import { updateMenu } from '@src/core/ui/render.ts';
import { getSearchKeyword } from '@src/core/ui/widgetState.ts';
import type {
  Direction,
  ScrollHandler,
} from '@src/core/ui/widgets/scrollSelector.ts';

export type Matcher<T = unknown> = (item: T, keyword: string) => boolean;

export const nameMatches: Matcher<{ name?: string } | null> = (item, keyword) =>
  !!item?.name && item.name.toLowerCase().includes(keyword);

/**
 * `startIdx` defaults to 1: RPG Maker data arrays start with a `null` at 0.
 */
export function findNextIndex<T>(
  data: readonly (T | null | undefined)[],
  currentIdx: number,
  direction: Direction,
  matches: Matcher<T>,
  keyword: string,
  startIdx = 1,
): number | null {
  const step = direction === 'left' ? -1 : 1;
  const len = data.length;
  let idx = currentIdx;
  for (let i = 0; i < len; i++) {
    idx += step;
    if (idx < startIdx) idx = len - 1;
    else if (idx >= len) idx = startIdx;
    const item = data[idx];
    if (item && matches(item, keyword)) return idx;
  }
  return null;
}

export function getIndexInfo<T>(
  data: readonly (T | null | undefined)[],
  currentIdx: number,
  matches: Matcher<T>,
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

export function makeScroll<T>(config: {
  stateKey: string;
  getData: () => readonly (T | null | undefined)[];
  getIdx: () => number;
  setIdx: (idx: number) => void;
  matches: Matcher<T>;
  startIdx?: number;
}): ScrollHandler {
  return function (direction) {
    const next = findNextIndex(
      config.getData(),
      config.getIdx(),
      direction,
      config.matches,
      getSearchKeyword(config.stateKey),
      config.startIdx ?? 1,
    );
    if (next !== null) config.setIdx(next);
    SoundManager.playSystemSound(0);
    updateMenu();
  };
}
