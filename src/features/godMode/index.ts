import { defineFeature } from '@src/core/feature.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import { actorSelector } from '@src/shared/controls/actorSelector.ts';
import { onOffLabel, playToggleSound } from '@src/shared/controls/status.ts';
import {
  disableGodMode,
  enableGodMode,
  godModeState,
  isGodModeActive,
  reapplyGodMode,
} from './godMode.ts';

function toggle(actor: Game_Actor): void {
  const enable = !isGodModeActive(actor);
  if (enable) enableGodMode(actor);
  else disableGodMode(actor);
  playToggleSound(enable);
  updateMenu();
}

export default defineFeature({
  id: 'godMode',
  state: godModeState,
  onStateRestored: reapplyGodMode,
  migrateV1: (v1) =>
    Array.isArray(v1.godModeActors) ? { actors: v1.godModeActors } : {},
  menus: [
    {
      id: 'godMode',
      name: 'God Mode',
      render(ui) {
        ui.cheatTitle();
        const actor = actorSelector(ui);
        ui.cheat(
          'Status:',
          onOffLabel(!!actor && isGodModeActive(actor)),
          () => actor && toggle(actor),
        );
      },
    },
  ],
});
