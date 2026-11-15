import { describe, expect, it } from 'vitest';
import {
  DEFAULT_LAYOUT_PREFS,
  getLayout,
  moveInGroup,
  navigationOrder,
  setGroup,
  toggleCollapsed,
  type LayoutGroup,
  type LayoutMenu,
  type LayoutPrefs,
} from './layout.ts';

const menus: LayoutMenu[] = [
  { id: 'a' },
  { id: 'b' },
  { id: 'adv1', tier: 'advanced' },
  { id: 'c' },
  { id: 'adv2', tier: 'advanced' },
];

const prefs = (over: Partial<LayoutPrefs> = {}): LayoutPrefs => ({
  ...structuredClone(DEFAULT_LAYOUT_PREFS),
  ...over,
});

const ids = (layout: readonly LayoutGroup[]) =>
  Object.fromEntries(layout.map((g) => [g.group, g.ids]));

const collapsedGroups = (layout: readonly LayoutGroup[]) =>
  layout.filter((g) => g.collapsed).map((g) => g.group);

describe('getLayout', () => {
  it('default prefs: groups from tier, registry order, Advanced collapsed', () => {
    const layout = getLayout(menus, DEFAULT_LAYOUT_PREFS);
    expect(layout.map((g) => g.group)).toEqual([
      'favourite',
      'basic',
      'advanced',
      'hidden',
    ]);
    expect(ids(layout)).toEqual({
      favourite: [],
      basic: ['a', 'b', 'c'],
      advanced: ['adv1', 'adv2'],
      hidden: [],
    });
    expect(collapsedGroups(layout)).toEqual(['advanced']);
  });

  it('applies saved order and groups', () => {
    const layout = getLayout(
      menus,
      prefs({
        order: ['c', 'adv2', 'a', 'b', 'adv1'],
        groups: { b: 'favourite', adv1: 'basic', c: 'hidden' },
        collapsed: [],
      }),
    );
    expect(ids(layout)).toEqual({
      favourite: ['b'],
      basic: ['a', 'adv1'],
      advanced: ['adv2'],
      hidden: ['c'],
    });
    expect(collapsedGroups(layout)).toEqual([]);
  });

  it('ignores unknown ids, duplicates and invalid values', () => {
    const layout = getLayout(
      menus,
      prefs({
        order: ['removed', 'b', 'b', 'a', 42 as unknown as string],
        groups: {
          removed: 'favourite',
          a: 'nonsense' as unknown as 'basic',
        },
        collapsed: ['nope' as unknown as 'basic'],
      }),
    );
    // c is missing from the cleaned order [b, a], so it follows its registry
    // predecessor (adv1 → b)
    expect(ids(layout)).toEqual({
      favourite: [],
      basic: ['b', 'c', 'a'],
      advanced: ['adv1', 'adv2'],
      hidden: [],
    });
    expect(collapsedGroups(layout)).toEqual([]);
  });

  it('a new menu lands in its default group after its default neighbour', () => {
    const saved = prefs({ order: ['c', 'b', 'a', 'adv2', 'adv1'] });
    const withNew: LayoutMenu[] = [
      { id: 'a' },
      { id: 'new' },
      { id: 'b' },
      { id: 'adv1', tier: 'advanced' },
      { id: 'newAdv', tier: 'advanced' },
      { id: 'c' },
      { id: 'adv2', tier: 'advanced' },
    ];
    expect(ids(getLayout(withNew, saved))).toEqual({
      favourite: [],
      basic: ['c', 'b', 'a', 'new'],
      advanced: ['adv2', 'adv1', 'newAdv'],
      hidden: [],
    });
  });

  it('a new first menu lands at the front', () => {
    const saved = prefs({ order: ['b', 'a', 'c', 'adv1', 'adv2'] });
    const withNew: LayoutMenu[] = [{ id: 'first' }, ...menus];
    expect(ids(getLayout(withNew, saved)).basic).toEqual([
      'first',
      'b',
      'a',
      'c',
    ]);
  });

  it('an extension menu placed with `after` keeps that spot in a custom order', () => {
    // the registry already placed ext.x right after b
    const registry: LayoutMenu[] = [
      { id: 'a' },
      { id: 'b' },
      { id: 'ext.x' },
      { id: 'c' },
    ];
    const saved = prefs({ order: ['c', 'b', 'a'] });
    expect(ids(getLayout(registry, saved)).basic).toEqual([
      'c',
      'b',
      'ext.x',
      'a',
    ]);
  });
});

