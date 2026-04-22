console.log('[CheatMenu] Loading feature: godMode.ts');

import CheatMenu from '../CheatMenu.ts';

CheatMenu.godMode = (actor) => {
  if (!actor.godMode) {
    actor.godMode = true;

    actor.gainHpBackup = actor.gainHp;
    actor.setHpBackup = actor.setHp;
    actor.gainMpBackup = actor.gainMp;
    actor.setMpBackup = actor.setMp;
    actor.gainTpBackup = actor.gainTp;
    actor.setTpBackup = actor.setTp;

    actor.gainHp = function (this, value: number): void {
      let finalValue = value;
      if (this.godMode) {
        finalValue = this.mhp;
      }
      if (this.gainHpBackup) {
        this.gainHpBackup.call(this, finalValue);
      }
    };

    actor.setHp = function (this, hp: number): void {
      let finalHp = hp;
      if (this.godMode) {
        finalHp = this.mhp;
      }
      if (this.setHpBackup) {
        this.setHpBackup.call(this, finalHp);
      }
    };

    actor.gainMp = function (this, value: number): void {
      let finalValue = value;
      if (this.godMode) {
        finalValue = this.mmp;
      }
      if (this.gainMpBackup) {
        this.gainMpBackup.call(this, finalValue);
      }
    };

    actor.setMp = function (this, mp: number): void {
      let finalMp = mp;
      if (this.godMode) {
        finalMp = this.mmp;
      }
      if (this.setMpBackup) {
        this.setMpBackup.call(this, finalMp);
      }
    };

    actor.gainTp = function (this, value: number): void {
      let finalValue = value;
      if (this.godMode) {
        finalValue = this.maxTp();
      }
      if (this.gainTpBackup) {
        this.gainTpBackup.call(this, finalValue);
      }
    };

    actor.setTp = function (this, tp: number): void {
      let finalTp = tp;
      if (this.godMode) {
        finalTp = this.maxTp();
      }
      if (this.setTpBackup) {
        this.setTpBackup.call(this, finalTp);
      }
    };

    if (actor.godModeInterval) {
      clearInterval(actor.godModeInterval);
    }

    actor.godModeInterval = setInterval(() => {
      if (actor.godMode) {
        actor.gainHp(actor.mhp);
        actor.gainMp(actor.mmp);
        actor.gainTp(actor.maxTp());
      } else {
        if (actor.godModeInterval) {
          clearInterval(actor.godModeInterval);
          actor.godModeInterval = undefined;
        }
      }
    }, 100);
  }
};

CheatMenu.godMode_off = (actor) => {
  if (actor.godMode) {
    actor.godMode = false;

    if (typeof actor.gainHpBackup === 'function') {
      actor.gainHp = actor.gainHpBackup;
    }

    if (typeof actor.setHpBackup === 'function') {
      actor.setHp = actor.setHpBackup;
    }

    if (typeof actor.gainMpBackup === 'function') {
      actor.gainMp = actor.gainMpBackup;
    }

    if (typeof actor.setMpBackup === 'function') {
      actor.setMp = actor.setMpBackup;
    }

    if (typeof actor.gainTpBackup === 'function') {
      actor.gainTp = actor.gainTpBackup;
    }

    if (typeof actor.setTpBackup === 'function') {
      actor.setTp = actor.setTpBackup;
    }

    if (actor.godModeInterval) {
      clearInterval(actor.godModeInterval);
      actor.godModeInterval = undefined;
    }
  }
};

CheatMenu.toggleGodMode = function () {
  const actorInstance = $gameActors.actor(CheatMenu.cheatSelectedActor);

  if (actorInstance) {
    const cheatActor = actorInstance as CheatMenu_Game_Actor;

    if (!cheatActor.godMode) {
      if (typeof CheatMenu.godMode === 'function') {
        CheatMenu.godMode(cheatActor);
        if (SoundManager) SoundManager.playSystemSound(1);
      }
    } else {
      if (typeof CheatMenu.godMode_off === 'function') {
        CheatMenu.godMode_off(cheatActor);
        if (SoundManager) SoundManager.playSystemSound(2);
      }
    }

    CheatMenu.updateMenu();
  }
};

CheatMenu.appendGodmodeStatus = function () {
  let statusHtml;

  const actorInstance = $gameActors.actor(CheatMenu.cheatSelectedActor);

  if (actorInstance && (actorInstance as CheatMenu_Game_Actor).godMode) {
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
