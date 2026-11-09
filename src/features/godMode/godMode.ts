import { patchMethod } from '../../core/engine/patch.ts';

/** Persisted: ids of actors with god mode on. */
export const godModeState = {
  actors: [] as number[],
};

const REFILL_INTERVAL_MS = 100;

// Restore functions / interval ids live here (module scope) instead of on the
// actor, so they are never serialized into save files.
const installed = new WeakMap<Game_Actor, () => void>();
const intervals = new Map<number, ReturnType<typeof setInterval>>();

export function isGodModeActive(actor: Game_Actor): boolean {
  return godModeState.actors.includes(actor.actorId());
}

/**
 * Per-actor method overrides. They check `godModeState` on every call (not a
 * flag on the actor), so a stale flag inside a save file can never claim god
 * mode is on. Overrides are own properties of the actor object, which JsonEx
 * drops on save — a loaded actor is a fresh object and gets them reinstalled.
 */
function installOverrides(actor: Game_Actor): void {
  if (installed.has(actor)) return;

  const full =
    (max: (a: Game_Actor) => number) =>
    (original: (this: Game_Actor, value: number) => void) =>
      function (this: Game_Actor, value: number) {
        original.call(this, isGodModeActive(this) ? max(this) : value);
      };
  const mhp = (a: Game_Actor) => a.mhp;
  const mmp = (a: Game_Actor) => a.mmp;
  const mtp = (a: Game_Actor) => a.maxTp();

  const restores = [
    patchMethod(actor, 'gainHp', full(mhp)),
    patchMethod(actor, 'setHp', full(mhp)),
    patchMethod(actor, 'gainMp', full(mmp)),
    patchMethod(actor, 'setMp', full(mmp)),
    patchMethod(actor, 'gainTp', full(mtp)),
    patchMethod(actor, 'setTp', full(mtp)),
    // skills are free: also usable when they cost more than max MP/TP
    patchMethod(
      actor,
      'canPaySkillCost',
      (original) =>
        function (this: Game_Actor, skill: DataSkill) {
          return isGodModeActive(this) || original.call(this, skill);
        },
    ),
    patchMethod(
      actor,
      'paySkillCost',
      (original) =>
        function (this: Game_Actor, skill: number) {
          if (!isGodModeActive(this)) original.call(this, skill);
        },
    ),
  ];

  installed.set(actor, () => restores.forEach((restore) => restore()));
}

function removeOverrides(actor: Game_Actor): void {
  installed.get(actor)?.();
  installed.delete(actor);
}

function stopRefill(actorId: number): void {
  clearInterval(intervals.get(actorId));
  intervals.delete(actorId);
}

/** Keeps HP/MP/TP topped up (covers damage that bypasses gain/set). */
function startRefill(actor: Game_Actor): void {
  const actorId = actor.actorId();
  stopRefill(actorId);

  intervals.set(
    actorId,
    setInterval(() => {
      // stop ticking when god mode is off, or when this actor object was
      // replaced by loading another save
      if (isGodModeActive(actor) && $gameActors.actor(actorId) === actor) {
        actor.gainHp(actor.mhp);
        actor.gainMp(actor.mmp);
        actor.gainTp(actor.maxTp());
      } else {
        stopRefill(actorId);
      }
    }, REFILL_INTERVAL_MS),
  );
}

export function enableGodMode(actor: Game_Actor): void {
  const actorId = actor.actorId();
  if (!godModeState.actors.includes(actorId)) {
    godModeState.actors = [...godModeState.actors, actorId];
  }
  installOverrides(actor);
  startRefill(actor);
}

export function disableGodMode(actor: Game_Actor): void {
  const actorId = actor.actorId();
  godModeState.actors = godModeState.actors.filter((id) => id !== actorId);
  removeOverrides(actor);
  stopRefill(actorId);
}

/**
 * After the state was restored from a save: drops intervals pointing at
 * actors of a previous session and installs god mode on the (fresh) actor
 * objects of the loaded game.
 */
export function reapplyGodMode(): void {
  for (const actorId of [...intervals.keys()]) stopRefill(actorId);

  if (!Array.isArray(godModeState.actors)) godModeState.actors = [];

  for (const actorId of godModeState.actors) {
    const actor = $gameActors.actor(actorId);
    if (actor) {
      installOverrides(actor);
      startRefill(actor);
    }
  }
}
