import { defineFeature } from '@src/core/feature.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import type { Direction } from '@src/core/ui/widgets/scrollSelector.ts';
import { currentSpeed, installSpeedControl, setSpeed } from './speedControl.ts';
import { formatSpeed, NORMAL_SPEED, stepSpeed } from './speeds.ts';

// Deliberately not persisted, so loading another save doesn't
// silently restore a changed speed. The selection takes effect only on
// Apply, so stepping to x10 doesn't run the game at every speed on the way.

let selected = NORMAL_SPEED;

function scrollSpeed(direction: Direction): void {
  selected = stepSpeed(selected, direction);
  SoundManager.playSystemSound(0);
  updateMenu();
}

function apply(): void {
  setSpeed(selected);
  SoundManager.playSystemSound(1);
  updateMenu();
}

function reset(): void {
  selected = NORMAL_SPEED;
  setSpeed(NORMAL_SPEED);
  SoundManager.playSystemSound(2);
  updateMenu();
}

export default defineFeature({
  id: 'gameSpeed',
  onInit: installSpeedControl,
  menus: [
    {
      id: 'gameSpeed',
      name: 'Game Speed',
      render(ui) {
        const applied = currentSpeed();
        ui.cheatTitle();
        ui.title(
          'Game Speed',
          selected === applied ? undefined : `now ${formatSpeed(applied)}`,
        );
        ui.scrollSelector(
          `<span class="actor-name-highlight">${formatSpeed(selected)}</span>`,
          scrollSpeed,
        );
        ui.buttonRow([
          { label: 'Reset', onActivate: reset },
          { label: 'Apply', onActivate: apply },
        ]);
      },
    },
  ],
});
