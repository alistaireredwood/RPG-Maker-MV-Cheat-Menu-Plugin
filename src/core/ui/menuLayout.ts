import { clone } from '@src/core/persistence.ts';
import { definePreference } from '@src/core/preferences.ts';
import { EXTENSION_ID_PREFIX } from '@src/core/extensions.ts';
import { getMenuPlacements } from '@src/core/registry.ts';
import {
  DEFAULT_LAYOUT_PREFS,
  getLayout,
  moveInGroup,
  navigationOrder,
  setGroup,
  toggleCollapsed,
  type Group,
  type LayoutGroup,
  type LayoutMenu,
  type LayoutPrefs,
} from './layout.ts';

// per game, not per save: a new game or another save keeps the user's grid
const layoutPref = definePreference<LayoutPrefs>(
  'layout',
  clone(DEFAULT_LAYOUT_PREFS) as LayoutPrefs,
);

// Built-ins are placed by features.ts order, so only an extension can lack a
// meaningful registry neighbour; without `after` it goes to the end of Basic.
const layoutMenus = (): LayoutMenu[] =>
  getMenuPlacements().map(({ entry, anchor }) => ({
    id: entry.id,
    tier: entry.tier,
    after: anchor,
    appended: anchor === undefined && entry.id.startsWith(EXTENSION_ID_PREFIX),
  }));

const prefs = () => layoutPref.get() as LayoutPrefs;

function apply(next: LayoutPrefs): void {
  layoutPref.update((value) => {
    value.order = next.order;
    value.groups = next.groups;
    value.collapsed = next.collapsed;
  });
}

export const currentLayout = (): LayoutGroup[] =>
  getLayout(layoutMenus(), prefs());

export const navigationMenuIds = (): string[] =>
  navigationOrder(currentLayout());

export const moveMenu = (id: string, direction: 'up' | 'down'): void =>
  apply(moveInGroup(layoutMenus(), prefs(), id, direction));

export const setMenuGroup = (id: string, group: Group): void =>
  apply(setGroup(layoutMenus(), prefs(), id, group));

export const toggleGroupCollapsed = (group: Group): void =>
  apply(toggleCollapsed(prefs(), group));

export const resetLayout = (): void => layoutPref.reset();
