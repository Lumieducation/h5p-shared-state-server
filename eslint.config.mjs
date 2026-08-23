import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        files: ['**/*.{js,mjs,cjs,ts}']
    },
    {
        ignores: [
            'typedoc/',
            '**/build/',
            '**/build-ide/',
            '**/coverage/',
            '**/node_modules/',
            '**/*.d.ts',
            '**/*.config.js',
            '**/*.config.mjs',
            'example/h5p/'
        ]
    },
    { languageOptions: { globals: { ...globals.node } } },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    eslintConfigPrettier,
    {
        rules: {
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-unused-vars': [
                'warn',
                { argsIgnorePattern: '^_' }
            ],
            'no-console': 'warn',
            'no-param-reassign': 'error',
            '@typescript-eslint/member-ordering': [
                'error',
                {
                    default: [
                        'public-constructor',
                        'private-constructor',
                        'public-static-field',
                        'private-static-field',
                        'public-instance-field',
                        'private-instance-field',
                        'public-static-method',
                        'private-static-method',
                        'public-instance-method',
                        'private-instance-method'
                    ]
                }
            ]
        }
    }
];
