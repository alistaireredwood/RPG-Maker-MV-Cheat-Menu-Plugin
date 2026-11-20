import { getOverlay } from '@src/core/ui/dom.ts';

export type TitleAction = {
  /** SVG markup, e.g. from `core/ui/icons.ts` */
  icon: string;
  /** tooltip */
  title: string;
  /** highlighted, e.g. while a filter is applied */
  active?: boolean;
  onClick: () => void;
};

export type TitleOptions = { actions?: readonly TitleAction[] };

export function appendTitle(
  title: string,
  sideText?: string,
  options: TitleOptions = {},
): void {
  const titleRow = getOverlay().insertRow();
  const temp = titleRow.insertCell();
  temp.className = 'cheat-menu-cell-title';
  const titleText = titleRow.insertCell();
  titleText.className = 'cheat-menu-cell-title';
  const sideCell = titleRow.insertCell();
  sideCell.className = 'cheat-menu-cell-title cheat-menu-title-side';
  titleText.innerHTML = title;
  if (sideText) sideCell.innerHTML = sideText;
  for (const action of options.actions ?? []) {
    sideCell.appendChild(createTitleAction(action));
  }
}

// Mouse only, like the pop-out button: an action key here would shift the
// keys of every row below whenever a menu adds or removes an icon.
function createTitleAction(action: TitleAction): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = action.active
    ? 'cheat-menu-title-action active'
    : 'cheat-menu-title-action';
  button.title = action.title;
  button.innerHTML = action.icon;
  button.tabIndex = -1;
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    action.onClick();
  });
  return button;
}

export function appendDescription(text: string): void {
  const titleRow = getOverlay().insertRow();
  let temp = titleRow.insertCell();
  temp.className = 'cheat-menu-cell';
  const titleText = titleRow.insertCell();
  titleText.className = 'cheat-menu-cell';
  temp = titleRow.insertCell();
  temp.className = 'cheat-menu-cell';
  titleText.innerHTML = text;
}

export function appendWideDescription(html: string): void {
  const row = getOverlay().insertRow();
  const cell = row.insertCell();
  cell.colSpan = 3;
  cell.className = 'cheat-menu-cell cheat-menu-search-cell';
  // the table sizes itself to its widest content, so the text wraps to the
  // width the other rows set instead of stretching the menu to one line
  const text = document.createElement('div');
  text.className = 'cheat-menu-wide-text';
  text.innerHTML = html;
  cell.appendChild(text);
}
