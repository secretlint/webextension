const path = require("path");
const GlobEntriesPlugin = require("webpack-watched-glob-entries-plugin");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
    webpack: (config, { dev, vendor }) => {
        // Add typescript loader. supports .ts and .tsx files as entry points
        config.resolve.extensions.push(".ts");
        config.resolve.extensions.push(".tsx");
        config.resolve.fallback = { fs: false };
        config.entry = GlobEntriesPlugin.getEntries([
            path.resolve("app", "*.{js,mjs,jsx,ts,tsx}"),
            path.resolve("app", "?(scripts)/*.{js,mjs,jsx,ts,tsx}")
        ]);
        config.module.rules.push({
            test: /\.tsx?$/,
            loader: "ts-loader"
        });
        config.plugins.push(new NodePolyfillPlugin());
        // Important: return the modified config
        return config;
    },
    copyIgnore: ["**/*.js", "**/*.json", "**/*.ts", "**/*.tsx"]
};
