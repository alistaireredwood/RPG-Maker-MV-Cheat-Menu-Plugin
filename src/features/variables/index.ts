import { defineFeature } from '@src/core/feature.ts';
import { renameV1Keys } from '@src/core/persistence.ts';
import type { MenuBuilder } from '@src/core/ui/builder.ts';
import { ICON_EDIT } from '@src/core/ui/icons.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import { getSearchKeyword } from '@src/core/ui/widgetState.ts';
import {
  amountSelector,
  makeApplyAmount,
} from '@src/shared/controls/amountSelector.ts';
import { getIndexInfo, makeScroll } from '@src/shared/controls/listSelector.ts';
import { systemNameLabels } from '@src/shared/game/systemNames.ts';
import { escapeHtml } from '@src/shared/html.ts';
import {
  countNames,
  entryMatches,
  nameOverrides,
  renameVariable,
  resetAllVariableNames,
  resetVariableName,
  variableEntries,
  type VariableEntry,
} from './displayNames.ts';
import { parseVariableInput } from './parseVariableInput.ts';

const SEARCH_KEY = 'variable';

const state = {
  selection: 1,
};

let editingNames = false;

const entries = () => variableEntries(systemNameLabels($dataSystem.variables));

const exists = (id: number) => $dataSystem.variables[id] != undefined;

const scroll = makeScroll({
  stateKey: SEARCH_KEY,
  getData: entries,
  getIdx: () => state.selection,
  setIdx: (idx) => {
    state.selection = idx;
  },
  matches: entryMatches,
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
    (entry) => entry !== null && entryMatches(entry, keyword),
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

const readOnlyLabel = (value: unknown): string => {
  if (value == undefined) return 'NULL';
  if (typeof value === 'object') {
    return `<span class="error-text">[${Array.isArray(value) ? 'Array' : 'Object'}]</span>`;
  }
  return escapeHtml(String(value));
};

function renderSelector(ui: MenuBuilder, id: number): VariableEntry | null {
  const entry = entries()[id] ?? null;
  if (editingNames && entry && exists(id)) {
    ui.valueInput(
      entry.label,
      `variableName:${id}`,
      (text) => commitName(id, entry, text),
      scroll,
    );
  } else {
    ui.scrollSelector(entry ? escapeHtml(entry.label) : 'NULL', scroll, {
      selectable: true,
    });
  }
  return entry;
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
  // arrays / objects stay read-only
  ui.scrollSelector(readOnlyLabel(value), addAmount, { showArrows: false });
}

function renderNameEditing(
  ui: MenuBuilder,
  id: number,
  entry: VariableEntry | null,
): void {
  // Read-only here: two value inputs on screen would drop each other's
  // drafts (a value input keeps only the draft of the focused one).
  ui.scrollSelector(readOnlyLabel($gameVariables.value(id)), addAmount, {
    showArrows: false,
  });
  ui.cheat('Reset name', entry ? escapeHtml(entry.original) : 'NULL', () => {
    if (entry) resetName(id, entry);
    else SoundManager.playBuzzer();
  });
  const renamed = countNames(nameOverrides());
  ui.cheat(
    'Reset all names',
    renamed ? `${renamed} renamed` : 'None',
    resetAllNames,
  );
}

export default defineFeature({
  id: 'variables',
  state,
  migrateV1: (v1) =>
    renameV1Keys<typeof state>(v1, { selection: 'variableSelection' }),
  menus: [
    {
      id: 'variables',
      name: 'Variables',
      tier: 'advanced',
      render(ui) {
        const id = state.selection;
        const { index, total } = getIndexInfo(
          entries(),
          id,
          entryMatches,
          getSearchKeyword(SEARCH_KEY),
          0,
        );

        ui.cheatTitle();
        amountSelector(ui);
        ui.searchInput('Search variables...', SEARCH_KEY, jumpToFirstMatch);
        ui.title('Variable', `${index}/${total}`, {
          actions: [
            {
              icon: ICON_EDIT,
              title: editingNames ? 'Stop renaming' : 'Rename variables',
              active: editingNames,
              onClick: toggleEditingNames,
            },
          ],
        });
        const entry = renderSelector(ui, id);
        if (editingNames) renderNameEditing(ui, id, entry);
        else renderValue(ui, id);
      },
    },
  ],
});
