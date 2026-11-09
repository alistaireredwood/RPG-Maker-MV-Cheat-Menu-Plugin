import type { Feature } from '@src/core/feature.ts';
import { sharedFeature } from '@src/shared/state.ts';

import armors from '@src/features/armors/index.ts';
import clearStates from '@src/features/clearStates/index.ts';
import enemyRecovery from '@src/features/enemyRecovery/index.ts';
import evaluate from '@src/features/evaluate/index.ts';
import exp from '@src/features/exp/index.ts';
import gameSpeed from '@src/features/gameSpeed/index.ts';
import godMode from '@src/features/godMode/index.ts';
import gold from '@src/features/gold/index.ts';
import items from '@src/features/items/index.ts';
import noClip from '@src/features/noClip/index.ts';
import partyRecovery from '@src/features/partyRecovery/index.ts';
import saveGame from '@src/features/saveGame/index.ts';
import saveRecall from '@src/features/saveRecall/index.ts';
import speed from '@src/features/speed/index.ts';
import stats from '@src/features/stats/index.ts';
import switches from '@src/features/switches/index.ts';
import teleport from '@src/features/teleport/index.ts';
import unlockControls from '@src/features/unlockControls/index.ts';
import variables from '@src/features/variables/index.ts';
import weapons from '@src/features/weapons/index.ts';

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
