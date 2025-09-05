import CheatMenu from '../CheatMenu.ts';

// enable god mode for an actor
CheatMenu.godMode = (actor) => {
  if (!actor.godMode) {
    actor.godMode = true;

    // Store backups
    actor.gainHP_bkup = actor.gainHp;
    actor.setHp_bkup = actor.setHp;
    actor.gainMp_bkup = actor.gainMp;
    actor.setMp_bkup = actor.setMp;
    actor.gainTp_bkup = actor.gainTp;
    actor.setTp_bkup = actor.setTp;
    // actor.paySkillCost_bkup = actor.paySkillCost;

    // Override methods
    actor.gainHp = function (this, value: number): void {
      // 'this' needs to be explicitly typed in function expressions assigned to object properties
      // if you intend to use 'this' with its original context.
      let finalValue = value;
      if (this.godMode) {
        // 'this' refers to the Game_Actor instance
        finalValue = this.mhp; // mhp is on Game_BattlerBase
      }
      // Call the original/backup method, ensuring 'this' context is preserved
      if (this.gainHP_bkup) {
        this.gainHP_bkup.call(this, finalValue);
      }
    };

    actor.setHp = function (this, hp: number): void {
      let finalHp = hp;
      if (this.godMode) {
        finalHp = this.mhp;
      }
      if (this.setHp_bkup) {
        this.setHp_bkup.call(this, finalHp);
      }
    };

    actor.gainMp = function (this, value: number): void {
      let finalValue = value;
      if (this.godMode) {
        finalValue = this.mmp; // mmp is on Game_BattlerBase
      }
      if (this.gainMp_bkup) {
        this.gainMp_bkup.call(this, finalValue);
      }
    };

    actor.setMp = function (this, mp: number): void {
      let finalMp = mp;
      if (this.godMode) {
        finalMp = this.mmp;
      }
      if (this.setMp_bkup) {
        this.setMp_bkup.call(this, finalMp);
      }
    };

    actor.gainTp = function (this, value: number): void {
      let finalValue = value;
      if (this.godMode) {
        finalValue = this.maxTp(); // maxTp is on Game_BattlerBase
      }
      if (this.gainTp_bkup) {
        this.gainTp_bkup.call(this, finalValue);
      }
    };

    actor.setTp = function (this, tp: number): void {
      let finalTp = tp;
      if (this.godMode) {
        finalTp = this.maxTp();
      }
      if (this.setTp_bkup) {
        this.setTp_bkup.call(this, finalTp);
      }
    };

    // actor.paySkillCost = function (this: Game_Actor, skill: DataSkill): void {
    //   // The parameter `skill` is part of the original signature,
    //   // even if the godMode override doesn't use it.
    //   if (this.godMode) {
    //     // Do nothing, cost is free
    //     return;
    //   }
    //   // Call the original if godMode is off
    //   if (this.paySkillCost_bkup) {
    //     this.paySkillCost_bkup.call(this, skill);
    //   }
    // };

    // Clear existing interval before setting a new one to prevent duplicates
    if (actor.godMode_interval) {
      clearInterval(actor.godMode_interval);
    }

    actor.godMode_interval = setInterval(() => {
      // Use arrow function for setInterval to lexically bind 'actor' if needed,
      // or ensure 'actor' is correctly captured if using a 'function() {}'
      // The original JS code was fine as 'actor' was from the outer scope.
      if (actor.godMode) {
        // 'actor' is from the outer scope of CM.godMode function
        actor.gainHp(actor.mhp); // This will call the *newly assigned* actor.gainHp
        actor.gainMp(actor.mmp);
        actor.gainTp(actor.maxTp());
      } else {
        // God mode was turned off externally, clear interval
        if (actor.godMode_interval) {
          clearInterval(actor.godMode_interval);
          actor.godMode_interval = undefined; // Clear the ID
        }
      }
    }, 100);
  }
};

// disable god mode for an actor
CheatMenu.godMode_off = (actor) => {
  if (actor.godMode) {
    actor.godMode = false;

    if (typeof actor.gainHP_bkup === 'function') {
      actor.gainHp = actor.gainHP_bkup;
    }

    if (typeof actor.setHp_bkup === 'function') {
      actor.setHp = actor.setHp_bkup;
    }

    if (typeof actor.gainMp_bkup === 'function') {
      actor.gainMp = actor.gainMp_bkup;
    }

    if (typeof actor.setMp_bkup === 'function') {
      actor.setMp = actor.setMp_bkup;
    }

    if (typeof actor.gainTp_bkup === 'function') {
      actor.gainTp = actor.gainTp_bkup;
    }

    if (typeof actor.setTp_bkup === 'function') {
      actor.setTp = actor.setTp_bkup;
    }

    // if (typeof actor.paySkillCost_bkup === 'function') {
    //   actor.paySkillCost = actor.paySkillCost_bkup;
    // }

    if (actor.godMode_interval) {
      clearInterval(actor.godMode_interval);
      actor.godMode_interval = undefined;
    }
  }
};

// Handler for the godMode cheat
CheatMenu.toggleGodMode = function () {
  const actorInstance = $gameActors.actor(CheatMenu.cheat_selected_actor);

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

    CheatMenu.update_menu();
  }
};

// Append the godMode cheat to the menu
CheatMenu.append_godmode_status = function () {
  let status_html;

  const actorInstance = $gameActors.actor(CheatMenu.cheat_selected_actor);

  if (actorInstance && (actorInstance as CheatMenu_Game_Actor).godMode) {
    status_html = '<span class="status-on">on</span>';
  } else {
    status_html = '<span class="status-off">off</span>';
  }

  CheatMenu.append_cheat('Status:', status_html, 6, CheatMenu.toggleGodMode);
};

CheatMenu.menus.splice(0, 0, function () {
  CheatMenu.append_cheat_title('God Mode');
  CheatMenu.append_actor_selection(4, 5);

  CheatMenu.append_godmode_status();
});
