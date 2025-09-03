/////////////////////////////////////////////////
// Cheat Menu Plugin Class
/////////////////////////////////////////////////
// Check if already defined (allows game specific extensions to be loaded in any order)

import CheatMenu from './CheatMenu.ts';
import './features/godMode.ts';
import './features/partyRecovery.ts';

(window as any).Cheat_Menu = CheatMenu;

/////////////////////////////////////////////////
// Initial values for resetting on new game/load
/////////////////////////////////////////////////

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

/////////////////////////////////////////////////
// Cheat Functions
/////////////////////////////////////////////////

// set all enemies hp
CheatMenu.set_enemy_hp = (hp, alive) => {
  let members = $gameTroop.members();
  for (let i = 0; i < members.length; i++) {
    if (members[i]) {
      if ((alive && members[i].hp != 0) || !alive) {
        members[i].setHp(hp);
      }
    }
  }
};

// increase exp
CheatMenu.give_exp = (actor, amount) => {
  actor.gainExp(amount);
};

// increase stat bonus
CheatMenu.give_stat = (actor, stat_index, amount) => {
  if (actor.paramPlus(stat_index) != undefined) {
    actor.addParam(stat_index, amount);
  }
};

// increase gold
CheatMenu.give_gold = (amount) => {
  $gameParty.gainGold(amount);
};

// increase item count for party of item, by id
CheatMenu.give_item = (item_id, amount) => {
  if ($dataItems[item_id] != undefined) {
    $gameParty.gainItem($dataItems[item_id], amount, false);
  }
};

// increase weapon count for party of item, by id
CheatMenu.give_weapon = (weapon_id, amount) => {
  if ($dataWeapons[weapon_id] != undefined) {
    $gameParty.gainItem($dataWeapons[weapon_id], amount, false);
  }
};

// increase armor count for party of item, by id
CheatMenu.give_armor = (armor_id, amount) => {
  if ($dataArmors[armor_id] != undefined) {
    $gameParty.gainItem($dataArmors[armor_id], amount, false);
  }
};

// initialize speed hook for locking
CheatMenu.initialize_speed_lock = () => {
  if (!CheatMenu.speed_initialized) {
    CheatMenu.speed = $gamePlayer.moveSpeed();
    Object.defineProperty($gamePlayer, '_moveSpeed', {
      get: function () {
        return CheatMenu.speed;
      },
      set: function (newVal) {
        if (CheatMenu.speed_unlocked) {
          CheatMenu.speed = newVal;
        }
      },
    });
    CheatMenu.speed_initialized = true;
  }
};

// change player movement speed
CheatMenu.change_player_speed = (amount) => {
  CheatMenu.initialize_speed_lock();
  if (CheatMenu.speed) {
    CheatMenu.speed += amount; // probably type error
  }
};

// toggle locking of player speed
CheatMenu.toggle_lock_player_speed = () => {
  CheatMenu.initialize_speed_lock();
  CheatMenu.speed_unlocked = !CheatMenu.speed_unlocked;
};

// clear active states on an actor
CheatMenu.clear_actor_states = (actor) => {
  if (actor.states() != undefined && actor.states().length > 0) {
    actor.clearStates();
  }
};

// clear active states on party
CheatMenu.clear_party_states = () => {
  const members = $gameParty.allMembers();

  for (let i = 0; i < members.length; i++) {
    CheatMenu.clear_actor_states(members[i]);
  }
};

// change game variable value, by id
CheatMenu.set_variable = (variable_id, value) => {
  if ($dataSystem.variables[variable_id] != undefined) {
    let new_value = $gameVariables.value(variable_id) + value;

    $gameVariables.setValue(variable_id, new_value);
  }
};

// toggle game switch value, by id
CheatMenu.toggle_switch = (switch_id) => {
  if ($dataSystem.switches[switch_id] != undefined) {
    $gameSwitches.setValue(switch_id, !$gameSwitches.value(switch_id));
  }
};

// Change location by map id, and x, y position
CheatMenu.teleport = (map_id, x_pos, y_pos) => {
  $gamePlayer.reserveTransfer(map_id, x_pos, y_pos, $gamePlayer.direction(), 0);
  $gamePlayer.setPosition(x_pos, y_pos);
};

/////////////////////////////////////////////////
// Cheat Menu overlay
/////////////////////////////////////////////////

// HTML elements and some CSS for positioning
//	other css in CSS file attached
CheatMenu.overlay_box = document.createElement('div');
CheatMenu.overlay_box.id = 'cheatMenu';
CheatMenu.overlay_box.style.left = '5px';
CheatMenu.overlay_box.style.top = '5px';
CheatMenu.overlay_box.style.right = '';
CheatMenu.overlay_box.style.bottom = '';

CheatMenu.overlay = document.createElement('table');
CheatMenu.overlay.id = 'cheatMenuText';
CheatMenu.overlay.style.left = '5px';
CheatMenu.overlay.style.top = '5px';
CheatMenu.overlay.style.right = '';
CheatMenu.overlay.style.bottom = '';

// Attach other css for styling
CheatMenu.style_css = document.createElement('link');
CheatMenu.style_css.type = 'text/css';
CheatMenu.style_css.rel = 'stylesheet';
CheatMenu.style_css.href = 'js/plugins/Cheat_Menu.css';
document.head.appendChild(CheatMenu.style_css);

