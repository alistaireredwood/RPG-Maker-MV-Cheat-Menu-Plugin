import CheatMenu from '../CheatMenu.ts';
import { makeScroll, makeApplyAmount, appendInventorySection } from '../core/scrollable.ts';

CheatMenu.giveItem = (itemId, amount) => {
  if ($dataItems[itemId] != undefined) {
    $gameParty.gainItem($dataItems[itemId], amount, false);
  }
};

const itemMatches = (item: any, keyword: string) =>
  !!item?.name && item.name.toLowerCase().includes(keyword);

CheatMenu.scrollItem = makeScroll({
  stateKey: 'item',
  getData: () => $dataItems,
  getIdx: () => CheatMenu.itemSelection,
  setIdx: (idx) => { CheatMenu.itemSelection = idx; },
  matches: itemMatches,
});

CheatMenu.applyCurrentItem = makeApplyAmount((amount) =>
  CheatMenu.giveItem(CheatMenu.itemSelection, amount),
);

CheatMenu.appendItemSelection = function (key1, key2, key3, key4) {
  appendInventorySection({
    searchPlaceholder: 'Search items...',
    stateKey: 'item',
    title: 'Item',
    getData: () => $dataItems,
    getIdx: () => CheatMenu.itemSelection,
    setIdx: (idx) => { CheatMenu.itemSelection = idx; },
    scrollFn: CheatMenu.scrollItem,
    applyFn: CheatMenu.applyCurrentItem,
    getCount: (item) => $gameParty.numItems(item as any),
    matches: itemMatches,
  }, key1, key2, key3, key4);
};

export const menu = {
  name: 'Items',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendAmountSelection(4, 5);
    CheatMenu.appendItemSelection(6, 7, 8, 9);
  },
};
