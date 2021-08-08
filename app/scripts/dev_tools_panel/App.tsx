import { useEffect, useState } from "react";
import { sendMessage } from "webext-bridge";
import React from "react";
import type { SecretLintMessage } from "../types";

const useSecretlint = () => {
    const [messages, setMessages] = useState<SecretLintMessage[]>([]);
    useEffect(() => {
        const timerId = setInterval(async () => {
            const messages = await sendMessage("pull-messages", {}, "background");
            setMessages(messages as SecretLintMessage[]);
        }, 500);
        return () => {
            clearInterval(timerId);
        };
    }, []);
    return messages;
};
export const MessageList = () => {
    const messages = useSecretlint();
    return (
        <ul>
            {messages.map((message) => {
                return (
                    <li key={message.ruleId + message.loc.start.line + message.loc.start.column}>
                        <b>{message.ruleId}</b> {message.message} @ {message.url}
                    </li>
                );
            })}
        </ul>
    );
};
export const App = () => {
    return (
        <div className={"App"}>
            <MessageList />
        </div>
    );
};