// keep menu in correct location
CheatMenu.position_menu = () => {
  //middle of screen
  if (CheatMenu.position == 0) {
    CheatMenu.overlay_box.style.left = '' + window.innerWidth / 2 + 'px';
    CheatMenu.overlay_box.style.top = '' + window.innerHeight / 2 + 'px';
    CheatMenu.overlay_box.style.right = '';
    CheatMenu.overlay_box.style.bottom = '';

    CheatMenu.overlay_box.style.marginLeft = '-110px';
    CheatMenu.overlay_box.style.marginTop = '-50px';

    CheatMenu.overlay.style.left = '' + window.innerWidth / 2 + 'px';
    CheatMenu.overlay.style.top = '' + window.innerHeight / 2 + 'px';
    CheatMenu.overlay.style.right = '';
    CheatMenu.overlay.style.bottom = '';

    CheatMenu.overlay.style.marginLeft = '-110px';
    CheatMenu.overlay.style.marginTop = '-50px';
  }
  // top left corner
  else if (CheatMenu.position == 1) {
    CheatMenu.overlay_box.style.left = '5px';
    CheatMenu.overlay_box.style.top = '5px';
    CheatMenu.overlay_box.style.right = '';
    CheatMenu.overlay_box.style.bottom = '';

    CheatMenu.overlay_box.style.marginLeft = '';
    CheatMenu.overlay_box.style.marginTop = '';

    CheatMenu.overlay.style.left = '5px';
    CheatMenu.overlay.style.top = '5px';
    CheatMenu.overlay.style.right = '';
    CheatMenu.overlay.style.bottom = '';

    CheatMenu.overlay.style.marginLeft = '';
    CheatMenu.overlay.style.marginTop = '';
  }
  // top right corner
  else if (CheatMenu.position == 2) {
    CheatMenu.overlay_box.style.left = '';
    CheatMenu.overlay_box.style.top = '5px';
    CheatMenu.overlay_box.style.right = '5px';
    CheatMenu.overlay_box.style.bottom = '';

    CheatMenu.overlay_box.style.marginLeft = '';
    CheatMenu.overlay_box.style.marginTop = '';

    CheatMenu.overlay.style.left = '';
    CheatMenu.overlay.style.top = '5px';
    CheatMenu.overlay.style.right = '-15px';
    CheatMenu.overlay.style.bottom = '';

    CheatMenu.overlay.style.marginLeft = '';
    CheatMenu.overlay.style.marginTop = '';
  }
  // bottom right corner
  else if (CheatMenu.position == 3) {
    CheatMenu.overlay_box.style.left = '';
    CheatMenu.overlay_box.style.top = '';
    CheatMenu.overlay_box.style.right = '5px';
    CheatMenu.overlay_box.style.bottom = '5px';

    CheatMenu.overlay_box.style.marginLeft = '';
    CheatMenu.overlay_box.style.marginTop = '';

    CheatMenu.overlay.style.left = '';
    CheatMenu.overlay.style.top = '';
    CheatMenu.overlay.style.right = '-15px';
    CheatMenu.overlay.style.bottom = '5px';

    CheatMenu.overlay.style.marginLeft = '';
    CheatMenu.overlay.style.marginTop = '';
  }
  // bottom left corner
  else if (CheatMenu.position == 4) {
    CheatMenu.overlay_box.style.left = '5px';
    CheatMenu.overlay_box.style.top = '';
    CheatMenu.overlay_box.style.right = '';
    CheatMenu.overlay_box.style.bottom = '5px';

    CheatMenu.overlay_box.style.marginLeft = '';
    CheatMenu.overlay_box.style.marginTop = '';

    CheatMenu.overlay.style.left = '5px';
    CheatMenu.overlay.style.top = '';
    CheatMenu.overlay.style.right = '';
    CheatMenu.overlay.style.bottom = '5px';

    CheatMenu.overlay.style.marginLeft = '';
    CheatMenu.overlay.style.marginTop = '';
  }

  // adjust background box size to match contents
  let height = 20;
  for (let i = 0; i < CheatMenu.overlay.children.length; i++) {
    height += CheatMenu.overlay.children[i].scrollHeight;
  }
  CheatMenu.overlay_box.style.height = '' + height + 'px';
};

/////////////////////////////////////////////////
// Menu item types
/////////////////////////////////////////////////

// insert row with buttons to scroll left and right for some context
//	appears as:
//	<-[key1] text [key2]->
//	scrolling is handled by scroll_left_handler and scroll_right_handler functions
//	text: string
//	key1,key2: key mapping
//	scroll_handler: single function that handles the left and right scroll arguments should be (direction, event)
CheatMenu.append_scroll_selector = function (text, key1, key2, scroll_handler) {
  const scroll_selector = CheatMenu.overlay.insertRow();
  scroll_selector.className = 'scroll_selector_row';

  const scroll_left_button = scroll_selector.insertCell();
  scroll_left_button.className = 'scroll_selector_buttons cheat_menu_cell';

  const scroll_text = scroll_selector.insertCell();
  scroll_text.className = 'cheat_menu_cell';

  const scroll_right_button = scroll_selector.insertCell();
  scroll_right_button.className = 'scroll_selector_buttons cheat_menu_cell';

  scroll_left_button.innerHTML = '←[' + key1 + ']';
  scroll_text.innerHTML = text + ''; // TODO: rethink method
  scroll_right_button.innerHTML = '[' + key2 + ']→';

  scroll_left_button.addEventListener(
    'mousedown',
    scroll_handler.bind(null, 'left'),
  );
  scroll_right_button.addEventListener(
    'mousedown',
    scroll_handler.bind(null, 'right'),
  );

  // @ts-ignore
  CheatMenu.key_listeners[key1] = scroll_handler.bind(null, 'left');
  // @ts-ignore
  CheatMenu.key_listeners[key2] = scroll_handler.bind(null, 'right');
};

// Insert a title row
//	A row in the menu that is just text
//	title: string
CheatMenu.append_title = function (title) {
  let title_row = CheatMenu.overlay.insertRow();
  let temp = title_row.insertCell();
  temp.className = 'cheat_menu_cell_title';
  let title_text = title_row.insertCell();
  title_text.className = 'cheat_menu_cell_title';
  temp = title_row.insertCell();
  temp.className = 'cheat_menu_cell_title';
  title_text.innerHTML = title;
};

// Insert a desciption row
//	A row in the menu that is just text (smaller than title)
//	text: string
CheatMenu.append_description = function (text) {
  let title_row = CheatMenu.overlay.insertRow();
  let temp = title_row.insertCell();
  temp.className = 'cheat_menu_cell';
  let title_text = title_row.insertCell();
  title_text.className = 'cheat_menu_cell';
  temp = title_row.insertCell();
  temp.className = 'cheat_menu_cell';
  title_text.innerHTML = text;
};