describe('extension menus', () => {
  it('with `after`: inherits the default group of that menu, right after it', () => {
    const registry: LayoutMenu[] = [
      ...menus.slice(0, 3),
      { id: 'ext.x', after: 'adv1' },
      ...menus.slice(3),
    ];
    expect(ids(getLayout(registry, DEFAULT_LAYOUT_PREFS))).toEqual({
      favourite: [],
      basic: ['a', 'b', 'c'],
      advanced: ['adv1', 'ext.x', 'adv2'],
      hidden: [],
    });
  });

  it('with `after`: follows the group the user moved that menu to', () => {
    const registry: LayoutMenu[] = [
      { id: 'a' },
      { id: 'ext.x', after: 'a' },
      { id: 'b' },
    ];
    const layout = getLayout(registry, prefs({ groups: { a: 'favourite' } }));
    expect(ids(layout).favourite).toEqual(['a', 'ext.x']);
    expect(ids(layout).basic).toEqual(['b']);
  });

  it('an explicit tier wins over `after`', () => {
    const registry: LayoutMenu[] = [
      { id: 'a' },
      { id: 'ext.x', after: 'a', tier: 'advanced' },
    ];
    expect(ids(getLayout(registry, DEFAULT_LAYOUT_PREFS)).advanced).toEqual([
      'ext.x',
    ]);
  });

  it('a chain of `after` reaches the first menu of the chain', () => {
    const registry: LayoutMenu[] = [
      { id: 'adv1', tier: 'advanced' },
      { id: 'ext.a', after: 'adv1' },
      { id: 'ext.b', after: 'ext.a' },
    ];
    expect(ids(getLayout(registry, DEFAULT_LAYOUT_PREFS)).advanced).toEqual([
      'adv1',
      'ext.a',
      'ext.b',
    ]);
  });

  it('an `after` cycle or an unknown `after` falls back to Basic', () => {
    const registry: LayoutMenu[] = [
      { id: 'ext.a', after: 'ext.b' },
      { id: 'ext.b', after: 'ext.a' },
      { id: 'ext.c', after: 'missing' },
    ];
    expect(ids(getLayout(registry, DEFAULT_LAYOUT_PREFS)).basic).toEqual([
      'ext.a',
      'ext.b',
      'ext.c',
    ]);
  });

  it('without `after`: at the end of Basic, whatever the saved order', () => {
    const registry: LayoutMenu[] = [...menus, { id: 'ext.z', appended: true }];
    const saved = prefs({ order: ['adv2', 'c', 'b', 'a', 'adv1'] });
    expect(ids(getLayout(registry, saved)).basic).toEqual([
      'c',
      'b',
      'a',
      'ext.z',
    ]);
  });

  it('moving it back to the inherited group drops the override', () => {
    const registry: LayoutMenu[] = [
      { id: 'adv1', tier: 'advanced' },
      { id: 'ext.x', after: 'adv1' },
    ];
    const moved = setGroup(registry, DEFAULT_LAYOUT_PREFS, 'ext.x', 'basic');
    expect(moved.groups).toEqual({ 'ext.x': 'basic' });
    const back = setGroup(registry, moved, 'ext.x', 'advanced');
    expect(back.groups).toEqual({});
  });
});

describe('navigationOrder', () => {
  it('Favourites → Basic → Advanced, without Hidden, collapsed included', () => {
    const layout = getLayout(
      menus,
      prefs({
        groups: { adv2: 'favourite', b: 'hidden' },
        collapsed: ['basic', 'advanced', 'favourite'],
      }),
    );
    expect(navigationOrder(layout)).toEqual(['adv2', 'a', 'c', 'adv1']);
  });
});

