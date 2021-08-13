import React, { useMemo, useCallback, Suspense, lazy } from "react";
import CodeMirror, * as codemirror from "codemirror";
import "codemirror/lib/codemirror.css";

const Controlled = lazy(async () => {
    await import("codemirror/addon/selection/active-line");
    await import("codemirror/addon/fold/foldcode");
    await import("codemirror/addon/fold/foldgutter");
    await import("codemirror/mode/javascript/javascript" as string);
    await import("codemirror/mode/css/css" as string);
    await import("codemirror/mode/xml/xml" as string);
    const { Controlled } = await import("react-codemirror2");
    return {
        default: Controlled
    };
});

export type CodeEditorProps = {
    value: string;
    readonly?: boolean;
    lang: "json";
    onChange: (value: string) => void;
};
export const CodeEditor = ({
    value,
    readonly,
    lang,
    onChange,
    ...props
}: Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> & CodeEditorProps) => {
    const handleChange = useCallback(
        (_editor: CodeMirror.Editor, _data: CodeMirror.EditorChange, value: string) => {
            onChange(value);
        },
        [onChange]
    );

    const codeMirrorOption: codemirror.EditorConfiguration = useMemo(() => {
        return {
            readOnly: readonly,
            mode: lang === "json" ? "javascript" : lang,
            autoCloseBrackets: true,
            lineNumbers: true,
            lineWrapping: true,
            tabindex: 2,
            indentUnit: 2,
            indentWithTabs: true,
            tabSize: 2,
            inputStyle: "textarea",
            cursorHeight: 1,
            styleActiveLine: true,
            nonEmpty: true,
            foldGutter: true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            showInvisibles: true,
            ...(lang === "json"
                ? {
                      json: true
                  }
                : {})
        };
    }, [lang, readonly]);

    return (
        <div {...props}>
            <Suspense fallback={<div>...loading</div>}>
                <Controlled value={value} options={codeMirrorOption} onBeforeChange={handleChange} />
            </Suspense>
        </div>
    );
};
