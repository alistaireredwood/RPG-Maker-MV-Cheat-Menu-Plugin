const cache = new WeakMap<readonly string[], readonly (string | null)[]>();

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
): readonly (string | null)[] {
  let labels = cache.get(names);
  if (!labels) {
    labels = buildLabels(names);
    cache.set(names, labels);
  }
  return labels;
}

function buildLabels(names: readonly string[]): (string | null)[] {
  const anyNamed = names.some((name, i) => i > 0 && !!name);
  const width = String(names.length - 1).length;
  return names.map((name, i) => {
    if (i === 0) return null;
    if (anyNamed) return name || null;
    return `#${String(i).padStart(width, '0')}`;
  });
}
