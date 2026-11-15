import { afterEach, describe, expect, it, vi } from 'vitest';
import { API_VERSION } from '@src/api.ts';
import { createApi } from '@src/createApi.ts';
import { installExtensions } from '@src/core/extensions.ts';
import { getFeatures } from '@src/core/registry.ts';

afterEach(() => vi.restoreAllMocks());

const keysDeep = (obj: object, prefix = ''): string[] =>
  Object.entries(obj).flatMap(([key, value]) =>
    value !== null && typeof value === 'object'
      ? keysDeep(value, `${prefix}${key}.`)
      : [`${prefix}${key}`],
  );

describe('public api', () => {
  // the surface is a contract with extensions — growing it is a decision,
  // not a side effect of a refactor
  it('exposes exactly the documented surface', () => {
    expect(keysDeep(createApi()).sort()).toEqual(
      [
        'version',
        'defineFeature',
        'defineInventoryFeature',
        'patchMethod',
        'updateMenu',
        'controls.actorSelector',
        'controls.amountSelector',
        'controls.makeApplyAmount',
        'controls.inventorySection',
        'controls.resourceCheats',
        'controls.onOffLabel',
        'controls.playToggleSound',
        'controls.makeScroll',
        'controls.nameMatches',
        'game.teleport',
        'game.changeResource',
        'game.makeSetExact',
        'game.systemNameLabels',
        'state.getSelectedActor',
        'state.currentAmount',
      ].sort(),
    );
    expect(createApi().version).toBe(API_VERSION);
  });

  it('is frozen, so one extension cannot swap functions under another', () => {
    const api = createApi();
    expect(Object.isFrozen(api)).toBe(true);
    expect(Object.isFrozen(api.controls)).toBe(true);
    expect(Object.isFrozen(api.game)).toBe(true);
    expect(Object.isFrozen(api.state)).toBe(true);
  });

  it('defineFeature returns the feature itself', () => {
    const feature = { id: 'ext.api.f', menus: [] };
    expect(createApi().defineFeature(feature)).toBe(feature);
  });

  it('defineInventoryFeature builds a feature an extension may register', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const api = createApi();
    const target = {};
    installExtensions(target, { api, apiVersion: API_VERSION });

    const feature = api.defineInventoryFeature({
      id: 'ext.api.keys',
      menuName: 'Keys',
      title: 'Keys',
      searchKey: 'ext.api.keys',
      searchPlaceholder: 'Search keys…',
      getData: () => [],
    });
    expect((feature as { migrateV1?: unknown }).migrateV1).toBeUndefined();

    (
      target as { CheatMenuExtensions: { push(d: unknown): void } }
    ).CheatMenuExtensions.push({
      name: 'api',
      apiVersion: API_VERSION,
      setup: () => [feature],
    });
    expect(getFeatures()).toContain(feature);
    expect(console.error).not.toHaveBeenCalled();
  });
});
