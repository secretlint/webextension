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
        <div className={"MessageList"}>
            {messages.map((message, i) => {
                return (
                    <div key={message.ruleId + i} className={"MessageListItem"}>
                        <div>
                            <div style={{ overflowWrap: "anywhere" }}>
                                <p style={{ margin: 0 }}>
                                    🔑{" "}
                                    {message.docsUrl ? (
                                        <a href={message.docsUrl} target={"_blank"} rel="noreferrer">
                                            {message.ruleId}
                                        </a>
                                    ) : (
                                        <b>{message.ruleId}</b>
                                    )}{" "}
                                    {message.message}
                                </p>
                                <p style={{ margin: 0 }}>
                                    📍{" "}
                                    <a href={message.url} target={"_blank"} rel="noreferrer">
                                        {message.url}
                                    </a>
                                </p>
                            </div>
                            <details>
                                <summary>Details</summary>
                                <pre style={{ overflowWrap: "anywhere" }}>{JSON.stringify(message, null, 4)}</pre>
                            </details>
                        </div>
                        <div>
                            <button>Menu</button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
export const App = () => {
    return (
        <div className={"App"}>
            <MessageList />
        </div>
    );
};
