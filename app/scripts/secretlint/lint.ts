import { lintSource } from "@secretlint/core";
// @ts-ignore
import { rules } from "@secretlint/secretlint-rule-preset-recommend";
import pattern from "@secretlint/secretlint-rule-pattern";
import { PATTERNS } from "./rule.patterns";
/**
 * HeaderName=HeaderValue
 */
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
                rules: rules
                    .map((rule: any) => {
                        return {
                            id: rule.meta.id,
                            rule: rule,
                            options: true
                        };
                    })
                    .concat([
                        {
                            id: pattern.meta.id,
                            rule: pattern,
                            options: {
                                // based on https://github.com/l4yton/RegHex
                                patterns: PATTERNS
                            }
                        }
                    ])
            }
        }
    });
};
