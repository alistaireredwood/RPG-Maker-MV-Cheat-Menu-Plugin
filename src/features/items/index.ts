import { defineFeature } from '../../core/feature.ts';
import {
  amountSelector,
  makeApplyAmount,
} from '../../shared/controls/amountSelector.ts';
import { inventorySection } from '../../shared/controls/inventorySection.ts';
import { makeScroll, nameMatches } from '../../shared/controls/listSelector.ts';

const state = {
  /** index into $dataItems */
  selection: 1,
};

const SEARCH_KEY = 'item';

function giveItem(itemId: number, amount: number): void {
  const item = $dataItems[itemId];
  if (item != undefined) $gameParty.gainItem(item, amount, false);
}

const scrollItem = makeScroll({
  stateKey: SEARCH_KEY,
  getData: () => $dataItems,
  getIdx: () => state.selection,
  setIdx: (idx) => {
    state.selection = idx;
  },
  matches: nameMatches,
});

const applyAmount = makeApplyAmount((amount) =>
  giveItem(state.selection, amount),
);

export default defineFeature({
  id: 'items',
  state,
  migrateV1: (v1) =>
    typeof v1.itemSelection === 'number' ? { selection: v1.itemSelection } : {},
  menus: [
    {
      id: 'items',
      name: 'Items',
      render(ui) {
        ui.cheatTitle();
        amountSelector(ui);
        inventorySection(ui, {
          searchPlaceholder: 'Search items...',
          stateKey: SEARCH_KEY,
          title: 'Item',
          getData: () => $dataItems,
          getIdx: () => state.selection,
          setIdx: (idx) => {
            state.selection = idx;
          },
          scrollFn: scrollItem,
          applyFn: applyAmount,
          getCount: (item) => $gameParty.numItems(item as DataItem),
          gainCount: (item, delta) =>
            $gameParty.gainItem(item as DataItem, delta, false),
          matches: nameMatches,
        });
      },
    },
  ],
});
