import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { prefsStorageKey } from '@src/core/preferencesFormat.ts';
import {
  countNames,
  withCustomNames,
  withName,
  withoutName,
} from './variableNames.ts';

describe('countNames', () => {
  it('counts only names that are applied', () => {
    expect(countNames({})).toBe(0);
    expect(countNames({ 1: 'Money', 2: 'Today' })).toBe(2);
  });

  it('skips blank and non-string entries edited into localStorage', () => {
    const overrides = { 1: 'Money', 2: '', 3: '  ', 4: 7, 5: null } as never;
    expect(countNames(overrides)).toBe(1);
  });
});

describe('withName / withoutName', () => {
  it('sets a trimmed name without mutating the input', () => {
    const overrides = { 1: 'Money' };
    expect(withName(overrides, 2, '  Today ')).toEqual({
      1: 'Money',
      2: 'Today',
    });
    expect(overrides).toEqual({ 1: 'Money' });
  });

  it('replaces an existing name', () => {
    expect(withName({ 2: 'Old' }, 2, 'New')).toEqual({ 2: 'New' });
  });

  it('an empty or whitespace-only name is a reset', () => {
    expect(withName({ 1: 'Money', 2: 'Today' }, 2, '')).toEqual({
      1: 'Money',
    });
    expect(withName({ 2: 'Today' }, 2, ' \t ')).toEqual({});
  });

  it('a name equal to the original is a reset, not a copy', () => {
    expect(withName({ 2: 'Today' }, 2, 'Day', 'Day')).toEqual({});
  });

  it('resets a single name', () => {
    const overrides = { 1: 'Money', 2: 'Today' };
    expect(withoutName(overrides, 1)).toEqual({ 2: 'Today' });
    expect(overrides).toEqual({ 1: 'Money', 2: 'Today' });
  });
});

describe('withCustomNames', () => {
  it('puts the user names over the labels, leaving id 0 and the input alone', () => {
    const labels = [null, 'Gold', null, 'Day'];
    const overrides = { 0: 'Zero', 2: 'Quest', 3: '  ' } as never;
    expect(withCustomNames(labels, overrides)).toEqual([
      null,
      'Gold',
      'Quest',
      'Day',
    ]);
    expect(labels).toEqual([null, 'Gold', null, 'Day']);
  });
});

describe('name store (per-game preference)', () => {
  class FakeStorage {
    items = new Map<string, string>();
    getItem = (key: string) => this.items.get(key) ?? null;
    setItem = (key: string, value: string) => {
      this.items.set(key, value);
    };
  }

  let storage: FakeStorage;

  const importStore = async () => {
    vi.resetModules();
    return import('./variableNames.ts');
  };

  const storedNames = (title: string) =>
    JSON.parse(storage.items.get(prefsStorageKey(title)) ?? '{}').variableNames
      ?.names;

  beforeEach(() => {
    storage = new FakeStorage();
    vi.stubGlobal('localStorage', storage);
    vi.stubGlobal('$dataSystem', { gameTitle: 'Game A' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sets, resets one and resets all names, writing each change', async () => {
    const store = await importStore();
    store.renameVariable(1, 'Money');
    store.renameVariable(2, 'Today');
    expect(store.nameOverrides()).toEqual({ 1: 'Money', 2: 'Today' });
    expect(storedNames('Game A')).toEqual({ 1: 'Money', 2: 'Today' });

    store.resetVariableName(1);
    expect(store.nameOverrides()).toEqual({ 2: 'Today' });
    expect(storedNames('Game A')).toEqual({ 2: 'Today' });

    store.resetAllVariableNames();
    expect(store.nameOverrides()).toEqual({});
    expect(storedNames('Game A')).toEqual({});
  });

  it('survives a restart (a fresh module reads the stored names)', async () => {
    (await importStore()).renameVariable(3, 'Quest');
    expect((await importStore()).nameOverrides()).toEqual({ 3: 'Quest' });
  });

  it('keeps the names of different games apart', async () => {
    const store = await importStore();
    store.renameVariable(1, 'Money');
    vi.stubGlobal('$dataSystem', { gameTitle: 'Game B' });
    expect(store.nameOverrides()).toEqual({});
  });
});
