import { describe, expect, it } from 'vitest';
import type { VariableEntry } from './displayNames.ts';
import {
  defaultFilter,
  isDefaultFilter,
  matchesFilter,
  normalizeFilter,
  parseBound,
  variableMatches,
  type VariableFilter,
} from './matchesFilter.ts';

const named: VariableEntry = {
  label: 'Gold',
  original: 'Gold',
  custom: false,
  named: true,
};
const renamed: VariableEntry = {
  label: 'Money',
  original: '#0002',
  custom: true,
  named: true,
};
const unnamed: VariableEntry = {
  label: '#0003',
  original: '#0003',
  custom: false,
  named: false,
};

const filter = (changes: Partial<VariableFilter> = {}): VariableFilter => ({
  ...defaultFilter(),
  ...changes,
});

describe('matchesFilter', () => {
  it('default filter: hides unnamed keys, shows named and renamed ones', () => {
    expect(matchesFilter(unnamed, 0, filter())).toBe(false);
    expect(matchesFilter(named, 0, filter())).toBe(true);
    expect(matchesFilter(renamed, 0, filter())).toBe(true);
  });

  it('showUnnamed: unnamed keys are visible', () => {
    expect(matchesFilter(unnamed, 0, filter({ showUnnamed: true }))).toBe(true);
  });

  it('hideFalsy: hides 0, null, NaN, empty text, false and undefined', () => {
    const hideFalsy = filter({ hideFalsy: true });
    for (const value of [0, null, NaN, '', false, undefined]) {
      expect(matchesFilter(named, value, hideFalsy)).toBe(false);
    }
    for (const value of ['0', [], {}, -1, 1, 'a', true]) {
      expect(matchesFilter(named, value, hideFalsy)).toBe(true);
    }
  });

  it('types: each type on its own', () => {
    const values = { number: 5, string: 'a', array: [1], object: { a: 1 } };
    for (const type of ['number', 'string', 'array', 'object'] as const) {
      const only = filter({ types: [type] });
      for (const [valueType, value] of Object.entries(values)) {
        expect(matchesFilter(named, value, only)).toBe(valueType === type);
      }
    }
  });

  it('types: several at once, arrays are not objects', () => {
    const numbersOrObjects = filter({ types: ['number', 'object'] });
    expect(matchesFilter(named, 1, numbersOrObjects)).toBe(true);
    expect(matchesFilter(named, { a: 1 }, numbersOrObjects)).toBe(true);
    expect(matchesFilter(named, [], numbersOrObjects)).toBe(false);
    expect(matchesFilter(named, 'a', numbersOrObjects)).toBe(false);
  });

  it('types: null, undefined and booleans are none of the types', () => {
    const all = filter({ types: ['number', 'string', 'array', 'object'] });
    for (const value of [null, undefined, true]) {
      expect(matchesFilter(named, value, all)).toBe(false);
    }
  });

  it('types: empty means all', () => {
    for (const value of [1, 'a', [], {}, null, true]) {
      expect(matchesFilter(named, value, filter())).toBe(true);
    }
  });

  it('min / max: inclusive bounds', () => {
    const range = filter({ min: 1, max: 3 });
    expect([0, 1, 2, 3, 4].map((v) => matchesFilter(named, v, range))).toEqual([
      false,
      true,
      true,
      true,
      false,
    ]);
  });

  it('min / max: only one bound set', () => {
    expect(matchesFilter(named, 10, filter({ min: 5 }))).toBe(true);
    expect(matchesFilter(named, 4, filter({ min: 5 }))).toBe(false);
    expect(matchesFilter(named, -10, filter({ max: 5 }))).toBe(true);
    expect(matchesFilter(named, 6, filter({ max: 5 }))).toBe(false);
  });

  it('min / max: min > max matches nothing', () => {
    const inverted = filter({ min: 5, max: 1 });
    for (const value of [0, 1, 3, 5, 6]) {
      expect(matchesFilter(named, value, inverted)).toBe(false);
    }
  });

  it('min / max: non-numeric values are hidden while a range is active', () => {
    const range = filter({ min: 0 });
    for (const value of ['5', NaN, [], {}, null, true]) {
      expect(matchesFilter(named, value, range)).toBe(false);
    }
  });

  it('every option has to match', () => {
    const strict = filter({ hideFalsy: true, types: ['number'], min: 0 });
    expect(matchesFilter(named, 5, strict)).toBe(true);
    expect(matchesFilter(named, 0, strict)).toBe(false);
    expect(matchesFilter(unnamed, 5, strict)).toBe(false);
  });
});

