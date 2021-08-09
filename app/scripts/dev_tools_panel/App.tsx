import { useEffect, useState } from "react";
import { sendMessage } from "webext-bridge";
import React from "react";
import type { SecretLintMessage } from "../types";
import "./base.css";
import "./App.css";

const useSecretlint = () => {
    const [messages, setMessages] = useState<SecretLintMessage[]>([]);
    useEffect(() => {
        const update = async () => {
            const messages = await sendMessage("pull-messages", {}, "background");
            setMessages(messages as SecretLintMessage[]);
        };
        const timerId = setInterval(update, 500);
        update();
        return () => {
            clearInterval(timerId);
        };
    }, []);
    return messages;
};
export const MessageList = () => {
    const messages = useSecretlint();
    if (messages.length === 0) {
        return (
            <div className={"MessageNotFound"}>
                <p>Not found secrets in this page.</p>
            </div>
        );
    }
    return (
        <ul className={"MessageList"}>
            {messages.map((message, i) => {
                return (
                    <li key={message.ruleId + i} className={"MessageListItem"}>
                        <details>
                            <summary>
                                <b>{message.ruleId}</b> {message.message}
                                <p style={{ margin: 0 }}>
                                    📍{" "}
                                    <a href={message.url} target={"_blank"}>
                                        {message.url}
                                    </a>
                                </p>
                                {message.docsUrl && (
                                    <footer>
                                        📝{" "}
                                        <a href={message.docsUrl} target={"_blank"}>
                                            {" "}
                                            Document
                                        </a>
                                    </footer>
                                )}
                            </summary>
                            <pre>{JSON.stringify(message, null, 4)}</pre>
                        </details>
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
