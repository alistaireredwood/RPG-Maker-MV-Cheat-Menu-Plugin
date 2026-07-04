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
    const keyword = (CheatMenu.searchKeywords?.[config.stateKey] || '').toLowerCase();
    const step = direction === 'left' ? -1 : 1;
    const data = config.getData();
    const len = data.length;
    let idx = config.getIdx();
    let found = false;
    for (let i = 0; i < len; i++) {
      idx += step;
      if (idx < startIdx) idx = len - 1;
      else if (idx >= len) idx = startIdx;
      if (data[idx] && config.matches(data[idx], keyword)) { found = true; break; }
    }
    if (found) config.setIdx(idx);
    SoundManager.playSystemSound(0);
    CheatMenu.updateMenu();
  };
}

export function makeApplyAmount(action: (amount: number) => void): ScrollFn {
  return function (direction) {
    let amount = CheatMenu.amounts[CheatMenu.amountIndex];
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
  },
  key1: string | number,
  key2: string | number,
  key3: string | number,
  key4: string | number,
): void {
  CheatMenu.appendSearchInput(config.searchPlaceholder, config.stateKey, (keyword) => {
    const idx = config
      .getData()
      .findIndex((item, i) => i >= 1 && !!item?.name && item.name.toLowerCase().includes(keyword));
    if (idx > 0) config.setIdx(idx);
  });
  CheatMenu.appendTitle(config.title);
  const data = config.getData()[config.getIdx()];
  CheatMenu.appendScrollSelector(data?.name ?? '', key1, key2, config.scrollFn);
  CheatMenu.appendScrollSelector(data ? config.getCount(data) : 0, key3, key4, config.applyFn);
}
