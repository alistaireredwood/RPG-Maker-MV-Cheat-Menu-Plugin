import CheatMenu from '../CheatMenu.ts';

type ScrollFn = (direction: 'left' | 'right', event?: MouseEvent) => void;
type RPGDataItem = { name?: string };

export function makeScroll(config: {
  stateKey: string;
  getData: () => unknown[];
  getIdx: () => number;
  setIdx: (idx: number) => void;
  matches: (item: unknown, keyword: string) => boolean;
  startIdx?: number;
}): ScrollFn {
  const startIdx = config.startIdx ?? 1;
  return function (direction) {
    const keyword = (
      CheatMenu.searchKeywords?.[config.stateKey] || ''
    ).toLowerCase();
    const step = direction === 'left' ? -1 : 1;
    const data = config.getData();
    const len = data.length;
    let idx = config.getIdx();
    let found = false;
    for (let i = 0; i < len; i++) {
      idx += step;
      if (idx < startIdx) idx = len - 1;
      else if (idx >= len) idx = startIdx;
      if (data[idx] && config.matches(data[idx], keyword)) {
        found = true;
        break;
      }
    }
    if (found) config.setIdx(idx);
    SoundManager.playSystemSound(0);
    CheatMenu.updateMenu();
  };
}

export function getIndexInfo(
  data: unknown[],
  currentIdx: number,
  matches: (item: unknown, keyword: string) => boolean,
  keyword: string,
  startIdx = 1,
): { index: number; total: number } {
  let total = 0;
  let index = 0;
  for (let i = startIdx; i < data.length; i++) {
    const item = data[i];
    if (item && matches(item, keyword)) {
      total++;
      if (i === currentIdx) index = total;
    }
  }
  return { index, total };
}

// typed text → whole number, or null if it isn't one (e.g. "", "abc", "1.5")
export function parseIntegerInput(text: string): number | null {
  const trimmed = text.trim();
  return /^[+-]?\d+$/.test(trimmed) ? Number(trimmed) : null;
}

// onCommit for appendValueInput: set a counter to the typed whole number by
// applying the difference — the engine's own gain* methods keep their clamping
// (max items, max gold, …). Returns false to reject non-integer input.
export function makeSetExact(
  getCurrent: () => number,
  applyDelta: (delta: number) => void,
): (text: string) => boolean {
  return (text) => {
    const target = parseIntegerInput(text);
    if (target === null) return false;
    applyDelta(target - getCurrent());
    SoundManager.playSystemSound(1);
    return true;
  };
}

export function makeApplyAmount(action: (amount: number) => void): ScrollFn {
  return function (direction) {
    let amount = CheatMenu.customAmount ?? CheatMenu.amounts[CheatMenu.amountIndex];
    if (direction === 'left') {
      amount = -amount;
      SoundManager.playSystemSound(2);
    } else {
      SoundManager.playSystemSound(1);
    }
    action(amount);
    CheatMenu.updateMenu();
  };
}

export function appendInventorySection(
  config: {
    searchPlaceholder: string;
    stateKey: string;
    title: string;
    getData: () => (RPGDataItem | null)[];
    getIdx: () => number;
    setIdx: (idx: number) => void;
    scrollFn: ScrollFn;
    applyFn: ScrollFn;
    getCount: (item: RPGDataItem) => number;
    /** adds (or removes, when negative) this many of `item` */
    gainCount: (item: RPGDataItem, delta: number) => void;
    matches: (item: RPGDataItem, keyword: string) => boolean;
  },
  key1: string | number,
  key2: string | number,
  key3: string | number,
  key4: string | number,
): void {
  CheatMenu.appendSearchInput(
    config.searchPlaceholder,
    config.stateKey,
    (keyword) => {
      const idx = config
        .getData()
        .findIndex(
          (item, i) =>
            i >= 1 && !!item?.name && item.name.toLowerCase().includes(keyword),
        );
      if (idx > 0) config.setIdx(idx);
    },
  );
  const items = config.getData();
  const idx = config.getIdx();
  const item = items[idx];

  const keyword = (CheatMenu.searchKeywords?.[config.stateKey] || '').toLowerCase();
  const { index, total } = getIndexInfo(items, idx, config.matches as (item: unknown, keyword: string) => boolean, keyword);

  CheatMenu.appendTitle(config.title, `${index}/${total}`);

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

  CheatMenu.appendScrollSelector(item?.name ?? '', key1, key2, config.scrollFn, true);

  if (item && typeof count === 'number') {
    CheatMenu.appendValueInput(
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
    CheatMenu.appendScrollSelector(count, key3, key4, config.applyFn);
  }
}
