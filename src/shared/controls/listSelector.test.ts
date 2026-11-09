import { describe, expect, it } from 'vitest';
import { findNextIndex, getIndexInfo, nameMatches } from './listSelector.ts';

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
