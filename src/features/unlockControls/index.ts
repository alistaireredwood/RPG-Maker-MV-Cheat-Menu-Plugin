import { patchMethod } from '@src/core/engine/patch.ts';
import { defineFeature } from '@src/core/feature.ts';
import { renameV1Keys } from '@src/core/persistence.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import { onOffLabel, playToggleSound } from '@src/shared/controls/status.ts';

const state = {
  forceMouseMovement: false,
  forceCtrlSkip: false,
};

const isCtrlSkipping = () => state.forceCtrlSkip && Input.isPressed('control');

// for games that disable touch / click movement
function moveByInputAllowingMouse(this: Game_Player): void {
  if (this.isMoving() || !this.canMove()) return;

  let direction = this.getInputDirection();
  if (direction > 0) {
    $gameTemp.clearDestination();
  } else if (TouchInput.isPressed()) {
    const x = $gameMap.canvasToMapX(TouchInput.x);
    const y = $gameMap.canvasToMapY(TouchInput.y);
    $gameTemp.setDestination(x, y);
    direction = this.findDirectionTo(x, y);
  }

  if (direction > 0) this.executeMove(direction);
}

function installOverrides(): void {
  patchMethod(
    Game_Player.prototype,
    'moveByInput',
    (original) =>
      function (this: Game_Player) {
        if (state.forceMouseMovement) moveByInputAllowingMouse.call(this);
        else original.call(this);
      },
  );

  // for games that disable message skipping
  patchMethod(
    Window_Message.prototype,
    'isTriggered',
    (original) =>
      function (this: Window_Message) {
        return isCtrlSkipping() || original.call(this);
      },
  );
  patchMethod(
    Window_Message.prototype,
    'updateShowFast',
    (original) =>
      function (this: Window_Message) {
        if (!isCtrlSkipping()) return original.call(this);
        (this as unknown as { _showFast: boolean })._showFast = true;
      },
  );
}

function toggle(flag: keyof typeof state): void {
  state[flag] = !state[flag];
  updateMenu();
  playToggleSound(state[flag]);
}

export default defineFeature({
  id: 'unlockControls',
  state,
  onInit: installOverrides,
  migrateV1: (v1) =>
    renameV1Keys<typeof state>(v1, {
      forceMouseMovement: 'forceMouseMovement',
      forceCtrlSkip: 'forceCtrlSkip',
    }),
  menus: [
    {
      id: 'unlockControls',
      name: 'Unlock Controls',
      render(ui) {
        ui.cheatTitle();
        ui.cheat(
          'Force mouse movement:',
          onOffLabel(state.forceMouseMovement),
          () => toggle('forceMouseMovement'),
        );
        ui.cheat('Force Ctrl skip:', onOffLabel(state.forceCtrlSkip), () =>
          toggle('forceCtrlSkip'),
        );
      },
    },
  ],
});
