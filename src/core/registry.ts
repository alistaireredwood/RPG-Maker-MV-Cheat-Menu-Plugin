import type { Feature, FeatureHook, MenuEntry } from './feature.ts';
import { clone, readSlice } from './persistence.ts';

type Registered = {
  feature: Feature<object>;
  /** live state: `feature.state` itself (or `{}`) — mutated in place, never replaced */
  state: object;
  defaults: object;
};

const registered: Registered[] = [];
const menus: { entry: MenuEntry<object>; owner: Registered }[] = [];

export function registerFeatures(features: readonly Feature<object>[]): void {
  const featureIds = new Set(registered.map((r) => r.feature.id));
  const menuIds = new Set(menus.map((m) => m.entry.id));

  for (const feature of features) {
    if (featureIds.has(feature.id) || feature.id === 'core') {
      throw new Error(`[CheatMenu] duplicate feature id "${feature.id}"`);
    }
    featureIds.add(feature.id);

    const state = feature.state ?? {};
    const owner: Registered = { feature, state, defaults: clone(state) };
    registered.push(owner);

    for (const entry of feature.menus) {
      if (menuIds.has(entry.id)) {
        throw new Error(`[CheatMenu] duplicate menu id "${entry.id}"`);
      }
      menuIds.add(entry.id);
      menus.push({ entry, owner });
    }
  }
}

export const getFeatures = (): readonly Feature<object>[] =>
  registered.map((r) => r.feature);

export const getMenus = (): readonly MenuEntry<object>[] =>
  menus.map((m) => m.entry);

export const findMenu = (id: string | null) =>
  id === null ? undefined : menus.find((m) => m.entry.id === id);

export function renderMenuEntry(
  id: string,
  ui: Parameters<MenuEntry['render']>[0],
): void {
  const menu = findMenu(id);
  if (menu) menu.entry.render(ui, menu.owner.state);
}

export function emit(hook: FeatureHook): void {
  for (const { feature, state } of registered) {
    try {
      feature[hook]?.(state);
    } catch (e) {
      console.error(`[CheatMenu] ${feature.id}.${hook} failed:`, e);
    }
  }
}

export function restoreStates(saved: Readonly<Record<string, unknown>> | null) {
  for (const { feature, state, defaults } of registered) {
    const fresh = readSlice(defaults, saved?.[feature.id]);
    const live = state as Record<string, unknown>;
    for (const key of Object.keys(live)) delete live[key];
    Object.assign(live, fresh);
  }
}

export function snapshotStates(): Record<string, object> {
  const result: Record<string, object> = {};
  for (const { feature, state } of registered) {
    if (feature.state) result[feature.id] = state;
  }
  return result;
}
