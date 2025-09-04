// This file defines the complete shape of the CheatMenu object.
// We use `export type` so these definitions can be imported into other files.

// --- Helper Types ---
// These were previously nested inside the namespace. We now export them directly.

export type PositionData = {
  m: number; // mapId
  x: number; // x-coordinate
  y: number; // y-coordinate
};

export type KeyCodeMapping = {
  keyCode: number;
  key_listener: number | string;
};

export type KeyListeners = {
  [key: string]: (event?: Event) => void;
  [key: number]: (event?: Event) => void;
};

export type InitialValues = {
  position: number;
  cheat_selected: number;
  cheat_selected_actor: number;
  amount_index: number;
  stat_selection: number;
  item_selection: number;
  weapon_selection: number;
  armor_selection: number;
  move_amount_index: number;
  variable_selection: number;
  switch_selection: number;
  saved_positions: [PositionData, PositionData, PositionData];
  teleport_location: PositionData;
  speed: number | null;
  speed_unlocked: boolean;
};

// --- The Main CheatMenu Type Definition ---
// This replaces the entire `declare namespace CheatMenu`.

export type CheatMenuT = {
  // --- Properties ---

  initialized: boolean;
  isCheatMenuOpen: boolean;
  isOverlayOpenable: boolean;
  position: number; // 0: middle, 1: TL, 2: TR, 3: BR, 4: BL
  menu_update_timer: NodeJS.Timeout | null;

  cheat_selected: number; // Index for current menu page
  cheat_selected_actor: number; // Actor ID
  amounts: number[];
  amount_index: number;
  stat_selection: number; // Index for actor parameters (0:MHP, 1:MMP, etc.)
  item_selection: number; // Item ID
  weapon_selection: number; // Weapon ID
  armor_selection: number; // Armor ID
  move_amounts: number[];
  move_amount_index: number;

  variable_selection: number; // Variable ID
  switch_selection: number; // Switch ID

  saved_positions: [PositionData, PositionData, PositionData];
  teleport_location: PositionData;

  speed: number | null;
  speed_unlocked: boolean;
  speed_initialized: boolean;

  initialValues: InitialValues;

  // DOM Elements
  overlay_box: HTMLDivElement;
  overlay: HTMLTableElement;
  style_css: HTMLLinkElement;

  // Menu building functions list
  menus: Array<() => void>;

  // Key listeners (dynamically populated)
  key_listeners: KeyListeners;

  // Key code mappings
  keyMappings: {
    [keyName: string]: string;
  };

  // --- Cheat Functions ---
  // Note the syntax change: `function name(...)` becomes `name: (...) => ...`

  godMode: (actor: CheatMenu_Game_Actor) => void;
  godMode_off: (actor: CheatMenu_Game_Actor) => void;
  set_party_hp: (hp: number, alive: boolean) => void;
  set_party_mp: (mp: number, alive: boolean) => void;
  set_party_tp: (tp: number, alive: boolean) => void;
  recover_party_hp: (alive: boolean) => void;
  recover_party_mp: (alive: boolean) => void;
  recover_party_tp: (alive: boolean) => void;
  set_enemy_hp: (hp: number, alive: boolean) => void;
  give_exp: (actor: CheatMenu_Game_Actor, amount: number) => void;
  give_stat: (
    actor: CheatMenu_Game_Actor,
    stat_index: number,
    amount: number,
  ) => void;
  give_gold: (amount: number) => void;
  give_item: (item_id: number, amount: number) => void;
  give_weapon: (weapon_id: number, amount: number) => void;
  give_armor: (armor_id: number, amount: number) => void;
  initialize_speed_lock: () => void;
  change_player_speed: (amount: number) => void;
  toggle_lock_player_speed: () => void;
  clear_actor_states: (actor: CheatMenu_Game_Actor) => void;
  clear_party_states: () => void;
  set_variable: (variable_id: number, value: number) => void;
  toggle_switch: (switch_id: number) => void;
  teleport: (map_id: number, x_pos: number, y_pos: number) => void;

  // --- Overlay and Menu Building Functions ---

  position_menu: (event?: Event) => void;

  append_scroll_selector: (
    text: string | number,
    key1: string | number,
    key2: string | number,
    scroll_handler: (direction: 'left' | 'right', event?: MouseEvent) => void,
  ) => void;

  append_title: (title: string) => void;
  append_description: (text: string) => void;
  append_cheat: (
    cheat_text: string,
    status_text: string | number | boolean | null,
    key: string | number,
    click_handler: (event?: MouseEvent) => void,
  ) => void;

  // --- Menu Page Setup Functions ---

  scroll_cheat: (direction: 'left' | 'right', event?: MouseEvent) => void;
  append_cheat_title: (cheat_name: string) => void;

  scroll_actor: (direction: 'left' | 'right', event?: MouseEvent) => void;
  append_actor_selection: (
    key1: string | number,
    key2: string | number,
  ) => void;

  toggleGodMode: (event?: MouseEvent) => void;
  append_godmode_status: () => void;

  enemy_hp_cheat_1: () => void;
  enemy_hp_cheat_2: () => void;
  enemy_hp_cheat_3: () => void;
  enemy_hp_cheat_4: () => void;
  append_enemy_cheats: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ) => void;

  party_hp_cheat_1: () => void;
  party_hp_cheat_2: () => void;
  party_hp_cheat_3: () => void;
  party_hp_cheat_4: () => void;
  party_hp_cheat_5: () => void;
  party_hp_cheat_6: () => void;
  append_hp_cheats: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
  ) => void;

  party_mp_cheat_1: () => void;
  party_mp_cheat_2: () => void;
  party_mp_cheat_3: () => void;
  party_mp_cheat_4: () => void;
  party_mp_cheat_5: () => void;
  party_mp_cheat_6: () => void;
  append_mp_cheats: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
  ) => void;

  party_tp_cheat_1: () => void;
  party_tp_cheat_2: () => void;
  party_tp_cheat_3: () => void;
  party_tp_cheat_4: () => void;
  party_tp_cheat_5: () => void;
  party_tp_cheat_6: () => void;
  append_tp_cheats: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
  ) => void;

  toggle_no_clip_status: (event?: MouseEvent) => void;
  append_no_clip_status: (key1: string | number) => void;

  scroll_amount: (direction: 'left' | 'right', event?: MouseEvent) => void;
  append_amount_selection: (
    key1: string | number,
    key2: string | number,
  ) => void;

  scroll_move_amount: (direction: 'left' | 'right', event?: MouseEvent) => void;
  append_move_amount_selection: (
    key1: string | number,
    key2: string | number,
  ) => void;

  apply_current_exp: (direction: 'left' | 'right', event?: MouseEvent) => void;
  append_exp_cheat: (key1: string | number, key2: string | number) => void;

  scroll_stat: (direction: 'left' | 'right', event?: MouseEvent) => void;
  apply_current_stat: (direction: 'left' | 'right', event?: MouseEvent) => void;
  append_stat_selection: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ) => void;

  apply_current_gold: (direction: 'left' | 'right', event?: MouseEvent) => void;
  append_gold_status: (key1: string | number, key2: string | number) => void;

  apply_speed_change: (direction: 'left' | 'right', event?: MouseEvent) => void;
  apply_speed_lock_toggle: () => void;
  append_speed_status: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
  ) => void;

  scroll_item: (direction: 'left' | 'right', event?: MouseEvent) => void;
  apply_current_item: (direction: 'left' | 'right', event?: MouseEvent) => void;
  append_item_selection: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ) => void;

  scroll_weapon: (direction: 'left' | 'right', event?: MouseEvent) => void;
  apply_current_weapon: (
    direction: 'left' | 'right',
    event?: MouseEvent,
  ) => void;
  append_weapon_selection: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ) => void;

  scroll_armor: (direction: 'left' | 'right', event?: MouseEvent) => void;
  apply_current_armor: (
    direction: 'left' | 'right',
    event?: MouseEvent,
  ) => void;
  append_armor_selection: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ) => void;

  clear_current_actor_states: () => void;
  party_clear_states_cheat: () => void;
  append_party_state: (key1: string | number) => void;
  append_current_state: (key1: string | number) => void;

  scroll_variable: (direction: 'left' | 'right', event?: MouseEvent) => void;
  apply_current_variable: (
    direction: 'left' | 'right',
    event?: MouseEvent,
  ) => void;
  append_variable_selection: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ) => void;

  scroll_switch: (direction: 'left' | 'right', event?: MouseEvent) => void;
  toggle_current_switch: (event?: MouseEvent) => void;
  append_switch_selection: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
  ) => void;

  save_position: (pos_num: number, event?: MouseEvent) => void;
  recall_position: (pos_num: number, event?: MouseEvent) => void;
  append_save_recall: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
  ) => void;

  scroll_map_teleport_selection: (
    direction: 'left' | 'right',
    event?: MouseEvent,
  ) => void;
  scroll_x_teleport_selection: (
    direction: 'left' | 'right',
    event?: MouseEvent,
  ) => void;
  scroll_y_teleport_selection: (
    direction: 'left' | 'right',
    event?: MouseEvent,
  ) => void;
  teleport_current_location: (event?: MouseEvent) => void;
  append_teleport: (
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
    key7: string | number,
  ) => void;

  // --- Core Menu Logic & Input Handlers ---
  update_menu: () => void;
  initialize: () => void;
  handleShowDevTools: (event: KeyboardEvent) => void;
  handleShowRpgMakerDebug: (event: KeyboardEvent) => void;
  handleToggleCheatMenu: (event: KeyboardEvent) => void;
};