describe('variableMatches', () => {
  it('is the filter AND the search keyword', () => {
    const f = filter({ hideFalsy: true });
    expect(variableMatches(named, 'gold', 5, f)).toBe(true);
    expect(variableMatches(named, 'day', 5, f)).toBe(false);
    expect(variableMatches(named, 'gold', 0, f)).toBe(false);
    expect(variableMatches(unnamed, '#0003', 5, f)).toBe(false);
    expect(
      variableMatches(unnamed, '#0003', 5, filter({ showUnnamed: true })),
    ).toBe(true);
  });

  it('searches the custom and the original name', () => {
    expect(variableMatches(renamed, 'money', 1, filter())).toBe(true);
    expect(variableMatches(renamed, '0002', 1, filter())).toBe(true);
  });
});

describe('isDefaultFilter (icon state)', () => {
  it('is true only for the defaults', () => {
    expect(isDefaultFilter(defaultFilter())).toBe(true);
    expect(isDefaultFilter(filter({ showUnnamed: true }))).toBe(false);
    expect(isDefaultFilter(filter({ hideFalsy: true }))).toBe(false);
    expect(isDefaultFilter(filter({ types: ['string'] }))).toBe(false);
    expect(isDefaultFilter(filter({ min: 0 }))).toBe(false);
    expect(isDefaultFilter(filter({ max: 0 }))).toBe(false);
  });
});

describe('defaultFilter', () => {
  it('returns a fresh object every time', () => {
    const a = defaultFilter();
    a.types.push('number');
    expect(defaultFilter().types).toEqual([]);
  });
});

describe('normalizeFilter (filter read from a save)', () => {
  it('missing or not an object → defaults', () => {
    for (const raw of [undefined, null, 'x', 5, [], true]) {
      expect(normalizeFilter(raw)).toEqual(defaultFilter());
    }
  });

  it('keeps valid values', () => {
    const valid: VariableFilter = {
      showUnnamed: true,
      hideFalsy: true,
      types: ['string', 'number'],
      min: -1.5,
      max: 10,
    };
    expect(normalizeFilter(valid)).toEqual({
      ...valid,
      types: ['number', 'string'],
    });
  });

  it('wrong value types → their defaults, the rest is kept', () => {
    expect(
      normalizeFilter({
        showUnnamed: 'yes',
        hideFalsy: true,
        types: 'number',
        min: '3',
        max: NaN,
      }),
    ).toEqual(filter({ hideFalsy: true }));
    expect(normalizeFilter({ min: Infinity, max: 2 })).toEqual(
      filter({ max: 2 }),
    );
  });

  it('drops unknown and duplicate types', () => {
    expect(
      normalizeFilter({ types: ['array', 'boolean', 'array', 7] }).types,
    ).toEqual(['array']);
  });

  it('ignores unknown keys', () => {
    expect(normalizeFilter({ extra: 1 })).toEqual(defaultFilter());
  });
});

describe('parseBound', () => {
  it('empty text clears the bound', () => {
    expect(parseBound('')).toBeNull();
    expect(parseBound('  ')).toBeNull();
  });

  it('reads numbers', () => {
    expect(parseBound('12')).toBe(12);
    expect(parseBound(' -3.5 ')).toBe(-3.5);
  });

  it('rejects anything else', () => {
    for (const text of ['abc', '1a', 'Infinity', 'NaN']) {
      expect(parseBound(text)).toBeUndefined();
    }
  });
});