// Append a cheat with some handler to activate
//	Appears as:
//	cheat text	status text[key]
//	cheat_text: string
//	status_text: string
//	key: key mapping
//	click_handler: function
CheatMenu.append_cheat = function (
  cheat_text,
  status_text,
  key,
  click_handler,
) {
  const cheat_row = CheatMenu.overlay.insertRow();

  const cheat_title = cheat_row.insertCell();
  cheat_title.className = 'cheat_menu_cell';
  const temp = cheat_row.insertCell();
  temp.className = 'cheat_menu_cell';
  const cheat = cheat_row.insertCell();
  cheat.className = 'cheat_menu_buttons cheat_menu_cell';

  cheat_title.innerHTML = cheat_text;
  cheat.innerHTML = status_text + '[' + key + ']';

  cheat.addEventListener('mousedown', click_handler);

  // @ts-ignore
  CheatMenu.key_listeners[key] = click_handler;
};

/////////////////////////////////////////////////////////////
// Various functions to set up each page of the cheat menu
/////////////////////////////////////////////////////////////

// Left and right scrolls for handling switching between menus
CheatMenu.scroll_cheat = function (direction) {
  if (direction == 'left') {
    CheatMenu.cheat_selected--;
    if (CheatMenu.cheat_selected < 0) {
      CheatMenu.cheat_selected = CheatMenu.menus.length - 1;
    }
  } else {
    CheatMenu.cheat_selected++;
    if (CheatMenu.cheat_selected > CheatMenu.menus.length - 1) {
      CheatMenu.cheat_selected = 0;
    }
  }

  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// Menu title with scroll options to go between menu, should be first
//	append on each menu
CheatMenu.append_cheat_title = function (cheat_name) {
  CheatMenu.append_title('Cheat');
  CheatMenu.append_scroll_selector(cheat_name, 2, 3, CheatMenu.scroll_cheat);
};

// Left and right scrolls for handling switching selected actors
CheatMenu.scroll_actor = function (direction) {
  // since Core Script is retarded and doesn't have a getter for protected field
  const gameActorsData = ($gameActors as any)._data as Game_Actor[];

  if (direction == 'left') {
    CheatMenu.cheat_selected_actor--;

    if (CheatMenu.cheat_selected_actor < 0) {
      CheatMenu.cheat_selected_actor =
        gameActorsData && gameActorsData.length > 0
          ? gameActorsData.length - 1
          : 0;
    }
  } else {
    CheatMenu.cheat_selected_actor++;
    if (
      gameActorsData &&
      CheatMenu.cheat_selected_actor >= gameActorsData.length
    ) {
      CheatMenu.cheat_selected_actor = 0;
    }
  }

  if (SoundManager) SoundManager.playSystemSound(0);
  if (CheatMenu.update_menu) CheatMenu.update_menu();
};

// Append actor selection to the menu
CheatMenu.append_actor_selection = function (key1, key2) {
  CheatMenu.append_title('Actor');

  let actor_name_display;
  const actor = $gameActors.actor(CheatMenu.cheat_selected_actor);

  if (actor && actor.name()) {
    actor_name_display = `<span class='actor-name-highlight'>${actor.name()}</span>`;
  } else {
    actor_name_display = `<span class="error-text">NULL</span>`;
  }

  CheatMenu.append_scroll_selector(
    actor_name_display,
    key1,
    key2,
    CheatMenu.scroll_actor,
  );
};

// handler for the enemy hp to 0 cheat alive only
CheatMenu.enemy_hp_cheat_1 = function () {
  CheatMenu.set_enemy_hp(0, true);
  SoundManager.playSystemSound(1);
};

// handler for the enemy hp to 1 cheat alive only
CheatMenu.enemy_hp_cheat_2 = function () {
  CheatMenu.set_enemy_hp(1, true);
  SoundManager.playSystemSound(1);
};

// handler for the enemy hp to 0 cheat all
CheatMenu.enemy_hp_cheat_3 = function () {
  CheatMenu.set_enemy_hp(0, false);
  SoundManager.playSystemSound(1);
};

// handler for the enemy hp to 1 cheat all
CheatMenu.enemy_hp_cheat_4 = function () {
  CheatMenu.set_enemy_hp(1, false);
  SoundManager.playSystemSound(1);
};

// Append the enemy hp cheats to the menu
CheatMenu.append_enemy_cheats = function (key1, key2, key3, key4) {
  CheatMenu.append_title('Alive');
  CheatMenu.append_cheat(
    'Enemy HP to 0',
    'Activate',
    key1,
    CheatMenu.enemy_hp_cheat_1,
  );
  CheatMenu.append_cheat(
    'Enemy HP to 1',
    'Activate',
    key2,
    CheatMenu.enemy_hp_cheat_2,
  );
  CheatMenu.append_title('All');
  CheatMenu.append_cheat(
    'Enemy HP to 0',
    'Activate',
    key3,
    CheatMenu.enemy_hp_cheat_3,
  );
  CheatMenu.append_cheat(
    'Enemy HP to 1',
    'Activate',
    key4,
    CheatMenu.enemy_hp_cheat_4,
  );
};

// handler for the toggle no clip cheat
CheatMenu.toggle_no_clip_status = function () {
  $gamePlayer.setThrough(!$gamePlayer.isThrough());

  CheatMenu.update_menu();
  if ($gamePlayer.isThrough()) {
    SoundManager.playSystemSound(1);
  } else {
    SoundManager.playSystemSound(2);
  }
};

// append the no clip cheat
CheatMenu.append_no_clip_status = function (key1) {
  let status_html;

  if ($gamePlayer.isThrough()) {
    status_html = '<span class="status-on">on</span>';
  } else {
    status_html = '<span class="status-off">off</span>';
  }

  CheatMenu.append_cheat(
    'Status:',
    status_html,
    key1,
    CheatMenu.toggle_no_clip_status,
  );
};

// Left and right scrolls for handling switching amount to modify numerical cheats
CheatMenu.scroll_amount = function (direction) {
  if (direction == 'left') {
    CheatMenu.amount_index--;
    if (CheatMenu.amount_index < 0) {
      CheatMenu.amount_index = 0;
    }
    SoundManager.playSystemSound(2);
  } else {
    CheatMenu.amount_index++;
    if (CheatMenu.amount_index >= CheatMenu.amounts.length) {
      CheatMenu.amount_index = CheatMenu.amounts.length - 1;
    }
    SoundManager.playSystemSound(1);
  }

  CheatMenu.update_menu();
};

// append the amount selection to the menu
CheatMenu.append_amount_selection = function (key1, key2) {
  CheatMenu.append_title('Amount');

  const currentAmount = CheatMenu.amounts[CheatMenu.amount_index];
  const currentAmountHtml = `<span class='actor-name-highlight'>${currentAmount}</span>`;

  CheatMenu.append_scroll_selector(
    currentAmountHtml,
    key1,
    key2,
    CheatMenu.scroll_amount,
  );
};

// Left and right scrolls for handling switching amount to modify for the movement cheat
CheatMenu.scroll_move_amount = function (direction) {
  if (direction == 'left') {
    CheatMenu.move_amount_index--;
    if (CheatMenu.move_amount_index < 0) {
      CheatMenu.move_amount_index = 0;
    }
    SoundManager.playSystemSound(2);
  } else {
    CheatMenu.move_amount_index++;
    if (CheatMenu.move_amount_index >= CheatMenu.move_amounts.length) {
      CheatMenu.move_amount_index = CheatMenu.move_amounts.length - 1;
    }
    SoundManager.playSystemSound(1);
  }

  CheatMenu.update_menu();
};

// append the movement speed amount to the menu
CheatMenu.append_move_amount_selection = function (key1, key2) {
  CheatMenu.append_title('Amount');

  const currentMoveAmount = CheatMenu.move_amounts[CheatMenu.move_amount_index];
  const currentMoveAmountHtml = `<span class='actor-name-highlight'>${currentMoveAmount}</span>`;

  CheatMenu.append_scroll_selector(
    currentMoveAmountHtml,
    key1,
    key2,
    CheatMenu.scroll_move_amount,
  );
};

// handlers for the exp cheat
CheatMenu.apply_current_exp = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];
  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.give_exp($gameActors.actor(CheatMenu.cheat_selected_actor), amount);
  CheatMenu.update_menu();
};

