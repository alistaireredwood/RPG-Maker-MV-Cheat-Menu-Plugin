// Widget state that must survive re-renders (the overlay DOM is rebuilt on
// every update). Not persisted to save files.

export type ValueInputDraft = { text: string; caret: number };
export type CodeInputFocus = { key: string; caret: number; scroll: number };

export const widgetState = {
  /** search term per list (`stateKey`), lower-cased; mutated in place, never replaced */
  searchKeywords: {} as Record<string, string>,
  /** which search input owns focus */
  activeSearchKey: null as string | null,

  /** typed-but-not-applied text of value inputs, keyed by `inputKey` */
  valueInputDrafts: {} as Record<string, ValueInputDraft>,
  /** which value input owns focus */
  activeValueInputKey: null as string | null,

  /** focus / caret / scroll of the code textarea */
  activeCodeInput: null as CodeInputFocus | null,
};

export const getSearchKeyword = (stateKey: string): string =>
  (widgetState.searchKeywords[stateKey] || '').toLowerCase();
