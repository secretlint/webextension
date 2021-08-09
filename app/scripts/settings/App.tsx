import Form from "@rjsf/core";
import React, { useEffect, useState } from "react";
import { SCHEMA } from "./SettingSchema.validator";
import { browser } from "webextension-polyfill-ts";
import { SettingSchema } from "./SettingSchema";

export const useApp = () => {
    const [settings, setSettings] = useState<Partial<SettingSchema>>();
    useEffect(() => {
        browser.storage.local.get(["settings"]).then(({ settings }) => {
            setSettings(settings as Partial<SettingSchema>);
        });
    }, []);
    return [{ settings }] as const;
};
export const App = () => {
    const [{ settings }] = useApp();
    return (
        <Form
            formData={settings}
            schema={SCHEMA.definitions.SettingSchema as any}
            uiSchema={{
                enableConsoleIntegration: {
                    "ui:help": "If you enable it, report found secrets into console panel."
                }
            }}
            onSubmit={(e) => {
                browser.storage.local.set({
                    settings: e.formData
                });
            }}
        />
    );
};
