// must run first: legacy feature files call CheatMenu.appendX(...)
import './legacyBridge.ts';

import CheatMenu from './CheatMenu.ts';
import { bootstrap } from './core/bootstrap.ts';
import { features, V1_MENU_ORDER } from './features.ts';

bootstrap(features, { v1MenuOrder: V1_MENU_ORDER });

(window as unknown as { Cheat_Menu: typeof CheatMenu }).Cheat_Menu = CheatMenu;