// append the exp cheat to the menu
CheatMenu.append_exp_cheat = function (key1, key2) {
  let current_exp;

  if ($gameActors.actor(CheatMenu.cheat_selected_actor)) {
    current_exp = $gameActors
      .actor(CheatMenu.cheat_selected_actor)
      .currentExp();
  }
  CheatMenu.append_title('EXP');
  CheatMenu.append_scroll_selector(
    current_exp || 0,
    key1,
    key2,
    CheatMenu.apply_current_exp,
  );
};

// Left and right scrolls for handling switching between stats for the selected character
CheatMenu.scroll_stat = function (direction) {
  // another hack
  const actorParamPlus = ($gameActors as any).actor(
    CheatMenu.cheat_selected_actor,
  )?._paramPlus as Game_Actor['_paramPlus'];

  if (actorParamPlus) {
    if (direction == 'left') {
      CheatMenu.stat_selection--;
      if (CheatMenu.stat_selection < 0) {
        CheatMenu.stat_selection = actorParamPlus.length - 1;
      }
    } else {
      CheatMenu.stat_selection++;
      if (CheatMenu.stat_selection >= actorParamPlus.length) {
        CheatMenu.stat_selection = 0;
      }
    }
  } else {
    CheatMenu.stat_selection = 0;
  }

  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// handlers for the stat cheat
CheatMenu.apply_current_stat = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];

  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.give_stat(
    $gameActors.actor(CheatMenu.cheat_selected_actor),
    CheatMenu.stat_selection,
    amount,
  );
  CheatMenu.update_menu();
};

// append the stat selection to the menu
CheatMenu.append_stat_selection = function (key1, key2, key3, key4) {
  CheatMenu.append_title('Stat');

  const actorParamPlus = ($gameActors as any).actor(
    CheatMenu.cheat_selected_actor,
  )?._paramPlus as Game_Actor['_paramPlus'];

  let stat_string = '';
  if ($gameActors.actor(CheatMenu.cheat_selected_actor) && actorParamPlus) {
    if (CheatMenu.stat_selection >= actorParamPlus.length) {
      CheatMenu.stat_selection = 0;
    }
    stat_string += $dataSystem.terms.params[CheatMenu.stat_selection];
  }

  CheatMenu.append_scroll_selector(
    stat_string,
    key1,
    key2,
    CheatMenu.scroll_stat,
  );
  let current_value: number | 'NULL' = 'NULL';

  if ($gameActors.actor(CheatMenu.cheat_selected_actor) && actorParamPlus) {
    current_value = actorParamPlus[CheatMenu.stat_selection];
  }
  CheatMenu.append_scroll_selector(
    current_value,
    key3,
    key4,
    CheatMenu.apply_current_stat,
  );
};

// handlers for the gold cheat
CheatMenu.apply_current_gold = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];

  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }

  CheatMenu.give_gold(amount);
  CheatMenu.update_menu();
};

// append the gold cheat to the menu
CheatMenu.append_gold_status = function (key1, key2) {
  CheatMenu.append_title('Gold');
  CheatMenu.append_scroll_selector(
    $gameParty.gold(),
    key1,
    key2,
    CheatMenu.apply_current_gold,
  );
};

// handler for the movement speed cheat
CheatMenu.apply_speed_change = function (direction) {
  let amount = CheatMenu.move_amounts[CheatMenu.move_amount_index];
  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.change_player_speed(amount);
  CheatMenu.update_menu();
};

CheatMenu.apply_speed_lock_toggle = function () {
  CheatMenu.toggle_lock_player_speed();
  if (CheatMenu.speed_unlocked) {
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.update_menu();
};

// append the movement speed to the menu
CheatMenu.append_speed_status = function (key1, key2, key3) {
  CheatMenu.append_title('Current Speed');
  CheatMenu.append_scroll_selector(
    $gamePlayer.moveSpeed(),
    key1,
    key2,
    CheatMenu.apply_speed_change,
  );

  let status_html;
  if (!CheatMenu.speed_unlocked) {
    status_html = '<span class="status-on">false</span>';
  } else {
    status_html = '<span class="status-off">true</span>';
  }
  CheatMenu.append_cheat(
    'Speed Unlocked',
    status_html,
    key3,
    CheatMenu.apply_speed_lock_toggle,
  );
};

// Left and right scrolls for handling switching between items selected
CheatMenu.scroll_item = function (direction) {
  if (direction == 'left') {
    CheatMenu.item_selection--;
    if (CheatMenu.item_selection < 0) {
      CheatMenu.item_selection = $dataItems.length - 1;
    }
  } else {
    CheatMenu.item_selection++;
    if (CheatMenu.item_selection >= $dataItems.length) {
      CheatMenu.item_selection = 0;
    }
  }
  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// handlers for the item cheat
CheatMenu.apply_current_item = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];
  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.give_item(CheatMenu.item_selection, amount);
  CheatMenu.update_menu();
};

