declare namespace Cheat_Menu {
  // --- Types for internal state and structures ---

  interface PositionData {
    m: number; // mapId
    x: number; // x-coordinate
    y: number; // y-coordinate
  }

  interface KeyCodeMapping {
    keyCode: number;
    key_listener: number | string; // e.g., 0, 1, '-', '`'
  }

  interface KeyListeners {
    [key: string]: (event?: MouseEvent) => void; // Key can be number or string
    [key: number]: (event?: MouseEvent) => void;
  }

  interface InitialValues {
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
  }

  // Type for data saved in $gameSystem.Cheat_Menu
  // This should mirror InitialValues as that's what's being saved/loaded
  type SavedValues = InitialValues;

  // --- Properties ---

  let initialized: boolean;
  let cheat_menu_open: boolean;
  let overlay_openable: boolean;
  let position: number; // 0: middle, 1: TL, 2: TR, 3: BR, 4: BL
  let menu_update_timer: NodeJS.Timeout;

  let cheat_selected: number; // Index for current menu page
  let cheat_selected_actor: number; // Actor ID (1-indexed usually in RMMV)
  let amounts: number[];
  let amount_index: number;
  let stat_selection: number; // Index for actor parameters (0:MHP, 1:MMP, etc.)
  let item_selection: number; // Item ID
  let weapon_selection: number; // Weapon ID
  let armor_selection: number; // Armor ID
  let move_amounts: number[];
  let move_amount_index: number;

  let variable_selection: number; // Variable ID
  let switch_selection: number; // Switch ID

  let saved_positions: [PositionData, PositionData, PositionData];
  let teleport_location: PositionData;

  let speed: number | null;
  let speed_unlocked: boolean;
  let speed_initialized: boolean;

  let initial_values: InitialValues;

  // DOM Elements
  let overlay_box: HTMLDivElement;
  let overlay: HTMLTableElement;
  let style_css: HTMLLinkElement;

  // Menu building functions
  let menus: Array<() => void>;

  // Key listeners (dynamically populated)
  let key_listeners: KeyListeners;

  // Key code mappings
  let keyMappings: {
    [keyName: string]: string;
  };

  // --- Cheat Functions ---

  function god_mode(actor: Cheat_Menu_Game_Actor): void;
  function god_mode_off(actor: Cheat_Menu_Game_Actor): void;
  function set_party_hp(hp: number, alive: boolean): void;
  function set_party_mp(mp: number, alive: boolean): void;
  function set_party_tp(tp: number, alive: boolean): void;
  function recover_party_hp(alive: boolean): void;
  function recover_party_mp(alive: boolean): void;
  function recover_party_tp(alive: boolean): void;
  function set_enemy_hp(hp: number, alive: boolean): void;
  function give_exp(actor: Cheat_Menu_Game_Actor, amount: number): void;
  function give_stat(
    actor: Cheat_Menu_Game_Actor,
    stat_index: number,
    amount: number,
  ): void;
  function give_gold(amount: number): void;
  function give_item(item_id: number, amount: number): void;
  function give_weapon(weapon_id: number, amount: number): void;
  function give_armor(armor_id: number, amount: number): void;
  function initialize_speed_lock(): void;
  function change_player_speed(amount: number): void;
  function toggle_lock_player_speed(): void; // Original code had 'amount' param, but not used.
  function clear_actor_states(actor: Game_Actor): void;
  function clear_party_states(): void;
  function set_variable(variable_id: number, value: number): void;
  function toggle_switch(switch_id: number): void;
  function teleport(map_id: number, x_pos: number, y_pos: number): void;

  // --- Overlay and Menu Building Functions ---

  function position_menu(event?: Event): void; // event might be from resize

  function append_scroll_selector(
    text: string | number,
    key1: string | number,
    key2: string | number,
    scroll_handler: (direction: 'left' | 'right', event?: MouseEvent) => void,
  ): void;

  function append_title(title: string): void;
  function append_description(text: string): void;
  function append_cheat(
    cheat_text: string,
    status_text: string | number | boolean | null, // Status can be varied
    key: string | number,
    click_handler: (event?: MouseEvent) => void,
  ): void;

  // --- Menu Page Setup Functions (Internal helpers for building specific menu pages) ---

  function scroll_cheat(direction: 'left' | 'right', event?: MouseEvent): void;
  function append_cheat_title(cheat_name: string): void;

  function scroll_actor(direction: 'left' | 'right', event?: MouseEvent): void;
  function append_actor_selection(
    key1: string | number,
    key2: string | number,
  ): void;

  function god_mode_toggle(event?: MouseEvent): void;
  function append_godmode_status(): void;

  function enemy_hp_cheat_1(): void;
  function enemy_hp_cheat_2(): void;
  function enemy_hp_cheat_3(): void;
  function enemy_hp_cheat_4(): void;
  function append_enemy_cheats(
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ): void;

  function party_hp_cheat_1(): void;
  function party_hp_cheat_2(): void;
  function party_hp_cheat_3(): void;
  function party_hp_cheat_4(): void;
  function party_hp_cheat_5(): void;
  function party_hp_cheat_6(): void;
  function append_hp_cheats(
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
  ): void;

