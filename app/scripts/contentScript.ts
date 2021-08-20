import { isInternalEndpoint, onMessage } from "webext-bridge";
import type { SecretLintMessage } from "./types";

onMessage("content-script:log-lint-messages", async (message) => {
    const { data, sender } = message;
    if (isInternalEndpoint(sender)) {
        const messages = data as SecretLintMessage[];
        console.group(`Found ${messages.length} secrets. For more details see Secretlint panel.`);
        console.table(messages, ["ruleId", "message", "url"]);
        console.groupEnd();
    }
    return {};
});