// append the item cheat to the menu
CheatMenu.append_item_selection = function (key1, key2, key3, key4) {
  CheatMenu.append_title('Item');

  const itemData = $dataItems[CheatMenu.item_selection];

  let current_item_name = '';
  if (itemData && itemData.name) {
    current_item_name = itemData.name;
  }

  CheatMenu.append_scroll_selector(
    current_item_name,
    key1,
    key2,
    CheatMenu.scroll_item,
  );

  let current_item_amount = 0;
  if (itemData) {
    current_item_amount = $gameParty.numItems(itemData);
  }

  CheatMenu.append_scroll_selector(
    current_item_amount,
    key3,
    key4,
    CheatMenu.apply_current_item,
  );
};

// Left and right scrolls for handling switching between weapon selected
CheatMenu.scroll_weapon = function (direction) {
  if (direction == 'left') {
    CheatMenu.weapon_selection--;
    if (CheatMenu.weapon_selection < 0) {
      CheatMenu.weapon_selection = $dataWeapons.length - 1;
    }
  } else {
    CheatMenu.weapon_selection++;
    if (CheatMenu.weapon_selection >= $dataWeapons.length) {
      CheatMenu.weapon_selection = 0;
    }
  }
  SoundManager.playSystemSound(0);

  CheatMenu.update_menu();
};

// handlers for the weapon cheat
CheatMenu.apply_current_weapon = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];

  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }

  CheatMenu.give_weapon(CheatMenu.weapon_selection, amount);
  CheatMenu.update_menu();
};

// append the weapon cheat to the menu
CheatMenu.append_weapon_selection = function (key1, key2, key3, key4) {
  CheatMenu.append_title('Weapon');

  const weaponData = $dataWeapons[CheatMenu.weapon_selection];

  let current_weapon_name = '';
  if (weaponData && weaponData.name) {
    current_weapon_name = weaponData.name;
  }

  CheatMenu.append_scroll_selector(
    current_weapon_name,
    key1,
    key2,
    CheatMenu.scroll_weapon,
  );

  let current_weapon_amount = 0;
  if (weaponData) {
    current_weapon_amount = $gameParty.numItems(weaponData);
  }

  CheatMenu.append_scroll_selector(
    current_weapon_amount,
    key3,
    key4,
    CheatMenu.apply_current_weapon,
  );
};

// Left and right scrolls for handling switching between armor selected
CheatMenu.scroll_armor = function (direction) {
  if (direction == 'left') {
    CheatMenu.armor_selection--;
    if (CheatMenu.armor_selection < 0) {
      CheatMenu.armor_selection = $dataArmors.length - 1;
    }
  } else {
    CheatMenu.armor_selection++;
    if (CheatMenu.armor_selection >= $dataArmors.length) {
      CheatMenu.armor_selection = 0;
    }
  }
  SoundManager.playSystemSound(0);

  CheatMenu.update_menu();
};

// handler for the armor cheat
CheatMenu.apply_current_armor = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];
  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }
  CheatMenu.give_armor(CheatMenu.armor_selection, amount);
  CheatMenu.update_menu();
};

// append the armor cheat to the menu
CheatMenu.append_armor_selection = function (key1, key2, key3, key4) {
  CheatMenu.append_title('Armor');

  const armorData = $dataArmors[CheatMenu.armor_selection]; // Get from $dataArmors

  let current_armor_name = '';
  if (armorData && armorData.name) {
    current_armor_name = armorData.name;
  }

  CheatMenu.append_scroll_selector(
    current_armor_name,
    key1,
    key2,
    CheatMenu.scroll_armor,
  );

  let current_armor_amount: number = 0;
  if (armorData) {
    current_armor_amount = $gameParty.numItems(armorData);
  }

  CheatMenu.append_scroll_selector(
    current_armor_amount,
    key3,
    key4,
    CheatMenu.apply_current_armor,
  );
};

// handler for the clear actor state cheat
CheatMenu.clear_current_actor_states = function () {
  CheatMenu.clear_actor_states(
    $gameActors.actor(CheatMenu.cheat_selected_actor),
  );

  SoundManager.playSystemSound(1);
  CheatMenu.update_menu();
};

// handler for the party state clear cheat
CheatMenu.party_clear_states_cheat = function () {
  CheatMenu.clear_party_states();
  SoundManager.playSystemSound(1);
};

// append the party hp cheats
CheatMenu.append_party_state = function (key1) {
  CheatMenu.append_cheat(
    'Clear Party States',
    'Activate',
    key1,
    CheatMenu.party_clear_states_cheat,
  );
};

// append the clear actor state cheat to the menu
CheatMenu.append_current_state = function (key1) {
  CheatMenu.append_title('Current State');
  let number_states = 0;

  const actorInstance = $gameActors.actor(CheatMenu.cheat_selected_actor);
  const activeStates = actorInstance.states();

  if (activeStates) {
    number_states = activeStates.length;
  }

  CheatMenu.append_cheat(
    'Number Effects:',
    number_states,
    key1,
    CheatMenu.clear_current_actor_states,
  );
};

