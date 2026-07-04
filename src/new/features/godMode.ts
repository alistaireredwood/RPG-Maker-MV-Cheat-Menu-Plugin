import CheatMenu from '../CheatMenu.ts';

// Interval ids live here (module scope) instead of on the actor, so they are
// never serialized into save files.
const godModeIntervals: Record<number, ReturnType<typeof setInterval> | undefined> = {};

function isGodModeActive(actor: Game_Actor): boolean {
  return CheatMenu.godModeActors.includes(actor.actorId());
}

// The overrides check CheatMenu.godModeActors (not a flag on the actor), so a
// stale flag inside a save file can never claim god mode is on. The *Backup
// properties are functions, which JsonEx drops on save — so after loading a
// save the actor is back to plain prototype methods and this re-installs.
function applyGodModeOverrides(actor: CheatMenu_Game_Actor): void {
  if (actor.gainHpBackup) {
    return; // already installed
  }

  actor.gainHpBackup = actor.gainHp;
  actor.setHpBackup = actor.setHp;
  actor.gainMpBackup = actor.gainMp;
  actor.setMpBackup = actor.setMp;
  actor.gainTpBackup = actor.gainTp;
  actor.setTpBackup = actor.setTp;

  actor.gainHp = function (this: CheatMenu_Game_Actor, value: number): void {
    const finalValue = isGodModeActive(this) ? this.mhp : value;
    if (this.gainHpBackup) {
      this.gainHpBackup.call(this, finalValue);
    }
  };

  actor.setHp = function (this: CheatMenu_Game_Actor, hp: number): void {
    const finalHp = isGodModeActive(this) ? this.mhp : hp;
    if (this.setHpBackup) {
      this.setHpBackup.call(this, finalHp);
    }
  };

  actor.gainMp = function (this: CheatMenu_Game_Actor, value: number): void {
    const finalValue = isGodModeActive(this) ? this.mmp : value;
    if (this.gainMpBackup) {
      this.gainMpBackup.call(this, finalValue);
    }
  };

  actor.setMp = function (this: CheatMenu_Game_Actor, mp: number): void {
    const finalMp = isGodModeActive(this) ? this.mmp : mp;
    if (this.setMpBackup) {
      this.setMpBackup.call(this, finalMp);
    }
  };

  actor.gainTp = function (this: CheatMenu_Game_Actor, value: number): void {
    const finalValue = isGodModeActive(this) ? this.maxTp() : value;
    if (this.gainTpBackup) {
      this.gainTpBackup.call(this, finalValue);
    }
  };

  actor.setTp = function (this: CheatMenu_Game_Actor, tp: number): void {
    const finalTp = isGodModeActive(this) ? this.maxTp() : tp;
    if (this.setTpBackup) {
      this.setTpBackup.call(this, finalTp);
    }
  };
}

function removeGodModeOverrides(actor: CheatMenu_Game_Actor): void {
  if (typeof actor.gainHpBackup === 'function') {
    actor.gainHp = actor.gainHpBackup;
    actor.gainHpBackup = undefined;
  }
  if (typeof actor.setHpBackup === 'function') {
    actor.setHp = actor.setHpBackup;
    actor.setHpBackup = undefined;
  }
  if (typeof actor.gainMpBackup === 'function') {
    actor.gainMp = actor.gainMpBackup;
    actor.gainMpBackup = undefined;
  }
  if (typeof actor.setMpBackup === 'function') {
    actor.setMp = actor.setMpBackup;
    actor.setMpBackup = undefined;
  }
  if (typeof actor.gainTpBackup === 'function') {
    actor.gainTp = actor.gainTpBackup;
    actor.gainTpBackup = undefined;
  }
  if (typeof actor.setTpBackup === 'function') {
    actor.setTp = actor.setTpBackup;
    actor.setTpBackup = undefined;
  }
}

function startGodModeInterval(actor: CheatMenu_Game_Actor): void {
  const actorId = actor.actorId();

  const existing = godModeIntervals[actorId];
  if (existing) {
    clearInterval(existing);
  }

  godModeIntervals[actorId] = setInterval(() => {
    // stop ticking when god mode is off, or when this actor object was
    // replaced by loading another save
    if (isGodModeActive(actor) && $gameActors.actor(actorId) === actor) {
      actor.gainHp(actor.mhp);
      actor.gainMp(actor.mmp);
      actor.gainTp(actor.maxTp());
    } else {
      const interval = godModeIntervals[actorId];
      if (interval) {
        clearInterval(interval);
        godModeIntervals[actorId] = undefined;
      }
    }
  }, 100);
}

CheatMenu.godMode = (actor) => {
  const actorId = actor.actorId();
  if (!CheatMenu.godModeActors.includes(actorId)) {
    CheatMenu.godModeActors = [...CheatMenu.godModeActors, actorId];
  }
  applyGodModeOverrides(actor);
  startGodModeInterval(actor);
};

CheatMenu.godMode_off = (actor) => {
  const actorId = actor.actorId();
  CheatMenu.godModeActors = CheatMenu.godModeActors.filter((id) => id !== actorId);
  removeGodModeOverrides(actor);

  const interval = godModeIntervals[actorId];
  if (interval) {
    clearInterval(interval);
    godModeIntervals[actorId] = undefined;
  }
};

// Called after CheatMenu state is restored from $gameSystem.CheatMenu:
// clears intervals pointing at actors from a previous session and re-installs
// god mode on the freshly loaded actor objects.
CheatMenu.reapplyGodMode = () => {
  for (const key in godModeIntervals) {
    const interval = godModeIntervals[key];
    if (interval) {
      clearInterval(interval);
      godModeIntervals[key] = undefined;
    }
  }

  // clone: breaks aliasing with initialValues / $gameSystem.CheatMenu arrays
  CheatMenu.godModeActors = Array.isArray(CheatMenu.godModeActors)
    ? [...CheatMenu.godModeActors]
    : [];

  for (const actorId of CheatMenu.godModeActors) {
    const actor = $gameActors.actor(actorId) as CheatMenu_Game_Actor | null;
    if (actor) {
      applyGodModeOverrides(actor);
      startGodModeInterval(actor);
    }
  }
};

CheatMenu.toggleGodMode = function () {
  const actorInstance = $gameActors.actor(CheatMenu.cheatSelectedActor);

  if (actorInstance) {
    const cheatActor = actorInstance as CheatMenu_Game_Actor;

    if (!isGodModeActive(cheatActor)) {
      CheatMenu.godMode(cheatActor);
      if (SoundManager) SoundManager.playSystemSound(1);
    } else {
      CheatMenu.godMode_off(cheatActor);
      if (SoundManager) SoundManager.playSystemSound(2);
    }

    CheatMenu.updateMenu();
  }
};

CheatMenu.appendGodmodeStatus = function () {
  let statusHtml;

  const actorInstance = $gameActors.actor(CheatMenu.cheatSelectedActor);

  if (actorInstance && isGodModeActive(actorInstance)) {
    statusHtml = '<span class="status-on">on</span>';
  } else {
    statusHtml = '<span class="status-off">off</span>';
  }

  CheatMenu.appendCheat('Status:', statusHtml, 6, CheatMenu.toggleGodMode);
};

export const menu = {
  name: 'God Mode',
  render: () => {
    CheatMenu.appendCheatTitle();
    CheatMenu.appendActorSelection(4, 5);
    CheatMenu.appendGodmodeStatus();
  },
};
