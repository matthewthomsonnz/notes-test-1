import js from '@eslint/js';
import vue from 'eslint-plugin-vue';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
    js.configs.recommended,
    ...vue.configs['flat/recommended'],
    {
        files: ['**/*.vue'],
        languageOptions: {
            parser: vue.parser,
            parserOptions: {
                parser: tsParser,
                ecmaVersion: 2021,
                sourceType: 'module',
            },
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsParser,
            ecmaVersion: 2021,
            sourceType: 'module',
        },
        plugins: {
            '@typescript-eslint': tseslint,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
        },
    },
    prettier,
];