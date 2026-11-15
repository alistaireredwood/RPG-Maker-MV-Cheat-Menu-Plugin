import { afterEach, describe, expect, it, vi } from 'vitest';
import { installBootHook } from './bootHook.ts';

afterEach(() => vi.unstubAllGlobals());

describe('installBootHook', () => {
  it('runs the handler before the original Scene_Boot.start', () => {
    const calls: string[] = [];
    class Scene_Boot {
      start() {
        calls.push('start');
        return 'result';
      }
    }
    vi.stubGlobal('Scene_Boot', Scene_Boot);

    installBootHook(() => calls.push('handler'));
    const scene = new Scene_Boot();

    expect(scene.start()).toBe('result');
    expect(calls).toEqual(['handler', 'start']);
  });

  it('runs the handler only on the first boot', () => {
    const handler = vi.fn();
    class Scene_Boot {
      start() {}
    }
    vi.stubGlobal('Scene_Boot', Scene_Boot);

    installBootHook(handler);
    new Scene_Boot().start();
    new Scene_Boot().start();
    expect(handler).toHaveBeenCalledTimes(1);
  });
});
