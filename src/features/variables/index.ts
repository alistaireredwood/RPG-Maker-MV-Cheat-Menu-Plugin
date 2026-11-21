import { defineFeature } from '@src/core/feature.ts';
import { renameV1Keys } from '@src/core/persistence.ts';
import type { MenuBuilder } from '@src/core/ui/builder.ts';
import { ICON_EDIT, ICON_FILTER } from '@src/core/ui/icons.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import { getSearchKeyword, widgetState } from '@src/core/ui/widgetState.ts';
import {
  amountSelector,
  makeApplyAmount,
} from '@src/shared/controls/amountSelector.ts';
import {
  getIndexInfo,
  makeScroll,
  type IdMatcher,
} from '@src/shared/controls/listSelector.ts';
import { onOffLabel, playToggleSound } from '@src/shared/controls/status.ts';
import { dictionaryLabels } from '@src/shared/game/dictionarySources.ts';
import { systemNameLabels } from '@src/shared/game/systemNames.ts';
import { escapeHtml } from '@src/shared/html.ts';
import {
  countNames,
  nameOverrides,
  renameVariable,
  resetAllVariableNames,
  resetVariableName,
} from '@src/shared/game/variableNames.ts';
import { variableEntries, type VariableEntry } from './displayNames.ts';
import {
  defaultFilter,
  isDefaultFilter,
  normalizeFilter,
  parseBound,
  VALUE_TYPES,
  variableMatches,
  type ValueType,
  type VariableFilter,
} from './matchesFilter.ts';
import { parseVariableInput } from './parseVariableInput.ts';

const SEARCH_KEY = 'variable';
const MIN_INPUT_KEY = 'variableFilter:min';
const MAX_INPUT_KEY = 'variableFilter:max';

const TYPE_LABELS: Record<ValueType, string> = {
  number: 'Numbers',
  string: 'Text',
  array: 'Arrays',
  object: 'Objects',
};

// filters are per save: which keys matter depends on where the player is
const state = {
  selection: 1,
  filter: defaultFilter(),
};

let editingNames = false;
let filterDraft: VariableFilter | null = null;

const entries = () => {
  const names = $dataSystem.variables;
  return variableEntries(
    dictionaryLabels(
      'variables',
      names,
      systemNameLabels(names, { autoIdLabels: false }),
    ),
    names,
  );
};

const exists = (id: number) => $dataSystem.variables[id] != undefined;

const isListed: IdMatcher<VariableEntry> = (entry, keyword, id) =>
  variableMatches(entry, keyword, $gameVariables.value(id), state.filter);

const isShown = (entry: VariableEntry | null): entry is VariableEntry =>
  !!entry && (entry.named || state.filter.showUnnamed);

const scroll = makeScroll({
  stateKey: SEARCH_KEY,
  getData: entries,
  getIdx: () => state.selection,
  setIdx: (idx) => {
    state.selection = idx;
  },
  matches: isListed,
  startIdx: 0,
});

const addAmount = makeApplyAmount((amount) => {
  const id = state.selection;
  if (exists(id))
    $gameVariables.setValue(id, $gameVariables.value(id) + amount);
});

function setTypedValue(id: number, text: string): void {
  if (!exists(id)) return;
  $gameVariables.setValue(id, parseVariableInput(text) as number);
  SoundManager.playSystemSound(1);
}

function jumpToFirstMatch(keyword: string): void {
  const idx = entries().findIndex(
    (entry, id) => entry !== null && isListed(entry, keyword, id),
  );
  if (idx > 0) state.selection = idx;
}

function toggleEditingNames(): void {
  editingNames = !editingNames;
  SoundManager.playSystemSound(0);
  updateMenu();
}

function commitName(id: number, entry: VariableEntry, text: string): void {
  renameVariable(id, text, entry.original);
  SoundManager.playSystemSound(1);
}

function resetName(id: number, entry: VariableEntry): void {
  if (!entry.custom) {
    SoundManager.playBuzzer();
    return;
  }
  resetVariableName(id);
  SoundManager.playSystemSound(2);
  updateMenu();
}

function resetAllNames(): void {
  if (countNames(nameOverrides()) === 0) {
    SoundManager.playBuzzer();
    return;
  }
  resetAllVariableNames();
  SoundManager.playSystemSound(2);
  updateMenu();
}

