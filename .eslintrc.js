module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true
    },
    extends: ["plugin:react/recommended"],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaFeatures: {
            jsx: true
        },
        ecmaVersion: 12,
        sourceType: "module"
    },
    plugins: ["react", "react-hooks", "@typescript-eslint"],
    rules: {
        "react-hooks/rules-of-hooks": "error", // Checks rules of Hooks
        "react-hooks/exhaustive-deps": "error" // Checks effect dependencies
    },
    settings: {
        react: {
            pragma: "React", // Pragma to use, default to "React"
            fragment: "Fragment", // Fragment to use (may be a property of <pragma>), default to "Fragment"
            version: "detect" // React version. "detect" automatically picks the version you have installed.
        }
    }
};
