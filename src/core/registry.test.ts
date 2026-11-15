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
    // the feature's own `state` object is the live one
    expect(after).toBe(alpha.state);
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

// registers more features, so it runs after the tests that pin the list above
describe('registry validation', () => {
  it('reserves the save-format keys as feature ids', () => {
    expect(() => registerFeatures([{ id: 'version', menus: [] }])).toThrow(
      /reserved/,
    );
  });

  it('registers nothing from a batch that fails validation', () => {
    const before = getMenus().map((m) => m.id);
    const featuresBefore = Object.keys(snapshotStates());
    expect(() =>
      registerFeatures([
        {
          id: 'ok1',
          state: { a: 1 },
          menus: [{ id: 'ok1', name: '', render: () => {} }],
        },
        {
          id: 'bad',
          state: { b: 1 },
          menus: [
            { id: 'bad-1', name: '', render: () => {} },
            { id: 'alpha-1', name: '', render: () => {} },
          ],
        },
      ]),
    ).toThrow(/duplicate menu id "alpha-1"/);
    expect(getMenus().map((m) => m.id)).toEqual(before);
    expect(Object.keys(snapshotStates())).toEqual(featuresBefore);
    // the rejected ids stay free
    expect(() => registerFeatures([{ id: 'ok1', menus: [] }])).not.toThrow();
  });

  it('rejects duplicates inside one batch', () => {
    expect(() =>
      registerFeatures([
        { id: 'twin', menus: [] },
        { id: 'twin', menus: [] },
      ]),
    ).toThrow(/duplicate feature id "twin"/);
    expect(() =>
      registerFeatures([
        {
          id: 'twinMenus',
          menus: [
            { id: 'tm', name: '', render: () => {} },
            { id: 'tm', name: '', render: () => {} },
          ],
        },
      ]),
    ).toThrow(/duplicate menu id "tm"/);
    expect(findMenu('tm')).toBeUndefined();
  });

  it('emits a hook only to the given features', () => {
    const initA = vi.fn();
    const initB = vi.fn();
    const a = defineFeature({
      id: 'emitA',
      state: { x: 1 },
      menus: [],
      onInit: initA,
    });
    const b = defineFeature({ id: 'emitB', menus: [], onInit: initB });
    registerFeatures([a, b]);
    emit('onInit', [a]);
    expect(initA).toHaveBeenCalledWith(a.state);
    expect(initB).not.toHaveBeenCalled();
  });
});

describe('menu placement (after)', () => {
  const menu = (id: string) => ({ id, name: id, render: () => {} });
  const ids = () => getMenus().map((m) => m.id);

  it("places a feature's menus right after the given menu", () => {
    registerFeatures([
      { id: 'placedA', after: 'alpha-1', menus: [menu('pa-1'), menu('pa-2')] },
    ]);
    const list = ids();
    const at = list.indexOf('alpha-1');
    expect(list.slice(at, at + 4)).toEqual([
      'alpha-1',
      'pa-1',
      'pa-2',
      'alpha-2',
    ]);
  });

  it('keeps registration order for features placed after the same menu', () => {
    registerFeatures([
      { id: 'placedB', after: 'alpha-1', menus: [menu('pb')] },
    ]);
    const list = ids();
    const at = list.indexOf('alpha-1');
    expect(list.slice(at, at + 5)).toEqual([
      'alpha-1',
      'pa-1',
      'pa-2',
      'pb',
      'alpha-2',
    ]);
  });

  it('can anchor to a menu registered in the same batch', () => {
    registerFeatures([
      { id: 'anchor', menus: [menu('anchor')] },
      { id: 'follower', after: 'anchor', menus: [menu('follower')] },
      { id: 'tail', menus: [menu('tail')] },
    ]);
    expect(ids().slice(-3)).toEqual(['anchor', 'follower', 'tail']);
  });

  it('falls back to the end for an unknown menu id', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerFeatures([{ id: 'lost', after: 'nope', menus: [menu('lost')] }]);
    expect(ids().slice(-1)).toEqual(['lost']);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"nope"'));
    warn.mockRestore();
  });
});
