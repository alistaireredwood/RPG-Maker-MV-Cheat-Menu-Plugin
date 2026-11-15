import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { prefsStorageKey } from '@src/core/preferencesFormat.ts';
import { systemNameLabels } from '@src/shared/game/systemNames.ts';
import {
  countNames,
  displayEntries,
  entryMatches,
  withName,
  withoutName,
  type VariableEntry,
} from './displayNames.ts';

const entry = (label: string, original: string, custom = false) => ({
  label,
  original,
  custom,
});

describe('displayEntries', () => {
  it('custom name → name from System.json → hidden in a game that names some', () => {
    const base = systemNameLabels(['', 'Gold', 'Day', '']);
    expect(displayEntries(base, { 2: 'Today' })).toEqual([
      null,
      entry('Gold', 'Gold'),
      entry('Today', 'Day', true),
      null,
    ]);
  });

  it('custom name → #0042 in a game that names nothing', () => {
    const base = systemNameLabels(Array<string>(12).fill(''));
    const entries = displayEntries(base, { 3: 'Quest' });
    expect(entries[3]).toEqual(entry('Quest', '#03', true));
    expect(entries[4]).toEqual(entry('#04', '#04'));
  });

  it('a custom name makes an unnamed id visible, with its id as the original', () => {
    const base = systemNameLabels(['', 'Gold', '', '']);
    expect(displayEntries(base, { 2: 'Hidden one' })[2]).toEqual(
      entry('Hidden one', '#2', true),
    );
  });

  it('ignores blank, non-string and out-of-range overrides', () => {
    const base = systemNameLabels(['', 'Gold', 'Day']);
    const overrides = { 0: 'Zero', 1: '  ', 2: 7, 9: 'Far' } as never;
    expect(displayEntries(base, overrides)).toEqual([
      null,
      entry('Gold', 'Gold'),
      entry('Day', 'Day'),
    ]);
  });

  it('does not modify the cached base labels', () => {
    const names = ['', 'Gold', 'Day'];
    const base = systemNameLabels(names);
    const before = [...base];
    displayEntries(base, { 1: 'Money', 2: 'Today' });
    expect(base).toEqual(before);
    expect(systemNameLabels(names)).toBe(base);
  });
});

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

describe('entryMatches', () => {
  const renamed: VariableEntry = entry('Today', 'Day counter', true);

  it('matches the custom name and the original one', () => {
    expect(entryMatches(renamed, 'tod')).toBe(true);
    expect(entryMatches(renamed, 'counter')).toBe(true);
    expect(entryMatches(renamed, 'gold')).toBe(false);
  });

  it('expects a lower-cased keyword and matches case-insensitively', () => {
    expect(entryMatches(entry('Gold', 'Gold'), 'gold')).toBe(true);
    expect(entryMatches(entry('Gold', 'Gold'), '')).toBe(true);
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
    return import('./displayNames.ts');
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

  it('variableEntries reflects renames right away', async () => {
    const store = await importStore();
    const base = systemNameLabels(['', 'Gold']);
    expect(store.variableEntries(base)[1]?.label).toBe('Gold');
    store.renameVariable(1, 'Money');
    expect(store.variableEntries(base)[1]?.label).toBe('Money');
    store.resetAllVariableNames();
    expect(store.variableEntries(base)[1]?.label).toBe('Gold');
  });
});
