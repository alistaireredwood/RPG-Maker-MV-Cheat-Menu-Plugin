import { defineFeature } from '../../core/feature.ts';
import { updateMenu } from '../../core/ui/render.ts';
import { onOffLabel, playToggleSound } from '../../shared/controls/status.ts';

// "through" is the engine's own flag (the same one ghost events use), so no
// state of our own — it isn't persisted by us either.
function toggleNoClip(): void {
  $gamePlayer.setThrough(!$gamePlayer.isThrough());
  updateMenu();
  playToggleSound($gamePlayer.isThrough());
}

export default defineFeature({
  id: 'noClip',
  menus: [
    {
      id: 'noClip',
      name: 'No Clip',
      render(ui) {
        ui.cheatTitle();
        ui.cheat('Status:', onOffLabel($gamePlayer.isThrough()), toggleNoClip);
      },
    },
  ],
});