// Left and right scrolls for handling switching between selected variable
CheatMenu.scroll_variable = function (direction) {
  if (direction == 'left') {
    CheatMenu.variable_selection--;
    if (CheatMenu.variable_selection < 0) {
      CheatMenu.variable_selection = $dataSystem.variables.length - 1;
    }
  } else {
    CheatMenu.variable_selection++;
    if (CheatMenu.variable_selection >= $dataSystem.variables.length) {
      CheatMenu.variable_selection = 0;
    }
  }
  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// handlers for the setting the current variable
CheatMenu.apply_current_variable = function (direction) {
  let amount = CheatMenu.amounts[CheatMenu.amount_index];

  if (direction == 'left') {
    amount = -amount;
    SoundManager.playSystemSound(2);
  } else {
    SoundManager.playSystemSound(1);
  }

  CheatMenu.set_variable(CheatMenu.variable_selection, amount);
  CheatMenu.update_menu();
};

// append the variable cheat to the menu
CheatMenu.append_variable_selection = function (key1, key2, key3, key4) {
  CheatMenu.append_title('Variable');

  let current_variable;

  if (
    $dataSystem.variables[CheatMenu.variable_selection] &&
    $dataSystem.variables[CheatMenu.variable_selection].length > 0
  ) {
    current_variable = $dataSystem.variables[CheatMenu.variable_selection];
  } else {
    current_variable = 'NULL';
  }

  CheatMenu.append_scroll_selector(
    current_variable,
    key1,
    key2,
    CheatMenu.scroll_variable,
  );

  let current_variable_value;
  if ($gameVariables.value(CheatMenu.variable_selection) != undefined) {
    current_variable_value = $gameVariables.value(CheatMenu.variable_selection);
  } else {
    current_variable_value = 'NULL';
  }

  CheatMenu.append_scroll_selector(
    current_variable_value,
    key3,
    key4,
    CheatMenu.apply_current_variable,
  );
};

// Left and right scrolls for handling switching between selected switch
CheatMenu.scroll_switch = function (direction) {
  if (direction == 'left') {
    CheatMenu.switch_selection--;
    if (CheatMenu.switch_selection < 0) {
      CheatMenu.switch_selection = $dataSystem.switches.length - 1;
    }
  } else {
    CheatMenu.switch_selection++;
    if (CheatMenu.switch_selection >= $dataSystem.switches.length) {
      CheatMenu.switch_selection = 0;
    }
  }
  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// handler for the toggling the current switch
CheatMenu.toggle_current_switch = function () {
  CheatMenu.toggle_switch(CheatMenu.switch_selection);
  if ($gameSwitches.value(CheatMenu.switch_selection)) {
    SoundManager.playSystemSound(1);
  } else {
    SoundManager.playSystemSound(2);
  }
  CheatMenu.update_menu();
};

// append the switch cheat to the menu
CheatMenu.append_switch_selection = function (key1, key2, key3) {
  CheatMenu.append_title('Switch');
  let current_switch;

  if (
    $dataSystem.switches[CheatMenu.switch_selection] &&
    $dataSystem.switches[CheatMenu.switch_selection].length > 0
  ) {
    current_switch = $dataSystem.switches[CheatMenu.switch_selection];
  } else {
    current_switch = 'NULL';
  }

  CheatMenu.append_scroll_selector(
    current_switch,
    key1,
    key2,
    CheatMenu.scroll_switch,
  );

  let current_switch_value;
  if ($gameSwitches.value(CheatMenu.switch_selection) != undefined) {
    current_switch_value = $gameSwitches.value(CheatMenu.switch_selection);
  } else {
    current_switch_value = 'NULL';
  }

  CheatMenu.append_cheat(
    'Status:',
    current_switch_value,
    key3,
    CheatMenu.toggle_current_switch,
  );
};

// handler for saving positions
CheatMenu.save_position = function (pos_num) {
  CheatMenu.saved_positions[pos_num].m = $gameMap.mapId();
  CheatMenu.saved_positions[pos_num].x = $gamePlayer.x;
  CheatMenu.saved_positions[pos_num].y = $gamePlayer.y;

  SoundManager.playSystemSound(1);
  CheatMenu.update_menu();
};

// handler for loading/recalling positions
CheatMenu.recall_position = function (pos_num) {
  if (CheatMenu.saved_positions[pos_num].m != -1) {
    CheatMenu.teleport(
      CheatMenu.saved_positions[pos_num].m,
      CheatMenu.saved_positions[pos_num].x,
      CheatMenu.saved_positions[pos_num].y,
    );
    SoundManager.playSystemSound(1);
  } else {
    SoundManager.playSystemSound(2);
  }
  CheatMenu.update_menu();
};

// append the save/recall cheat to the menu
CheatMenu.append_save_recall = function () {
  CheatMenu.append_title('Current Position: ');

  if ($dataMapInfos[$gameMap.mapId()] && $dataMapInfos[$gameMap.mapId()].name) {
    let current_map =
      '' + $gameMap.mapId() + ': ' + $dataMapInfos[$gameMap.mapId()].name;
    CheatMenu.append_description(current_map);

    let map_pos = '(' + $gamePlayer.x + ', ' + $gamePlayer.y + ')';
    CheatMenu.append_description(map_pos);
  } else {
    CheatMenu.append_description('NULL');
  }

  let cur_key = 1;
  for (let i = 0; i < CheatMenu.saved_positions.length; i++) {
    CheatMenu.append_title('Position ' + (i + 1));

    let map_text;
    let pos_text;
    if (CheatMenu.saved_positions[i].m != -1) {
      map_text = '' + CheatMenu.saved_positions[i].m + ': ';
      if ($dataMapInfos[CheatMenu.saved_positions[i].m].name) {
        map_text += $dataMapInfos[CheatMenu.saved_positions[i].m].name;
      } else {
        map_text += 'NULL';
      }
      pos_text =
        '(' +
        CheatMenu.saved_positions[i].x +
        ', ' +
        CheatMenu.saved_positions[i].y +
        ')';
    } else {
      map_text = 'NULL';
      pos_text = 'NULL';
    }

    CheatMenu.append_cheat(
      'Save:',
      map_text,
      eval('key' + cur_key),
      CheatMenu.save_position.bind(null, i),
    );
    cur_key++;

    CheatMenu.append_cheat(
      'Recall:',
      pos_text,
      eval('key' + cur_key),
      CheatMenu.recall_position.bind(null, i),
    );
    cur_key++;
  }
};

// Left and right scrollers for handling switching between target teleport map
CheatMenu.scroll_map_teleport_selection = function (direction) {
  if (direction == 'left') {
    CheatMenu.teleport_location.m--;
    if (CheatMenu.teleport_location.m < 1) {
      CheatMenu.teleport_location.m = $dataMapInfos.length - 1;
    }
  } else {
    CheatMenu.teleport_location.m++;
    if (CheatMenu.teleport_location.m >= $dataMapInfos.length) {
      CheatMenu.teleport_location.m = 1;
    }
  }

  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// Left and right scrollers for handling switching between target teleport x coord
CheatMenu.scroll_x_teleport_selection = function (direction) {
  if (direction == 'left') {
    CheatMenu.teleport_location.x--;
    if (CheatMenu.teleport_location.x < 0) {
      CheatMenu.teleport_location.x = 255;
    }
  } else {
    CheatMenu.teleport_location.x++;
    if (CheatMenu.teleport_location.x > 255) {
      CheatMenu.teleport_location.x = 0;
    }
  }

  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// Left and right scrollers for handling switching between target teleport y coord
CheatMenu.scroll_y_teleport_selection = function (direction) {
  if (direction == 'left') {
    CheatMenu.teleport_location.y--;
    if (CheatMenu.teleport_location.y < 0) {
      CheatMenu.teleport_location.y = 255;
    }
  } else {
    CheatMenu.teleport_location.y++;
    if (CheatMenu.teleport_location.y > 255) {
      CheatMenu.teleport_location.y = 0;
    }
  }

  SoundManager.playSystemSound(0);
  CheatMenu.update_menu();
};

// handler for teleporting to targed map and location
CheatMenu.teleport_current_location = function () {
  CheatMenu.teleport(
    CheatMenu.teleport_location.m,
    CheatMenu.teleport_location.x,
    CheatMenu.teleport_location.y,
  );
  SoundManager.playSystemSound(1);
  CheatMenu.update_menu();
};

// append the teleport cheat to the menu
CheatMenu.append_teleport = function (
  key1,
  key2,
  key3,
  key4,
  key5,
  key6,
  key7,
) {
  let current_map = '' + CheatMenu.teleport_location.m + ': ';

  if (
    $dataMapInfos[CheatMenu.teleport_location.m] &&
    $dataMapInfos[CheatMenu.teleport_location.m].name
  ) {
    current_map += $dataMapInfos[CheatMenu.teleport_location.m].name;
  } else {
    current_map += 'NULL';
  }

  CheatMenu.append_scroll_selector(
    current_map,
    key1,
    key2,
    CheatMenu.scroll_map_teleport_selection,
  );

  CheatMenu.append_scroll_selector(
    'X: ' + CheatMenu.teleport_location.x,
    key3,
    key4,
    CheatMenu.scroll_x_teleport_selection,
  );

  CheatMenu.append_scroll_selector(
    'Y: ' + CheatMenu.teleport_location.y,
    key5,
    key6,
    CheatMenu.scroll_y_teleport_selection,
  );

  CheatMenu.append_cheat(
    'Teleport',
    'Activate',
    key7,
    CheatMenu.teleport_current_location,
  );
};

//////////////////////////////////////////////////////////////////////////////////
// Final Functions for building each Menu and function list for updating the menu
//////////////////////////////////////////////////////////////////////////////////
// Check if already defined (allows game specific extensions to be loaded in any order)
if (typeof CheatMenu.menus == 'undefined') {
  CheatMenu.menus = [];
}

// One menu added for each cheat/page of the CheatMenu
//	appended in reverse order at the front so they will
//	appear first no matter the plugin load order for any
//	extension plugins

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Teleport');
  CheatMenu.append_teleport(4, 5, 6, 7, 8, 9, 0);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Save and Recall');
  CheatMenu.append_save_recall(4, 5, 6, 7, 8, 9);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Switches');
  CheatMenu.append_switch_selection(4, 5, 6);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Variables');
  CheatMenu.append_amount_selection(4, 5);
  CheatMenu.append_variable_selection(6, 7, 8, 9);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Clear States');
  CheatMenu.append_party_state(4);
  CheatMenu.append_actor_selection(5, 6);
  CheatMenu.append_current_state(7);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Speed');
  CheatMenu.append_move_amount_selection(4, 5);
  CheatMenu.append_speed_status(6, 7, 8);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Armors');
  CheatMenu.append_amount_selection(4, 5);
  CheatMenu.append_armor_selection(6, 7, 8, 9);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Weapons');
  CheatMenu.append_amount_selection(4, 5);
  CheatMenu.append_weapon_selection(6, 7, 8, 9);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Items');
  CheatMenu.append_amount_selection(4, 5);
  CheatMenu.append_item_selection(6, 7, 8, 9);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Gold');
  CheatMenu.append_amount_selection(4, 5);
  CheatMenu.append_gold_status(6, 7);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Stats');
  CheatMenu.append_actor_selection(4, 5);
  CheatMenu.append_amount_selection(6, 7);
  CheatMenu.append_stat_selection(8, 9, 0, '-');
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Give Exp');
  CheatMenu.append_actor_selection(4, 5);
  CheatMenu.append_amount_selection(6, 7);
  CheatMenu.append_exp_cheat(8, 9);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Party TP');

  CheatMenu.append_tp_cheats(4, 5, 6, 7, 8, 9);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Party MP');

  CheatMenu.append_mp_cheats(4, 5, 6, 7, 8, 9);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Party HP');

  CheatMenu.append_hp_cheats(4, 5, 6, 7, 8, 9);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('Enemy HP');

  CheatMenu.append_enemy_cheats(4, 5, 6, 7);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('No Clip');

  CheatMenu.append_no_clip_status(4);
});

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('God Mode');
  CheatMenu.append_actor_selection(4, 5);

  CheatMenu.append_godmode_status();
});

