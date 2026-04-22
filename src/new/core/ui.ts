import CheatMenu from '../CheatMenu';

let _gridFocusIndex = 0;
let _updatingMenu = false;

CheatMenu.overlay = document.createElement('table');
CheatMenu.overlay.id = 'cheat-menu-text';

CheatMenu.styleCss = document.createElement('link');
CheatMenu.styleCss.type = 'text/css';
CheatMenu.styleCss.rel = 'stylesheet';
CheatMenu.styleCss.href = 'js/plugins/Cheat_Menu.css';
document.head.appendChild(CheatMenu.styleCss);

const indicator = document.createElement('div');
indicator.id = 'cheat-menu-indicator';
document.body.appendChild(indicator);

const positions: [string, string, string, string][] = [
  // [left, top, right, bottom]
  ['50%', '50%', '', ''],   // 0: center
  ['5px', '5px', '', ''],   // 1: top-left
  ['', '5px', '5px', ''],   // 2: top-right
  ['', '', '5px', '5px'],   // 3: bottom-right
  ['5px', '', '', '5px'],   // 4: bottom-left
];

CheatMenu.positionMenu = () => {
  const pos = positions[CheatMenu.position] ?? positions[1];
  const overlay = CheatMenu.overlay;

  overlay.style.left = pos[0];
  overlay.style.top = pos[1];
  overlay.style.right = pos[2];
  overlay.style.bottom = pos[3];
  overlay.style.transform = CheatMenu.position === 0 ? 'translate(-50%, -50%)' : '';

  const ind = document.getElementById('cheat-menu-indicator');
  if (ind) {
    ind.style.left = pos[0];
    ind.style.top = pos[1];
    ind.style.right = pos[2];
    ind.style.bottom = pos[3];
    ind.textContent = `[${CheatMenu.keyMappings.KEY_1}]`;
    ind.style.display = CheatMenu.isCheatMenuOpen ? 'none' : '';
  }
};

CheatMenu.overlay.addEventListener('mousedown', (event) =>
  event.stopPropagation(),
);

// set initial indicator position/text before menu is ever opened
CheatMenu.positionMenu();

/////////////////////////////////////////////////
// Menu item types
/////////////////////////////////////////////////

CheatMenu.appendSearchInput = function (placeholder, stateKey, onSearchChange) {
  const row = CheatMenu.overlay.insertRow();
  const cell = row.insertCell();
  cell.colSpan = 3;
  cell.className = 'cheat-menu-cell cheat-menu-search-cell';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = placeholder;
  input.value = CheatMenu.searchKeywords?.[stateKey] || '';
  input.className = 'cheat-menu-search-input';

  ['keydown', 'keyup', 'keypress'].forEach((evt) => {
    input.addEventListener(evt, (e) => e.stopPropagation());
  });
  input.addEventListener('mousedown', (e) => e.stopPropagation());

  input.addEventListener('focus', () => {
    CheatMenu._activeSearchKey = stateKey;
  });

  input.addEventListener('blur', () => {
    if (!_updatingMenu && CheatMenu._activeSearchKey === stateKey) {
      CheatMenu._activeSearchKey = null;
    }
  });

  input.addEventListener('input', () => {
    const keyword = input.value.toLowerCase();
    if (!CheatMenu.searchKeywords) CheatMenu.searchKeywords = {};
    CheatMenu.searchKeywords[stateKey] = keyword;
    onSearchChange?.(keyword);
    CheatMenu.updateMenu();
  });

  cell.appendChild(input);

  if (CheatMenu._activeSearchKey === stateKey) {
    requestAnimationFrame(() => {
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
    });
  }
};

