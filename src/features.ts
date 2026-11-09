// The single list of features — order here = order in the main menu grid.
// Removing a feature = deleting its folder + its line below.
//
// Features not yet migrated to src/features/<name>/ are wrapped by
// `legacyFeature()`: their state still lives on the CheatMenu singleton, the
// adapter copies it into / out of the feature's persisted slice.
import CheatMenu from './CheatMenu.ts';
import type { Feature } from './core/feature.ts';
import { legacyFeature, type LegacyState } from './legacyFeature.ts';

import { menu as clearStates } from './features/clearStates.ts';
import { menu as enemyRecovery } from './features/enemyRecovery.ts';
import { menu as evaluate } from './features/evaluate.ts';
import { menu as gameSpeed } from './features/gameSpeed.ts';
import { menu as giveArmor } from './features/giveArmor.ts';
import { menu as giveExp } from './features/giveExp.ts';
import { menu as giveGold } from './features/giveGold.ts';
import { menu as giveItem } from './features/giveItem.ts';
import { menu as giveStat } from './features/giveStat.ts';
import { menu as giveWeapon } from './features/giveWeapon.ts';
import { menu as godMode } from './features/godMode.ts';
import { menu as noClip } from './features/noClip.ts';
import { menus as partyRecovery } from './features/partyRecovery.ts';
import { menu as saveGame } from './features/saveGame.ts';
import { menu as saveRecall } from './features/saveRecall.ts';
import { menu as setVariable } from './features/setVariable.ts';
import { menu as speed } from './features/speed.ts';
import { menu as teleport } from './features/teleport.ts';
import { menu as toggleSwitch } from './features/toggleSwitch.ts';
import { menu as unlockControls } from './features/unlockControls.ts';

const resetSpeedLock = () => {
  // the lock is installed on $gamePlayer, which the engine replaces
  CheatMenu.speedInitialized = false;
};

export const features: Feature<LegacyState>[] = [
  // menu-less: state shared by several menus (selected actor, amount)
  legacyFeature({
    id: 'shared',
    menus: [],
    fields: {
      selectedActor: ['cheatSelectedActor', 1],
      amountIndex: ['amountIndex', 0],
    },
  }),

  legacyFeature({
    id: 'teleport',
    menus: [['teleport', teleport]],
    fields: { location: ['teleportLocation', { m: 1, x: 0, y: 0 }] },
  }),
  legacyFeature({
    id: 'saveRecall',
    menus: [['saveRecall', saveRecall]],
    fields: {
      positions: [
        'savedPositions',
        [
          { m: -1, x: -1, y: -1 },
          { m: -1, x: -1, y: -1 },
          { m: -1, x: -1, y: -1 },
        ],
      ],
    },
  }),
  legacyFeature({ id: 'noClip', menus: [['noClip', noClip]] }),
  legacyFeature({
    id: 'speed',
    menus: [['speed', speed]],
    fields: {
      speed: ['speed', 5],
      unlocked: ['speedUnlocked', true],
      moveAmountIndex: ['moveAmountIndex', 1],
    },
    onNewGame: resetSpeedLock,
    onLoad: resetSpeedLock,
    onStateRestored: () => {
      if (!CheatMenu.speedUnlocked) CheatMenu.initializeSpeedLock();
    },
  }),
  legacyFeature({ id: 'gameSpeed', menus: [['gameSpeed', gameSpeed]] }),
  legacyFeature({
    id: 'switches',
    menus: [['switches', toggleSwitch]],
    fields: { selection: ['switchSelection', 1] },
  }),
  legacyFeature({
    id: 'variables',
    menus: [['variables', setVariable]],
    fields: { selection: ['variableSelection', 1] },
  }),
  legacyFeature({
    id: 'godMode',
    menus: [['godMode', godMode]],
    fields: { actors: ['godModeActors', []] },
    onStateRestored: () => CheatMenu.reapplyGodMode(),
  }),
  legacyFeature({ id: 'exp', menus: [['exp', giveExp]] }),
  legacyFeature({
    id: 'partyRecovery',
    menus: [
      ['partyHp', partyRecovery[0]],
      ['partyMp', partyRecovery[1]],
      ['partyTp', partyRecovery[2]],
    ],
  }),
  legacyFeature({
    id: 'enemyRecovery',
    menus: [['enemyRecovery', enemyRecovery]],
  }),
  legacyFeature({ id: 'gold', menus: [['gold', giveGold]] }),
  legacyFeature({
    id: 'items',
    menus: [['items', giveItem]],
    fields: { selection: ['itemSelection', 1] },
  }),
  legacyFeature({
    id: 'weapons',
    menus: [['weapons', giveWeapon]],
    fields: { selection: ['weaponSelection', 1] },
  }),
  legacyFeature({
    id: 'armors',
    menus: [['armors', giveArmor]],
    fields: { selection: ['armorSelection', 1] },
  }),
  legacyFeature({ id: 'clearStates', menus: [['clearStates', clearStates]] }),
  legacyFeature({
    id: 'stats',
    menus: [['stats', giveStat]],
    fields: { selection: ['statSelection', 0] },
  }),
  legacyFeature({
    id: 'unlockControls',
    menus: [['unlockControls', unlockControls]],
    fields: {
      forceMouseMovement: ['forceMouseMovement', false],
      forceCtrlSkip: ['forceCtrlSkip', false],
    },
  }),
  legacyFeature({
    id: 'saveGame',
    menus: [['saveGame', saveGame]],
    fields: { slot: ['saveSlotSelection', 1] },
  }),
  legacyFeature({ id: 'evaluate', menus: [['evaluate', evaluate]] }),
];

/**
 * Menu order of the pre-v2 plugin — old saves stored the open menu as an
 * index into it. Frozen: never reorder or edit when features change.
 */
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
