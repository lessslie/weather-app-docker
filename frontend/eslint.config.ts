import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { Linter } from 'eslint';

interface ESLintConfig {
  ignores?: string[];
  files?: string[];
  languageOptions?: {
    ecmaVersion?: number;
    globals?: Record<string, boolean>;
    parserOptions?: {
      ecmaVersion?: string;
      ecmaFeatures?: {
        jsx?: boolean;
      };
      sourceType?: string;
    };
  };
  plugins?: Record<string, unknown>;
  rules?: Record<string, unknown>;
}

const config: ESLintConfig[] = [
  { ignores: ['dist'] },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
];

export default config;
