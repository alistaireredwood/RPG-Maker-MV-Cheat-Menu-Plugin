import { describe, expect, it } from 'vitest';
import { patchMethod } from './patch.ts';

const makeTarget = () => ({
  base: 10,
  add(this: { base: number }, n: number) {
    return this.base + n;
  },
});

describe('patchMethod', () => {
  it('wraps the method and keeps `this`', () => {
    const target = makeTarget();
    patchMethod(
      target,
      'add',
      (original) =>
        function (this: { base: number }, n: number) {
          return original.call(this, n) * 2;
        },
    );
    expect(target.add(1)).toBe(22);
  });

  it('restore() puts the original back', () => {
    const target = makeTarget();
    const original = target.add;
    const restore = patchMethod(target, 'add', () => () => 0);
    restore();
    expect(target.add).toBe(original);
  });

  it('restore() keeps a patch applied on top of ours', () => {
    const target = makeTarget();
    const restore = patchMethod(target, 'add', () => () => 1);
    const later = () => 2;
    target.add = later;
    restore();
    expect(target.add).toBe(later);
  });

  it('throws for non-methods', () => {
    const target = { notAMethod: 1 } as unknown as { notAMethod: () => void };
    expect(() => patchMethod(target, 'notAMethod', (o) => o)).toThrow(
      TypeError,
    );
  });
});
