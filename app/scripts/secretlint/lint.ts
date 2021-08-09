import { lintSource } from "@secretlint/core";
// @ts-ignore
import { rules } from "@secretlint/secretlint-rule-preset-recommend";
import pattern from "@secretlint/secretlint-rule-pattern";

// @ts-ignore
const LOW_RULES = [
    {
        name: "Base64(JWT)",
        pattern: "/(eyJ|YTo|Tzo|PD[89]|aHR0cHM6L|aHR0cDo|rO0)[a-zA-Z0-9+/]+={0,2}/"
    },
    {
        name: "Basic Auth Credentials",
        pattern: "/(?<=:\\/\\/)[a-zA-Z0-9]+:[a-zA-Z0-9]+@[a-zA-Z0-9]+\\.[a-zA-Z]+/"
    },
    {
        name: "Google API Key",
        pattern: "/AIza[0-9A-Za-z\\-_]{35}/"
    }
];
/**
 * HeaderName=HeaderValue
 */
const Authorization = [
    {
        name: "Authorization Basic",
        pattern: `/Authorization=basic [a-zA-Z0-9_\\-:\\.=]+/i`
    },
    {
        name: "Authorization Bearer",
        pattern: `/Authorization=bearer [a-zA-Z0-9_\\-:\\.=]+/i`
    }
];
export const lintContent = ({ content, url }: { content: string; url: string }) => {
    const headerPatterns = url.startsWith("request-header:") ? Authorization : [];
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
                                patterns: [
                                    {
                                        name: "Artifactory API Token",
                                        pattern: '/(?:\\s|=|:|"|^)AKC[a-zA-Z0-9]{10,}/'
                                    },
                                    {
                                        name: "Artifactory Password",
                                        pattern: '/(?:\\s|=|:|"|^)AP[\\dABCDEF][a-zA-Z0-9]{8,}/'
                                    },
                                    {
                                        name: "AWS Client ID",
                                        pattern: "/(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/"
                                    },
                                    {
                                        name: "AWS MWS Key",
                                        pattern:
                                            "/amzn\\.mws\\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/"
                                    },
                                    {
                                        name: "AWS Secret Key",
                                        pattern: "/(?i)aws(.{0,20})?(?-i)['\"][0-9a-zA-Z\\/+]{40}['\"]/"
                                    },
                                    {
                                        name: "Cloudinary Basic Auth",
                                        pattern: "/cloudinary:\\/\\/[0-9]{15}:[0-9A-Za-z]+@[a-z]+/"
                                    },
                                    {
                                        name: "Facebook Access Token",
                                        pattern: "/EAACEdEose0cBA[0-9A-Za-z]{32,64}/"
                                    },
                                    {
                                        name: "Facebook Client ID",
                                        pattern: "/(?i)(facebook|fb)(.{0,20})?['\"][0-9]{13,17}['\"]/"
                                    },
                                    {
                                        name: "Facebook Oauth",
                                        pattern:
                                            "/[f|F][a|A][c|C][e|E][b|B][o|O][o|O][k|K](.{0,20}['|\"][0-9a-f]{32}['|\"]/"
                                    },
                                    {
                                        name: "Facebook Secret Key",
                                        pattern: "/(?i)(facebook|fb)(.{0,20})?(?-i)['\"][0-9a-f]{32}['\"]/"
                                    },
                                    {
                                        name: "Github",
                                        pattern: "/(?i)github(.{0,20})?(?-i)['\"][0-9a-zA-Z]{35,40}/"
                                    },
                                    {
                                        name: "Google Cloud Platform API Key",
                                        pattern:
                                            "/(?i)(google|gcp|youtube|drive|yt)(.{0,20})?['\"][AIza[0-9a-z\\-_]{35}]['\"]/"
                                    },
                                    {
                                        name: "Google Drive Oauth",
                                        pattern: "/[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com/"
                                    },
                                    {
                                        name: "Google Gmail Oauth",
                                        pattern: "/[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com/"
                                    },
                                    {
                                        name: "Google Oauth Access Token",
                                        pattern: "/ya29\\.[0-9A-Za-z\\-_]+/"
                                    },
                                    {
                                        name: "Google Youtube Oauth",
                                        pattern: "/[0-9]+-[0-9A-Za-z_]{32}\\.apps\\.googleusercontent\\.com/"
                                    },
                                    {
                                        name: "Heroku API Key",
                                        pattern:
                                            "/[h|H][e|E][r|R][o|O][k|K][u|U].{0,30}[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/"
                                    },
                                    {
                                        name: "IPv4",
                                        pattern:
                                            "/['\"](25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}['\"]/"
                                    },
                                    // {
                                    //     name: "IPv6",
                                    //     pattern:
                                    //         "/(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/"
                                    // },
                                    {
                                        name: "LinkedIn Client ID",
                                        pattern: "/(?i)linkedin(.{0,20})?(?-i)['\"][0-9a-z]{12}['\"]/"
                                    },
                                    {
                                        name: "LinkedIn Secret Key",
                                        pattern: "/(?i)linkedin(.{0,20})?['\"][0-9a-z]{16}['\"]/"
                                    },
                                    {
                                        name: "Mailchamp API Key",
                                        pattern: "/[0-9a-f]{32}-us[0-9]{1,2}/"
                                    },
                                    {
                                        name: "Mailgun API Key",
                                        pattern: "/key-[0-9a-zA-Z]{32}/"
                                    },
                                    {
                                        name: "Mailto:",
                                        pattern: "/(?<=mailto:)[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\\.[a-zA-Z0-9.-]+/"
                                    },
                                    // {
                                    //     name: "MD5 Hash",
                                    //     pattern: "/[a-f0-9]{32}/"
                                    // },
                                    {
                                        name: "Picatic API Key",
                                        pattern: "/sk_live_[0-9a-z]{32}/"
                                    },
                                    {
                                        name: "Slack Token",
                                        pattern: "/xox[baprs]-([0-9a-zA-Z]{10,48})?/"
                                    },
                                    {
                                        name: "Slack Webhook",
                                        pattern:
                                            "/https://hooks.slack.com/services/T[a-zA-Z0-9_]{8}/B[a-zA-Z0-9_]{8}/[a-zA-Z0-9_]{24}/"
                                    },
                                    {
                                        name: "Stripe API Key",
                                        pattern: "/(?:r|s)k_live_[0-9a-zA-Z]{24}/"
                                    },
                                    {
                                        name: "Square Access Token",
                                        pattern: "/sqOatp-[0-9A-Za-z\\-_]{22}/"
                                    },
                                    {
                                        name: "Square Oauth Secret",
                                        pattern: "/sq0csp-[ 0-9A-Za-z\\-_]{43}/"
                                    },
                                    {
                                        name: "Twilio API Key",
                                        pattern: "/SK[0-9a-fA-F]{32}/"
                                    },
                                    {
                                        name: "Twitter Client ID",
                                        pattern: "/(?i)twitter(.{0,20})?['\"][0-9a-z]{18,25}/"
                                    },
                                    {
                                        name: "Twitter Oauth",
                                        pattern:
                                            "/[t|T][w|W][i|I][t|T][t|T][e|E][r|R].{0,30}['\"\\s][0-9a-zA-Z]{35,44}['\"\\s]/"
                                    },
                                    {
                                        name: "Twitter Secret Key",
                                        pattern: "/(?i)twitter(.{0,20})?['\"][0-9a-z]{35,44}/"
                                    },
                                    {
                                        name: "Vault Token",
                                        pattern: "/['\"\\s][sb]\\.[a-zA-Z0-9]{24}['\"\\s]/"
                                    }
                                    // {
                                    //     name: "URL Parameter",
                                    //     pattern: "/(?<=\\?|\\&)[a-zA-Z0-9_]+(?=\\=)/"
                                    // }
                                ].concat(headerPatterns)
                            }
                        }
                    ])
            }
        }
    });
};