// update whats being displayed in menu
CheatMenu.update_menu = function () {
  // clear menu
  CheatMenu.overlay.innerHTML = '';
  // clear key listeners
  CheatMenu.key_listeners = {};

  CheatMenu.menus[CheatMenu.cheat_selected]();

  CheatMenu.position_menu();
};

// listener to reposition menu
window.addEventListener('resize', CheatMenu.position_menu);

// prevent clicking from passing through
CheatMenu.overlay.addEventListener('mousedown', function (event) {
  event.stopPropagation();
});

/////////////////////////////////////////////////
// Cheat Menu Key Listener
/////////////////////////////////////////////////

// Key codes
if (typeof CheatMenu.keyMappings == 'undefined') {
  CheatMenu.keyMappings = {};
}

CheatMenu.keyMappings = {
  KEY_0: '0',
  KEY_1: '1',
  KEY_2: '2',
  KEY_3: '3',
  KEY_4: '4',
  KEY_5: '5',
  KEY_6: '6',
  KEY_7: '7',
  KEY_8: '8',
  KEY_9: '9',
  MINUS: '-',
  EQUAL: '=',
  TILDE: '`',
  F1: 'F1',
  F8: 'F8',
  F9: 'F9',
};
// ENTER: "Enter",
// ESCAPE: "Escape",
// ARROW_LEFT: "ArrowLeft",
// ARROW_RIGHT: "ArrowRight",

