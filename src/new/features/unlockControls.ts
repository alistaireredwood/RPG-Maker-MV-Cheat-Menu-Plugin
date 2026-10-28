import CheatMenu from '../CheatMenu.ts';

let overridesInstalled = false;

function installOverrides(): void {
  if (overridesInstalled) return;
  overridesInstalled = true;

  const moveByInputBackup = Game_Player.prototype.moveByInput;

  Game_Player.prototype.moveByInput = function (this: Game_Player) {
    if (!CheatMenu.forceMouseMovement) {
      moveByInputBackup.call(this);
      return;
    }

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

    if (direction > 0) {
      this.executeMove(direction);
    }
  };

  const isTriggeredBackup = Window_Message.prototype.isTriggered;
  const updateShowFastBackup = Window_Message.prototype.updateShowFast;

  Window_Message.prototype.isTriggered = function (this: Window_Message) {
    if (CheatMenu.forceCtrlSkip && Input.isPressed('control')) return true;
    return isTriggeredBackup.call(this);
  };

  Window_Message.prototype.updateShowFast = function (this: Window_Message) {
    if (CheatMenu.forceCtrlSkip && Input.isPressed('control')) {
      (this as unknown as { _showFast: boolean })._showFast = true;
      return;
    }
    updateShowFastBackup.call(this);
  };
}

installOverrides();

function createToggle(flagKey: 'forceMouseMovement' | 'forceCtrlSkip') {
  return function () {
    CheatMenu[flagKey] = !CheatMenu[flagKey];

    CheatMenu.updateMenu();
    SoundManager.playSystemSound(CheatMenu[flagKey] ? 1 : 2);
  };
}

CheatMenu.toggleForceMouseMovement = createToggle('forceMouseMovement');
CheatMenu.toggleForceCtrlSkip = createToggle('forceCtrlSkip');

CheatMenu.appendUnlockControlsStatus = function (key1, key2) {
  const mouseStatus = CheatMenu.forceMouseMovement
    ? '<span class="status-on">on</span>'
    : '<span class="status-off">off</span>';
  const ctrlStatus = CheatMenu.forceCtrlSkip
    ? '<span class="status-on">on</span>'
    : '<span class="status-off">off</span>';

  CheatMenu.appendCheat(
    'Force mouse movement:',
    mouseStatus,
    key1,
    CheatMenu.toggleForceMouseMovement,
  );
  CheatMenu.appendCheat(
    'Force Ctrl skip:',
    ctrlStatus,
    key2,
    CheatMenu.toggleForceCtrlSkip,
  );
};

export const menu = {
  name: 'Unlock Controls',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendUnlockControlsStatus(4, 5);
  },
};