  function party_mp_cheat_1(): void;
  function party_mp_cheat_2(): void;
  function party_mp_cheat_3(): void;
  function party_mp_cheat_4(): void;
  function party_mp_cheat_5(): void;
  function party_mp_cheat_6(): void;
  // ... (similar for other party_mp_cheat_N and append_mp_cheats)
  function append_mp_cheats(
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
  ): void;

  function party_tp_cheat_1(): void;
  function party_tp_cheat_2(): void;
  function party_tp_cheat_3(): void;
  function party_tp_cheat_4(): void;
  function party_tp_cheat_5(): void;
  function party_tp_cheat_6(): void;
  // ... (similar for other party_tp_cheat_N and append_tp_cheats)
  function append_tp_cheats(
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
  ): void;

  function toggle_no_clip_status(event?: MouseEvent): void;
  function append_no_clip_status(key1: string | number): void;

  function scroll_amount(direction: 'left' | 'right', event?: MouseEvent): void;
  function append_amount_selection(
    key1: string | number,
    key2: string | number,
  ): void;

  function scroll_move_amount(
    direction: 'left' | 'right',
    event?: MouseEvent,
  ): void;
  function append_move_amount_selection(
    key1: string | number,
    key2: string | number,
  ): void;

  function apply_current_exp(
    direction: 'left' | 'right',
    event?: MouseEvent,
  ): void;
  function append_exp_cheat(key1: string | number, key2: string | number): void;

  function scroll_stat(direction: 'left' | 'right', event?: MouseEvent): void;
  function apply_current_stat(
    direction: 'left' | 'right',
    event?: MouseEvent,
  ): void;
  function append_stat_selection(
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ): void;

  function apply_current_gold(
    direction: 'left' | 'right',
    event?: MouseEvent,
  ): void;
  function append_gold_status(
    key1: string | number,
    key2: string | number,
  ): void;

  function apply_speed_change(
    direction: 'left' | 'right',
    event?: MouseEvent,
  ): void;
  function apply_speed_lock_toggle(): void;
  function append_speed_status(
    key1: string | number,
    key2: string | number,
    key3: string | number,
  ): void;

  function scroll_item(direction: 'left' | 'right', event?: MouseEvent): void;
  function apply_current_item(
    direction: 'left' | 'right',
    event?: MouseEvent,
  ): void;
  function append_item_selection(
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ): void;

  function scroll_weapon(direction: 'left' | 'right', event?: MouseEvent): void;
  function apply_current_weapon(
    direction: 'left' | 'right',
    event?: MouseEvent,
  ): void;
  function append_weapon_selection(
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ): void;

  function scroll_armor(direction: 'left' | 'right', event?: MouseEvent): void;
  function apply_current_armor(
    direction: 'left' | 'right',
    event?: MouseEvent,
  ): void;
  function append_armor_selection(
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ): void;

  function clear_current_actor_states(): void;
  function party_clear_states_cheat(): void;
  function append_party_state(key1: string | number): void;
  function append_current_state(key1: string | number): void;

  function scroll_variable(
    direction: 'left' | 'right',
    event?: MouseEvent,
  ): void;
  function apply_current_variable(
    direction: 'left' | 'right',
    event?: MouseEvent,
  ): void;
  function append_variable_selection(
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
  ): void;

  function scroll_switch(direction: 'left' | 'right', event?: MouseEvent): void;
  function toggle_current_switch(event?: MouseEvent): void;
  function append_switch_selection(
    key1: string | number,
    key2: string | number,
    key3: string | number,
  ): void;

  function save_position(pos_num: number, event?: MouseEvent): void;
  function recall_position(pos_num: number, event?: MouseEvent): void;
  function append_save_recall(
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
  ): void;

  function scroll_map_teleport_selection(
    direction: 'left' | 'right',
    event?: MouseEvent,
  ): void;
  function scroll_x_teleport_selection(
    direction: 'left' | 'right',
    event?: MouseEvent,
  ): void;
  function scroll_y_teleport_selection(
    direction: 'left' | 'right',
    event?: MouseEvent,
  ): void;
  function teleport_current_location(event?: MouseEvent): void;
  function append_teleport(
    key1: string | number,
    key2: string | number,
    key3: string | number,
    key4: string | number,
    key5: string | number,
    key6: string | number,
    key7: string | number,
  ): void;

  // --- Core Menu Logic ---
  function update_menu(): void;
  function initialize(): void; // For load/new game hooks
}

// Make Cheat_Menu available globally if it's intended to be used as such.
// This is often how RMMV plugins expose themselves if they aren't proper classes/modules.
// However, since the original code does `if (typeof Cheat_Menu == "undefined") { Cheat_Menu = {}; }`,
// it's already establishing itself on the global scope (e.g., window.Cheat_Menu).
// The `declare namespace Cheat_Menu` above should be sufficient for TypeScript to find it
// when you refer to `Cheat_Menu.someProperty` or `Cheat_Menu.someFunction()`.

// If you were to use this in a module system and needed to explicitly declare it on the window:
/*
declare global {
    interface Window {
        Cheat_Menu: typeof Cheat_Menu; // Exposes the namespace structure
    }
}
*/
// But for RMMV plugins that create globals directly, just `declare namespace` is usually enough.
