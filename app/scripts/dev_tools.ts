import { browser, DevtoolsNetwork } from "webextension-polyfill-ts";
import type { Request } from "har-format";
import { lintContent } from "./secretlint/lint";
import { sendMessage } from "webext-bridge";
import { SecretLintMessage } from "./types";
import jsesc from "jsesc";
import { SettingSchema } from "./settings/SettingSchema";
import { SCHEMA } from "./settings/SettingSchema.validator";
import { ALLOWS } from "./secretlint/rule.allows";

const headersToEnv = (headers: Request["headers"]): string => {
    return headers
        .map((header) => {
            return `${header.name}=${header.value}`;
        })
        .join("\n");
};
const lintContentAndSend = async ({
    url,
    content,
    setting
}: {
    url: string;
    content: string;
    setting: SettingSchema & { allows: string[] };
}): Promise<SecretLintMessage[]> => {
    const result = await lintContent({
        content,
        url: url,
        allows: setting.allows
    });
    if (result.messages.length === 0) {
        return [];
    }
    const lintMessages: SecretLintMessage[] = result.messages.map((message) => {
        const sliceContent = content.slice(
            Math.max(message.range[0] - setting.sliceBefore, 0),
            Math.min(message.range[1] + setting.sliceAfter, content.length)
        );
        return {
            ...message,
            sliceContent,
            url
        };
    });
    await sendMessage("lint-messages", lintMessages, "background");
    return lintMessages;
};
(async function main() {
    await browser.devtools.panels.create("Secretlint", "/images/icon-192.png", "/pages/dev_tools_panel.html");
    const storage = await browser.storage.local.get(["settings", "rule.allows"]);
    const setting = {
        sliceBefore: SCHEMA.definitions.SettingSchema.properties.sliceBefore.default,
        sliceAfter: SCHEMA.definitions.SettingSchema.properties.sliceAfter.default,
        enableConsoleIntegration: SCHEMA.definitions.SettingSchema.properties.enableConsoleIntegration.default,
        allows: storage["rule.allows"] ?? ALLOWS,
        ...storage?.settings
    } as SettingSchema & {
        allows: string[];
    };
    const onRequestFinished = async (
        request: DevtoolsNetwork.Request & { request?: Request; serverIPAddress?: string }
    ) => {
        const harRequest = request.request as Request;
        const [content, mimeType] = await request.getContent();
        const isBinary = mimeType === "base64";
        const url = harRequest.url;
        const headerLinting =
            Object.keys(harRequest.headers).length > 0
                ? lintContentAndSend({
                      url: "request-header:" + url,
                      content: headersToEnv(harRequest.headers),
                      setting
                  })
                : Promise.resolve([]);
        const contentLinting =
            !isBinary && content
                ? lintContentAndSend({
                      url,
                      content,
                      setting
                  })
                : Promise.resolve([]);
        const messages = (await Promise.all([headerLinting, contentLinting])).flat();
        if (setting.enableConsoleIntegration && messages.length > 0) {
            browser.tabs.executeScript({
                code: `console.group("Found ${messages.length} secrets. For more details see Secretlint panel.");
${messages
    .map((message) => {
        return `console.warn("${jsesc(message.ruleId + ":" + message.message, {
            quotes: "double"
        })}");`;
    })
    .join("\n")}
console.groupEnd("Found ${messages.length} secrets");
`
            });
        }
    };
    browser.devtools.network.onRequestFinished.addListener(onRequestFinished);
})();
