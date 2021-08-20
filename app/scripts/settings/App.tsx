import Form, { ISubmitEvent } from "@rjsf/core";
import React, { useCallback, useEffect, useState } from "react";
import { SCHEMA } from "./SettingSchema.validator";
import { browser } from "webextension-polyfill-ts";
import { SettingSchema } from "./SettingSchema";
import { RULE_DEFAULT_PATTERNS } from "../secretlint/rule.patterns";
import { CodeEditor } from "./CodeEditor";
import { RULES_DEFAULT_ALLOWS } from "../secretlint/rule.allows";

const useStorageLocal = <V extends any>(name: string, initialValue?: V) => {
    const [state, setState] = useState<V | undefined>(initialValue);
    const get = useCallback(() => {
        return browser.storage.local.get([name]).then((storage) => {
            return storage[name];
        });
    }, [name]);
    const set = useCallback(
        (value: V) => {
            return browser.storage.local.set({ [name]: value });
        },
        [name]
    );
    const load = useCallback(async () => {
        const initial = await get();
        if (initial) {
            setState(initial);
        }
    }, [get]);

    useEffect(() => {
        load();
    }, [load]);
    return [state, set] as const;
};
type Pattern = { name: string; pattern: string };
type Patterns = Pattern[];
export const useApp = () => {
    const [settings, setSettings] = useStorageLocal<Partial<SettingSchema>>("settings");
    const [patterns, setPatterns] = useStorageLocal<Patterns>("rule.patterns", RULE_DEFAULT_PATTERNS);
    const [allows, setAllows] = useStorageLocal<string[]>("rule.allows", RULES_DEFAULT_ALLOWS);
    const [patternValue, setPatternValue] = useState(JSON.stringify(patterns, null, 2));
    const [allowsValue, setAllowsValue] = useState(JSON.stringify(allows, null, 2));
    useEffect(() => {
        setPatternValue(JSON.stringify(patterns, null, 2));
    }, [patterns]);
    useEffect(() => {
        setAllowsValue(JSON.stringify(allows, null, 2));
    }, [allows]);
    const onSaveSettings = useCallback(
        (event: ISubmitEvent<Partial<SettingSchema>>) => {
            setSettings(event.formData);
        },
        [setSettings]
    );
    const onChangePatterns = useCallback(
        (newValue: string) => {
            try {
                setPatternValue(newValue);
                const json = JSON.parse(newValue) as Patterns;
                if (!Array.isArray(json)) {
                    return;
                }
                setPatterns(json);
            } catch {
                // nope
            }
        },
        [setPatterns]
    );
    const onChangeAllows = useCallback(
        (newValue: string) => {
            try {
                setAllowsValue(newValue);
                const json = JSON.parse(newValue) as string[];
                if (!Array.isArray(json)) {
                    return;
                }
                setAllows(json);
            } catch {
                // nope
            }
        },
        [setAllows]
    );

    const resetConfig = useCallback(() => {
        if (confirm("Reset all config. OK?")) {
            browser.storage.local.clear();
        }
    }, []);

    return [
        { settings, patterns, allows, patternValue, allowsValue },
        { onSaveSettings, onChangePatterns, onChangeAllows, resetConfig }
    ] as const;
};
export const App = () => {
    const [{ settings, patternValue, allowsValue }, { onSaveSettings, onChangePatterns, onChangeAllows, resetConfig }] =
        useApp();
    return (
        <div
            className={"App"}
            style={{
                width: "600px"
            }}
        >
            <Form
                formData={settings}
                schema={SCHEMA.definitions.SettingSchema as any}
                uiSchema={{
                    enableConsoleIntegration: {
                        "ui:help": "If you enable it, report found secrets into console panel."
                    }
                }}
                onSubmit={onSaveSettings}
            >
                <button type="submit">Save</button>
            </Form>
            <h2>Allows patterns</h2>
            <p>
                If match following patterns, just ignore it. For more details, see{" "}
                <a href={"https://github.com/secretlint/webextension#config"} target={"_blank"} rel="noreferrer">
                    Document📝
                </a>
            </p>
            <CodeEditor lang={"json"} value={allowsValue} onChange={onChangeAllows} />
            <h2>Disallows patterns</h2>
            <p>
                If match following patterns, report it as error. For more details, see{" "}
                <a href={"https://github.com/secretlint/webextension#config"} target={"_blank"} rel="noreferrer">
                    Document📝
                </a>
            </p>
            <CodeEditor lang={"json"} value={patternValue} onChange={onChangePatterns} />
            <h2>Danger Zone</h2>
            <button onClick={resetConfig}>Reset config</button>
        </div>
    );
};
