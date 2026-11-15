import type { Feature, FeatureHook, MenuEntry } from './feature.ts';
import { clone, readSlice } from './persistence.ts';

type Registered = {
  feature: Feature<object>;
  /** live state: `feature.state` itself (or `{}`) — mutated in place, never replaced */
  state: object;
  defaults: object;
};

const registered: Registered[] = [];

type RegisteredMenu = {
  entry: MenuEntry<object>;
  owner: Registered;
  /** the `after` id this menu was placed by */
  anchor?: string;
};

const menus: RegisteredMenu[] = [];

function placeMenus(added: RegisteredMenu[], after: string | undefined): void {
  if (after === undefined) {
    menus.push(...added);
    return;
  }
  let at = menus.findIndex((m) => m.entry.id === after);
  if (at < 0) {
    console.warn(
      `[CheatMenu] menu "${after}" not found, "${added[0]?.owner.feature.id}" goes to the end`,
    );
    menus.push(...added);
    return;
  }
  // earlier features placed after the same menu keep their spot in front
  at++;
  while (at < menus.length && menus[at].anchor === after) at++;
  menus.splice(at, 0, ...added.map((m) => ({ ...m, anchor: after })));
}

// feature ids are slice keys of the save object, next to these
const RESERVED_IDS = new Set(['core', 'version']);

function validate(features: readonly Feature<object>[]): void {
  const featureIds = new Set(registered.map((r) => r.feature.id));
  const menuIds = new Set(menus.map((m) => m.entry.id));

  for (const feature of features) {
    if (RESERVED_IDS.has(feature.id)) {
      throw new Error(`[CheatMenu] feature id "${feature.id}" is reserved`);
    }
    if (featureIds.has(feature.id)) {
      throw new Error(`[CheatMenu] duplicate feature id "${feature.id}"`);
    }
    featureIds.add(feature.id);

    for (const entry of feature.menus) {
      if (menuIds.has(entry.id)) {
        throw new Error(`[CheatMenu] duplicate menu id "${entry.id}"`);
      }
      menuIds.add(entry.id);
    }
  }
}

/**
 * All or nothing: extensions register at runtime inside a try/catch, and a
 * half-registered feature would keep receiving hooks.
 */
export function registerFeatures(features: readonly Feature<object>[]): void {
  validate(features);

  for (const feature of features) {
    const state = feature.state ?? {};
    const owner: Registered = { feature, state, defaults: clone(state) };
    registered.push(owner);
    placeMenus(
      feature.menus.map((entry) => ({ entry, owner })),
      feature.after,
    );
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

export function emit(
  hook: FeatureHook,
  only?: readonly Feature<object>[],
): void {
  for (const { feature, state } of registered) {
    if (only && !only.includes(feature)) continue;
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
