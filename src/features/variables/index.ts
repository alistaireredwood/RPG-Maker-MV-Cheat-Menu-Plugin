import { defineFeature } from '@src/core/feature.ts';
import { renameV1Keys } from '@src/core/persistence.ts';
import { getSearchKeyword } from '@src/core/ui/widgetState.ts';
import {
  amountSelector,
  makeApplyAmount,
} from '@src/shared/controls/amountSelector.ts';
import {
  getIndexInfo,
  makeScroll,
  type Matcher,
} from '@src/shared/controls/listSelector.ts';
import { systemNameLabels } from '@src/shared/game/systemNames.ts';
import { parseVariableInput } from './parseVariableInput.ts';

const SEARCH_KEY = 'variable';

const state = {
  selection: 1,
};

const variableMatches: Matcher<string> = (label, keyword) =>
  label.toLowerCase().includes(keyword);

const labels = () => systemNameLabels($dataSystem.variables);

const exists = (id: number) => $dataSystem.variables[id] != undefined;

const scroll = makeScroll({
  stateKey: SEARCH_KEY,
  getData: labels,
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
  const idx = labels().findIndex(
    (label) => label !== null && variableMatches(label, keyword),
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
      tier: 'advanced',
      render(ui) {
        const id = state.selection;
        const { index, total } = getIndexInfo(
          labels(),
          id,
          variableMatches,
          getSearchKeyword(SEARCH_KEY),
          0,
        );

        ui.cheatTitle();
        amountSelector(ui);
        ui.searchInput('Search variables...', SEARCH_KEY, jumpToFirstMatch);
        ui.title('Variable', `${index}/${total}`);
        ui.scrollSelector(labels()[id] ?? 'NULL', scroll, {
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
