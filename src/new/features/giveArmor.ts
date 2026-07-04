import CheatMenu from '../CheatMenu.ts';
import { makeScroll, makeApplyAmount, appendInventorySection } from '../core/scrollable.ts';

CheatMenu.giveArmor = (armorId, amount) => {
  if ($dataArmors[armorId] != undefined) {
    $gameParty.gainItem($dataArmors[armorId], amount, false);
  }
};

CheatMenu.scrollArmor = makeScroll({
  stateKey: 'armor',
  getData: () => $dataArmors,
  getIdx: () => CheatMenu.armorSelection,
  setIdx: (idx) => { CheatMenu.armorSelection = idx; },
  matches: (item: any, keyword) => item?.name?.toLowerCase().includes(keyword),
});

CheatMenu.applyCurrentArmor = makeApplyAmount((amount) =>
  CheatMenu.giveArmor(CheatMenu.armorSelection, amount),
);

CheatMenu.appendArmorSelection = function (key1, key2, key3, key4) {
  appendInventorySection({
    searchPlaceholder: 'Search armors...',
    stateKey: 'armor',
    title: 'Armor',
    getData: () => $dataArmors,
    getIdx: () => CheatMenu.armorSelection,
    setIdx: (idx) => { CheatMenu.armorSelection = idx; },
    scrollFn: CheatMenu.scrollArmor,
    applyFn: CheatMenu.applyCurrentArmor,
    getCount: (item) => $gameParty.numItems(item as any),
  }, key1, key2, key3, key4);
};

export const menu = {
  name: 'Armors',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendAmountSelection(4, 5);
    CheatMenu.appendArmorSelection(6, 7, 8, 9);
  },
};
