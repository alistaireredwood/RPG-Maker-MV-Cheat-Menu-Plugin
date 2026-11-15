// Widget state that must survive re-renders (the overlay DOM is rebuilt on
// every update). Not persisted to save files.

export type ValueInputDraft = { text: string; caret: number };
export type CodeInputFocus = { key: string; caret: number; scroll: number };

export const widgetState = {
  searchKeywords: {} as Record<string, string>,
  activeSearchKey: null as string | null,

  /** typed-but-not-applied text of value inputs, keyed by `inputKey` */
  valueInputDrafts: {} as Record<string, ValueInputDraft>,
  activeValueInputKey: null as string | null,

  activeCodeInput: null as CodeInputFocus | null,
};

const renderedValueInputs = new Set<string>();

export function beginValueInputPass(): void {
  renderedValueInputs.clear();
}

export function markValueInputRendered(inputKey: string): void {
  renderedValueInputs.add(inputKey);
}

/**
 * After a render, drop the drafts of value inputs that are not on screen any
 * more (e.g. the selection moved to another variable). Pruning per render
 * rather than while drawing one input lets several inputs coexist: the 1 s
 * refresh used to wipe the text typed into one while it drew another.
 */
export function endValueInputPass(): void {
  const drafts = widgetState.valueInputDrafts;
  for (const key of Object.keys(drafts)) {
    if (!renderedValueInputs.has(key)) delete drafts[key];
  }
  const active = widgetState.activeValueInputKey;
  if (active !== null && !renderedValueInputs.has(active)) {
    widgetState.activeValueInputKey = null;
  }
}

export const getSearchKeyword = (stateKey: string): string =>
  (widgetState.searchKeywords[stateKey] || '').toLowerCase();
