import { describe, expect, it } from 'vitest';
import {
  PREFS_VERSION,
  parsePrefs,
  prefsStorageKey,
  readPrefSlice,
  serializePrefs,
} from './preferencesFormat.ts';

describe('prefsStorageKey', () => {
  it('is namespaced by the game title', () => {
    expect(prefsStorageKey('Game A')).toBe('Cheat_Menu.prefs.Game A');
    expect(prefsStorageKey('Game A')).not.toBe(prefsStorageKey('Game B'));
  });
});

describe('parsePrefs', () => {
  it('nothing stored → empty, writable', () => {
    expect(parsePrefs(null)).toEqual({ data: {}, writable: true });
  });

  it('reads the slices of the current version', () => {
    const raw = JSON.stringify({ version: PREFS_VERSION, layout: { a: 1 } });
    expect(parsePrefs(raw)).toEqual({
      data: { layout: { a: 1 } },
      writable: true,
    });
  });

  it.each(['{not json', '"a string"', '[1,2]', 'null', '42'])(
    'broken data %s → empty, writable (replaced on the next write)',
    (raw) => {
      expect(parsePrefs(raw)).toEqual({ data: {}, writable: true });
    },
  );

  it('missing / older version → empty, writable', () => {
    expect(parsePrefs(JSON.stringify({ layout: {} }))).toEqual({
      data: {},
      writable: true,
    });
    expect(parsePrefs(JSON.stringify({ version: 0, layout: {} }))).toEqual({
      data: {},
      writable: true,
    });
  });

  it('newer version → empty and read-only, so a downgrade keeps the newer data', () => {
    const raw = JSON.stringify({ version: PREFS_VERSION + 1, layout: {} });
    expect(parsePrefs(raw)).toEqual({ data: {}, writable: false });
  });
});

describe('serializePrefs', () => {
  it('round-trips through parsePrefs', () => {
    const data = { layout: { order: ['a', 'b'] }, names: { 3: 'x' } };
    expect(parsePrefs(serializePrefs(data))).toEqual({ data, writable: true });
  });
});

describe('readPrefSlice', () => {
  const defaults = {
    flag: false,
    count: 1,
    label: 'x',
    list: [] as string[],
    map: {} as Record<string, string>,
    anything: null as unknown,
  };

  it('nothing stored → copy of the defaults', () => {
    const result = readPrefSlice(defaults, undefined);
    expect(result).toEqual(defaults);
    expect(result).not.toBe(defaults);
    expect(result.list).not.toBe(defaults.list);
  });

  it('takes stored values of known keys', () => {
    const stored = {
      flag: true,
      count: 5,
      label: 'y',
      list: ['a'],
      map: { 1: 'one' },
      anything: [1],
    };
    expect(readPrefSlice(defaults, stored)).toEqual(stored);
  });

  it('ignores unknown keys', () => {
    expect(readPrefSlice(defaults, { extra: 1, flag: true })).toEqual({
      ...defaults,
      flag: true,
    });
  });

  it('a value of the wrong type falls back to the default', () => {
    const result = readPrefSlice(defaults, {
      flag: 'yes',
      count: '5',
      label: 3,
      list: { 0: 'a' },
      map: ['a'],
    });
    expect(result).toEqual(defaults);
  });

  it('a stored slice that is not an object → defaults', () => {
    expect(readPrefSlice(defaults, 'x')).toEqual(defaults);
    expect(readPrefSlice(defaults, [1])).toEqual(defaults);
    expect(readPrefSlice(defaults, null)).toEqual(defaults);
  });

  it('never aliases the stored data', () => {
    const stored = { list: ['a'] };
    const result = readPrefSlice(defaults, stored);
    result.list.push('b');
    expect(stored.list).toEqual(['a']);
  });
});
