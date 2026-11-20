// Names the user gives variables. Per game, not per save: a name describes
// what the game uses a variable for, which a new game doesn't change.

import { definePreference } from '@src/core/preferences.ts';

export type NameOverrides = Readonly<Record<string, string>>;

// localStorage is easy to edit by hand — only a non-blank string is a name
export function customName(
  overrides: NameOverrides,
  id: number,
): string | null {
  const name: unknown = overrides[id];
  return typeof name === 'string' && name.trim() ? name : null;
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

/** `labels` with the user's names on top, e.g. for an export. */
export function withCustomNames(
  labels: readonly (string | null)[],
  overrides: NameOverrides,
): (string | null)[] {
  return labels.map((label, id) =>
    id === 0 ? label : (customName(overrides, id) ?? label),
  );
}

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
