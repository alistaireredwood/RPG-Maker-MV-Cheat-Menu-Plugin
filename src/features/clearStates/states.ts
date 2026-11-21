/**
 * A long list of active states would push the rest of the menu off screen,
 * so only the first few are named; browsing all of them is what the
 * Active filter of the state list is for.
 */
export function summarizeNames(names: readonly string[], max = 4): string {
  if (names.length <= max) return names.join(', ');
  return `${names.slice(0, max).join(', ')} +${names.length - max} more`;
}
