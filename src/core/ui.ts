import CheatMenu from '../CheatMenu';
import { ICON_POP_IN, ICON_POP_OUT } from '../components/icons';

let _gridFocusIndex = 0;
let _updatingMenu = false;

// the overlay may live in the pop-out window (core/popout.ts)
const menuWindow = (): Window =>
  CheatMenu.getMenuDocument().defaultView ?? window;

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
  ['50%', '50%', '', ''], // 0: center
  ['5px', '5px', '', ''], // 1: top-left
  ['', '5px', '5px', ''], // 2: top-right
  ['', '', '5px', '5px'], // 3: bottom-right
  ['5px', '', '', '5px'], // 4: bottom-left
];

CheatMenu.positionMenu = () => {
  const pos = positions[CheatMenu.position] ?? positions[1];
  const overlay = CheatMenu.overlay;

  if (CheatMenu.isPoppedOut) {
    // the pop-out window lays the overlay out via .cheat-menu-popout CSS
    overlay.style.left =
      overlay.style.top =
      overlay.style.right =
      overlay.style.bottom =
        '';
    overlay.style.transform = '';
    const ind = document.getElementById('cheat-menu-indicator');
    if (ind) ind.style.display = 'none';
    return;
  }

  overlay.style.left = pos[0];
  overlay.style.top = pos[1];
  overlay.style.right = pos[2];
  overlay.style.bottom = pos[3];
  overlay.style.transform =
    CheatMenu.position === 0 ? 'translate(-50%, -50%)' : '';

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
    menuWindow().requestAnimationFrame(() => {
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
    });
  }
};

const CJK_RE =
  /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u;

function wrapWords(el: HTMLElement): void {
  const doc = el.ownerDocument;
  const walker = doc.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    const fragment = doc.createDocumentFragment();
    for (const part of (node.textContent ?? '').split(/(\s+)/)) {
      if (part === '') continue;
      if (/^\s+$/.test(part) || CJK_RE.test(part)) {
        fragment.appendChild(doc.createTextNode(part));
      } else {
        const word = doc.createElement('span');
        word.className = 'cheat-menu-word';
        word.textContent = part;
        fragment.appendChild(word);
      }
    }
    node.replaceWith(fragment);
  }
}

