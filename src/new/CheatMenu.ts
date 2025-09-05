import type { CheatMenuT } from '../types/CheatMenu';

const CheatMenu = {
  initialized: false,
  isCheatMenuOpen: false,
  isOverlayOpenable: false,
  position: 1,
  menu_update_timer: null,
  cheat_selected: 0,
  cheat_selected_actor: 1,
  amounts: [1, 10, 100, 1000, 10000, 100000, 1000000],
  amount_index: 0,
  stat_selection: 0,
  item_selection: 1,
  weapon_selection: 1,
  armor_selection: 1,
  move_amounts: [0.5, 1, 1.5, 2],
  move_amount_index: 1,
  variable_selection: 1,
  switch_selection: 1,
  saved_positions: [
    { m: -1, x: -1, y: -1 },
    { m: -1, x: -1, y: -1 },
    { m: -1, x: -1, y: -1 },
  ],
  teleport_location: { m: 1, x: 0, y: 0 },
  speed: null,
  speed_unlocked: true,
  speed_initialized: false,
} as CheatMenuT;

// Check if already defined (allows game specific extensions to be loaded in any order)
if (!CheatMenu.initialValues) {
  CheatMenu.initialValues = {
    position: 1,
    cheat_selected: 0,
    cheat_selected_actor: 1,
    amount_index: 0,
    stat_selection: 0,
    item_selection: 1,
    weapon_selection: 1,
    armor_selection: 1,
    move_amount_index: 1,
    variable_selection: 1,
    switch_selection: 1,
    saved_positions: [
      { m: -1, x: -1, y: -1 },
      { m: -1, x: -1, y: -1 },
      { m: -1, x: -1, y: -1 },
    ],
    teleport_location: { m: 1, x: 0, y: 0 },
    speed: 5,
    speed_unlocked: true,
  };
}

export default CheatMenu;
