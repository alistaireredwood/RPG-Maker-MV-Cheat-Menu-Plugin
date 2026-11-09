import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import feature from './index.ts';
import {
  disableGodMode,
  enableGodMode,
  godModeState,
  isGodModeActive,
  reapplyGodMode,
} from './godMode.ts';

// minimal Game_Actor: prototype methods, like the engine's
class FakeActor {
  hp = 50;
  mp = 10;
  tp = 0;
  mhp = 100;
  mmp = 40;
  paid = 0;
  private id: number;
  constructor(id: number) {
    this.id = id;
  }
  actorId() {
    return this.id;
  }
  maxTp() {
    return 100;
  }
  gainHp(v: number) {
    this.hp = Math.min(this.mhp, this.hp + v);
  }
  setHp(v: number) {
    this.hp = v;
  }
  gainMp(v: number) {
    this.mp = Math.min(this.mmp, this.mp + v);
  }
  setMp(v: number) {
    this.mp = v;
  }
  gainTp(v: number) {
    this.tp = Math.min(100, this.tp + v);
  }
  setTp(v: number) {
    this.tp = v;
  }
  canPaySkillCost() {
    return false;
  }
  paySkillCost() {
    this.paid++;
  }
}

let actors: Record<number, FakeActor>;
const asActor = (a: FakeActor) => a as unknown as Game_Actor;

beforeEach(() => {
  vi.useFakeTimers();
  actors = { 1: new FakeActor(1), 2: new FakeActor(2) };
  vi.stubGlobal('$gameActors', { actor: (id: number) => actors[id] ?? null });
  godModeState.actors = [];
});

afterEach(() => {
  for (const a of Object.values(actors)) disableGodMode(asActor(a));
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('god mode', () => {
  it('turns damage and resets into full HP/MP/TP', () => {
    const actor = actors[1];
    enableGodMode(asActor(actor));

    expect(isGodModeActive(asActor(actor))).toBe(true);
    actor.gainHp(-30);
    expect(actor.hp).toBe(100);
    actor.setMp(0);
    expect(actor.mp).toBe(40);
    actor.setTp(0);
    expect(actor.tp).toBe(100);
  });

  it('makes skills free', () => {
    const actor = actors[1];
    enableGodMode(asActor(actor));
    expect(actor.canPaySkillCost()).toBe(true);
    actor.paySkillCost();
    expect(actor.paid).toBe(0);
  });

  it('refills periodically (damage that bypasses gain/set)', () => {
    const actor = actors[1];
    enableGodMode(asActor(actor));
    actor.hp = 1; // direct write, no method
    vi.advanceTimersByTime(100);
    expect(actor.hp).toBe(100);
  });

  it('only affects the enabled actor', () => {
    enableGodMode(asActor(actors[1]));
    actors[2].gainHp(-30);
    expect(actors[2].hp).toBe(20);
  });

  it('disable restores the original behaviour', () => {
    const actor = actors[1];
    enableGodMode(asActor(actor));
    disableGodMode(asActor(actor));

    expect(godModeState.actors).toEqual([]);
    expect(Object.prototype.hasOwnProperty.call(actor, 'gainHp')).toBe(false);
    actor.gainHp(-30);
    expect(actor.hp).toBe(20);
    expect(actor.canPaySkillCost()).toBe(false);
  });

  it('overrides are own properties, never serialized flags', () => {
    enableGodMode(asActor(actors[1]));
    const saved = JSON.parse(JSON.stringify(actors[1]));
    expect(Object.keys(saved)).not.toContain('gainHp');
    expect(JSON.stringify(godModeState)).toBe('{"actors":[1]}');
  });

  it('reapply installs god mode on the actors of a freshly loaded game', () => {
    enableGodMode(asActor(actors[1]));
    // "load a save": new actor objects, state restored with actor 1
    const old = actors[1];
    actors = { 1: new FakeActor(1), 2: new FakeActor(2) };
    reapplyGodMode();

    actors[1].gainHp(-30);
    expect(actors[1].hp).toBe(100);
    // the old object's refill stopped ticking
    old.hp = 1;
    vi.advanceTimersByTime(200);
    expect(old.hp).toBe(1);
  });

  it('reapply tolerates a malformed restored list', () => {
    (godModeState as { actors: unknown }).actors = 'nope';
    expect(() => reapplyGodMode()).not.toThrow();
    expect(godModeState.actors).toEqual([]);
  });
});

describe('godMode feature', () => {
  it('persists godModeState and migrates v1 godModeActors', () => {
    expect(feature.state).toBe(godModeState);
    expect(feature.migrateV1?.({ godModeActors: [1, 4] })).toEqual({
      actors: [1, 4],
    });
    expect(feature.migrateV1?.({ godModeActors: 'x' })).toEqual({});
  });
});
