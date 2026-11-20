// The engine has no game speed of its own: the speed is the number of logic
// updates (SceneManager.updateScene) run per rendered frame. Faster runs extra
// updates in the same frame, slower skips updates in some frames. Audio and
// rendering are unaffected.

import { patchMethod } from '@src/core/engine/patch.ts';
import { NORMAL_SPEED, planFrame } from './speeds.ts';

type KeyInput = { _onKeyUp(event: KeyboardEvent): void };

let speed = NORMAL_SPEED;
let pending = 0;
/** decided by the input update, which runs right before the scene update */
let frameUpdates = 1;

let originalInputUpdate: (() => void) | null = null;
let originalKeyUp: ((event: KeyboardEvent) => void) | null = null;
const heldKeyUps: KeyboardEvent[] = [];

// A key pressed and released between two slowed-down updates would never be
// seen by the game, so releases wait for the next update.
const slowMotion = () => speed < 1;

function releaseHeldKeys(): void {
  const keyUp = originalKeyUp;
  if (!keyUp) return;
  for (const event of heldKeyUps.splice(0)) keyUp.call(Input, event);
}

export const currentSpeed = (): number => speed;

export function setSpeed(next: number): void {
  speed = next;
  pending = 0;
  frameUpdates = 1;
  if (!slowMotion()) releaseHeldKeys();
}

export function installSpeedControl(): void {
  patchMethod(Input as unknown as KeyInput, '_onKeyUp', (original) => {
    originalKeyUp = original;
    return function (this: KeyInput, event: KeyboardEvent) {
      if (slowMotion()) heldKeyUps.push(event);
      else original.call(this, event);
    };
  });

  patchMethod(SceneManager, 'updateInputData', (original) => {
    originalInputUpdate = () => original.call(SceneManager);
    return function (this: typeof SceneManager) {
      const plan = planFrame(pending, speed);
      pending = plan.pending;
      frameUpdates = plan.updates;
      // slowed down, input waits for the frame that updates the game
      if (frameUpdates > 0) {
        original.call(this);
        releaseHeldKeys();
      }
    };
  });

  patchMethod(SceneManager, 'updateScene', (original) => {
    return function (this: typeof SceneManager) {
      if (frameUpdates === 0) {
        // a scene that is changing or not started yet would stay black
        if (this.isSceneChanging() || !this.isCurrentSceneStarted()) {
          original.call(this);
        }
        return;
      }
      original.call(this);
      for (let i = 1; i < frameUpdates; i++) {
        // a pending scene change must go through the engine's main loop first
        if (this.isSceneChanging()) {
          pending = 0;
          break;
        }
        // otherwise one key press would be "triggered" once per extra update
        originalInputUpdate?.();
        original.call(this);
      }
    };
  });
}