CheatMenu.handleShowDevTools = (event) => {
  if (
    !event.ctrlKey &&
    !event.altKey &&
    event.key === CheatMenu.keyMappings.F8 &&
    $gameTemp &&
    !$gameTemp.isPlaytest()
  ) {
    // open debug menu
    event.stopPropagation();
    event.preventDefault();
    try {
      const gui = require('nw.gui');

      gui.Window.get().showDevTools();
    } catch (e) {
      console.warn("[CheatMenu] Failed to load 'nw.gui' for DevTools:", e);
    }
  }
};

CheatMenu.handleShowRpgMakerDebug = (event) => {
  if (
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    event.key === CheatMenu.keyMappings.F9 &&
    $gameTemp &&
    !$gameTemp.isPlaytest()
  ) {
    ($gameTemp as any)._isPlaytest = true;

    setTimeout(function () {
      ($gameTemp as any) = false;
    }, 100);
  }
};

CheatMenu.handleToggleCheatMenu = (event) => {
  if (
    CheatMenu.isOverlayOpenable &&
    !event.altKey &&
    !event.ctrlKey &&
    !event.shiftKey
  ) {
    // open and close menu
    if (event.key === '1') {
      if (!CheatMenu.initialized) {
        const gameActorsData = ($gameActors as any)._data as Game_Actor[];

        for (let i = 0; i < gameActorsData.length; i++) {
          const actorInstance = $gameActors.actor(i) as CheatMenu_Game_Actor;

          if (actorInstance) {
            actorInstance.godMode = false;

            if (actorInstance.godMode_interval) {
              clearInterval(actorInstance.godMode_interval);
            }
          }
        }

        // reset to initial values
        for (let name in CheatMenu.initialValues) {
          // @ts-ignore
          CheatMenu[name] =
            CheatMenu.initialValues[
              name as keyof typeof CheatMenu.initialValues
            ];
        }

        // load saved values if they exist
        if ($gameSystem.CheatMenu) {
          for (let name in $gameSystem.CheatMenu) {
            // @ts-ignore
            CheatMenu[name] = $gameSystem.CheatMenu[name];
          }
        }

        // if speed is locked then initialize it so effect is active
        if (!CheatMenu.speed_unlocked) {
          CheatMenu.initialize_speed_lock();
        }

        // only do this once per load or new game
        CheatMenu.initialized = true;
      }

      // open menu
      if (!CheatMenu.isCheatMenuOpen) {
        CheatMenu.isCheatMenuOpen = true;
        document.body.appendChild(CheatMenu.overlay_box);
        document.body.appendChild(CheatMenu.overlay);
        CheatMenu.update_menu();
        SoundManager.playSystemSound(1);
      }
      // close menu
      else {
        CheatMenu.isCheatMenuOpen = false;
        CheatMenu.overlay_box.remove();
        CheatMenu.overlay.remove();
        SoundManager.playSystemSound(2);
      }
    }

    // navigate and activate cheats
    else if (CheatMenu.isCheatMenuOpen) {
      // move menu position
      if (event.key == '~') {
        CheatMenu.position++;
        if (CheatMenu.position > 4) {
          CheatMenu.position = 0;
        }
        CheatMenu.update_menu();
      } else {
        for (const keyCode in CheatMenu.keyMappings) {
          if (
            CheatMenu.key_listeners[CheatMenu.keyMappings[keyCode]] &&
            event.key === CheatMenu.keyMappings[keyCode]
          ) {
            // @ts-ignore
            CheatMenu.key_listeners[CheatMenu.keyMappings[keyCode]](event);
          }
        }
      }
    }
  }
};

window.addEventListener('keydown', (event) => {
  CheatMenu.handleShowDevTools(event);
  CheatMenu.handleShowRpgMakerDebug(event);
  CheatMenu.handleToggleCheatMenu(event);
});

/////////////////////////////////////////////////
// Load Hook
/////////////////////////////////////////////////

// close the menu and set for initialization on first open
//	timer to provide periodic updates if the menu is open
CheatMenu.initialize = () => {
  CheatMenu.isOverlayOpenable = true;
  CheatMenu.initialized = false;
  CheatMenu.isCheatMenuOpen = false;
  CheatMenu.speed_initialized = false;
  CheatMenu.overlay_box.remove();
  CheatMenu.overlay.remove();

  // periodic update
  clearInterval(CheatMenu.menu_update_timer || undefined);
  CheatMenu.menu_update_timer = setInterval(function () {
    if (CheatMenu.isCheatMenuOpen) {
      CheatMenu.update_menu();
    }
  }, 1000);
};

// add hook for loading a game
DataManager.default_loadGame = DataManager.loadGame;
DataManager.loadGame = function (saveFileId) {
  CheatMenu.initialize();

  if (DataManager.default_loadGame) {
    return DataManager.default_loadGame(saveFileId);
  }

  return false;
};

// add hook for new game
DataManager.default_setupNewGame = DataManager.setupNewGame;
DataManager.setupNewGame = function () {
  CheatMenu.initialize();

  if (DataManager.default_setupNewGame) {
    DataManager.default_setupNewGame();
  }
};

// add hook for saving values (just added into $gameSystem to be saved)

DataManager.default_saveGame = DataManager.saveGame;
DataManager.saveGame = function (saveFileId) {
  // save values that are in intial values

  $gameSystem.CheatMenu = {};
  for (let name in CheatMenu.initialValues) {
    // @ts-ignore
    $gameSystem.CheatMenu[name] = CheatMenu[name];
  }

  if (DataManager.default_saveGame) {
    return DataManager.default_saveGame(saveFileId);
  }

  return false;
};
