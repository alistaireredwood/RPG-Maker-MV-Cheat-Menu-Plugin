import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'chrome66',
    outDir: './www/js/plugins',
    rollupOptions: {
      input: {
        Cheat_Menu: 'src/new/Cheat_Menu.ts',
        Cheat_Menu_style: 'src/new/Cheat_Menu.css',
      },
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'Cheat_Menu_style.css') {
            return 'Cheat_Menu.css';
          }

          return '[name].[ext]';
        },
        entryFileNames: '[name].js',
        // plugins load as classic <script> tags: without a wrapper every
        // minified top-level name (e.g. the CheatMenu state object) becomes a
        // window global that any other game script can overwrite
        banner: '(function () {',
        footer: '})();',
      },
    },
  },
});
