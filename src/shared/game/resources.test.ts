import { describe, expect, it } from 'vitest';
import { changeResource } from './resources.ts';

const battler = (hp: number) => {
  const b = {
    hp,
    mp: 5,
    tp: 5,
    mhp: 101,
    mmp: 51,
    maxTp: () => 100,
    setHp: (v: number) => (b.hp = v),
    setMp: (v: number) => (b.mp = v),
    setTp: (v: number) => (b.tp = v),
  };
  return b;
};
const asBattlers = (list: ReturnType<typeof battler>[]) =>
  list as unknown as Game_Battler[];

describe('changeResource', () => {
  it('sets 0 / 1 / half / full', () => {
    const b = battler(10);
    changeResource(asBattlers([b]), 'HP', 'zero', false);
    expect(b.hp).toBe(0);
    changeResource(asBattlers([b]), 'HP', 'one', false);
    expect(b.hp).toBe(1);
    changeResource(asBattlers([b]), 'MP', 'half', false);
    expect(b.mp).toBe(25);
    changeResource(asBattlers([b]), 'TP', 'full', false);
    expect(b.tp).toBe(100);
  });

  it('half HP never drops to 0', () => {
    const b = battler(10);
    b.mhp = 1;
    changeResource(asBattlers([b]), 'HP', 'half', false);
    expect(b.hp).toBe(1);
  });

  it('aliveOnly skips dead battlers; empty troop slots are ignored', () => {
    const alive = battler(10);
    const dead = battler(0);
    const troop = [alive, null, dead] as unknown as Game_Battler[];
    changeResource(troop, 'HP', 'full', true);
    expect(alive.hp).toBe(101);
    expect(dead.hp).toBe(0);
    changeResource(troop, 'HP', 'full', false);
    expect(dead.hp).toBe(101);
  });
});
