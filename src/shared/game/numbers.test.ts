import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeSetExact, parseIntegerInput } from './numbers.ts';

describe('parseIntegerInput', () => {
  it.each([
    ['42', 42],
    [' 7 ', 7],
    ['-3', -3],
    ['+5', 5],
    ['007', 7],
  ])('%j → %j', (text, value) => {
    expect(parseIntegerInput(text)).toBe(value);
  });

  it.each(['', '  ', 'abc', '1.5', '1e3', '1,000', '--1', '5-'])(
    'rejects %j',
    (text) => {
      expect(parseIntegerInput(text)).toBeNull();
    },
  );
});

describe('makeSetExact', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('applies the difference to reach the typed value', () => {
    vi.stubGlobal('SoundManager', { playSystemSound: vi.fn() });
    const applyDelta = vi.fn();
    const commit = makeSetExact(() => 10, applyDelta);

    expect(commit('25')).toBe(true);
    expect(applyDelta).toHaveBeenCalledWith(15);
    expect(commit('3')).toBe(true);
    expect(applyDelta).toHaveBeenLastCalledWith(-7);
  });

  it('rejects non-integer input without applying anything', () => {
    const applyDelta = vi.fn();
    expect(makeSetExact(() => 0, applyDelta)('abc')).toBe(false);
    expect(applyDelta).not.toHaveBeenCalled();
  });
});
