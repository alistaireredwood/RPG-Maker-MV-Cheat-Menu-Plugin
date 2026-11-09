import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-config-prettier';

// Dependencies only point towards core, and a feature never reaches into
// another one, so removing a feature folder (plus its line in features.ts)
// can't break anything else.
export default tseslint.config(
  {
    ignores: [
      'www/**',
      'release/**',
      'patcher/**',
      'node_modules/**',
      'src/types/**',
    ],
  },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ['scripts/**/*.js', 'eslint.config.js', '.pnpmfile.cjs'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
        module: 'writable',
        require: 'readonly',
      },
    },
  },

  {
    files: ['src/**/*.ts'],
    plugins: { boundaries },
    settings: {
      'import/resolver': {
        typescript: { project: './tsconfig.json' },
      },
      'boundaries/include': ['src/**/*.ts'],
      'boundaries/ignore': ['src/types/**', 'src/**/*.test.ts'],
      'boundaries/files': [
        { category: 'app', pattern: ['src/main.ts', 'src/features.ts'] },
      ],
      'boundaries/elements': [
        { type: 'core', pattern: 'src/core' },
        { type: 'shared', pattern: 'src/shared' },
        {
          type: 'feature',
          pattern: 'src/features/*',
          capture: ['featureName'],
        },
      ],
    },
    rules: {
      'boundaries/no-unknown-files': 'error',
      'boundaries/no-unknown-dependencies': 'error',
      'boundaries/dependencies': [
        'error',
        {
          default: 'disallow',
          policies: [
            {
              from: { file: { categories: 'app' } },
              allow: [
                { to: { element: { types: ['core', 'shared'] } } },
                { to: { file: { categories: 'app' } } },
                // a feature's other files are private to it
                {
                  to: {
                    element: { type: 'feature', fileInternalPath: 'index.ts' },
                  },
                },
              ],
            },
            {
              from: { element: { type: 'core' } },
              allow: { to: { element: { type: 'core' } } },
            },
            {
              from: { element: { type: 'shared' } },
              allow: { to: { element: { types: ['core', 'shared'] } } },
            },
            {
              from: { element: { type: 'feature' } },
              allow: [
                { to: { element: { types: ['core', 'shared'] } } },
                {
                  to: {
                    element: {
                      type: 'feature',
                      captured: {
                        featureName: '{{ from.element.captured.featureName }}',
                      },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  },

  prettier,
);
