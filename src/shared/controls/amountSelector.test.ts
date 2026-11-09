import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AMOUNTS, amountInput, sharedState } from '@src/shared/state.ts';
import {
  makeApplyAmount,
  scrollAmount,
  snapToPreset,
} from './amountSelector.ts';

describe('snapToPreset', () => {
  const presets = [1, 10, 100, 1000];

  it('right goes to the next higher preset', () => {
    expect(snapToPreset(presets, 50, 'right')).toBe(2);
    expect(snapToPreset(presets, 10, 'right')).toBe(2);
    expect(snapToPreset(presets, 0, 'right')).toBe(0);
  });

  it('left goes to the next lower preset', () => {
    expect(snapToPreset(presets, 50, 'left')).toBe(1);
    expect(snapToPreset(presets, 10, 'left')).toBe(0);
    expect(snapToPreset(presets, 1, 'left')).toBe(0);
  });

  it('clamps beyond the last preset', () => {
    expect(snapToPreset(presets, 5000, 'right')).toBe(3);
    expect(snapToPreset(presets, 5000, 'left')).toBe(3);
  });
});

describe('scrollAmount / makeApplyAmount', () => {
  beforeEach(() => {
    vi.stubGlobal('SoundManager', { playSystemSound: vi.fn() });
    sharedState.amountIndex = 0;
    amountInput.custom = null;
    amountInput.text = null;
  });
  afterEach(() => vi.unstubAllGlobals());

  it('steps through presets and clamps at both ends', () => {
    scrollAmount('left');
    expect(sharedState.amountIndex).toBe(0);
    scrollAmount('right');
    scrollAmount('right');
    expect(sharedState.amountIndex).toBe(2);
    sharedState.amountIndex = AMOUNTS.length - 1;
    scrollAmount('right');
    expect(sharedState.amountIndex).toBe(AMOUNTS.length - 1);
  });

  it('a typed amount snaps to a preset and is cleared on arrow press', () => {
    amountInput.custom = 50;
    amountInput.text = '50';
    scrollAmount('right');
    expect(sharedState.amountIndex).toBe(AMOUNTS.indexOf(100));
    expect(amountInput.custom).toBeNull();
    expect(amountInput.text).toBeNull();
  });

  it('applies the typed amount when set, else the preset; left subtracts', () => {
    const action = vi.fn();
    const apply = makeApplyAmount(action);

    sharedState.amountIndex = AMOUNTS.indexOf(100);
    apply('right');
    expect(action).toHaveBeenLastCalledWith(100);

    amountInput.custom = 7;
    apply('left');
    expect(action).toHaveBeenLastCalledWith(-7);
  });
});
