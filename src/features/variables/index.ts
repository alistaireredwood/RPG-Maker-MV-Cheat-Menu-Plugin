import { defineFeature } from '../../core/feature.ts';
import { renameV1Keys } from '../../core/persistence.ts';
import { getSearchKeyword } from '../../core/ui/widgetState.ts';
import {
  amountSelector,
  makeApplyAmount,
} from '../../shared/controls/amountSelector.ts';
import {
  getIndexInfo,
  makeScroll,
  type Matcher,
} from '../../shared/controls/listSelector.ts';
import { parseVariableInput } from './parseVariableInput.ts';

const SEARCH_KEY = 'variable';

const state = {
  selection: 1,
};

const variableMatches: Matcher<string> = (name, keyword) =>
  name !== '' && name.toLowerCase().includes(keyword);

const exists = (id: number) => $dataSystem.variables[id] != undefined;

const scroll = makeScroll({
  stateKey: SEARCH_KEY,
  getData: () => $dataSystem.variables,
  getIdx: () => state.selection,
  setIdx: (idx) => {
    state.selection = idx;
  },
  matches: variableMatches,
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
  const idx = $dataSystem.variables.findIndex(
    (name, i) => i > 0 && !!name && name.toLowerCase().includes(keyword),
  );
  if (idx > 0) state.selection = idx;
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
      render(ui) {
        const id = state.selection;
        const { index, total } = getIndexInfo(
          $dataSystem.variables,
          id,
          variableMatches,
          getSearchKeyword(SEARCH_KEY),
          0,
        );

        ui.cheatTitle();
        amountSelector(ui);
        ui.searchInput('Search variables...', SEARCH_KEY, jumpToFirstMatch);
        ui.title('Variable', `${index}/${total}`);
        ui.scrollSelector($dataSystem.variables[id] || 'NULL', scroll, {
          selectable: true,
        });

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
        const label =
          value != undefined
            ? `<span class="error-text">[${Array.isArray(value) ? 'Array' : 'Object'}]</span>`
            : 'NULL';
        ui.scrollSelector(label, addAmount, { showArrows: false });
      },
    },
  ],
});
