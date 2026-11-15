import { defineFeature } from '@src/core/feature.ts';
import { renameV1Keys } from '@src/core/persistence.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import { getSearchKeyword } from '@src/core/ui/widgetState.ts';
import {
  getIndexInfo,
  makeScroll,
  type Matcher,
} from '@src/shared/controls/listSelector.ts';
import { systemNameLabels } from '@src/shared/game/systemNames.ts';
import { playToggleSound } from '@src/shared/controls/status.ts';

const SEARCH_KEY = 'switch';

const state = {
  selection: 1,
};

const switchMatches: Matcher<string> = (label, keyword) =>
  label.toLowerCase().includes(keyword);

const labels = () => systemNameLabels($dataSystem.switches);

const scroll = makeScroll({
  stateKey: SEARCH_KEY,
  getData: labels,
  getIdx: () => state.selection,
  setIdx: (idx) => {
    state.selection = idx;
  },
  matches: switchMatches,
  startIdx: 0,
});

function jumpToFirstMatch(keyword: string): void {
  const idx = labels().findIndex(
    (label) => label !== null && switchMatches(label, keyword),
  );
  if (idx > 0) state.selection = idx;
}

function toggleSelected(): void {
  const id = state.selection;
  if ($dataSystem.switches[id] != undefined) {
    $gameSwitches.setValue(id, !$gameSwitches.value(id));
  }
  playToggleSound($gameSwitches.value(id));
  updateMenu();
}

function valueLabel(value: boolean | undefined): string {
  if (value == undefined) return 'NULL';
  return `<span class="${value ? 'status-on' : 'status-off'}">${value}</span>`;
}

export default defineFeature({
  id: 'switches',
  state,
  migrateV1: (v1) =>
    renameV1Keys<typeof state>(v1, { selection: 'switchSelection' }),
  menus: [
    {
      id: 'switches',
      name: 'Switches',
      render(ui) {
        const id = state.selection;
        const { index, total } = getIndexInfo(
          labels(),
          id,
          switchMatches,
          getSearchKeyword(SEARCH_KEY),
          0,
        );

        ui.cheatTitle();
        ui.searchInput('Search switches...', SEARCH_KEY, jumpToFirstMatch);
        ui.title('Switch', `${index}/${total}`);
        ui.scrollSelector(labels()[id] ?? 'NULL', scroll, {
          selectable: true,
        });
        ui.cheat(
          'Status:',
          valueLabel($gameSwitches.value(id)),
          toggleSelected,
        );
      },
    },
  ],
});
