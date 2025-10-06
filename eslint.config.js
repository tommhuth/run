import ts from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import react from "eslint-plugin-react"
import simpleImportSort from "eslint-plugin-simple-import-sort"
import importPlugin from "eslint-plugin-import"
import unusedImports from "eslint-plugin-unused-imports";
import importAlias from '@dword-design/eslint-plugin-import-alias';

export default [
    importAlias.configs.recommended,
    {
        ignores: [
            "node_modules",
            "dist",
            "build",
            ".next",
            "out",
            "coverage",
            "**/*.d.ts",
            "vite.config.ts"
        ],
    },
    {
        files: ["**/*.{ts,tsx}"],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2022,
            sourceType: "module",
            globals: {
                browser: true,
                es6: true,
                node: true,
                serviceworker: true,
                workbox: true,
                THREE: "readonly",
                window: "readonly",
                self: "readonly",
                document: "readonly",
                console: "readonly",
                requestAnimationFrame: "readonly",
                cancelAnimationFrame: "readonly",
                performance: "readonly",
                "virtual:pwa-register": "readonly",
            },
            parserOptions: {
                ecmaFeatures: { jsx: true },
                project: "./tsconfig.json",
            },
        },
        settings: {
            react: { version: "detect" },
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                    project: "./tsconfig.json",
                },
            },
        },
        plugins: {
            "@typescript-eslint": ts,
            react,
            "simple-import-sort": simpleImportSort,
            import: importPlugin,
            "unused-imports": unusedImports,
        },
        rules: {
            "react/no-unknown-property": "off",
            "padding-line-between-statements": [
                "error",
                { blankLine: "always", prev: "*", next: "return" },
                { blankLine: "always", prev: ["const", "let", "var", "import"], next: "*" },
                { blankLine: "always", prev: "*", next: ["for", "switch", "if", "try"] },
                { blankLine: "always", prev: "*", next: "export" },
                { blankLine: "always", prev: "*", next: "function" },
                { blankLine: "any", prev: ["const", "let", "var"], next: ["const", "let", "var"] },
                { blankLine: "any", prev: ["import"], next: ["import"] },
                { blankLine: "any", prev: ["export"], next: ["export"] },
            ],
            "@dword-design/import-alias/prefer-alias": [
                "error",
                {
                    "alias": {
                        "@assets/*": "./assets/*",
                        "@data/*": "./src/data/*",
                        "@components/*": "./src/components/*",
                        "@src/*": "./src/*"
                    }
                }
            ],
            "no-unused-vars": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
            ],
            indent: ["error", 4, { SwitchCase: 1 }],
            "eol-last": ["error", "always"],
            quotes: ["error", "double", { avoidEscape: true }],
            semi: ["error", "never"],
            "unused-imports/no-unused-imports": "error",
            // Auto-import sorting
            "simple-import-sort/imports": "error",
            "simple-import-sort/exports": "error",
            // Validate import paths & TS aliases
            "import/no-unresolved": "error",
            "react/prop-types": "off",
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
            "import/no-unresolved": [
                "error",
                { ignore: ["virtual:pwa-register"] }
            ],
        },
    },
]