CheatMenu.appendScrollSelector = function (
  text,
  key1,
  key2,
  scrollHandler,
  selectable,
  showArrows = true,
) {
  const scrollSelector = CheatMenu.overlay.insertRow();
  scrollSelector.className = 'scroll-selector-row';

  const scrollLeftButton = scrollSelector.insertCell();
  scrollLeftButton.className = 'scroll-selector-buttons cheat-menu-cell';

  const scrollText = scrollSelector.insertCell();
  scrollText.className = selectable
    ? 'cheat-menu-cell cheat-menu-selectable'
    : 'cheat-menu-cell';

  const scrollRightButton = scrollSelector.insertCell();
  scrollRightButton.className = 'scroll-selector-buttons cheat-menu-cell';

  if (selectable) {
    const box = document.createElement('div');
    box.className = 'cheat-menu-name';
    const inner = document.createElement('div');
    inner.className = 'cheat-menu-name-text';
    inner.innerHTML = text + '';
    wrapWords(inner);
    box.title = inner.textContent ?? '';
    box.appendChild(inner);
    scrollText.appendChild(box);
  } else {
    scrollText.innerHTML = text + '';
  }

  if (!showArrows) {
    return;
  }

  scrollLeftButton.innerHTML = '←[' + key1 + ']';
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

// Like appendScrollSelector, but the middle cell is a text input for typing a
// value directly. Enter commits (onCommit; return false to reject the input),
// Esc or clicking away discards.
// While the user types, the draft survives re-renders (incl. the 1 s timer)
// in CheatMenu._valueInputDrafts under `inputKey` — scope the key to the edited
// entity (e.g. `variable:12`) so a draft never leaks onto another one.
CheatMenu.appendValueInput = function (
  value,
  inputKey,
  onCommit,
  key1,
  key2,
  scrollHandler,
  showArrows = true,
) {
  const row = CheatMenu.overlay.insertRow();
  row.className = 'scroll-selector-row';

  const leftButton = row.insertCell();
  leftButton.className = 'scroll-selector-buttons cheat-menu-cell';

  const cell = row.insertCell();
  cell.className = 'cheat-menu-cell';

  const rightButton = row.insertCell();
  rightButton.className = 'scroll-selector-buttons cheat-menu-cell';

  // a draft for another entity (selection changed) is dropped
  if (CheatMenu._activeValueInputKey !== inputKey) {
    for (const key in CheatMenu._valueInputDrafts) {
      if (key !== inputKey) delete CheatMenu._valueInputDrafts[key];
    }
  }
  const draft = CheatMenu._valueInputDrafts[inputKey];

  const input = document.createElement('input');
  input.type = 'text';
  input.autocomplete = 'off';
  input.spellcheck = false;
  input.className = 'cheat-menu-amount-input cheat-menu-value-input';
  input.title = 'Enter: apply, Esc: cancel';
  input.value = draft ? draft.text : value;
  if (draft && draft.text !== value) input.classList.add('is-dirty');

  const discard = () => {
    delete CheatMenu._valueInputDrafts[inputKey];
    CheatMenu._activeValueInputKey = null;
  };

  input.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      const text = input.value;
      // onCommit returning false = rejected input: keep the draft and focus
      // so the user can fix it
      if (onCommit(text) === false) {
        SoundManager.playBuzzer();
        input.classList.add('is-invalid');
        return;
      }
      discard();
      input.blur();
      CheatMenu.updateMenu();
    } else if (e.key === 'Escape') {
      discard();
      input.blur();
      CheatMenu.updateMenu();
    }
  });
  ['keyup', 'keypress'].forEach((evt) => {
    input.addEventListener(evt, (e) => e.stopPropagation());
  });
  input.addEventListener('mousedown', (e) => e.stopPropagation());

  input.addEventListener('focus', () => {
    CheatMenu._activeValueInputKey = inputKey;
  });

  input.addEventListener('blur', () => {
    // a re-render removes the element (and blurs it) — keep the draft then
    if (!_updatingMenu && CheatMenu._activeValueInputKey === inputKey) {
      discard();
      CheatMenu.updateMenu();
    }
  });

  input.addEventListener('input', () => {
    CheatMenu._valueInputDrafts[inputKey] = {
      text: input.value,
      caret: input.selectionStart ?? input.value.length,
    };
    input.classList.toggle('is-dirty', input.value !== value);
    input.classList.remove('is-invalid');
  });
  // keep the caret where the user left it across re-renders
  ['keyup', 'click', 'select'].forEach((evt) => {
    input.addEventListener(evt, () => {
      const d = CheatMenu._valueInputDrafts[inputKey];
      if (d) d.caret = input.selectionStart ?? d.caret;
    });
  });

  cell.appendChild(input);

  if (CheatMenu._activeValueInputKey === inputKey) {
    menuWindow().requestAnimationFrame(() => {
      input.focus();
      const pos = Math.min(
        draft?.caret ?? input.value.length,
        input.value.length,
      );
      input.setSelectionRange(pos, pos);
    });
  }

  if (!showArrows) return;

  leftButton.innerHTML = '←[' + key1 + ']';
  rightButton.innerHTML = '[' + key2 + ']→';
  leftButton.addEventListener('mousedown', scrollHandler.bind(null, 'left'));
  rightButton.addEventListener('mousedown', scrollHandler.bind(null, 'right'));

  // @ts-ignore
  CheatMenu.keyListeners[key1] = scrollHandler.bind(null, 'left');
  // @ts-ignore
  CheatMenu.keyListeners[key2] = scrollHandler.bind(null, 'right');
};

CheatMenu.appendCodeInput = function (
  inputKey,
  value,
  onChange,
  onSubmit,
  rows = 6,
) {
  const row = CheatMenu.overlay.insertRow();
  const cell = row.insertCell();
  cell.colSpan = 3;
  cell.className = 'cheat-menu-cell cheat-menu-search-cell';

  const textarea = document.createElement('textarea');
  textarea.className = 'cheat-menu-search-input cheat-menu-code-input';
  textarea.rows = rows;
  textarea.spellcheck = false;
  textarea.autocomplete = 'off';
  textarea.value = value;
  textarea.placeholder = 'Ctrl+Enter: run';

  const remember = () => {
    CheatMenu._activeCodeInput = {
      key: inputKey,
      caret: textarea.selectionStart ?? textarea.value.length,
      scroll: textarea.scrollTop,
    };
  };

  textarea.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      remember();
      onSubmit(textarea.value);
    } else if (e.key === 'Tab') {
      // insert indentation instead of moving focus out of the editor
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.setRangeText('  ', start, end, 'end');
      onChange(textarea.value);
    }
  });
  ['keyup', 'keypress'].forEach((evt) => {
    textarea.addEventListener(evt, (e) => e.stopPropagation());
  });
  textarea.addEventListener('mousedown', (e) => e.stopPropagation());

  textarea.addEventListener('focus', remember);
  textarea.addEventListener('blur', () => {
    if (!_updatingMenu && CheatMenu._activeCodeInput?.key === inputKey) {
      CheatMenu._activeCodeInput = null;
    }
  });
  textarea.addEventListener('input', () => onChange(textarea.value));

  cell.appendChild(textarea);

  const active = CheatMenu._activeCodeInput;
  if (active?.key === inputKey) {
    menuWindow().requestAnimationFrame(() => {
      textarea.focus();
      const pos = Math.min(active.caret, textarea.value.length);
      textarea.setSelectionRange(pos, pos);
      textarea.scrollTop = active.scroll;
    });
  }
};

