import Form, { ISubmitEvent } from "@rjsf/core";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { SCHEMA } from "./SettingSchema.validator";
import { browser } from "webextension-polyfill-ts";
import { SettingSchema } from "./SettingSchema";
import { PATTERNS } from "../secretlint/rule.patterns";
import { CodeEditor } from "./CodeEditor";

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
    const [pattern, setPatterns] = useStorageLocal<Patterns>("rule.patterns", PATTERNS);
    const patternValue = useMemo(() => {
        return JSON.stringify(pattern, null, 2);
    }, [pattern]);
    const onSaveSettings = useCallback(
        (event: ISubmitEvent<Partial<SettingSchema>>) => {
            setSettings(event.formData);
        },
        [setSettings]
    );
    const onChangePatterns = useCallback(
        (newValue: string) => {
            try {
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

    return [
        { settings, pattern, patternValue },
        { onSaveSettings, onChangePatterns }
    ] as const;
};
export const App = () => {
    const [{ settings, patternValue }, { onSaveSettings, onChangePatterns }] = useApp();
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
            <h2>Configurable Patterns</h2>
            <p>If match these pattern, report it as error.</p>
            <CodeEditor lang={"json"} value={patternValue} onChange={onChangePatterns} />
        </div>
    );
};
