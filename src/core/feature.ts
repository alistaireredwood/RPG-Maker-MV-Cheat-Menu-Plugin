import type { MenuBuilder } from './ui/builder.ts';

/** One entry of the main menu grid. */
export type MenuEntry<S extends object = object> = {
  /** Stable id — persisted as the currently open menu, so never reuse/rename it lightly. */
  id: string;
  name: string;
  render(ui: MenuBuilder, state: S): void;
};

/**
 * A self-contained cheat. Core knows nothing about concrete features — it only
 * calls these hooks, renders `menus` and persists `state`.
 *
 * `state` is the live state object: its values at registration are the
 * defaults, afterwards it is restored *in place* from saves — so module code
 * may keep a reference to it (mutate it, never replace it). Hooks and `render`
 * receive the same object. It is persisted in `$gameSystem.CheatMenu[id]`.
 */
export type Feature<S extends object = object> = {
  /** Key of the persisted state slice — never reuse/rename it lightly. */
  id: string;
  /** Live persisted state (initial values = defaults). Must be JSON-serializable. */
  state?: S;
  menus: MenuEntry<S>[];

  /** Once, when the plugin boots (install engine patches here). */
  onInit?(state: S): void;
  /** A new game is being set up (before the engine replaces its game objects). */
  onNewGame?(state: S): void;
  /** A save file is being loaded (before the engine replaces its game objects). */
  onLoad?(state: S): void;
  /**
   * `state` was just restored from the loaded save (or reset to defaults).
   * Runs lazily, the first time the menu is opened after a load / new game.
   */
  onStateRestored?(state: S): void;
  /** Right before `state` is written into the save file. */
  onSave?(state: S): void;

  /**
   * Converts the pre-v2 flat save format (`$gameSystem.CheatMenu` with keys
   * like `itemSelection`) into this feature's state. Return only known keys.
   */
  migrateV1?(v1: Readonly<Record<string, unknown>>): Partial<S> | undefined;
};

// Hooks / render are declared as methods (bivariant parameters), so features
// with different state types fit into one `Feature[]` list.

export type FeatureHook =
  'onInit' | 'onNewGame' | 'onLoad' | 'onStateRestored' | 'onSave';

/** Identity helper — gives `state` type inference to hooks and `render`. */
export function defineFeature<S extends object = Record<string, never>>(
  feature: Feature<S>,
): Feature<S> {
  return feature;
}
