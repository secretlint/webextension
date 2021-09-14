import { lintSource } from "@secretlint/core";
// @ts-ignore
import creator from "@secretlint/secretlint-rule-preset-recommend";
import pattern from "@secretlint/secretlint-rule-pattern";
import { RULE_DEFAULT_PATTERNS } from "./rule.patterns";

/**
 * HeaderName=HeaderValue
 */
export const lintContent = ({ content, url, allows }: { content: string; url: string; allows: string[] }) => {
    console.log({ content, url, allows });
    const rules = [
        {
            id: "@secretlint/secretlint-rule-preset-recommend",
            rule: creator,
            options: {
                allows
            }
        },
        {
            id: pattern.meta.id,
            rule: pattern,
            options: {
                // based on https://github.com/l4yton/RegHex
                patterns: RULE_DEFAULT_PATTERNS,
                allows
            }
        }
    ];
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
            }
        }
    });
};
