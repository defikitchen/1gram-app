module.exports = {
  root: true,

  env: {
    node: true
  },

  rules: {
    // turned off for linting in e2e test
    // "no-console": process.env.NODE_ENV === "production" ? "error" : "off",
    // "no-debugger": process.env.NODE_ENV === "production" ? "error" : "off",
    "no-prototype-builtins": "off",
    "no-console": "off",
    "no-debugger": "off",
    "max-len": [2, 500000, 4, { ignoreUrls: true }]
  },

  parserOptions: {
    parser: "@typescript-eslint/parser"
  },

  extends: ["plugin:vue/essential", "@vue/prettier", "@vue/typescript"],

  overrides: [
    {
      files: [
        '**/__tests__/*.{j,t}s?(x)',
        '**/tests/unit/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        jest: true
      }
    }
  ]
};
