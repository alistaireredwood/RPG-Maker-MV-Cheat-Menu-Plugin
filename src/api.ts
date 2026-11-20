// The public contract for game-specific extensions
// (docs/game-specific-extensions.md) and the entry of release/types/Cheat_Menu.d.ts.
// Everything an extension can reach is listed here — keep it narrow.
//
// Implementation modules are imported as types only: extensions are a
// separate bundle and get the values through `api` at runtime (createApi.ts).

import type * as Patch from '@src/core/engine/patch.ts';
import type {
  ExtensionDescriptor,
  ExtensionQueue,
} from '@src/core/extensions.ts';
import type { Feature } from '@src/core/feature.ts';
import type * as Render from '@src/core/ui/render.ts';
import type * as ActorSelector from '@src/shared/controls/actorSelector.ts';
import type * as AmountSelector from '@src/shared/controls/amountSelector.ts';
import type * as InventorySection from '@src/shared/controls/inventorySection.ts';
import type * as ListSelector from '@src/shared/controls/listSelector.ts';
import type * as ResourceCheats from '@src/shared/controls/resourceCheats.ts';
import type * as Status from '@src/shared/controls/status.ts';
import type { DictionaryNames } from '@src/shared/game/dictionary.ts';
import type * as Numbers from '@src/shared/game/numbers.ts';
import type * as Resources from '@src/shared/game/resources.ts';
import type * as SystemNames from '@src/shared/game/systemNames.ts';
import type * as Teleport from '@src/shared/game/teleport.ts';
import type * as InventoryFeature from '@src/shared/inventoryFeature.ts';
import type * as SharedState from '@src/shared/state.ts';

export type { Feature, MenuEntry } from '@src/core/feature.ts';
export type { MenuBuilder } from '@src/core/ui/builder.ts';
export type { ExtensionDescriptor, ExtensionQueue };
export type {
  DictionaryNames,
  NameSection,
} from '@src/shared/game/dictionary.ts';

/** Bumped only on a breaking change of the api; additions keep it. */
export const API_VERSION = 1;

/** v1 saves predate extensions, so there is nothing to migrate. */
export type ExtensionFeature<S extends object = Record<string, never>> = Omit<
  Feature<S>,
  'migrateV1'
>;

export type InventoryConfig = Omit<
  Parameters<typeof InventoryFeature.defineInventoryFeature>[0],
  'v1SelectionKey'
>;

export type CheatMenuApi = {
  /** {@link API_VERSION} of this Cheat Menu. */
  readonly version: number;
  /** Identity — gives `state` type inference to hooks and `render`. */
  defineFeature<S extends object = Record<string, never>>(
    feature: ExtensionFeature<S>,
  ): ExtensionFeature<S>;
  /** Items / Weapons / Armors style menu over any `$data*`-like array. */
  defineInventoryFeature(
    config: InventoryConfig,
  ): ExtensionFeature<{ selection: number }>;
  patchMethod: typeof Patch.patchMethod;
  updateMenu: typeof Render.updateMenu;
  readonly controls: {
    actorSelector: typeof ActorSelector.actorSelector;
    amountSelector: typeof AmountSelector.amountSelector;
    makeApplyAmount: typeof AmountSelector.makeApplyAmount;
    inventorySection: typeof InventorySection.inventorySection;
    resourceCheats: typeof ResourceCheats.resourceCheats;
    onOffLabel: typeof Status.onOffLabel;
    playToggleSound: typeof Status.playToggleSound;
    makeScroll: typeof ListSelector.makeScroll;
    nameMatches: typeof ListSelector.nameMatches;
  };
  readonly game: {
    teleport: typeof Teleport.teleport;
    changeResource: typeof Resources.changeResource;
    makeSetExact: typeof Numbers.makeSetExact;
    systemNameLabels: typeof SystemNames.systemNameLabels;
  };
  readonly state: {
    getSelectedActor: typeof SharedState.getSelectedActor;
    currentAmount: typeof SharedState.currentAmount;
  };
};

/** `names` takes the sections of `Cheat_Menu.dictionary.json`, and loses to it. */
export type CheatMenuExtension = ExtensionDescriptor<
  CheatMenuApi,
  DictionaryNames
>;

declare global {
  interface Window {
    CheatMenuExtensions?: CheatMenuExtension[] | ExtensionQueue<CheatMenuApi>;
  }
}