CheatMenu.appendTitle = function (title, sideText) {
  const titleRow = CheatMenu.overlay.insertRow();
  const temp = titleRow.insertCell();
  temp.className = 'cheat-menu-cell-title';
  const titleText = titleRow.insertCell();
  titleText.className = 'cheat-menu-cell-title';
  const sideCell = titleRow.insertCell();
  sideCell.className = 'cheat-menu-cell-title cheat-menu-title-side';
  titleText.innerHTML = title;
  if (sideText) sideCell.innerHTML = sideText;
};

CheatMenu.appendDescription = function (text) {
  const titleRow = CheatMenu.overlay.insertRow();
  let temp = titleRow.insertCell();
  temp.className = 'cheat-menu-cell';
  const titleText = titleRow.insertCell();
  titleText.className = 'cheat-menu-cell';
  temp = titleRow.insertCell();
  temp.className = 'cheat-menu-cell';
  titleText.innerHTML = text;
};

// full-width variant of appendDescription (spans all three columns)
CheatMenu.appendWideDescription = function (html) {
  const row = CheatMenu.overlay.insertRow();
  const cell = row.insertCell();
  cell.colSpan = 3;
  cell.className = 'cheat-menu-cell cheat-menu-search-cell';
  cell.innerHTML = html;
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
    true,
  );
};

CheatMenu.scrollAmount = function (direction) {
  // typed amount takes over from here; clear it so the display reverts to
  // the hardcoded amounts list on this and future renders
  CheatMenu.amountInputText = null;

  if (CheatMenu.customAmount !== null) {
    // arrows snap a typed value to the nearest hardcoded amount *in that
    // direction* — right goes to the next higher value, left to the next
    // lower one — rather than the closest value overall
    const current = CheatMenu.customAmount;
    let targetIdx: number;
    if (direction === 'right') {
      targetIdx = CheatMenu.amounts.findIndex((value) => value > current);
      if (targetIdx === -1) targetIdx = CheatMenu.amounts.length - 1;
    } else {
      targetIdx = 0;
      for (let i = 0; i < CheatMenu.amounts.length; i++) {
        if (CheatMenu.amounts[i] < current) {
          targetIdx = i;
        } else {
          break;
        }
      }
    }
    CheatMenu.amountIndex = targetIdx;
    CheatMenu.customAmount = null;
    SoundManager.playSystemSound(direction === 'left' ? 2 : 1);
    CheatMenu.updateMenu();
    return;
  }

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

  const row = CheatMenu.overlay.insertRow();
  row.className = 'scroll-selector-row';

  const leftButton = row.insertCell();
  leftButton.className = 'scroll-selector-buttons cheat-menu-cell';
  leftButton.innerHTML = '←[' + key1 + ']';

  const cell = row.insertCell();
  cell.className = 'cheat-menu-cell';

  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'numeric';
  input.autocomplete = 'off';
  input.className = 'cheat-menu-amount-input actor-name-highlight';
  input.value =
    CheatMenu.amountInputText ??
    String(CheatMenu.amounts[CheatMenu.amountIndex]);

  const allowedKeys = [
    'Backspace',
    'Delete',
    'ArrowLeft',
    'ArrowRight',
    'Tab',
    'Home',
    'End',
  ];

  input.addEventListener('keydown', (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      input.blur();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey || allowedKeys.includes(e.key))
      return;
    // only whole digits — blocks commas, dots, minus signs, letters, etc.
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  });
  ['keyup', 'keypress'].forEach((evt) => {
    input.addEventListener(evt, (e) => e.stopPropagation());
  });
  input.addEventListener('mousedown', (e) => e.stopPropagation());

  input.addEventListener('paste', (e) => {
    e.preventDefault();
    const text = (e.clipboardData?.getData('text') ?? '').replace(
      /[^0-9]/g,
      '',
    );
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    input.value = input.value.slice(0, start) + text + input.value.slice(end);
    input.setSelectionRange(start + text.length, start + text.length);
    input.dispatchEvent(new Event('input'));
  });

  input.addEventListener('focus', () => {
    CheatMenu._activeAmountInput = true;
  });

  input.addEventListener('blur', () => {
    if (!_updatingMenu) {
      CheatMenu._activeAmountInput = false;
      // an empty/cleared field with no valid typed amount reverts to the
      // hardcoded value once the user clicks away
      if (CheatMenu.customAmount === null) {
        CheatMenu.amountInputText = null;
      }
    }
  });

  input.addEventListener('input', () => {
    const digitsOnly = input.value.replace(/[^0-9]/g, '');
    if (digitsOnly !== input.value) {
      const pos = input.selectionStart ?? digitsOnly.length;
      input.value = digitsOnly;
      input.setSelectionRange(pos, pos);
    }
    CheatMenu.amountInputText = digitsOnly;
    CheatMenu.customAmount =
      digitsOnly === '' ? null : parseInt(digitsOnly, 10);
    CheatMenu.updateMenu();
  });

  cell.appendChild(input);

  if (CheatMenu._activeAmountInput) {
    menuWindow().requestAnimationFrame(() => {
      input.focus();
      const len = input.value.length;
      input.setSelectionRange(len, len);
    });
  }

  const rightButton = row.insertCell();
  rightButton.className = 'scroll-selector-buttons cheat-menu-cell';
  rightButton.innerHTML = '[' + key2 + ']→';

  leftButton.addEventListener(
    'mousedown',
    CheatMenu.scrollAmount.bind(null, 'left'),
  );
  rightButton.addEventListener(
    'mousedown',
    CheatMenu.scrollAmount.bind(null, 'right'),
  );

  // @ts-ignore
  CheatMenu.keyListeners[key1] = CheatMenu.scrollAmount.bind(null, 'left');
  // @ts-ignore
  CheatMenu.keyListeners[key2] = CheatMenu.scrollAmount.bind(null, 'right');
};

