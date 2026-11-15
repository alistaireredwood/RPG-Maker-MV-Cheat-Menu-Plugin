import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PREFS_VERSION, prefsStorageKey } from './preferencesFormat.ts';

class FakeStorage {
  items = new Map<string, string>();
  getItem = vi.fn((key: string) => this.items.get(key) ?? null);
  setItem = vi.fn((key: string, value: string) => {
    this.items.set(key, value);
  });
}

let storage: FakeStorage;

const setGameTitle = (gameTitle: string) =>
  vi.stubGlobal('$dataSystem', { gameTitle });

// fresh module per test: the module caches what it read
const importPreferences = async () => {
  vi.resetModules();
  return import('./preferences.ts');
};

const stored = (title: string) => {
  const raw = storage.items.get(prefsStorageKey(title));
  return raw === undefined ? undefined : JSON.parse(raw);
};

beforeEach(() => {
  storage = new FakeStorage();
  vi.stubGlobal('localStorage', storage);
  setGameTitle('Game A');
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('definePreference', () => {
  it('reads nothing at import time or on define, only on first use', async () => {
    const { definePreference } = await importPreferences();
    const pref = definePreference('layout', { order: [] as string[] });
    expect(storage.getItem).not.toHaveBeenCalled();

    pref.get();
    expect(storage.getItem).toHaveBeenCalledTimes(1);
    pref.get();
    expect(storage.getItem).toHaveBeenCalledTimes(1);
  });

  it('nothing stored → defaults', async () => {
    const { definePreference } = await importPreferences();
    const pref = definePreference('layout', { order: ['a'] });
    expect(pref.get()).toEqual({ order: ['a'] });
  });

  it('reads stored known keys and ignores unknown ones', async () => {
    storage.items.set(
      prefsStorageKey('Game A'),
      JSON.stringify({
        version: PREFS_VERSION,
        layout: { order: ['b'], unknown: 1 },
      }),
    );
    const { definePreference } = await importPreferences();
    const pref = definePreference('layout', { order: [] as string[] });
    expect(pref.get()).toEqual({ order: ['b'] });
  });

  it.each([
    ['broken JSON', '{oops'],
    ['wrong version', JSON.stringify({ version: 999, layout: { n: 5 } })],
    [
      'wrong value type',
      JSON.stringify({ version: PREFS_VERSION, layout: { n: 'five' } }),
    ],
  ])('%s → defaults, no exception', async (_, raw) => {
    storage.items.set(prefsStorageKey('Game A'), raw);
    const { definePreference } = await importPreferences();
    const pref = definePreference('layout', { n: 1 });
    expect(pref.get()).toEqual({ n: 1 });
  });

  it('update mutates the live value and writes right away', async () => {
    const { definePreference } = await importPreferences();
    const pref = definePreference('layout', { order: [] as string[] });
    const live = pref.get();

    pref.update((value) => {
      value.order.push('a');
    });

    expect(pref.get()).toBe(live);
    expect(live.order).toEqual(['a']);
    expect(stored('Game A')).toEqual({
      version: PREFS_VERSION,
      layout: { order: ['a'] },
    });
  });

  it('values survive a restart (a fresh module reads what was written)', async () => {
    const first = await importPreferences();
    first
      .definePreference('names', { map: {} as Record<string, string> })
      .update((value) => {
        value.map['3'] = 'Gold';
      });

    const second = await importPreferences();
    const pref = second.definePreference('names', {
      map: {} as Record<string, string>,
    });
    expect(pref.get()).toEqual({ map: { 3: 'Gold' } });
  });

  it('several preferences share one storage entry without clobbering each other', async () => {
    const { definePreference } = await importPreferences();
    const layout = definePreference('layout', { n: 0 });
    const names = definePreference('names', { s: '' });

    layout.update((v) => {
      v.n = 1;
    });
    names.update((v) => {
      v.s = 'x';
    });

    expect(stored('Game A')).toEqual({
      version: PREFS_VERSION,
      layout: { n: 1 },
      names: { s: 'x' },
    });
  });

  it('keeps slices of preferences that are not defined right now', async () => {
    storage.items.set(
      prefsStorageKey('Game A'),
      JSON.stringify({ version: PREFS_VERSION, removed: { x: 1 } }),
    );
    const { definePreference } = await importPreferences();
    definePreference('layout', { n: 0 }).update((v) => {
      v.n = 2;
    });
    expect(stored('Game A')).toEqual({
      version: PREFS_VERSION,
      removed: { x: 1 },
      layout: { n: 2 },
    });
  });

  it('reset restores the defaults in place and writes them', async () => {
    const { definePreference } = await importPreferences();
    const defaults = { order: ['a'] };
    const pref = definePreference('layout', defaults);
    const live = pref.get();
    pref.update((v) => {
      v.order.push('b');
    });

    pref.reset();

    expect(pref.get()).toBe(live);
    expect(live).toEqual({ order: ['a'] });
    expect(defaults).toEqual({ order: ['a'] });
    expect(stored('Game A').layout).toEqual({ order: ['a'] });
  });

  it('different game titles use separate storage keys', async () => {
    const { definePreference } = await importPreferences();
    const pref = definePreference('layout', { n: 0 });
    pref.update((v) => {
      v.n = 1;
    });

    setGameTitle('Game B');
    expect(pref.get()).toEqual({ n: 0 });
    pref.update((v) => {
      v.n = 2;
    });

    expect(stored('Game A').layout).toEqual({ n: 1 });
    expect(stored('Game B').layout).toEqual({ n: 2 });
  });

  it('a newer stored version is never overwritten', async () => {
    const newer = JSON.stringify({ version: PREFS_VERSION + 1, layout: {} });
    storage.items.set(prefsStorageKey('Game A'), newer);
    const { definePreference } = await importPreferences();
    const pref = definePreference('layout', { n: 0 });

    pref.update((v) => {
      v.n = 1;
    });

    expect(pref.get()).toEqual({ n: 1 });
    expect(storage.items.get(prefsStorageKey('Game A'))).toBe(newer);
  });

  it('localStorage throwing → defaults, changes kept in memory only', async () => {
    storage.getItem.mockImplementation(() => {
      throw new Error('denied');
    });
    storage.setItem.mockImplementation(() => {
      throw new Error('denied');
    });
    const { definePreference } = await importPreferences();
    const pref = definePreference('layout', { n: 0 });

    expect(pref.get()).toEqual({ n: 0 });
    expect(() =>
      pref.update((v) => {
        v.n = 1;
      }),
    ).not.toThrow();
    expect(pref.get()).toEqual({ n: 1 });
  });

  it('no game data yet → defaults in memory, nothing read or written', async () => {
    vi.stubGlobal('$dataSystem', undefined);
    const { definePreference } = await importPreferences();
    const pref = definePreference('layout', { n: 0 });

    expect(pref.get()).toEqual({ n: 0 });
    pref.update((v) => {
      v.n = 1;
    });

    expect(storage.getItem).not.toHaveBeenCalled();
    expect(storage.setItem).not.toHaveBeenCalled();
  });
});
