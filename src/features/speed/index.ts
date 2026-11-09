import { defineFeature } from '../../core/feature.ts';
import { renameV1Keys } from '../../core/persistence.ts';
import { updateMenu } from '../../core/ui/render.ts';
import type { Direction } from '../../core/ui/widgets/scrollSelector.ts';
import { playToggleSound } from '../../shared/controls/status.ts';

const MOVE_AMOUNTS = [0.5, 1, 1.5, 2];
const MIN_SPEED = 0.5;

const state = {
  speed: 5,
  unlocked: true,
  moveAmountIndex: 1,
};

// the lock lives on $gamePlayer, which the engine replaces on load / new game
let lockInstalled = false;

function installSpeedLock(): void {
  if (lockInstalled) return;
  state.speed = $gamePlayer.moveSpeed();
  // a property (not a method patch) so the engine's own writes to _moveSpeed
  // — events, dash, plugins — are ignored while the speed is locked
  Object.defineProperty($gamePlayer, '_moveSpeed', {
    get: () => state.speed,
    set: (value: number) => {
      if (state.unlocked) state.speed = value;
    },
  });
  lockInstalled = true;
}

function changeSpeed(direction: Direction): void {
  installSpeedLock();
  const amount = MOVE_AMOUNTS[state.moveAmountIndex];
  state.speed = Math.max(
    MIN_SPEED,
    state.speed + (direction === 'left' ? -amount : amount),
  );
  SoundManager.playSystemSound(direction === 'left' ? 2 : 1);
  updateMenu();
}

function toggleLock(): void {
  installSpeedLock();
  state.unlocked = !state.unlocked;
  playToggleSound(!state.unlocked);
  updateMenu();
}

function scrollMoveAmount(direction: Direction): void {
  state.moveAmountIndex =
    direction === 'left'
      ? Math.max(0, state.moveAmountIndex - 1)
      : Math.min(MOVE_AMOUNTS.length - 1, state.moveAmountIndex + 1);
  SoundManager.playSystemSound(direction === 'left' ? 2 : 1);
  updateMenu();
}

const resetLock = () => {
  lockInstalled = false;
};

export default defineFeature({
  id: 'speed',
  state,
  onNewGame: resetLock,
  onLoad: resetLock,
  onStateRestored() {
    if (!state.unlocked) installSpeedLock();
  },
  migrateV1: (v1) =>
    renameV1Keys<typeof state>(v1, {
      speed: 'speed',
      unlocked: 'speedUnlocked',
      moveAmountIndex: 'moveAmountIndex',
    }),
  menus: [
    {
      id: 'speed',
      name: 'Speed',
      render(ui) {
        const locked = !state.unlocked;
        ui.cheatTitle();
        ui.title('Amount');
        ui.scrollSelector(
          `<span class='actor-name-highlight'>${MOVE_AMOUNTS[state.moveAmountIndex]}</span>`,
          scrollMoveAmount,
        );
        ui.title('Current Speed');
        ui.scrollSelector($gamePlayer.moveSpeed(), changeSpeed);
        ui.cheat(
          'Speed Locked',
          `<span class="${locked ? 'status-on' : 'status-off'}">${locked}</span>`,
          toggleLock,
        );
      },
    },
  ],
});
