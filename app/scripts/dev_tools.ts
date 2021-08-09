import { browser, DevtoolsNetwork } from "webextension-polyfill-ts";
import type { Request } from "har-format";
import { lintContent } from "./secretlint/lint";
import { sendMessage } from "webext-bridge";
import { SecretLintMessage } from "./types";
import jsesc from "jsesc";
import { SettingSchema } from "./settings/SettingSchema";
import { SCHEMA } from "./settings/SettingSchema.validator";

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
    setting: SettingSchema;
}): Promise<SecretLintMessage[]> => {
    const result = await lintContent({
        content,
        url: url
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
    const storage = await browser.storage.local.get(["settings"]);
    const setting = {
        sliceBefore: SCHEMA.definitions.SettingSchema.properties.sliceBefore.default,
        sliceAfter: SCHEMA.definitions.SettingSchema.properties.sliceAfter.default,
        enableConsoleIntegration: SCHEMA.definitions.SettingSchema.properties.enableConsoleIntegration.default,
        ...storage?.settings
    } as SettingSchema;
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
            console.log(JSON.stringify(messages));
            browser.devtools.inspectedWindow.eval(`console.group("Found ${
                messages.length
            } secrets. For more details see Secretlint panel.");
${messages.map((message) => {
    return `console.error("${jsesc(message.ruleId, {
        quotes: "double"
    })}: ${jsesc(message.message, {
        quotes: "double"
    })}", ${jsesc(message, {
        quotes: "double"
    })})`;
})}
console.groupEnd("Found ${messages.length} secrets");
`);
        }
    };
    browser.devtools.network.onRequestFinished.addListener(onRequestFinished);
})();
