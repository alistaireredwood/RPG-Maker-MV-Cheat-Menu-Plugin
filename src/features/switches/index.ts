import { defineFeature } from '@src/core/feature.ts';
import { renameV1Keys } from '@src/core/persistence.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import { getSearchKeyword } from '@src/core/ui/widgetState.ts';
import {
  getIndexInfo,
  makeScroll,
  type Matcher,
} from '@src/shared/controls/listSelector.ts';
import { playToggleSound } from '@src/shared/controls/status.ts';

const SEARCH_KEY = 'switch';

const state = {
  selection: 1,
};

const switchMatches: Matcher<string> = (name, keyword) =>
  name !== '' && name.toLowerCase().includes(keyword);

const scroll = makeScroll({
  stateKey: SEARCH_KEY,
  getData: () => $dataSystem.switches,
  getIdx: () => state.selection,
  setIdx: (idx) => {
    state.selection = idx;
  },
  matches: switchMatches,
  startIdx: 0,
});

function jumpToFirstMatch(keyword: string): void {
  const idx = $dataSystem.switches.findIndex(
    (name, i) => i > 0 && !!name && name.toLowerCase().includes(keyword),
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
          $dataSystem.switches,
          id,
          switchMatches,
          getSearchKeyword(SEARCH_KEY),
          0,
        );

        ui.cheatTitle();
        ui.searchInput('Search switches...', SEARCH_KEY, jumpToFirstMatch);
        ui.title('Switch', `${index}/${total}`);
        ui.scrollSelector($dataSystem.switches[id] || 'NULL', scroll, {
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
