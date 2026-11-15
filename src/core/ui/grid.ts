import { findMenu } from '@src/core/registry.ts';
import { store } from '@src/core/store.ts';
import { getOverlay } from './dom.ts';
import type { Group, LayoutGroup } from './layout.ts';
import {
  currentLayout,
  moveMenu,
  resetLayout,
  setMenuGroup,
  toggleGroupCollapsed,
} from './menuLayout.ts';
import { getMenuDocument } from './popout.ts';
import { updateMenu } from './render.ts';

const GROUP_LABELS: Record<Group, string> = {
  favourite: 'Favourites',
  basic: 'Basic',
  advanced: 'Advanced',
  hidden: 'Hidden',
};

const GROUP_PICKER: readonly { group: Group; text: string }[] = [
  { group: 'favourite', text: '★' },
  { group: 'basic', text: 'B' },
  { group: 'advanced', text: 'A' },
  { group: 'hidden', text: 'H' },
];

let editing = false;
// The grid is rebuilt after every click; remembering *which* button had focus
// (not its index) keeps it on the same control even when ↑/↓ moved its row.
let focusKey: string | null = null;

export const isLayoutEditing = (): boolean => editing;

export function toggleLayoutEditing(): void {
  editing = !editing;
  focusKey = null;
  SoundManager.playSystemSound(editing ? 1 : 2);
  updateMenu();
}

export function resetGridFocus(): void {
  focusKey = null;
}

function button(
  className: string,
  html: string,
  key: string,
  onClick: () => void,
  title?: string,
): HTMLButtonElement {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = className;
  el.innerHTML = html;
  el.dataset.focusKey = key;
  if (title) el.title = title;
  el.addEventListener('focus', () => {
    focusKey = key;
  });
  el.onclick = onClick;
  return el;
}

const rerender = (sound: number, change: () => void) => () => {
  change();
  SoundManager.playSystemSound(sound);
  updateMenu();
};

function groupHeader(group: LayoutGroup): HTMLButtonElement {
  const arrow = group.collapsed ? '▸' : '▾';
  return button(
    'cheat-menu-group-header',
    `${arrow} ${GROUP_LABELS[group.group]} <span class="cheat-menu-group-count">${group.ids.length}</span>`,
    `header:${group.group}`,
    rerender(0, () => toggleGroupCollapsed(group.group)),
    group.collapsed ? 'Expand' : 'Collapse',
  );
}

function menuButtons(ids: readonly string[]): HTMLElement {
  const grid = document.createElement('div');
  grid.className = 'cheat-menu-grid';
  for (const id of ids) {
    const entry = findMenu(id)?.entry;
    if (!entry) continue;
    const open = button('cheat-menu-grid-button', '', `open:${id}`, () => {
      SoundManager.playSystemSound(0);
      store.currentMenuId = id;
      updateMenu();
    });
    open.textContent = entry.name;
    grid.appendChild(open);
  }
  return grid;
}

function editRows(group: LayoutGroup): HTMLElement {
  const list = document.createElement('div');
  list.className = 'cheat-menu-layout-list';
  group.ids.forEach((id, idx) => {
    const entry = findMenu(id)?.entry;
    if (!entry) return;
    const row = document.createElement('div');
    row.className = 'cheat-menu-layout-row';

    const name = document.createElement('span');
    name.className = 'cheat-menu-layout-name';
    name.textContent = entry.name;
    row.appendChild(name);

    const up = button(
      'cheat-menu-layout-button',
      '↑',
      `up:${id}`,
      rerender(0, () => moveMenu(id, 'up')),
      'Move up',
    );
    up.disabled = idx === 0;
    const down = button(
      'cheat-menu-layout-button',
      '↓',
      `down:${id}`,
      rerender(0, () => moveMenu(id, 'down')),
      'Move down',
    );
    down.disabled = idx === group.ids.length - 1;
    row.append(up, down);

    const picker = document.createElement('span');
    picker.className = 'cheat-menu-layout-picker';
    for (const option of GROUP_PICKER) {
      const current = option.group === group.group;
      const el = button(
        current
          ? 'cheat-menu-layout-button active'
          : 'cheat-menu-layout-button',
        option.text,
        `group:${id}:${option.group}`,
        rerender(1, () => setMenuGroup(id, option.group)),
        `Move to ${GROUP_LABELS[option.group]}`,
      );
      el.disabled = current;
      picker.appendChild(el);
    }
    row.appendChild(picker);
    list.appendChild(row);
  });
  return list;
}

function bindTabCycling(container: HTMLElement): void {
  container.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    event.preventDefault();
    event.stopPropagation();
    const buttons = Array.from(
      container.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
    );
    if (buttons.length === 0) return;
    const idx = buttons.indexOf(
      getMenuDocument().activeElement as HTMLButtonElement,
    );
    const step = event.shiftKey ? -1 : 1;
    const next =
      idx === -1 ? 0 : (idx + step + buttons.length) % buttons.length;
    buttons[next].focus();
  });
}

function restoreFocus(container: HTMLElement): void {
  const buttons = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
  );
  const target =
    buttons.find((b) => b.dataset.focusKey === focusKey) ??
    buttons.find((b) => b.classList.contains('cheat-menu-grid-button')) ??
    buttons[0];
  target?.focus();
}

export function renderMainMenuGrid(): void {
  const overlay = getOverlay();
  overlay.innerHTML = '';
  overlay.className = '';

  const cell = overlay.insertRow().insertCell();
  cell.style.padding = '0';

  const container = document.createElement('div');
  container.className = editing
    ? 'cheat-menu-groups cheat-menu-groups-editing'
    : 'cheat-menu-groups';
  cell.appendChild(container);

  for (const group of currentLayout()) {
    // outside edit mode Hidden stays invisible and an empty group is noise
    if (!editing && (group.group === 'hidden' || group.ids.length === 0)) {
      continue;
    }
    container.appendChild(groupHeader(group));
    if (group.collapsed) continue;
    container.appendChild(editing ? editRows(group) : menuButtons(group.ids));
  }

  if (editing) {
    container.appendChild(
      button(
        'cheat-menu-layout-reset',
        'Reset layout',
        'reset',
        rerender(2, resetLayout),
        'Default groups and order',
      ),
    );
  }

  bindTabCycling(container);
  restoreFocus(container);
}
