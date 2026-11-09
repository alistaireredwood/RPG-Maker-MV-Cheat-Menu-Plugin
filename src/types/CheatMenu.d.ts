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
  godModeActors: number[];
  currentMenuIndex: number | null;
  forceMouseMovement: boolean;
  forceCtrlSkip: boolean;
  saveSlotSelection: number;
};

export type CheatMenuT = {
  _prevMenuIndex: number | null;
  // --- Properties ---

  initialized: boolean;
  isCheatMenuOpen: boolean;
  isOverlayOpenable: boolean;
  position: number;
  menuUpdateTimer: NodeJS.Timeout | null;

  cheatSelectedActor: number;
  amounts: number[];
  amountIndex: number;
  customAmount: number | null;
  amountInputText: string | null;
  _activeAmountInput: boolean;
  /** appendValueInput drafts (typed, not yet applied) — not persisted to save */
  _valueInputDrafts: Record<string, { text: string; caret: number }>;
  _activeValueInputKey: string | null;
  /** focus/caret of the appendCodeInput textarea, restored across re-renders */
  _activeCodeInput: { key: string; caret: number; scroll: number } | null;
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

  gameSpeedIndex: number;
  saveSlotSelection: number;

  godModeActors: number[];

  forceMouseMovement: boolean;
  forceCtrlSkip: boolean;

  searchKeywords: Record<string, string>;
  _activeSearchKey: string | null;

  initialValues: InitialValues;

  // DOM Elements
  overlay: HTMLTableElement;
  styleCss: HTMLLinkElement;

  // --- Pop-out window (core/popout.ts) ---
  isPoppedOut: boolean;
  canPopout: () => boolean;
  getMenuDocument: () => Document;
  openPopout: () => void;
  closePopout: (keepMenuOpen?: boolean) => void;
  togglePopout: () => void;

  menus: MenuEntry[];
  currentMenuIndex: number | null;
  renderMainMenuGrid: () => void;
  appendBackButton: () => void;
  appendTopBar: () => void;

  keyListeners: KeyListeners;

  keyMappings: {
    [keyName: string]: string;
  };

  // --- Cheat Functions ---

  godMode: (actor: CheatMenu_Game_Actor) => void;
  godMode_off: (actor: CheatMenu_Game_Actor) => void;
  reapplyGodMode: () => void;
  setPartyHp: (hp: number, alive: boolean) => void;
  setPartyMp: (mp: number, alive: boolean) => void;
  setPartyTp: (tp: number, alive: boolean) => void;
  recoverPartyHp: (alive: boolean) => void;
  recoverPartyMp: (alive: boolean) => void;
  recoverPartyTp: (alive: boolean) => void;
  halfPartyHp: (alive: boolean) => void;
  halfPartyMp: (alive: boolean) => void;
  halfPartyTp: (alive: boolean) => void;
  setEnemyHp: (hp: number, alive: boolean) => void;
  halfEnemyHp: (alive: boolean) => void;
  recoverEnemyHp: (alive: boolean) => void;
  giveExp: (actor: CheatMenu_Game_Actor | null, amount: number) => void;
  giveStat: (
    actor: CheatMenu_Game_Actor | null,
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
  setVariableValue: (variableId: number, text: string) => void;
  toggleSwitch: (switchId: number) => void;
  teleport: (mapId: number, xPos: number, yPos: number) => void;

  // --- Overlay and Menu Building Functions ---

  positionMenu: (event?: Event) => void;

  appendScrollSelector: (
    text: string | number,
    key1: string | number,
    key2: string | number,
    scrollHandler: (direction: 'left' | 'right', event?: MouseEvent) => void,
    selectable?: boolean,
    showArrows?: boolean,
  ) => void;

  appendValueInput: (
    value: string,
    inputKey: string,
    onCommit: (text: string) => void,
    key1: string | number,
    key2: string | number,
    scrollHandler: (direction: 'left' | 'right', event?: MouseEvent) => void,
    showArrows?: boolean,
  ) => void;

  appendCodeInput: (
    inputKey: string,
    value: string,
    onChange: (text: string) => void,
    onSubmit: (text: string) => void,
    rows?: number,
  ) => void;

  appendTitle: (title: string, sideText?: string) => void;
  appendDescription: (text: string) => void;
  appendWideDescription: (html: string) => void;
  appendCheat: (
    cheatText: string,
    statusText: string | number | boolean | null,
    key: string | number,
    clickHandler: (event?: MouseEvent) => void,
  ) => void;

  // --- Menu Page Setup Functions ---

  scrollCheat: (direction: 'left' | 'right', event?: MouseEvent) => void;
  appendCheatTitle: () => void;

  scrollActor: (direction: 'left' | 'right', event?: MouseEvent) => void;
  appendActorSelection: (key1: string | number, key2: string | number) => void;

  toggleGodMode: (event?: MouseEvent) => void;
  appendGodmodeStatus: () => void;

  appendEnemyCheats: (...keys: (string | number)[]) => void;

  appendHpCheats: (...keys: (string | number)[]) => void;

  appendMpCheats: (...keys: (string | number)[]) => void;

  appendTpCheats: (...keys: (string | number)[]) => void;

  toggleNoClipStatus: (event?: MouseEvent) => void;
  appendNoClipStatus: (key1: string | number) => void;

  toggleForceMouseMovement: (event?: MouseEvent) => void;
  toggleForceCtrlSkip: (event?: MouseEvent) => void;
  appendUnlockControlsStatus: (
    key1: string | number,
    key2: string | number,
  ) => void;

  scrollAmount: (direction: 'left' | 'right', event?: MouseEvent) => void;
  appendAmountSelection: (key1: string | number, key2: string | number) => void;

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

  scrollGameSpeed: (direction: 'left' | 'right', event?: MouseEvent) => void;
  resetGameSpeed: (event?: MouseEvent) => void;
  appendGameSpeed: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
  ) => void;

  scrollSaveSlot: (direction: 'left' | 'right', event?: MouseEvent) => void;
  saveToSelectedSlot: (event?: MouseEvent) => void;
  runEvaluate: (event?: MouseEvent) => void;
  appendEvaluate: (key1: string | number, key2: string | number) => void;

  appendSaveGame: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
  ) => void;
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
  applyCurrentWeapon: (direction: 'left' | 'right', event?: MouseEvent) => void;
  appendWeaponSelection: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ) => void;

  scrollArmor: (direction: 'left' | 'right', event?: MouseEvent) => void;
  applyCurrentArmor: (direction: 'left' | 'right', event?: MouseEvent) => void;
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

  appendSearchInput: (
    placeholder: string,
    stateKey: string,
    onSearchChange?: (keyword: string) => void,
  ) => void;

  // --- Core Menu Logic & Input Handlers ---
  updateMenu: () => void;
  initialize: () => void;
  handleShowDevTools: (event: KeyboardEvent) => void;
  handleShowRpgMakerDebug: (event: KeyboardEvent) => void;
  handleToggleCheatMenu: (event: KeyboardEvent) => void;
  onKeyDown: (event: KeyboardEvent) => void;
};

export type MenuEntry = {
  name: string;
  render: () => void;
};
