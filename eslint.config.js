import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import boundaries from 'eslint-plugin-boundaries';
import prettier from 'eslint-config-prettier';

// Architecture boundaries (see eslint-plugin-boundaries, `boundaries/dependencies`):
//
//   app (main.ts, features.ts)  →  feature (index.ts only)  →  shared  →  core
//
//   - core     → core
//   - shared   → core, shared
//   - feature  → core, shared, its own folder
//   - app      → core, shared, feature entry points (features/<name>/index.ts)
//
// `legacy` covers the pre-refactor singleton and is reachable from everywhere
// until the migration removes it.
const BOUNDARIES_SEVERITY = 'warn';

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
    rules: {
      // remaining `any` / `@ts-ignore` mostly come from the CheatMenu singleton
      // (dynamic `CheatMenu[name]` access over initialValues); raise to error
      // once the singleton is gone
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },

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
      'boundaries/ignore': ['src/types/**'],
      // single files: classified by category
      'boundaries/files': [
        {
          category: 'app',
          pattern: ['src/main.ts', 'src/features.ts', 'src/Cheat_Menu.ts'],
        },
        {
          category: 'legacy',
          pattern: ['src/CheatMenu.ts', 'src/components/**/*.ts'],
        },
      ],
      // folders: classified by element type
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
      'boundaries/no-unknown-files': BOUNDARIES_SEVERITY,
      'boundaries/no-unknown-dependencies': BOUNDARIES_SEVERITY,
      'boundaries/dependencies': [
        BOUNDARIES_SEVERITY,
        {
          default: 'disallow',
          policies: [
            {
              from: { file: { categories: 'app' } },
              allow: [
                { to: { element: { types: ['core', 'shared'] } } },
                { to: { file: { categories: 'legacy' } } },
                // features only through their entry point
                {
                  to: {
                    element: { type: 'feature', fileInternalPath: 'index.ts' },
                  },
                },
              ],
            },
            {
              from: { element: { type: 'core' } },
              allow: [
                { to: { element: { type: 'core' } } },
                { to: { file: { categories: 'legacy' } } },
              ],
            },
            {
              from: { element: { type: 'shared' } },
              allow: [
                { to: { element: { types: ['core', 'shared'] } } },
                { to: { file: { categories: 'legacy' } } },
              ],
            },
            {
              from: { element: { type: 'feature' } },
              allow: [
                { to: { element: { types: ['core', 'shared'] } } },
                { to: { file: { categories: 'legacy' } } },
                // own folder only
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
            {
              from: { file: { categories: 'legacy' } },
              allow: { to: { file: { categories: 'legacy' } } },
            },
          ],
        },
      ],
    },
  },

  prettier,
);
