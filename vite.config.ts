import { defineConfig } from 'vite';

export default defineConfig({
  build: {
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
      },
    },
  },
});
