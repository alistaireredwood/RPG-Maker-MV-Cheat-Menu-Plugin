import { describe, expect, it, vi } from 'vitest';
import { defineFeature } from './feature.ts';
import {
  emit,
  findMenu,
  getMenus,
  registerFeatures,
  restoreStates,
  snapshotStates,
} from './registry.ts';

// the registry is a module singleton — register once for the whole file
const restored = vi.fn();
const alpha = defineFeature({
  id: 'alpha',
  state: { count: 1, list: [] as number[] },
  menus: [
    { id: 'alpha-1', name: 'Alpha 1', render: () => {} },
    { id: 'alpha-2', name: 'Alpha 2', render: () => {} },
  ],
  onStateRestored: restored,
});
const broken = defineFeature({
  id: 'broken',
  menus: [],
  onStateRestored: () => {
    throw new Error('boom');
  },
});
const beta = defineFeature({
  id: 'beta',
  menus: [{ id: 'beta', name: 'Beta', render: () => {} }],
});

registerFeatures([alpha, broken, beta]);

describe('registry', () => {
  it('lists menus in feature order', () => {
    expect(getMenus().map((m) => m.id)).toEqual(['alpha-1', 'alpha-2', 'beta']);
    expect(findMenu('beta')?.entry.name).toBe('Beta');
    expect(findMenu(null)).toBeUndefined();
  });

  it('rejects duplicate feature and menu ids', () => {
    expect(() => registerFeatures([{ id: 'alpha', menus: [] }])).toThrow(
      /duplicate feature id/,
    );
    expect(() =>
      registerFeatures([
        { id: 'gamma', menus: [{ id: 'beta', name: '', render: () => {} }] },
      ]),
    ).toThrow(/duplicate menu id/);
    expect(() => registerFeatures([{ id: 'core', menus: [] }])).toThrow();
  });

  it('restores state in place, so references held by features stay valid', () => {
    const before = snapshotStates().alpha as { count: number };
    restoreStates({ alpha: { count: 5, unknown: 1 } });
    const after = snapshotStates().alpha;
    expect(after).toBe(before);
    expect(after).toEqual({ count: 5, list: [] });
  });

  it('resets to defaults when nothing is saved', () => {
    restoreStates(null);
    expect(snapshotStates().alpha).toEqual({ count: 1, list: [] });
  });

  it('snapshots only features that have state', () => {
    expect(Object.keys(snapshotStates())).toEqual(['alpha']);
  });

  it('a failing hook does not stop the others', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    restored.mockClear();
    emit('onStateRestored');
    expect(restored).toHaveBeenCalledWith(snapshotStates().alpha);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('broken.onStateRestored'),
      expect.any(Error),
    );
    error.mockRestore();
  });
});
