import CheatMenu from './CheatMenu.ts';

import.meta.glob('./core/**/*.ts', { eager: true });
import.meta.glob('./features/**/*.ts', { eager: true });

(window as any).Cheat_Menu = CheatMenu;