function clearBoundInputs(): void {
  for (const key of [MIN_INPUT_KEY, MAX_INPUT_KEY]) {
    delete widgetState.valueInputDrafts[key];
    if (widgetState.activeValueInputKey === key) {
      widgetState.activeValueInputKey = null;
    }
  }
}

function closeFilterPanel(): void {
  filterDraft = null;
  clearBoundInputs();
}

function openFilterPanel(): void {
  filterDraft = normalizeFilter(state.filter);
  SoundManager.playSystemSound(0);
  updateMenu();
}

function cancelFilters(): void {
  closeFilterPanel();
  SoundManager.playSystemSound(2);
  updateMenu();
}

// Saves right away, unlike the options above it: a reset needs no review.
function resetFilters(): void {
  state.filter = defaultFilter();
  closeFilterPanel();
  selectFirstListedIfHidden();
  SoundManager.playSystemSound(2);
  updateMenu();
}

// Apply is bound on mousedown, which runs before the focused bound input
// blurs and drops its text — so a bound typed without Enter is read here.
function takeTypedBounds(draft: VariableFilter): boolean {
  for (const [key, bound] of [
    [MIN_INPUT_KEY, 'min'],
    [MAX_INPUT_KEY, 'max'],
  ] as const) {
    const typed = widgetState.valueInputDrafts[key];
    if (!typed) continue;
    const value = parseBound(typed.text);
    if (value === undefined) return false;
    draft[bound] = value;
  }
  return true;
}

function selectFirstListedIfHidden(): void {
  const entry = entries()[state.selection];
  const keyword = getSearchKeyword(SEARCH_KEY);
  if (!entry || !isListed(entry, keyword, state.selection)) {
    jumpToFirstMatch(keyword);
  }
}

function applyFilters(draft: VariableFilter): void {
  if (!takeTypedBounds(draft)) {
    SoundManager.playBuzzer();
    return;
  }
  state.filter = normalizeFilter(draft);
  closeFilterPanel();
  selectFirstListedIfHidden();
  SoundManager.playSystemSound(1);
  updateMenu();
}

function toggleDraftOption(
  draft: VariableFilter,
  option: 'showUnnamed' | 'hideFalsy',
): void {
  draft[option] = !draft[option];
  playToggleSound(draft[option]);
  updateMenu();
}

function toggleDraftType(draft: VariableFilter, type: ValueType): void {
  const on = !draft.types.includes(type);
  draft.types = on
    ? [...draft.types, type]
    : draft.types.filter((t) => t !== type);
  playToggleSound(on);
  updateMenu();
}

function setDraftBound(
  draft: VariableFilter,
  bound: 'min' | 'max',
  text: string,
): boolean {
  const value = parseBound(text);
  if (value === undefined) return false;
  draft[bound] = value;
  SoundManager.playSystemSound(1);
  return true;
}

const readOnlyLabel = (value: unknown): string => {
  if (value == undefined) return 'NULL';
  if (typeof value === 'object') {
    return `<span class="error-text">[${Array.isArray(value) ? 'Array' : 'Object'}]</span>`;
  }
  return escapeHtml(String(value));
};

// In a game that names nothing the default filter lists nothing at all —
// point at the option instead of showing a bare NULL.
function emptyListLabel(): string {
  const anyNamed = entries().some((entry) => entry?.named);
  return anyNamed || state.filter.showUnnamed
    ? 'NULL'
    : 'No named variables – enable <i>Show unnamed</i> in filters';
}

function renderSelector(
  ui: MenuBuilder,
  id: number,
  total: number,
): VariableEntry | null {
  const entry = entries()[id] ?? null;
  const shown = isShown(entry) ? entry : null;
  if (editingNames && shown && exists(id)) {
    ui.valueInput(
      shown.label,
      `variableName:${id}`,
      (text) => commitName(id, shown, text),
      scroll,
      { wide: true },
    );
  } else {
    const label = shown
      ? escapeHtml(shown.label)
      : total === 0
        ? emptyListLabel()
        : 'NULL';
    ui.scrollSelector(label, scroll, { selectable: true });
  }
  return shown;
}

function renderValue(ui: MenuBuilder, id: number): void {
  const value: unknown = $gameVariables.value(id);
  const isNumeric = typeof value === 'number';
  if (exists(id) && (isNumeric || typeof value === 'string')) {
    // ←/→ are hidden for strings — "abc" + 10 would corrupt the value
    ui.valueInput(
      String(value),
      `variable:${id}`,
      (text) => setTypedValue(id, text),
      addAmount,
      { showArrows: isNumeric },
    );
    return;
  }
  ui.scrollSelector(readOnlyLabel(value), addAmount, { showArrows: false });
}

