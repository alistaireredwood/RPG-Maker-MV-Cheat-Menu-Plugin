declare interface ICheatMenu {
  initialized: boolean;
  cheat_menu_open: boolean;
  overlay_openable: boolean;
  position: number;
  menu_update_timer: NodeJS.Timeout;

  cheat_selected: number;
  cheat_selected_actor: number;
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

  gainHP_bkup?: (value: number) => void;
  setHp_bkup?: (hp: number) => void;

  gainMp_bkup?: (value: number) => void;
  setMp_bkup?: (mp: number) => void;

  gainTp_bkup?: (value: number) => void;
  setTp_bkup?: (tp: number) => void;

  /** Backup of Game_BattlerBase.prototype.paySkillCost */
  // paySkillCost_bkup: (skill: DataSkill) => void;
}

declare class Game_System {
  Cheat_Menu?: ICheatMenu | {};
}

declare class DataManager {
  static default_loadGame?: (saveFileId: number) => boolean;
  static default_setupNewGame?: () => void;
  static default_saveGame?: (saveFileId: number) => boolean;
  // don't know why I needed to re-declare those
  static loadGame: ((saveFileId: number) => boolean) | undefined;
  static setupNewGame: () => void;
  static saveGame: ((saveFileId: number) => boolean) | undefined;
}
