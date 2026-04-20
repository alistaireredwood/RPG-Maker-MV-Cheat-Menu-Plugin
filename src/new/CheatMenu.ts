import type { CheatMenuT } from '../types/CheatMenu';

const CheatMenu = {
  initialized: false,
  isCheatMenuOpen: false,
  isOverlayOpenable: false,
  position: 1,
  menuUpdateTimer: null,
  cheatSelected: 0,
  cheatSelectedActor: 1,
  amounts: [1, 10, 100, 1000, 10000, 100000, 1000000],
  amountIndex: 0,
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
} as CheatMenuT;

// Check if already defined (allows game specific extensions to be loaded in any order)
if (!CheatMenu.initialValues) {
  CheatMenu.initialValues = {
    position: 1,
    cheatSelected: 0,
    cheatSelectedActor: 1,
    amountIndex: 0,
    statSelection: 0,
    itemSelection: 1,
    weaponSelection: 1,
    armorSelection: 1,
    moveAmountIndex: 1,
    variableSelection: 1,
    switchSelection: 1,
    savedPositions: [
      { m: -1, x: -1, y: -1 },
      { m: -1, x: -1, y: -1 },
      { m: -1, x: -1, y: -1 },
    ],
    teleportLocation: { m: 1, x: 0, y: 0 },
    speed: 5,
    speedUnlocked: true,
    currentMenuIndex: null,
  };
}

export default CheatMenu;
