import { lintSource } from "@secretlint/core";
// @ts-ignore
import { rules } from "@secretlint/secretlint-rule-preset-recommend";
export const lintContent = ({ content, url }: { content: string; url: string }) => {
    return lintSource({
        source: {
            contentType: "text",
            content,
            filePath: url,
            ext: url.split(".").pop() ?? ""
        },
        options: {
            config: {
                rules: rules.map((rule: any) => {
                    return {
                        id: rule.meta.id,
                        rule: rule,
                        options: true
                    };
                })
            }
        }
    });
};
