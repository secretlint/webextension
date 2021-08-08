import { SecretLintCoreResultMessage } from "@secretlint/types";

export type SecretLintMessage = SecretLintCoreResultMessage & {
    url: string;
};