CheatMenu.appendCheatTitle = function () {
  const name =
    CheatMenu.menus[CheatMenu.currentMenuIndex as number]?.name ?? '';
  CheatMenu.appendTitle('Cheat');
  CheatMenu.appendScrollSelector(name, 2, 3, CheatMenu.scrollCheat);
};

CheatMenu.appendTopBar = function () {
  const row = CheatMenu.overlay.insertRow(0);
  const cell = row.insertCell();
  cell.colSpan = 3;
  cell.className = 'cheat-menu-topbar-cell';

  const bar = document.createElement('div');
  bar.className = 'cheat-menu-topbar';
  cell.appendChild(bar);

  const title = document.createElement('span');
  title.className = 'cheat-menu-topbar-title';
  title.textContent = 'Cheat Menu';
  bar.appendChild(title);

  if (!CheatMenu.canPopout()) return;

  const poppedOut = CheatMenu.isPoppedOut;
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cheat-menu-topbar-button';
  button.title = poppedOut
    ? 'Pop in — back to game window [F7]'
    : 'Pop out to separate window [F7]';
  button.innerHTML = poppedOut ? ICON_POP_IN : ICON_POP_OUT;
  button.tabIndex = -1;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    CheatMenu.togglePopout();
  });
  bar.appendChild(button);
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

  const buttons = Array.from(
    grid.querySelectorAll<HTMLElement>('.cheat-menu-grid-button'),
  );
  if (buttons.length) {
    _gridFocusIndex = Math.min(_gridFocusIndex, buttons.length - 1);
    buttons[_gridFocusIndex].focus();
  }

  grid.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    event.stopPropagation();
    const idx = buttons.indexOf(
      CheatMenu.getMenuDocument().activeElement as HTMLElement,
    );
    const current = idx >= 0 ? idx : _gridFocusIndex;
    const next = event.shiftKey
      ? current <= 0
        ? buttons.length - 1
        : current - 1
      : current >= buttons.length - 1
        ? 0
        : current + 1;
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

  // a stale/invalid index (e.g. restored from a save) would render an empty
  // overlay — fall back to the main grid instead
  if (
    CheatMenu.currentMenuIndex == null ||
    !CheatMenu.menus[CheatMenu.currentMenuIndex]
  ) {
    CheatMenu.currentMenuIndex = null;
  }

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

      try {
        menuToRender.render();
      } catch (e) {
        // a game can override engine APIs a feature relies on — show the
        // failure inside the menu instead of leaving it half-rendered
        console.error(`[CheatMenu] "${menuToRender.name}" render failed:`, e);
        CheatMenu.appendTitle(menuToRender.name);
        CheatMenu.appendDescription(
          `<span class="error-text">Render failed: ${e instanceof Error ? e.message : e}<br>See console (F8) for details.</span>`,
        );
      }
    }
  }

  CheatMenu.appendTopBar();
  CheatMenu.positionMenu();
  _updatingMenu = false;
};
