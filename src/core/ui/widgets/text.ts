import { getOverlay } from '../dom.ts';

export function appendTitle(title: string, sideText?: string): void {
  const titleRow = getOverlay().insertRow();
  const temp = titleRow.insertCell();
  temp.className = 'cheat-menu-cell-title';
  const titleText = titleRow.insertCell();
  titleText.className = 'cheat-menu-cell-title';
  const sideCell = titleRow.insertCell();
  sideCell.className = 'cheat-menu-cell-title cheat-menu-title-side';
  titleText.innerHTML = title;
  if (sideText) sideCell.innerHTML = sideText;
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

/** Full-width variant of appendDescription (spans all three columns). */
export function appendWideDescription(html: string): void {
  const row = getOverlay().insertRow();
  const cell = row.insertCell();
  cell.colSpan = 3;
  cell.className = 'cheat-menu-cell cheat-menu-search-cell';
  cell.innerHTML = html;
}
