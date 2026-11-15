import { defineConfig } from 'vite';

// The file name becomes the plugin name in plugins.js: Cheat_Menu.example.js
// -> {"name":"Cheat_Menu.example", ...}. Keeping the "Cheat_Menu." prefix lets
// the patcher find it.
const PLUGIN_FILE = 'Cheat_Menu.example.js';

export default defineConfig({
  build: {
    target: 'chrome66',
    outDir: 'dist',
    emptyOutDir: true,
    lib: {
      entry: 'src/index.ts',
      // a classic <script>: the IIFE keeps every top-level name out of window
      formats: ['iife'],
      name: 'CheatMenuExample',
      fileName: () => PLUGIN_FILE,
    },
  },
});
