import type { ActionKey } from '@src/core/input/keymap.ts';
import type { MenuBuilder } from '@src/core/ui/builder.ts';
import { getSearchKeyword } from '@src/core/ui/widgetState.ts';
import {
  appendScrollSelector,
  type ScrollHandler,
} from '@src/core/ui/widgets/scrollSelector.ts';
import { appendSearchInput } from '@src/core/ui/widgets/searchInput.ts';
import { appendTitle } from '@src/core/ui/widgets/text.ts';
import { appendValueInput } from '@src/core/ui/widgets/valueInput.ts';
import { makeSetExact } from '@src/shared/game/numbers.ts';
import { getIndexInfo, type Matcher } from './listSelector.ts';

type RPGDataItem = { name?: string };

export type InventorySectionConfig = {
  searchPlaceholder: string;
  stateKey: string;
  title: string;
  getData: () => (RPGDataItem | null)[];
  getIdx: () => number;
  setIdx: (idx: number) => void;
  scrollFn: ScrollHandler;
  applyFn: ScrollHandler;
  getCount: (item: RPGDataItem) => number;
  /** adds (or removes, when negative) this many of `item` */
  gainCount: (item: RPGDataItem, delta: number) => void;
  matches: Matcher<RPGDataItem>;
};

export function appendInventorySection(
  config: InventorySectionConfig,
  key1: ActionKey,
  key2: ActionKey,
  key3: ActionKey,
  key4: ActionKey,
): void {
  appendSearchInput(config.searchPlaceholder, config.stateKey, (keyword) => {
    const idx = config
      .getData()
      .findIndex(
        (item, i) =>
          i >= 1 && !!item?.name && item.name.toLowerCase().includes(keyword),
      );
    if (idx > 0) config.setIdx(idx);
  });
  const items = config.getData();
  const idx = config.getIdx();
  const item = items[idx];

  const { index, total } = getIndexInfo(
    items,
    idx,
    config.matches,
    getSearchKeyword(config.stateKey),
  );

  appendTitle(config.title, `${index}/${total}`);

  let count: number | string = 0;

  if (item) {
    // some games override inventory APIs ($gameParty.numItems etc.) in ways
    // that throw — degrade to '?' instead of breaking the whole menu
    try {
      count = config.getCount(item);
    } catch (e) {
      console.error(`[CheatMenu] getCount failed for "${config.title}":`, e);
      count = '?';
    }
  }

  appendScrollSelector(item?.name ?? '', key1, key2, config.scrollFn, true);

  if (item && typeof count === 'number') {
    appendValueInput(
      String(count),
      `${config.stateKey}:${idx}`,
      makeSetExact(
        () => config.getCount(item),
        (delta) => config.gainCount(item, delta),
      ),
      key3,
      key4,
      config.applyFn,
    );
  } else {
    appendScrollSelector(count, key3, key4, config.applyFn);
  }
}

/** Takes 4 keys. */
export function inventorySection(
  ui: MenuBuilder,
  config: InventorySectionConfig,
): void {
  appendInventorySection(
    config,
    ui.nextKey(),
    ui.nextKey(),
    ui.nextKey(),
    ui.nextKey(),
  );
}
