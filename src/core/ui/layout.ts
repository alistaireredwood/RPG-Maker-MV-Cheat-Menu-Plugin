// Pure layout of the main grid — unit tested in layout.test.ts. The registry
// order is never changed (extensions' `after` relies on it); the user's
// layout is computed on top of it.

export const GROUPS = ['favourite', 'basic', 'advanced', 'hidden'] as const;
export type Group = (typeof GROUPS)[number];

export type LayoutMenu = {
  id: string;
  tier?: 'advanced';
  /** registry anchor (`Feature.after`): the default group is inherited from it */
  after?: string;
  /** an extension menu without an anchor: goes to the end of Basic */
  appended?: boolean;
};

export type LayoutPrefs = {
  /** every menu id in the user's order, across groups */
  order: string[];
  /** only menus moved out of their default group */
  groups: Record<string, Group>;
  collapsed: Group[];
};

export const DEFAULT_LAYOUT_PREFS: Readonly<LayoutPrefs> = {
  order: [],
  groups: {},
  collapsed: ['advanced'],
};

export type LayoutGroup = { group: Group; ids: string[]; collapsed: boolean };

const isGroup = (value: unknown): value is Group =>
  (GROUPS as readonly unknown[]).includes(value);

/**
 * An extension placed with `after` sits next to that menu, so it also takes
 * that menu's group, including one the user moved it to. An explicit `tier`
 * is more specific and wins.
 */
function makeGroups(menus: readonly LayoutMenu[], prefs: LayoutPrefs) {
  const byId = new Map(menus.map((m) => [m.id, m]));
  const saved = (id: string): Group | undefined => {
    const group = prefs.groups[id];
    return isGroup(group) ? group : undefined;
  };
  const defaultOf = (menu: LayoutMenu, seen: Set<string>): Group => {
    if (menu.tier === 'advanced') return 'advanced';
    const anchor = menu.after === undefined ? undefined : byId.get(menu.after);
    if (!anchor || seen.has(anchor.id)) return 'basic';
    seen.add(menu.id);
    return saved(anchor.id) ?? defaultOf(anchor, seen);
  };
  return {
    of: (id: string): Group =>
      saved(id) ?? defaultOf(byId.get(id)!, new Set<string>()),
    defaultOf: (menu: LayoutMenu): Group => defaultOf(menu, new Set<string>()),
  };
}

/**
 * Saved order of the known menus; a menu missing from it (a new feature or
 * extension) goes right after the menu that precedes it in the registry, so
 * it shows up where its author placed it. An extension without an anchor has
 * no meaningful predecessor and goes to the end.
 */
function mergedOrder(menus: readonly LayoutMenu[], saved: unknown): string[] {
  const registry = menus.map((m) => m.id);
  const known = new Set(registry);
  const result: string[] = [];
  for (const id of Array.isArray(saved) ? saved : []) {
    if (typeof id === 'string' && known.has(id) && !result.includes(id)) {
      result.push(id);
    }
  }
  menus.forEach(({ id, appended }, i) => {
    if (result.includes(id)) return;
    if (appended) {
      result.push(id);
      return;
    }
    let at = 0;
    for (let j = i - 1; j >= 0; j--) {
      const k = result.indexOf(registry[j]);
      if (k >= 0) {
        at = k + 1;
        break;
      }
    }
    result.splice(at, 0, id);
  });
  return result;
}

export function getLayout(
  menus: readonly LayoutMenu[],
  prefs: LayoutPrefs,
): LayoutGroup[] {
  const groups = makeGroups(menus, prefs);
  const order = mergedOrder(menus, prefs.order);
  const collapsed = Array.isArray(prefs.collapsed) ? prefs.collapsed : [];
  return GROUPS.map((group) => ({
    group,
    ids: order.filter((id) => groups.of(id) === group),
    collapsed: collapsed.includes(group),
  }));
}

/** What keys 2/3 step through: collapsing is visual only, Hidden is skipped. */
// no flatMap: MV 1.6 ships NW.js with Chromium 65, which predates it
export const navigationOrder = (layout: readonly LayoutGroup[]): string[] =>
  ([] as string[]).concat(
    ...layout.filter((g) => g.group !== 'hidden').map((g) => g.ids),
  );

const copy = (prefs: LayoutPrefs): LayoutPrefs => ({
  order: [...prefs.order],
  groups: { ...prefs.groups },
  collapsed: [...prefs.collapsed],
});

export function moveInGroup(
  menus: readonly LayoutMenu[],
  prefs: LayoutPrefs,
  id: string,
  direction: 'up' | 'down',
): LayoutPrefs {
  const next = copy(prefs);
  const group = getLayout(menus, prefs).find((g) => g.ids.includes(id));
  if (!group) return next;
  const idx = group.ids.indexOf(id);
  const neighbour = group.ids[direction === 'up' ? idx - 1 : idx + 1];
  if (neighbour === undefined) return next;

  const order = mergedOrder(menus, prefs.order);
  const a = order.indexOf(id);
  const b = order.indexOf(neighbour);
  [order[a], order[b]] = [order[b], order[a]];
  next.order = order;
  return next;
}

export function setGroup(
  menus: readonly LayoutMenu[],
  prefs: LayoutPrefs,
  id: string,
  group: Group,
): LayoutPrefs {
  const next = copy(prefs);
  const menu = menus.find((m) => m.id === id);
  if (!menu) return next;

  const target = getLayout(menus, prefs).find((g) => g.group === group);
  const others = target ? target.ids.filter((other) => other !== id) : [];
  const last = others[others.length - 1];
  const order = mergedOrder(menus, prefs.order);
  if (last !== undefined) {
    order.splice(order.indexOf(id), 1);
    order.splice(order.indexOf(last) + 1, 0, id);
  }
  next.order = order;

  // an explicit default would pin the menu if its default group changes later
  if (group === makeGroups(menus, prefs).defaultOf(menu))
    delete next.groups[id];
  else next.groups[id] = group;
  return next;
}

export function toggleCollapsed(prefs: LayoutPrefs, group: Group): LayoutPrefs {
  const next = copy(prefs);
  next.collapsed = next.collapsed.includes(group)
    ? next.collapsed.filter((g) => g !== group)
    : [...next.collapsed, group];
  return next;
}
