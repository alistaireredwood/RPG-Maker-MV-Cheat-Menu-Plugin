import CheatMenu from '../CheatMenu';

CheatMenu.overlayBox = document.createElement('div');
CheatMenu.overlayBox.id = 'cheat-menu';
CheatMenu.overlayBox.style.left = '5px';
CheatMenu.overlayBox.style.top = '5px';
CheatMenu.overlayBox.style.right = '';
CheatMenu.overlayBox.style.bottom = '';

CheatMenu.overlay = document.createElement('table');
CheatMenu.overlay.id = 'cheat-menu-text';
CheatMenu.overlay.style.left = '5px';
CheatMenu.overlay.style.top = '5px';
CheatMenu.overlay.style.right = '';
CheatMenu.overlay.style.bottom = '';

CheatMenu.styleCss = document.createElement('link');
CheatMenu.styleCss.type = 'text/css';
CheatMenu.styleCss.rel = 'stylesheet';
CheatMenu.styleCss.href = 'js/plugins/Cheat_Menu.css';
document.head.appendChild(CheatMenu.styleCss);

CheatMenu.positionMenu = () => {
  if (CheatMenu.position == 0) {
    CheatMenu.overlayBox.style.left = '' + window.innerWidth / 2 + 'px';
    CheatMenu.overlayBox.style.top = '' + window.innerHeight / 2 + 'px';
    CheatMenu.overlayBox.style.right = '';
    CheatMenu.overlayBox.style.bottom = '';
    CheatMenu.overlayBox.style.marginLeft = '-110px';
    CheatMenu.overlayBox.style.marginTop = '-50px';

    CheatMenu.overlay.style.left = '' + window.innerWidth / 2 + 'px';
    CheatMenu.overlay.style.top = '' + window.innerHeight / 2 + 'px';
    CheatMenu.overlay.style.right = '';
    CheatMenu.overlay.style.bottom = '';
    CheatMenu.overlay.style.marginLeft = '-110px';
    CheatMenu.overlay.style.marginTop = '-50px';
  } else if (CheatMenu.position == 1) {
    CheatMenu.overlayBox.style.left = '5px';
    CheatMenu.overlayBox.style.top = '5px';
    CheatMenu.overlayBox.style.right = '';
    CheatMenu.overlayBox.style.bottom = '';
    CheatMenu.overlayBox.style.marginLeft = '';
    CheatMenu.overlayBox.style.marginTop = '';

    CheatMenu.overlay.style.left = '5px';
    CheatMenu.overlay.style.top = '5px';
    CheatMenu.overlay.style.right = '';
    CheatMenu.overlay.style.bottom = '';
    CheatMenu.overlay.style.marginLeft = '';
    CheatMenu.overlay.style.marginTop = '';
  } else if (CheatMenu.position == 2) {
    CheatMenu.overlayBox.style.left = '';
    CheatMenu.overlayBox.style.top = '5px';
    CheatMenu.overlayBox.style.right = '5px';
    CheatMenu.overlayBox.style.bottom = '';
    CheatMenu.overlayBox.style.marginLeft = '';
    CheatMenu.overlayBox.style.marginTop = '';

    CheatMenu.overlay.style.left = '';
    CheatMenu.overlay.style.top = '5px';
    CheatMenu.overlay.style.right = '-15px';
    CheatMenu.overlay.style.bottom = '';
    CheatMenu.overlay.style.marginLeft = '';
    CheatMenu.overlay.style.marginTop = '';
  } else if (CheatMenu.position == 3) {
    CheatMenu.overlayBox.style.left = '';
    CheatMenu.overlayBox.style.top = '';
    CheatMenu.overlayBox.style.right = '5px';
    CheatMenu.overlayBox.style.bottom = '5px';
    CheatMenu.overlayBox.style.marginLeft = '';
    CheatMenu.overlayBox.style.marginTop = '';

    CheatMenu.overlay.style.left = '';
    CheatMenu.overlay.style.top = '';
    CheatMenu.overlay.style.right = '-15px';
    CheatMenu.overlay.style.bottom = '5px';
    CheatMenu.overlay.style.marginLeft = '';
    CheatMenu.overlay.style.marginTop = '';
  } else if (CheatMenu.position == 4) {
    CheatMenu.overlayBox.style.left = '5px';
    CheatMenu.overlayBox.style.top = '';
    CheatMenu.overlayBox.style.right = '';
    CheatMenu.overlayBox.style.bottom = '5px';
    CheatMenu.overlayBox.style.marginLeft = '';
    CheatMenu.overlayBox.style.marginTop = '';

    CheatMenu.overlay.style.left = '5px';
    CheatMenu.overlay.style.top = '';
    CheatMenu.overlay.style.right = '';
    CheatMenu.overlay.style.bottom = '5px';
    CheatMenu.overlay.style.marginLeft = '';
    CheatMenu.overlay.style.marginTop = '';
  }

  let height = 20;
  for (let i = 0; i < CheatMenu.overlay.children.length; i++) {
    height += CheatMenu.overlay.children[i].scrollHeight;
  }
  CheatMenu.overlayBox.style.height = '' + height + 'px';
};

CheatMenu.overlay.addEventListener('mousedown', (event) =>
  event.stopPropagation(),
);

/////////////////////////////////////////////////
// Menu item types
/////////////////////////////////////////////////

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
  if (direction == 'left') {
    CheatMenu.cheatSelected--;
    if (CheatMenu.cheatSelected < 0) {
      CheatMenu.cheatSelected = CheatMenu.menus.length - 1;
    }
  } else {
    CheatMenu.cheatSelected++;
    if (CheatMenu.cheatSelected > CheatMenu.menus.length - 1) {
      CheatMenu.cheatSelected = 0;
    }
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

CheatMenu.appendCheatTitle = function (cheatName) {
  CheatMenu.appendTitle('Cheat');
  CheatMenu.appendScrollSelector(cheatName, 2, 3, CheatMenu.scrollCheat);
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
  overlay.className = 'cheat-menu-grid';

  CheatMenu.menus.forEach((menuEntry, index) => {
    const button = document.createElement('button');
    button.className = 'cheat-menu-grid-button';
    button.textContent = menuEntry.name;

    button.onclick = () => {
      SoundManager.playSystemSound(0);
      CheatMenu.currentMenuIndex = index;
      CheatMenu.updateMenu();
    };

    overlay.appendChild(button);
  });
};

if (typeof CheatMenu.menus == 'undefined') {
  CheatMenu.menus = [];
}

CheatMenu.updateMenu = function () {
  CheatMenu.keyListeners = {};

  if (CheatMenu.currentMenuIndex === null) {
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
};
