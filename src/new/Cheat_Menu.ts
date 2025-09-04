/////////////////////////////////////////////////
// Cheat Menu Plugin Class
/////////////////////////////////////////////////
// Check if already defined (allows game specific extensions to be loaded in any order)

import CheatMenu from './CheatMenu.ts';
import.meta.glob('./features/**/*.ts', { eager: true });

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
