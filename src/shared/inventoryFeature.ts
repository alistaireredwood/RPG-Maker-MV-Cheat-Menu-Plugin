import { defineFeature } from '../core/feature.ts';
import { renameV1Keys } from '../core/persistence.ts';
import { amountSelector, makeApplyAmount } from './controls/amountSelector.ts';
import { inventorySection } from './controls/inventorySection.ts';
import { makeScroll, nameMatches } from './controls/listSelector.ts';

type InventoryItem = DataItem | DataWeapon | DataArmor;

/** Items / Weapons / Armors: same menu over a different data array. */
export function defineInventoryFeature(config: {
  id: string;
  menuName: string;
  title: string;
  searchKey: string;
  searchPlaceholder: string;
  getData: () => (InventoryItem | null)[];
  v1SelectionKey: string;
}) {
  const state = { selection: 1 };
  const getIdx = () => state.selection;
  const setIdx = (idx: number) => {
    state.selection = idx;
  };

  const give = (amount: number) => {
    const item = config.getData()[state.selection];
    if (item != undefined) $gameParty.gainItem(item, amount, false);
  };

  const scroll = makeScroll({
    stateKey: config.searchKey,
    getData: config.getData,
    getIdx,
    setIdx,
    matches: nameMatches,
  });
  const apply = makeApplyAmount(give);

  return defineFeature({
    id: config.id,
    state,
    migrateV1: (v1) =>
      renameV1Keys<typeof state>(v1, { selection: config.v1SelectionKey }),
    menus: [
      {
        id: config.id,
        name: config.menuName,
        render(ui) {
          ui.cheatTitle();
          amountSelector(ui);
          inventorySection(ui, {
            searchPlaceholder: config.searchPlaceholder,
            stateKey: config.searchKey,
            title: config.title,
            getData: config.getData,
            getIdx,
            setIdx,
            scrollFn: scroll,
            applyFn: apply,
            getCount: (item) => $gameParty.numItems(item as InventoryItem),
            gainCount: (item, delta) =>
              $gameParty.gainItem(item as InventoryItem, delta, false),
            matches: nameMatches,
          });
        },
      },
    ],
  });
}
