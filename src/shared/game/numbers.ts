export function parseIntegerInput(text: string): number | null {
  const trimmed = text.trim();
  return /^[+-]?\d+$/.test(trimmed) ? Number(trimmed) : null;
}

/**
 * Applies the difference instead of setting the value, so the engine's own
 * gain* methods keep their clamping (max items, max gold, …).
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
