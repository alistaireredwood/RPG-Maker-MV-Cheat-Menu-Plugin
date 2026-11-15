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

export const getSearchKeyword = (stateKey: string): string =>
  (widgetState.searchKeywords[stateKey] || '').toLowerCase();
