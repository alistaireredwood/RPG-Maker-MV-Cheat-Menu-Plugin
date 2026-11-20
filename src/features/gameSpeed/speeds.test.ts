import { describe, expect, it } from 'vitest';
import { formatSpeed, GAME_SPEEDS, planFrame, stepSpeed } from './speeds.ts';

const updatesOver = (speed: number, frames: number) => {
  let pending = 0;
  const updates: number[] = [];
  for (let i = 0; i < frames; i++) {
    const plan = planFrame(pending, speed);
    pending = plan.pending;
    updates.push(plan.updates);
  }
  return updates;
};

describe('planFrame', () => {
  it('runs one update per frame at x1', () => {
    expect(updatesOver(1, 4)).toEqual([1, 1, 1, 1]);
  });

  it('slows down by skipping frames', () => {
    expect(updatesOver(0.5, 4)).toEqual([0, 1, 0, 1]);
    expect(updatesOver(0.25, 8)).toEqual([0, 0, 0, 1, 0, 0, 0, 1]);
  });

  it('speeds up with extra updates, fractions carried over', () => {
    expect(updatesOver(3, 2)).toEqual([3, 3]);
    expect(updatesOver(1.5, 4)).toEqual([1, 2, 1, 2]);
  });

  it('every listed speed keeps its average over many frames', () => {
    for (const speed of GAME_SPEEDS) {
      const total = updatesOver(speed, 400).reduce((a, b) => a + b, 0);
      expect(total).toBe(speed * 400);
    }
  });
});

describe('stepSpeed', () => {
  it('steps through the list and stops at both ends', () => {
    expect(stepSpeed(1, 'left')).toBe(0.5);
    expect(stepSpeed(1, 'right')).toBe(1.5);
    expect(stepSpeed(0.25, 'left')).toBe(0.25);
    expect(stepSpeed(10, 'right')).toBe(10);
  });

  it('an unknown speed steps from x1', () => {
    expect(stepSpeed(7, 'right')).toBe(1.5);
  });
});

it('formatSpeed', () => {
  expect(formatSpeed(0.25)).toBe('x0.25');
});
