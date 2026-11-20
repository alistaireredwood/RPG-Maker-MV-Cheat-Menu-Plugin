import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Control = typeof import('./speedControl.ts');

let control: Control;
let log: string[];
let changing: boolean;
let started: boolean;

const fakeSceneManager = () => ({
  updateInputData() {
    log.push('input');
  },
  updateScene() {
    log.push('scene');
  },
  isSceneChanging: () => changing,
  isCurrentSceneStarted: () => started,
});

const fakeInput = () => ({
  _onKeyUp(event: KeyboardEvent) {
    log.push(`up:${event.key}`);
  },
});

/** One pass of the engine's main loop: input first, then the scene. */
function frame(): string[] {
  log = [];
  SceneManager.updateInputData();
  SceneManager.updateScene();
  return log;
}

const keyUp = (key: string) => {
  log = [];
  Input._onKeyUp({ key } as KeyboardEvent);
  return log;
};

declare const Input: { _onKeyUp(event: KeyboardEvent): void };

beforeEach(async () => {
  log = [];
  changing = false;
  started = true;
  vi.resetModules();
  vi.stubGlobal('SceneManager', fakeSceneManager());
  vi.stubGlobal('Input', fakeInput());
  control = await import('./speedControl.ts');
  control.installSpeedControl();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('speed control', () => {
  it('x1 leaves the main loop as it is', () => {
    expect(frame()).toEqual(['input', 'scene']);
    expect(keyUp('a')).toEqual(['up:a']);
  });

  it('speeds up with extra input + scene updates in the same frame', () => {
    control.setSpeed(3);
    expect(frame()).toEqual([
      'input',
      'scene',
      'input',
      'scene',
      'input',
      'scene',
    ]);
  });

  it('stops extra updates at a scene change', () => {
    control.setSpeed(3);
    log = [];
    SceneManager.updateInputData();
    changing = true;
    SceneManager.updateScene();
    expect(log).toEqual(['input', 'scene']);
  });

  it('slows down by skipping input and scene together', () => {
    control.setSpeed(0.5);
    expect(frame()).toEqual([]);
    expect(frame()).toEqual(['input', 'scene']);
  });

  it('holds key releases until the next update, so a quick tap is seen', () => {
    control.setSpeed(0.25);
    frame();
    expect(keyUp('a')).toEqual([]);
    expect(frame()).toEqual([]);
    frame();
    expect(frame()).toEqual(['input', 'up:a', 'scene']);
  });

  it('releases held keys when the speed leaves slow motion', () => {
    control.setSpeed(0.5);
    keyUp('a');
    log = [];
    control.setSpeed(1);
    expect(log).toEqual(['up:a']);
  });

  it('slowed down, a changing or new scene still gets its updates', () => {
    control.setSpeed(0.25);
    changing = true;
    // input still waits for the next real update
    expect(frame()).toEqual(['scene']);
    changing = false;
    started = false;
    expect(frame()).toEqual(['scene']);
  });
});
