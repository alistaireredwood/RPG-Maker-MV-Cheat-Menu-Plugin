import { patchMethod } from '@src/core/engine/patch.ts';
import { defineFeature } from '@src/core/feature.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import type { Direction } from '@src/core/ui/widgets/scrollSelector.ts';

// Speeds up the whole game (map, events, battles, animations, messages) by
// running extra logic updates per frame; audio and rendering are unaffected.
// Deliberately not persisted, so loading another save doesn't silently
// restore a sped-up game.

const GAME_SPEEDS = [1, 1.5, 2, 3, 4, 5, 8, 10];

let speedIndex = 0;
let pendingUpdates = 0;

const multiplier = () => GAME_SPEEDS[speedIndex] ?? 1;

function installExtraUpdates(): void {
  patchMethod(
    SceneManager,
    'updateScene',
    (original) =>
      function (this: typeof SceneManager) {
        original.call(this);

        if (multiplier() <= 1) {
          pendingUpdates = 0;
          return;
        }

        // fractional multipliers (e.g. 1.5) accumulate across frames
        pendingUpdates += multiplier() - 1;
        while (pendingUpdates >= 1) {
          pendingUpdates--;
          // a pending scene change must go through the engine's main loop first
          if (this.isSceneChanging()) {
            pendingUpdates = 0;
            break;
          }
          // otherwise one key press would be "triggered" once per extra update
          this.updateInputData();
          original.call(this);
        }
      },
  );
}

function scrollSpeed(direction: Direction): void {
  speedIndex =
    direction === 'left'
      ? Math.max(0, speedIndex - 1)
      : Math.min(GAME_SPEEDS.length - 1, speedIndex + 1);
  SoundManager.playSystemSound(direction === 'left' ? 2 : 1);
  updateMenu();
}

function resetSpeed(): void {
  speedIndex = 0;
  SoundManager.playSystemSound(2);
  updateMenu();
}

export default defineFeature({
  id: 'gameSpeed',
  onInit: installExtraUpdates,
  menus: [
    {
      id: 'gameSpeed',
      name: 'Game Speed',
      render(ui) {
        ui.cheatTitle();
        ui.title('Game Speed');
        ui.scrollSelector(
          `<span class="actor-name-highlight">x${multiplier()}</span>`,
          scrollSpeed,
        );
        ui.cheat('Reset to x1', 'Activate', resetSpeed);
        ui.description('High values may cause frame drops.');
      },
    },
  ],
});
