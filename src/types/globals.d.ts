declare interface ICheatMenu {
  initialized: boolean;
  cheat_menu_open: boolean;
  overlay_openable: boolean;
  position: number;
  menu_update_timer: NodeJS.Timeout;

  cheat_selected: number;
  cheat_selected_actor: number; // This is an Actor ID
  amounts: number[];
  amount_index: number;

  saved_positions: SavedPosition[];

  // Methods
  god_mode?: (actor: Cheat_Menu_Game_Actor) => void;
  god_mode_off?: (actor: Cheat_Menu_Game_Actor) => void;
  initialize?: () => void;
  update_menu?: () => void;
  append_title?: (title: string) => void;

  initial_values: Partial<ICheatMenu>;
}

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

declare class Game_System {
  Cheat_Menu?: ICheatMenu | {};
}

declare class DataManager {
  static default_loadGame?: (savefileId: number) => boolean;
  static default_setupNewGame?: () => void;
  static default_saveGame?: (savefileId: number) => boolean;
  // don't know why I needed to re-declare those
  static loadGame: ((savefileId: number) => boolean) | undefined;
  static setupNewGame: () => void;
  static saveGame: ((savefileId: number) => boolean) | undefined;
}
