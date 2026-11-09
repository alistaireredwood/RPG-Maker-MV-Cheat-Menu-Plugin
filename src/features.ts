import type { Feature } from './core/feature.ts';
import { sharedFeature } from './shared/state.ts';

import armors from './features/armors/index.ts';
import clearStates from './features/clearStates/index.ts';
import enemyRecovery from './features/enemyRecovery/index.ts';
import evaluate from './features/evaluate/index.ts';
import exp from './features/exp/index.ts';
import gameSpeed from './features/gameSpeed/index.ts';
import godMode from './features/godMode/index.ts';
import gold from './features/gold/index.ts';
import items from './features/items/index.ts';
import noClip from './features/noClip/index.ts';
import partyRecovery from './features/partyRecovery/index.ts';
import saveGame from './features/saveGame/index.ts';
import saveRecall from './features/saveRecall/index.ts';
import speed from './features/speed/index.ts';
import stats from './features/stats/index.ts';
import switches from './features/switches/index.ts';
import teleport from './features/teleport/index.ts';
import unlockControls from './features/unlockControls/index.ts';
import variables from './features/variables/index.ts';
import weapons from './features/weapons/index.ts';

export const features: Feature<object>[] = [
  sharedFeature,
  teleport,
  saveRecall,
  noClip,
  speed,
  gameSpeed,
  switches,
  variables,
  godMode,
  exp,
  partyRecovery,
  enemyRecovery,
  gold,
  items,
  weapons,
  armors,
  clearStates,
  stats,
  unlockControls,
  saveGame,
  evaluate,
];

// Pre-v2 saves stored the open menu as an index into this order — frozen,
// never edit when features change.
export const V1_MENU_ORDER: readonly string[] = [
  'teleport',
  'saveRecall',
  'noClip',
  'speed',
  'gameSpeed',
  'switches',
  'variables',
  'godMode',
  'exp',
  'partyHp',
  'partyMp',
  'partyTp',
  'enemyRecovery',
  'gold',
  'items',
  'weapons',
  'armors',
  'clearStates',
  'stats',
  'unlockControls',
  'saveGame',
  'evaluate',
];
