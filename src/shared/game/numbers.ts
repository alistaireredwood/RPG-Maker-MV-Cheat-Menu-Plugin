/** Typed text → whole number, or null if it isn't one (e.g. "", "abc", "1.5"). */
export function parseIntegerInput(text: string): number | null {
  const trimmed = text.trim();
  return /^[+-]?\d+$/.test(trimmed) ? Number(trimmed) : null;
}

/**
 * `onCommit` for value inputs: sets a counter to the typed whole number by
 * applying the difference — the engine's own gain* methods keep their
 * clamping (max items, max gold, …). Returns false to reject non-integer input.
 */
export function makeSetExact(
  getCurrent: () => number,
  applyDelta: (delta: number) => void,
): (text: string) => boolean {
  return (text) => {
    const target = parseIntegerInput(text);
    if (target === null) return false;
    applyDelta(target - getCurrent());
    SoundManager.playSystemSound(1);
    return true;
  };
}
