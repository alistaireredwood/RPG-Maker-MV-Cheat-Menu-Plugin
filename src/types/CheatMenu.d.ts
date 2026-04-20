export type PositionData = {
  m: number;
  x: number;
  y: number;
};

export type KeyCodeMapping = {
  keyCode: number;
  keyListener: number | string;
};

export type KeyListeners = {
  [key: string]: (event?: Event) => void;
  [key: number]: (event?: Event) => void;
};

export type InitialValues = {
  position: number;
  cheatSelected: number;
  cheatSelectedActor: number;
  amountIndex: number;
  statSelection: number;
  itemSelection: number;
  weaponSelection: number;
  armorSelection: number;
  moveAmountIndex: number;
  variableSelection: number;
  switchSelection: number;
  savedPositions: [PositionData, PositionData, PositionData];
  teleportLocation: PositionData;
  speed: number | null;
  speedUnlocked: boolean;
  currentMenuIndex: number | null;
};

export type CheatMenuT = {
  // --- Properties ---

  initialized: boolean;
  isCheatMenuOpen: boolean;
  isOverlayOpenable: boolean;
  position: number;
  menuUpdateTimer: NodeJS.Timeout | null;

  cheatSelected: number;
  cheatSelectedActor: number;
  amounts: number[];
  amountIndex: number;
  statSelection: number;
  itemSelection: number;
  weaponSelection: number;
  armorSelection: number;
  move_amounts: number[];
  moveAmountIndex: number;

  variableSelection: number;
  switchSelection: number;

  savedPositions: [PositionData, PositionData, PositionData];
  teleportLocation: PositionData;

  speed: number | null;
  speedUnlocked: boolean;
  speedInitialized: boolean;

  initialValues: InitialValues;

  // DOM Elements
  overlayBox: HTMLDivElement;
  overlay: HTMLTableElement;
  styleCss: HTMLLinkElement;

  menus: MenuEntry[];
  currentMenuIndex: number | null;
  renderMainMenuGrid: () => void;
  appendBackButton: () => void;

  keyListeners: KeyListeners;

  keyMappings: {
    [keyName: string]: string;
  };

  // --- Cheat Functions ---

  godMode: (actor: CheatMenu_Game_Actor) => void;
  godMode_off: (actor: CheatMenu_Game_Actor) => void;
  setPartyHp: (hp: number, alive: boolean) => void;
  setPartyMp: (mp: number, alive: boolean) => void;
  setPartyTp: (tp: number, alive: boolean) => void;
  recoverPartyHp: (alive: boolean) => void;
  recoverPartyMp: (alive: boolean) => void;
  recoverPartyTp: (alive: boolean) => void;
  setEnemyHp: (hp: number, alive: boolean) => void;
  giveExp: (actor: CheatMenu_Game_Actor, amount: number) => void;
  giveStat: (
    actor: CheatMenu_Game_Actor,
    statIndex: number,
    amount: number,
  ) => void;
  giveGold: (amount: number) => void;
  giveItem: (itemId: number, amount: number) => void;
  giveWeapon: (weaponId: number, amount: number) => void;
  giveArmor: (armorId: number, amount: number) => void;
  initializeSpeedLock: () => void;
  changePlayerSpeed: (amount: number) => void;
  toggleLockPlayerSpeed: () => void;
  clearActorStates: (actor: CheatMenu_Game_Actor) => void;
  clearPartyStates: () => void;
  setVariable: (variableId: number, value: number) => void;
  toggleSwitch: (switchId: number) => void;
  teleport: (mapId: number, xPos: number, yPos: number) => void;

  // --- Overlay and Menu Building Functions ---

  positionMenu: (event?: Event) => void;

  appendScrollSelector: (
    text: string | number,
    key1: string | number,
    key2: string | number,
    scrollHandler: (direction: 'left' | 'right', event?: MouseEvent) => void,
  ) => void;

  appendTitle: (title: string) => void;
  appendDescription: (text: string) => void;
  appendCheat: (
    cheatText: string,
    statusText: string | number | boolean | null,
    key: string | number,
    clickHandler: (event?: MouseEvent) => void,
  ) => void;

  // --- Menu Page Setup Functions ---

  scrollCheat: (direction: 'left' | 'right', event?: MouseEvent) => void;
  appendCheatTitle: (cheatName: string) => void;

  scrollActor: (direction: 'left' | 'right', event?: MouseEvent) => void;
  appendActorSelection: (
    key1: string | number,
    key2: string | number,
  ) => void;

  toggleGodMode: (event?: MouseEvent) => void;
  appendGodmodeStatus: () => void;

  enemyHpCheat1: () => void;
  enemyHpCheat2: () => void;
  enemyHpCheat3: () => void;
  enemyHpCheat4: () => void;
  appendEnemyCheats: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ) => void;

  partyHpCheat1: () => void;
  partyHpCheat2: () => void;
  partyHpCheat3: () => void;
  partyHpCheat4: () => void;
  partyHpCheat5: () => void;
  partyHpCheat6: () => void;
  appendHpCheats: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
  ) => void;

  partyMpCheat1: () => void;
  partyMpCheat2: () => void;
  partyMpCheat3: () => void;
  partyMpCheat4: () => void;
  partyMpCheat5: () => void;
  partyMpCheat6: () => void;
  appendMpCheats: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
  ) => void;

  partyTpCheat1: () => void;
  partyTpCheat2: () => void;
  partyTpCheat3: () => void;
  partyTpCheat4: () => void;
  partyTpCheat5: () => void;
  partyTpCheat6: () => void;
  appendTpCheats: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
  ) => void;

  toggleNoClipStatus: (event?: MouseEvent) => void;
  appendNoClipStatus: (key1: string | number) => void;

  scrollAmount: (direction: 'left' | 'right', event?: MouseEvent) => void;
  appendAmountSelection: (
    key1: string | number,
    key2: string | number,
  ) => void;

  scrollMoveAmount: (direction: 'left' | 'right', event?: MouseEvent) => void;
  appendMoveAmountSelection: (
    key1: string | number,
    key2: string | number,
  ) => void;

  applyCurrentExp: (direction: 'left' | 'right', event?: MouseEvent) => void;
  appendExpCheat: (key1: string | number, key2: string | number) => void;

  scrollStat: (direction: 'left' | 'right', event?: MouseEvent) => void;
  applyCurrentStat: (direction: 'left' | 'right', event?: MouseEvent) => void;
  appendStatSelection: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ) => void;

  applyCurrentGold: (direction: 'left' | 'right', event?: MouseEvent) => void;
  appendGoldStatus: (key1: string | number, key2: string | number) => void;

  applySpeedChange: (direction: 'left' | 'right', event?: MouseEvent) => void;
  applySpeedLockToggle: () => void;
  appendSpeedStatus: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
  ) => void;

  scrollItem: (direction: 'left' | 'right', event?: MouseEvent) => void;
  applyCurrentItem: (direction: 'left' | 'right', event?: MouseEvent) => void;
  appendItemSelection: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ) => void;

  scrollWeapon: (direction: 'left' | 'right', event?: MouseEvent) => void;
  applyCurrentWeapon: (
    direction: 'left' | 'right',
    event?: MouseEvent,
  ) => void;
  appendWeaponSelection: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ) => void;

  scrollArmor: (direction: 'left' | 'right', event?: MouseEvent) => void;
  applyCurrentArmor: (
    direction: 'left' | 'right',
    event?: MouseEvent,
  ) => void;
  appendArmorSelection: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ) => void;

  clearCurrentActorStates: () => void;
  partyClearStatesCheat: () => void;
  appendPartyState: (key1: string | number) => void;
  appendCurrentState: (key1: string | number) => void;

  scrollVariable: (direction: 'left' | 'right', event?: MouseEvent) => void;
  applyCurrentVariable: (
    direction: 'left' | 'right',
    event?: MouseEvent,
  ) => void;
  appendVariableSelection: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ) => void;

  scrollSwitch: (direction: 'left' | 'right', event?: MouseEvent) => void;
  toggleCurrentSwitch: (event?: MouseEvent) => void;
  appendSwitchSelection: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
  ) => void;

  savePosition: (posNum: number, event?: MouseEvent) => void;
  recallPosition: (posNum: number, event?: MouseEvent) => void;
  appendSaveRecall: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
  ) => void;

  scrollMapTeleportSelection: (
    direction: 'left' | 'right',
    event?: MouseEvent,
  ) => void;
  scrollXTeleportSelection: (
    direction: 'left' | 'right',
    event?: MouseEvent,
  ) => void;
  scrollYTeleportSelection: (
    direction: 'left' | 'right',
    event?: MouseEvent,
  ) => void;
  teleportCurrentLocation: (event?: MouseEvent) => void;
  appendTeleport: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
    key7: string | number,
  ) => void;

  // --- Core Menu Logic & Input Handlers ---
  updateMenu: () => void;
  initialize: () => void;
  handleShowDevTools: (event: KeyboardEvent) => void;
  handleShowRpgMakerDebug: (event: KeyboardEvent) => void;
  handleToggleCheatMenu: (event: KeyboardEvent) => void;
};

export type MenuEntry = {
  name: string;
  render: () => void;
};
