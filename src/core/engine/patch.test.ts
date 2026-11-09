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

  it('patching an inherited method adds an own property, restore removes it', () => {
    class Base {
      greet() {
        return 'base';
      }
    }
    const obj = new Base();
    const restore = patchMethod(obj, 'greet', () => () => 'patched');
    expect(Object.prototype.hasOwnProperty.call(obj, 'greet')).toBe(true);
    expect(obj.greet()).toBe('patched');
    restore();
    expect(Object.prototype.hasOwnProperty.call(obj, 'greet')).toBe(false);
    expect(obj.greet()).toBe('base');
  });

  it('throws for non-methods', () => {
    const target = { notAMethod: 1 } as unknown as { notAMethod: () => void };
    expect(() => patchMethod(target, 'notAMethod', (o) => o)).toThrow(
      TypeError,
    );
  });
});
