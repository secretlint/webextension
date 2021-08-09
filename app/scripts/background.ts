import { isInternalEndpoint, onMessage } from "webext-bridge";
import { browser } from "webextension-polyfill-ts";
import { SecretLintMessage } from "./types";

const lintManager = (() => {
    let _messages = new Map<string, SecretLintMessage[]>();
    return {
        get(url: string) {
            return _messages.get(url);
        },
        update(url: string, messages: SecretLintMessage[]) {
            _messages.set(url, messages);
        },
        add(url: string, messages: SecretLintMessage[]) {
            const currentMessages = _messages.get(url) ?? [];
            _messages.set(url, currentMessages.concat(messages));
        },
        delete(url: string) {
            _messages.delete(url);
        },
        clear() {
            _messages.clear();
        }
    };
})();

onMessage("lint-messages", async (message) => {
    const { data, sender } = message;
    const tab = await browser.tabs.get(sender.tabId);
    if (isInternalEndpoint(sender) && tab && tab.url) {
        lintManager.add(tab.url, data as SecretLintMessage[]);
    }
    return {};
});
onMessage("pull-messages", async ({ sender }) => {
    const tab = await browser.tabs.get(sender.tabId);
    if (!isInternalEndpoint(sender)) {
        throw new Error("no support sender");
    }
    if (!tab) {
        throw new Error("not found sender tab");
    }
    if (!tab.url) {
        throw new Error("not found sender tab");
    }
    return lintManager.get(tab.url) ?? [];
});

onMessage("clear-messages", async ({ sender }) => {
    if (isInternalEndpoint(sender)) {
        lintManager.clear();
    }
    return {};
});

browser.webNavigation.onCommitted.addListener((details) => {
    lintManager.delete(details.url);
});
