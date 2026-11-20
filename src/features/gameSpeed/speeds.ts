export const GAME_SPEEDS: readonly number[] = [
  0.25, 0.5, 1, 1.5, 2, 3, 4, 5, 8, 10,
];

export const NORMAL_SPEED = 1;

export function stepSpeed(speed: number, direction: 'left' | 'right'): number {
  const idx = GAME_SPEEDS.indexOf(speed);
  const at = idx === -1 ? GAME_SPEEDS.indexOf(NORMAL_SPEED) : idx;
  const next = direction === 'left' ? at - 1 : at + 1;
  return GAME_SPEEDS[Math.max(0, Math.min(GAME_SPEEDS.length - 1, next))];
}

export const formatSpeed = (speed: number): string => `x${speed}`;

/**
 * Logic updates to run this frame. The fraction carries over, so x1.5 runs
 * 1, 2, 1, 2, … updates and x0.25 one update every 4th frame.
 */
export function planFrame(
  pending: number,
  speed: number,
): { updates: number; pending: number } {
  const total = pending + speed;
  const updates = Math.floor(total);
  return { updates, pending: total - updates };
}
