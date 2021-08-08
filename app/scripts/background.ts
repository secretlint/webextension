import { isInternalEndpoint, onMessage } from "webext-bridge";
import { SecretLintCoreResultMessage } from "@secretlint/types";
import { browser } from "webextension-polyfill-ts";

const lintManager = (() => {
    let _messages: SecretLintMessage[] = [];
    return {
        get() {
            return _messages;
        },
        update(messages: SecretLintMessage[]) {
            _messages = messages;
        },
        clear() {
            _messages = [];
            console.log("clearn", _messages);
        }
    };
})();
onMessage("lint-messages", (message) => {
    const { data, sender } = message;
    if (isInternalEndpoint(sender)) {
        lintManager.update(data as SecretLintMessage[]);
    }
});
onMessage("pull-messages", ({ sender }) => {
    if (!isInternalEndpoint(sender)) {
        throw new Error("no support sender");
    }
    return lintManager.get();
});
browser.webNavigation.onBeforeNavigate.addListener(function () {
    lintManager.clear();
});
