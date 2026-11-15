import { afterEach, describe, expect, it, vi } from 'vitest';
import { widgetState } from '@src/core/ui/widgetState.ts';
import {
  findNextIndex,
  getIndexInfo,
  makeScroll,
  nameMatches,
  type IdMatcher,
} from './listSelector.ts';

vi.mock('@src/core/ui/render.ts', () => ({ updateMenu: vi.fn() }));

// RPG Maker data arrays: index 0 is null, deleted entries are null too
const data = [
  null,
  { name: 'Potion' },
  null,
  { name: 'Hi-Potion' },
  { name: 'Ether' },
  { name: '' },
];

describe('nameMatches', () => {
  it('matches a lower-cased keyword in the name', () => {
    expect(nameMatches({ name: 'Hi-Potion' }, 'potion')).toBe(true);
    expect(nameMatches({ name: 'Ether' }, 'potion')).toBe(false);
    expect(nameMatches({ name: 'Ether' }, '')).toBe(true);
  });

  it('never matches unnamed or missing entries', () => {
    expect(nameMatches({ name: '' }, '')).toBe(false);
    expect(nameMatches(null, '')).toBe(false);
  });
});

describe('findNextIndex', () => {
  it('skips null and non-matching entries', () => {
    expect(findNextIndex(data, 1, 'right', nameMatches, '')).toBe(3);
    expect(findNextIndex(data, 3, 'left', nameMatches, '')).toBe(1);
  });

  it('wraps around and never lands before startIdx', () => {
    expect(findNextIndex(data, 4, 'right', nameMatches, '')).toBe(1);
    expect(findNextIndex(data, 1, 'left', nameMatches, '')).toBe(4);
  });

  it('only visits entries matching the keyword', () => {
    expect(findNextIndex(data, 1, 'right', nameMatches, 'potion')).toBe(3);
    expect(findNextIndex(data, 3, 'right', nameMatches, 'potion')).toBe(1);
  });

  it('returns null when nothing matches', () => {
    expect(findNextIndex(data, 1, 'right', nameMatches, 'sword')).toBeNull();
    expect(findNextIndex([null], 0, 'right', nameMatches, '')).toBeNull();
  });

  it('honours a custom startIdx', () => {
    const switches = ['s0', 's1', 's2'];
    const matchAll = () => true;
    expect(findNextIndex(switches, 2, 'right', matchAll, '', 1)).toBe(1);
    expect(findNextIndex(switches, 2, 'right', matchAll, '', 0)).toBe(0);
  });
});

describe('getIndexInfo', () => {
  it('counts matching entries and the 1-based position of the current one', () => {
    expect(getIndexInfo(data, 3, nameMatches, '')).toEqual({
      index: 2,
      total: 3,
    });
    expect(getIndexInfo(data, 3, nameMatches, 'potion')).toEqual({
      index: 2,
      total: 2,
    });
  });

  it('reports index 0 when the current entry is filtered out', () => {
    expect(getIndexInfo(data, 4, nameMatches, 'potion')).toEqual({
      index: 0,
      total: 2,
    });
  });
});

// e.g. Variables: whether a key is listed depends on its value, looked up by id
const values = [0, 5, 0, 7, 0, 9];
const nonZero: IdMatcher<{ name?: string }> = (item, keyword, id) =>
  nameMatches(item, keyword) && values[id] !== 0;

describe('matchers with the id', () => {
  it('findNextIndex passes the id and skips keys the predicate rejects', () => {
    const seen: number[] = [];
    findNextIndex(
      data,
      1,
      'right',
      (_item, _keyword, id) => {
        seen.push(id);
        return false;
      },
      '',
    );
    expect(seen).toEqual([3, 4, 5, 1]);
    expect(findNextIndex(data, 1, 'right', nonZero, '')).toBe(3);
    expect(findNextIndex(data, 3, 'right', nonZero, '')).toBe(1);
  });

  it('getIndexInfo counts only the keys the predicate accepts', () => {
    expect(getIndexInfo(data, 3, nonZero, '')).toEqual({ index: 2, total: 2 });
    expect(getIndexInfo(data, 4, nonZero, '')).toEqual({ index: 0, total: 2 });
    expect(getIndexInfo(data, 3, nonZero, 'hi')).toEqual({
      index: 1,
      total: 1,
    });
  });
});

describe('makeScroll', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    widgetState.searchKeywords = {};
  });

  const scrollWith = (matches: IdMatcher<{ name?: string }>) => {
    vi.stubGlobal('SoundManager', { playSystemSound: vi.fn() });
    const selection = { idx: 1 };
    const scroll = makeScroll({
      stateKey: 'test',
      getData: () => data,
      getIdx: () => selection.idx,
      setIdx: (idx) => {
        selection.idx = idx;
      },
      matches,
    });
    return { scroll, selection };
  };

  it('steps through the keys the predicate over the id accepts', () => {
    const { scroll, selection } = scrollWith(nonZero);
    scroll('right');
    expect(selection.idx).toBe(3);
    scroll('right');
    expect(selection.idx).toBe(1);
    scroll('left');
    expect(selection.idx).toBe(3);
  });

  it('combines the predicate with the search keyword', () => {
    widgetState.searchKeywords.test = 'Potion';
    const { scroll, selection } = scrollWith(nonZero);
    scroll('right');
    expect(selection.idx).toBe(3);
    scroll('right');
    expect(selection.idx).toBe(1);
  });

  it('keeps the selection when nothing matches', () => {
    const { scroll, selection } = scrollWith(() => false);
    scroll('right');
    expect(selection.idx).toBe(1);
  });
});
