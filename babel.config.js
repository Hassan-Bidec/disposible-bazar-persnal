module.exports = {
  presets: [
    [
      "next/babel",
      {
        "preset-env": {
          // Target Chrome 49+ — covers most SEO crawlers including old headless tools
          targets: {
            chrome: "49",
          },
          // Do NOT use useBuiltIns here — Next.js handles polyfills
        },
      },
    ],
  ],
  plugins: [
    // Transpile ?. (optional chaining) → old-style && checks
    "@babel/plugin-transform-optional-chaining",
    // Transpile ?? (nullish coalescing) → old-style || checks
    "@babel/plugin-transform-nullish-coalescing-operator",
    // Transpile &&=, ||=, ??= operators
    "@babel/plugin-transform-logical-assignment-operators",
  ],
};
