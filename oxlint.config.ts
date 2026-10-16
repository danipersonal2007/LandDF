import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import react from "ultracite/oxlint/react";
import remix from "ultracite/oxlint/remix";

export default defineConfig({
  extends: [core, react, remix],
  ignorePatterns: [
    ...(core.ignorePatterns ?? []),
    "vendor/**",
    "app/wedding/**",
  ],
  rules: {
    "react/function-component-definition": [
      "error",
      {
        namedComponents: "function-declaration",
        unnamedComponents: "arrow-function",
      },
    ],
    "func-style": "off",
    "sort-keys": "off",
    "prefer-destructuring": "off",
    "import/consistent-type-specifier-style": [
      "error",
      "prefer-top-level-if-only-type-imports",
    ],
    "no-use-before-define": "off",
    "no-empty-pattern": "off",
    "arrow-body-style": "off",
    curly: "off",
    "react/todo": "off",
    "no-await-in-loop": "off",
    "no-nested-ternary": "off",
    // Guest-uploaded videos do not have a caption file to attach.
    "jsx-a11y/media-has-caption": "off",
  },
  overrides: [
    {
      files: ["lib/db/migrations/*.ts"],
      rules: {
        "typescript/no-explicit-any": "off",
        "no-unused-vars": "off",
        "unicorn/filename-case": "off",
      },
    },
  ],
});
