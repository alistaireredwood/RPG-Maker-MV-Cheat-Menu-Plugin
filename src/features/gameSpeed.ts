import CheatMenu from '../CheatMenu.ts';

// Speeds up the whole game (map, events, battles, animations, messages) by
// running extra logic updates per frame. Audio and rendering are unaffected.
// Runtime-only: deliberately not in initialValues, so loading another save
// doesn't silently restore a sped-up game.

const GAME_SPEEDS = [1, 1.5, 2, 3, 4, 5, 8, 10];

let extraUpdates = 0;
let overridesInstalled = false;

function installOverrides(): void {
  if (overridesInstalled) return;
  overridesInstalled = true;

  const updateSceneBackup = SceneManager.updateScene;

  SceneManager.updateScene = function (this: typeof SceneManager) {
    updateSceneBackup.call(this);

    const multiplier = GAME_SPEEDS[CheatMenu.gameSpeedIndex] ?? 1;
    if (multiplier <= 1) {
      extraUpdates = 0;
      return;
    }

    // fractional multipliers (e.g. 1.5) accumulate leftovers across frames
    extraUpdates += multiplier - 1;
    while (extraUpdates >= 1) {
      extraUpdates--;
      // a pending scene change must go through the engine's main loop first
      if (this.isSceneChanging()) {
        extraUpdates = 0;
        break;
      }
      // refresh input between updates so a single key press is only
      // "triggered" once, not once per extra update
      this.updateInputData();
      updateSceneBackup.call(this);
    }
  };
}

installOverrides();

CheatMenu.scrollGameSpeed = function (direction) {
  if (direction === 'left') {
    CheatMenu.gameSpeedIndex = Math.max(0, CheatMenu.gameSpeedIndex - 1);
    SoundManager.playSystemSound(2);
  } else {
    CheatMenu.gameSpeedIndex = Math.min(
      GAME_SPEEDS.length - 1,
      CheatMenu.gameSpeedIndex + 1,
    );
    SoundManager.playSystemSound(1);
  }
  CheatMenu.updateMenu();
};

CheatMenu.resetGameSpeed = function () {
  CheatMenu.gameSpeedIndex = 0;
  SoundManager.playSystemSound(2);
  CheatMenu.updateMenu();
};

CheatMenu.appendGameSpeed = function (key1, key2, key3) {
  const multiplier = GAME_SPEEDS[CheatMenu.gameSpeedIndex] ?? 1;
  CheatMenu.appendTitle('Game Speed');
  CheatMenu.appendScrollSelector(
    `<span class="actor-name-highlight">x${multiplier}</span>`,
    key1,
    key2,
    CheatMenu.scrollGameSpeed,
  );
  CheatMenu.appendCheat(
    'Reset to x1',
    'Activate',
    key3,
    CheatMenu.resetGameSpeed,
  );
  CheatMenu.appendDescription('High values may cause frame drops.');
};

export const menu = {
  name: 'Game Speed',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendGameSpeed(4, 5, 6);
  },
};
