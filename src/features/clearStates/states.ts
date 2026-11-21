// a long list would push the menu off screen; the Active filter browses all
export function summarizeNames(names: readonly string[], max = 4): string {
  if (names.length <= max) return names.join(', ');
  return `${names.slice(0, max).join(', ')} +${names.length - max} more`;
}
