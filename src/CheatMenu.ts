import type { CheatMenuT } from './types/CheatMenu';

// Legacy singleton: runtime state and functions of the features that are not
// migrated to src/features/<name>/ yet. Menu/UI state lives in core/ (store,
// widgetState), state shared by several menus in shared/state.ts;
// legacyBridge.ts exposes the core widgets here for old code.
// Persistence is handled by the adapters in features.ts.
const CheatMenu = {
  statSelection: 0,
  itemSelection: 1,
  weaponSelection: 1,
  armorSelection: 1,
  move_amounts: [0.5, 1, 1.5, 2],
  moveAmountIndex: 1,
  variableSelection: 1,
  switchSelection: 1,
  savedPositions: [
    { m: -1, x: -1, y: -1 },
    { m: -1, x: -1, y: -1 },
    { m: -1, x: -1, y: -1 },
  ],
  teleportLocation: { m: 1, x: 0, y: 0 },
  speed: null,
  speedUnlocked: true,
  speedInitialized: false,
  gameSpeedIndex: 0,
  saveSlotSelection: 1,
  godModeActors: [] as number[],
  forceMouseMovement: false,
  forceCtrlSkip: false,
} as CheatMenuT;

export default CheatMenu;
