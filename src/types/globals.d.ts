declare class Cheat_Menu_Game_Actor extends Game_Actor {
  god_mode?: boolean;
  god_mode_interval?: NodeJS.Timeout;

  /** Backup of Game_Battler.prototype.gainHp */
  gainHP_bkup?: (value: number) => void;

  /** Backup of Game_BattlerBase.prototype.setHp */
  setHp_bkup?: (hp: number) => void;

  /** Backup of Game_Battler.prototype.gainMp */
  gainMp_bkup?: (value: number) => void;

  /** Backup of Game_BattlerBase.prototype.setMp */
  setMp_bkup?: (mp: number) => void;

  /** Backup of Game_Battler.prototype.gainTp */
  gainTp_bkup?: (value: number) => void;

  /** Backup of Game_BattlerBase.prototype.setTp */
  setTp_bkup?: (tp: number) => void;

  /** Backup of Game_BattlerBase.prototype.paySkillCost */
  // paySkillCost_bkup: (skill: DataSkill) => void; // Use DataSkill or RPG.Skill based on your RMMV types
}

declare class DataManager {
  static default_loadGame?: (savefileId: number) => boolean;
  static default_setupNewGame?: () => void;
  static default_saveGame?: (savefileId: number) => boolean;
}