function renderNameEditing(
  ui: MenuBuilder,
  id: number,
  entry: VariableEntry | null,
): void {
  // Read-only by design: renaming mode changes names only, so a value can't
  // be changed by mistake while editing names.
  ui.scrollSelector(readOnlyLabel($gameVariables.value(id)), addAmount, {
    showArrows: false,
  });
  ui.cheat(
    'Reset name',
    entry ? escapeHtml(entry.original) : 'NULL',
    () => {
      if (entry) resetName(id, entry);
      else SoundManager.playBuzzer();
    },
    { wide: true },
  );
  const renamed = countNames(nameOverrides());
  ui.cheat(
    'Reset all names',
    renamed ? `${renamed} renamed` : 'None',
    resetAllNames,
    { wide: true },
  );
}

const boundText = (value: number | null) =>
  value === null ? '' : String(value);

// Drawn instead of the amount, search, selector and value rows: the options
// need 9 action keys, all there are.
function renderFilterPanel(ui: MenuBuilder, draft: VariableFilter): void {
  ui.title('Filters', undefined, {
    actions: [
      {
        icon: ICON_FILTER,
        title: 'Close filters (cancel)',
        active: !isDefaultFilter(draft),
        onClick: cancelFilters,
      },
    ],
  });
  ui.cheat('Show unnamed', onOffLabel(draft.showUnnamed), () =>
    toggleDraftOption(draft, 'showUnnamed'),
  );
  ui.cheat('Hide empty', onOffLabel(draft.hideFalsy), () =>
    toggleDraftOption(draft, 'hideFalsy'),
  );

  ui.title('Value types', draft.types.length ? '' : 'none = all');
  for (const type of VALUE_TYPES) {
    ui.cheat(TYPE_LABELS[type], onOffLabel(draft.types.includes(type)), () =>
      toggleDraftType(draft, type),
    );
  }

  ui.title('Range');
  ui.valueInputPair(
    {
      value: boundText(draft.min),
      inputKey: MIN_INPUT_KEY,
      onCommit: (text) => setDraftBound(draft, 'min', text),
      accept: 'decimal',
      placeholder: 'min',
    },
    {
      value: boundText(draft.max),
      inputKey: MAX_INPUT_KEY,
      onCommit: (text) => setDraftBound(draft, 'max', text),
      accept: 'decimal',
      placeholder: 'max',
    },
  );

  ui.section('cheat-menu-buttons-section', () =>
    ui.buttonRow([
      { label: 'Apply', onActivate: () => applyFilters(draft) },
      { label: 'Reset', onActivate: resetFilters },
      { label: 'Cancel', onActivate: cancelFilters },
    ]),
  );
}

export default defineFeature({
  id: 'variables',
  state,
  migrateV1: (v1) =>
    renameV1Keys<typeof state>(v1, { selection: 'variableSelection' }),
  onStateRestored(restored) {
    restored.filter = normalizeFilter(restored.filter);
    // an open panel holds the previous save's filter
    closeFilterPanel();
  },
  menus: [
    {
      id: 'variables',
      name: 'Variables',
      tier: 'advanced',
      render(ui) {
        ui.cheatTitle();
        if (filterDraft) {
          renderFilterPanel(ui, filterDraft);
          return;
        }

        const id = state.selection;
        const { index, total } = getIndexInfo(
          entries(),
          id,
          isListed,
          getSearchKeyword(SEARCH_KEY),
          0,
        );

        amountSelector(ui);
        ui.searchInput('Search variables...', SEARCH_KEY, jumpToFirstMatch);
        ui.title('Variable', `${index}/${total}`, {
          actions: [
            {
              icon: ICON_FILTER,
              title: 'Filters',
              active: !isDefaultFilter(state.filter),
              onClick: openFilterPanel,
            },
            {
              icon: ICON_EDIT,
              title: editingNames ? 'Stop renaming' : 'Rename variables',
              active: editingNames,
              onClick: toggleEditingNames,
            },
          ],
        });
        const entry = renderSelector(ui, id, total);
        if (editingNames) renderNameEditing(ui, id, entry);
        else if (entry) renderValue(ui, id);
        else {
          ui.scrollSelector('NULL', addAmount, { showArrows: false });
        }
      },
    },
  ],
});