describe('moveInGroup', () => {
  it('swaps with the neighbour in the same group, skipping other groups', () => {
    // global order a, b, adv1, c, adv2: c's upper Basic neighbour is b
    const next = moveInGroup(menus, DEFAULT_LAYOUT_PREFS, 'c', 'up');
    expect(ids(getLayout(menus, next)).basic).toEqual(['a', 'c', 'b']);
    expect(ids(getLayout(menus, next)).advanced).toEqual(['adv1', 'adv2']);
  });

  it('down', () => {
    const next = moveInGroup(menus, DEFAULT_LAYOUT_PREFS, 'a', 'down');
    expect(ids(getLayout(menus, next)).basic).toEqual(['b', 'a', 'c']);
  });

  it('first up / last down changes nothing', () => {
    expect(
      ids(
        getLayout(menus, moveInGroup(menus, DEFAULT_LAYOUT_PREFS, 'a', 'up')),
      ),
    ).toEqual(ids(getLayout(menus, DEFAULT_LAYOUT_PREFS)));
    expect(
      ids(
        getLayout(
          menus,
          moveInGroup(menus, DEFAULT_LAYOUT_PREFS, 'adv2', 'down'),
        ),
      ),
    ).toEqual(ids(getLayout(menus, DEFAULT_LAYOUT_PREFS)));
  });

  it('unknown id changes nothing', () => {
    const next = moveInGroup(menus, DEFAULT_LAYOUT_PREFS, 'zzz', 'up');
    expect(ids(getLayout(menus, next))).toEqual(
      ids(getLayout(menus, DEFAULT_LAYOUT_PREFS)),
    );
  });

  it('does not mutate the given prefs', () => {
    const given = prefs();
    moveInGroup(menus, given, 'c', 'up');
    expect(given).toEqual(DEFAULT_LAYOUT_PREFS);
  });
});

describe('setGroup', () => {
  it.each(['favourite', 'advanced', 'hidden'] as const)(
    'moves a menu to %s, at the end of that group',
    (group) => {
      const start = setGroup(menus, DEFAULT_LAYOUT_PREFS, 'adv2', 'favourite');
      const next = setGroup(menus, start, 'a', group);
      const layout = ids(getLayout(menus, next));
      expect(layout[group][layout[group].length - 1]).toBe('a');
      expect(layout.basic).not.toContain('a');
    },
  );

  it('moving back to the default group drops the override', () => {
    const fav = setGroup(menus, DEFAULT_LAYOUT_PREFS, 'a', 'favourite');
    const back = setGroup(menus, fav, 'a', 'basic');
    expect(back.groups).toEqual({});
    expect(ids(getLayout(menus, back)).basic).toContain('a');
  });

  it('unknown id changes nothing', () => {
    const next = setGroup(menus, DEFAULT_LAYOUT_PREFS, 'zzz', 'hidden');
    expect(next.groups).toEqual({});
  });
});

describe('toggleCollapsed', () => {
  it('toggles one group and keeps the others', () => {
    const opened = toggleCollapsed(DEFAULT_LAYOUT_PREFS, 'advanced');
    expect(opened.collapsed).toEqual([]);
    const both = toggleCollapsed(toggleCollapsed(opened, 'advanced'), 'basic');
    expect(both.collapsed.slice().sort()).toEqual(['advanced', 'basic']);
    expect(DEFAULT_LAYOUT_PREFS.collapsed).toEqual(['advanced']);
  });
});

describe('reset', () => {
  it('default prefs after any edits → the default layout', () => {
    let p = setGroup(menus, DEFAULT_LAYOUT_PREFS, 'a', 'hidden');
    p = moveInGroup(menus, p, 'adv2', 'up');
    p = toggleCollapsed(p, 'advanced');
    expect(getLayout(menus, p)).not.toEqual(
      getLayout(menus, DEFAULT_LAYOUT_PREFS),
    );
    expect(getLayout(menus, structuredClone(DEFAULT_LAYOUT_PREFS))).toEqual(
      getLayout(menus, DEFAULT_LAYOUT_PREFS),
    );
  });
});
