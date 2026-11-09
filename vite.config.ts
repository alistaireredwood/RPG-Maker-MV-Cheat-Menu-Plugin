import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
  build: {
    target: 'chrome66',
    outDir: './release/www/js/plugins',
    rolldownOptions: {
      input: {
        Cheat_Menu: 'src/main.ts',
        Cheat_Menu_style: 'src/core/ui/Cheat_Menu.css',
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.names.includes('Cheat_Menu_style.css')) {
            return 'Cheat_Menu.css';
          }

          return '[name].[ext]';
        },
        entryFileNames: '[name].js',
        // plugins load as classic <script> tags: without a wrapper every
        // minified top-level name (e.g. a feature's state object) becomes a
        // window global that any other game script can overwrite
        banner: '(function () {',
        footer: '})();',
      },
    },
  },
});