CheatMenu.appendScrollSelector = function (text, key1, key2, scrollHandler) {
  const scrollSelector = CheatMenu.overlay.insertRow();
  scrollSelector.className = 'scroll-selector-row';

  const scrollLeftButton = scrollSelector.insertCell();
  scrollLeftButton.className = 'scroll-selector-buttons cheat-menu-cell';

  const scrollText = scrollSelector.insertCell();
  scrollText.className = 'cheat-menu-cell';

  const scrollRightButton = scrollSelector.insertCell();
  scrollRightButton.className = 'scroll-selector-buttons cheat-menu-cell';

  scrollLeftButton.innerHTML = '←[' + key1 + ']';
  scrollText.innerHTML = text + '';
  scrollRightButton.innerHTML = '[' + key2 + ']→';

  scrollLeftButton.addEventListener(
    'mousedown',
    scrollHandler.bind(null, 'left'),
  );
  scrollRightButton.addEventListener(
    'mousedown',
    scrollHandler.bind(null, 'right'),
  );

  // @ts-ignore
  CheatMenu.keyListeners[key1] = scrollHandler.bind(null, 'left');
  // @ts-ignore
  CheatMenu.keyListeners[key2] = scrollHandler.bind(null, 'right');
};

CheatMenu.appendTitle = function (title) {
  let titleRow = CheatMenu.overlay.insertRow();
  let temp = titleRow.insertCell();
  temp.className = 'cheat-menu-cell-title';
  let titleText = titleRow.insertCell();
  titleText.className = 'cheat-menu-cell-title';
  temp = titleRow.insertCell();
  temp.className = 'cheat-menu-cell-title';
  titleText.innerHTML = title;
};

CheatMenu.appendDescription = function (text) {
  let titleRow = CheatMenu.overlay.insertRow();
  let temp = titleRow.insertCell();
  temp.className = 'cheat-menu-cell';
  let titleText = titleRow.insertCell();
  titleText.className = 'cheat-menu-cell';
  temp = titleRow.insertCell();
  temp.className = 'cheat-menu-cell';
  titleText.innerHTML = text;
};

CheatMenu.appendCheat = function (cheatText, statusText, key, clickHandler) {
  const cheatRow = CheatMenu.overlay.insertRow();

  const cheatTitle = cheatRow.insertCell();
  cheatTitle.className = 'cheat-menu-cell';
  const temp = cheatRow.insertCell();
  temp.className = 'cheat-menu-cell';
  const cheat = cheatRow.insertCell();
  cheat.className = 'cheat-menu-buttons cheat-menu-cell';

  cheatTitle.innerHTML = cheatText;
  cheat.innerHTML = statusText + '[' + key + ']';

  cheat.addEventListener('mousedown', clickHandler);

  // @ts-ignore
  CheatMenu.keyListeners[key] = clickHandler;
};

CheatMenu.scrollCheat = function (direction) {
  const len = CheatMenu.menus.length;
  if (len === 0) return;
  const current = CheatMenu.currentMenuIndex ?? 0;
  if (direction == 'left') {
    CheatMenu.currentMenuIndex = current <= 0 ? len - 1 : current - 1;
  } else {
    CheatMenu.currentMenuIndex = current >= len - 1 ? 0 : current + 1;
  }
  SoundManager.playSystemSound(0);
  CheatMenu.updateMenu();
};

CheatMenu.scrollActor = function (direction) {
  const gameActorsData = ($gameActors as any)._data as Game_Actor[];

  if (direction == 'left') {
    CheatMenu.cheatSelectedActor--;

    if (CheatMenu.cheatSelectedActor < 0) {
      CheatMenu.cheatSelectedActor =
        gameActorsData && gameActorsData.length > 0
          ? gameActorsData.length - 1
          : 0;
    }
  } else {
    CheatMenu.cheatSelectedActor++;
    if (
      gameActorsData &&
      CheatMenu.cheatSelectedActor >= gameActorsData.length
    ) {
      CheatMenu.cheatSelectedActor = 0;
    }
  }

  if (SoundManager) SoundManager.playSystemSound(0);
  if (CheatMenu.updateMenu) CheatMenu.updateMenu();
};

CheatMenu.appendActorSelection = function (key1, key2) {
  CheatMenu.appendTitle('Actor');

  let actorNameDisplay;
  const actor = $gameActors.actor(CheatMenu.cheatSelectedActor);

  if (actor && actor.name()) {
    actorNameDisplay = `<span class='actor-name-highlight'>${actor.name()}</span>`;
  } else {
    actorNameDisplay = `<span class="error-text">NULL</span>`;
  }

  CheatMenu.appendScrollSelector(
    actorNameDisplay,
    key1,
    key2,
    CheatMenu.scrollActor,
  );
};

