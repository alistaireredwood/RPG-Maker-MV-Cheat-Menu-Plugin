type Labels = readonly (string | null)[];

const caches = {
  auto: new WeakMap<readonly string[], Labels>(),
  plain: new WeakMap<readonly string[], Labels>(),
};

export type SystemNameOptions = {
  /**
   * Label every id `#0042` when the game names nothing (default `true`).
   * Off for lists that let the user show unnamed ids on demand (Variables'
   * filters), where unnamed ids are always `null`.
   */
  autoIdLabels?: boolean;
};

/**
 * Some games ship `System.json` with every variable / switch name blanked
 * out. Events address them by id only, so they still work — hiding every
 * unnamed id would leave the menu with nothing to select. When no name is
 * left at all, ids are labelled `#0042` instead.
 *
 * A game that names at least one entry keeps hiding the unnamed ones: there
 * they are almost always unused slots that would only clutter the list.
 */
export function systemNameLabels(
  names: readonly string[],
  { autoIdLabels = true }: SystemNameOptions = {},
): readonly (string | null)[] {
  const cache = autoIdLabels ? caches.auto : caches.plain;
  let labels = cache.get(names);
  if (!labels) {
    labels = buildLabels(names, autoIdLabels);
    cache.set(names, labels);
  }
  return labels;
}

/** `#0042`, zero-padded to the widest id of a list of `count` entries. */
export function idLabel(id: number, count: number): string {
  const width = String(count - 1).length;
  return `#${String(id).padStart(width, '0')}`;
}

function buildLabels(
  names: readonly string[],
  autoIdLabels: boolean,
): (string | null)[] {
  const anyNamed = names.some((name, i) => i > 0 && !!name);
  return names.map((name, i) => {
    if (i === 0) return null;
    if (anyNamed || !autoIdLabels) return name || null;
    return idLabel(i, names.length);
  });
}
