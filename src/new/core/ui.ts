import CheatMenu from '../CheatMenu';

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

// Prevent clicking from passing through the menu
CheatMenu.overlay.addEventListener('mousedown', (event) =>
  event.stopPropagation(),
);

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

if (typeof CheatMenu.menus == 'undefined') {
  CheatMenu.menus = [];
}

// update whats being displayed in menu
CheatMenu.update_menu = function () {
  // clear menu
  CheatMenu.overlay.innerHTML = '';
  // clear key listeners
  CheatMenu.key_listeners = {};

  CheatMenu.menus[CheatMenu.cheat_selected]();

  CheatMenu.position_menu();
};

// Menu title with scroll options to go between menu, should be first
//	append on each menu
CheatMenu.append_cheat_title = function (cheat_name) {
  CheatMenu.append_title('Cheat');
  CheatMenu.append_scroll_selector(cheat_name, 2, 3, CheatMenu.scroll_cheat);
};
