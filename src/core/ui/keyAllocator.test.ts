import { describe, expect, it } from 'vitest';
import { ACTION_KEYS, createKeyAllocator } from './keyAllocator.ts';

describe('createKeyAllocator', () => {
  it('hands out action keys in order, starting at 4', () => {
    const keys = createKeyAllocator();
    expect([keys.next(), keys.next(), keys.next()]).toEqual([4, 5, 6]);
  });

  it('skip() leaves keys unused', () => {
    const keys = createKeyAllocator();
    keys.next();
    keys.skip(2);
    expect(keys.next()).toBe(7);
  });

  it('throws once all keys are used', () => {
    const keys = createKeyAllocator([1, 2]);
    keys.next();
    keys.next();
    expect(() => keys.next()).toThrow(/more than 2 action keys/);
  });

  it('covers the largest legacy menu (party recovery: 8 keys)', () => {
    expect(ACTION_KEYS.slice(0, 8)).toEqual([4, 5, 6, 7, 8, 9, 0, '-']);
  });
});