CheatMenu.scrollAmount = function (direction) {
  if (direction == 'left') {
    CheatMenu.amountIndex--;
    if (CheatMenu.amountIndex < 0) {
      CheatMenu.amountIndex = 0;
    }
    SoundManager.playSystemSound(2);
  } else {
    CheatMenu.amountIndex++;
    if (CheatMenu.amountIndex >= CheatMenu.amounts.length) {
      CheatMenu.amountIndex = CheatMenu.amounts.length - 1;
    }
    SoundManager.playSystemSound(1);
  }

  CheatMenu.updateMenu();
};

CheatMenu.appendAmountSelection = function (key1, key2) {
  CheatMenu.appendTitle('Amount');

  const currentAmount = CheatMenu.amounts[CheatMenu.amountIndex];
  const currentAmountHtml = `<span class='actor-name-highlight'>${currentAmount}</span>`;

  CheatMenu.appendScrollSelector(
    currentAmountHtml,
    key1,
    key2,
    CheatMenu.scrollAmount,
  );
};

CheatMenu.appendCheatTitle = function () {
  const name = CheatMenu.menus[CheatMenu.currentMenuIndex as number]?.name ?? '';
  CheatMenu.appendTitle('Cheat');
  CheatMenu.appendScrollSelector(name, 2, 3, CheatMenu.scrollCheat);
};

CheatMenu.appendBackButton = function () {
  const backRow = CheatMenu.overlay.insertRow(0);
  const backCell = backRow.insertCell();
  backCell.colSpan = 3;
  backCell.className = 'cheat-menu-back-button';
  backCell.innerHTML = `<span>&larr; Back to Main Menu</span>`;

  backCell.onclick = () => {
    SoundManager.playSystemSound(1);
    CheatMenu.currentMenuIndex = null;
    CheatMenu.updateMenu();
  };
};

CheatMenu.renderMainMenuGrid = function () {
  const overlay = CheatMenu.overlay;
  overlay.innerHTML = '';
  overlay.className = '';

  const cell = overlay.insertRow().insertCell();
  cell.style.padding = '0';

  const grid = document.createElement('div');
  grid.className = 'cheat-menu-grid';
  cell.appendChild(grid);

  CheatMenu.menus.forEach((menuEntry, index) => {
    const button = document.createElement('button');
    button.className = 'cheat-menu-grid-button';
    button.textContent = menuEntry.name;

    button.onclick = () => {
      SoundManager.playSystemSound(0);
      CheatMenu.currentMenuIndex = index;
      CheatMenu.updateMenu();
    };

    grid.appendChild(button);
  });

  const buttons = Array.from(grid.querySelectorAll<HTMLElement>('.cheat-menu-grid-button'));
  if (buttons.length) {
    _gridFocusIndex = Math.min(_gridFocusIndex, buttons.length - 1);
    buttons[_gridFocusIndex].focus();
  }

  grid.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    event.stopPropagation();
    const idx = buttons.indexOf(document.activeElement as HTMLElement);
    const current = idx >= 0 ? idx : _gridFocusIndex;
    const next = event.shiftKey
      ? (current <= 0 ? buttons.length - 1 : current - 1)
      : (current >= buttons.length - 1 ? 0 : current + 1);
    _gridFocusIndex = next;
    buttons[next].focus();
  });
};

if (typeof CheatMenu.menus == 'undefined') {
  CheatMenu.menus = [];
}

CheatMenu.updateMenu = function () {
  _updatingMenu = true;
  CheatMenu.keyListeners = {};

  const prev = CheatMenu._prevMenuIndex ?? null;
  CheatMenu._prevMenuIndex = CheatMenu.currentMenuIndex;

  if (CheatMenu.currentMenuIndex === null) {
    if (prev !== null) _gridFocusIndex = 0;
    CheatMenu.renderMainMenuGrid();
  } else {
    const menuToRender = CheatMenu.menus[CheatMenu.currentMenuIndex];
    if (menuToRender) {
      CheatMenu.overlay.innerHTML = '';
      CheatMenu.overlay.className = 'cheat-menu-text';

      CheatMenu.appendBackButton();

      menuToRender.render();
    }
  }

  CheatMenu.positionMenu();
  _updatingMenu = false;
};
