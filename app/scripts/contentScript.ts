import { isInternalEndpoint, onMessage } from "webext-bridge";
import type { SecretLintMessage } from "./types";

onMessage("content-script:log-lint-messages", async (message) => {
    const { data, sender } = message;
    if (isInternalEndpoint(sender)) {
        const messages = data as SecretLintMessage[];
        // FIXME: Firefox does not preserve order, manual sorts
        const sortedMessages: SecretLintMessage[] = messages.map((message) => {
            return {
                ...message,
                "1.ruleId": message.ruleId,
                "2.message": message.message,
                "3.url": message.url,
                "4.sliceContent": message.sliceContent
            };
        });
        console.group(`Found ${sortedMessages.length} secrets. For more details see Secretlint panel.`);
        console.table(sortedMessages, ["1.ruleId", "2.message", "3.url", "4.sliceContent"]);
        console.groupEnd();
    }
    return {};
});
