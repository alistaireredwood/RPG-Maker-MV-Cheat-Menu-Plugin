// Names the user gives variables. Per game, not per save: a name describes
// what the game uses a variable for, which a new game doesn't change.

import { definePreference } from '@src/core/preferences.ts';
import type { Matcher } from '@src/shared/controls/listSelector.ts';
import { idLabel } from '@src/shared/game/systemNames.ts';

export type NameOverrides = Readonly<Record<string, string>>;

export type VariableEntry = {
  label: string;
  /** name from the dictionary or System.json, or `#0042` when it has none */
  original: string;
  /** the System.json name a dictionary replaced, still found by the search */
  systemName?: string;
  custom: boolean;
  /** has a custom name or an original one; the filters hide the rest */
  named: boolean;
};

// localStorage is easy to edit by hand — only a non-blank string is a name
function customName(overrides: NameOverrides, id: number): string | null {
  const name: unknown = overrides[id];
  return typeof name === 'string' && name.trim() ? name : null;
}

function originalEntry(
  baseLabel: string | null,
  id: number,
  base: readonly (string | null)[],
  systemNames: readonly string[],
): Omit<VariableEntry, 'label' | 'custom'> {
  const original = baseLabel ?? idLabel(id, base.length);
  const systemName = (systemNames[id] || '').trim();
  return systemName && systemName !== original
    ? { original, systemName, named: !!baseLabel }
    : { original, named: !!baseLabel };
}

/**
 * Overrides layered on top of the base labels (`systemNameLabels` without
 * `autoIdLabels`, then the dictionary), which stay untouched because they
 * are cached. Every id gets an entry, so the filters can show the unnamed
 * ones as `#0042`.
 */
export function displayEntries(
  base: readonly (string | null)[],
  overrides: NameOverrides,
  systemNames: readonly string[] = [],
): (VariableEntry | null)[] {
  return base.map((baseLabel, id) => {
    if (id === 0) return null;
    const entry = originalEntry(baseLabel, id, base, systemNames);
    const custom = customName(overrides, id);
    return custom === null
      ? { ...entry, label: entry.original, custom: false }
      : { ...entry, label: custom, custom: true, named: true };
  });
}

export const countNames = (overrides: NameOverrides): number =>
  Object.keys(overrides).filter((id) => customName(overrides, Number(id)))
    .length;

export function withoutName(
  overrides: NameOverrides,
  id: number,
): Record<string, string> {
  const next = { ...overrides };
  delete next[id];
  return next;
}

/** A blank name, or one equal to `original`, resets instead of storing a copy. */
export function withName(
  overrides: NameOverrides,
  id: number,
  text: string,
  original?: string,
): Record<string, string> {
  const name = text.trim();
  if (!name || name === original) return withoutName(overrides, id);
  return { ...overrides, [id]: name };
}

export const entryMatches: Matcher<VariableEntry> = (entry, keyword) =>
  entry.label.toLowerCase().includes(keyword) ||
  entry.original.toLowerCase().includes(keyword) ||
  !!entry.systemName?.toLowerCase().includes(keyword);

const namesPref = definePreference('variableNames', {
  names: {} as Record<string, string>,
});

export const nameOverrides = (): NameOverrides => namesPref.get().names;

export function renameVariable(
  id: number,
  text: string,
  original?: string,
): void {
  namesPref.update((value) => {
    value.names = withName(value.names, id, text, original);
  });
}

export function resetVariableName(id: number): void {
  namesPref.update((value) => {
    value.names = withoutName(value.names, id);
  });
}

export const resetAllVariableNames = (): void => namesPref.reset();

// Every change replaces the `names` object, so its identity is the cache key.
let cached: {
  base: readonly (string | null)[];
  systemNames: readonly string[];
  names: NameOverrides;
  entries: readonly (VariableEntry | null)[];
} | null = null;

export function variableEntries(
  base: readonly (string | null)[],
  systemNames: readonly string[] = [],
): readonly (VariableEntry | null)[] {
  const names = nameOverrides();
  if (
    cached?.base !== base ||
    cached.systemNames !== systemNames ||
    cached.names !== names
  ) {
    cached = {
      base,
      systemNames,
      names,
      entries: displayEntries(base, names, systemNames),
    };
  }
  return cached.entries;
}
