import { beforeEach, describe, expect, it, vi } from 'vitest';
import CheatMenu from './CheatMenu.ts';
import { legacyFeature } from './legacyFeature.ts';

const render = vi.fn();
const restored = vi.fn();

const feature = legacyFeature({
  id: 'items',
  menus: [['items', { name: 'Items', render }]],
  fields: {
    selection: ['itemSelection', 1],
    positions: ['savedPositions', [{ m: -1, x: -1, y: -1 }]],
  },
  onStateRestored: restored,
});

describe('legacyFeature', () => {
  beforeEach(() => {
    render.mockClear();
    restored.mockClear();
  });

  it('builds defaults from the field map', () => {
    expect(feature.state).toEqual({
      selection: 1,
      positions: [{ m: -1, x: -1, y: -1 }],
    });
  });

  it('wraps legacy menus with stable ids', () => {
    const [menu] = feature.menus;
    expect(menu).toMatchObject({ id: 'items', name: 'Items' });
    menu.render({} as never, {});
    expect(render).toHaveBeenCalledOnce();
  });

  it('onStateRestored copies the slice onto CheatMenu, then runs the hook', () => {
    const state = { selection: 7, positions: [{ m: 2, x: 3, y: 4 }] };
    restored.mockImplementation(() => {
      expect(CheatMenu.itemSelection).toBe(7);
    });
    feature.onStateRestored?.(state);
    expect(restored).toHaveBeenCalledOnce();
    expect(CheatMenu.savedPositions).toEqual([{ m: 2, x: 3, y: 4 }]);
    // a copy: legacy code mutating CheatMenu must not change the slice
    expect(CheatMenu.savedPositions).not.toBe(state.positions);
  });

  it('onSave copies CheatMenu back into the slice', () => {
    const state: Record<string, unknown> = { selection: 1, positions: [] };
    CheatMenu.itemSelection = 42;
    feature.onSave?.(state);
    expect(state.selection).toBe(42);
  });

  it('migrateV1 renames known v1 keys and ignores the rest', () => {
    expect(
      feature.migrateV1?.({ itemSelection: 9, weaponSelection: 3 }),
    ).toEqual({ selection: 9 });
  });

  it('features without fields have no persisted state', () => {
    const plain = legacyFeature({
      id: 'noClip',
      menus: [['noClip', { name: 'No Clip', render }]],
    });
    expect(plain.state).toBeUndefined();
    expect(plain.migrateV1?.({ itemSelection: 1 })).toEqual({});
  });
});
