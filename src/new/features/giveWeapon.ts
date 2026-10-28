import CheatMenu from '../CheatMenu.ts';
import { makeScroll, makeApplyAmount, appendInventorySection } from '../core/scrollable.ts';

CheatMenu.giveWeapon = (weaponId, amount) => {
  if ($dataWeapons[weaponId] != undefined) {
    $gameParty.gainItem($dataWeapons[weaponId], amount, false);
  }
};

const weaponMatches = (item: any, keyword: string) =>
  !!item?.name && item.name.toLowerCase().includes(keyword);

CheatMenu.scrollWeapon = makeScroll({
  stateKey: 'weapon',
  getData: () => $dataWeapons,
  getIdx: () => CheatMenu.weaponSelection,
  setIdx: (idx) => { CheatMenu.weaponSelection = idx; },
  matches: weaponMatches,
});

CheatMenu.applyCurrentWeapon = makeApplyAmount((amount) =>
  CheatMenu.giveWeapon(CheatMenu.weaponSelection, amount),
);

CheatMenu.appendWeaponSelection = function (key1, key2, key3, key4) {
  appendInventorySection({
    searchPlaceholder: 'Search weapons...',
    stateKey: 'weapon',
    title: 'Weapon',
    getData: () => $dataWeapons,
    getIdx: () => CheatMenu.weaponSelection,
    setIdx: (idx) => { CheatMenu.weaponSelection = idx; },
    scrollFn: CheatMenu.scrollWeapon,
    applyFn: CheatMenu.applyCurrentWeapon,
    getCount: (item) => $gameParty.numItems(item as any),
    matches: weaponMatches,
  }, key1, key2, key3, key4);
};

export const menu = {
  name: 'Weapons',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendAmountSelection(4, 5);
    CheatMenu.appendWeaponSelection(6, 7, 8, 9);
  },
};
