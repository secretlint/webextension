import { browser, DevtoolsNetwork } from "webextension-polyfill-ts";
import type { Request } from "har-format";
import { lintContent } from "./secretlint/lint";
import { sendMessage } from "webext-bridge";
import { SecretLintMessage } from "./types";

(async function main() {
    await browser.devtools.panels.create("secretlint", "/images/icon-192.png", "/pages/dev_tools_panel.html");
    const messages: SecretLintMessage[] = [];
    const onRequestFinished = async (
        request: DevtoolsNetwork.Request & { request?: Request; serverIPAddress?: string }
    ) => {
        const harRequest = request.request as Request;
        // const contentType = harRequest.headers?.find(header => {
        //     return header.name.toLowerCase() === "content-type";
        // });
        const [content, mimeType] = await request.getContent();
        const isBinary = mimeType === "base64";
        const url = harRequest.url;
        if (!isBinary && content) {
            const result = await lintContent({ content, url: url });
            if (result.messages.length > 0) {
                console.log("secretlint", url, result);
                messages.push(
                    ...result.messages.map((message) => {
                        return {
                            ...message,
                            url
                        };
                    })
                );
                await sendMessage("lint-messages", messages, "background");
            } else {
                console.log("secretlint", url, result);
            }
        }
    };
    browser.devtools.network.onRequestFinished.addListener(onRequestFinished);
})();
