declare interface ICheatMenu {
  initialized: boolean;
  isCheatMenuOpen: boolean;
  isOverlayOpenable: boolean;
  position: number;
  menu_update_timer: NodeJS.Timeout;

  cheat_selected: number;
  cheat_selected_actor: number;
  amounts: number[];
  amount_index: number;

  saved_positions: SavedPosition[];

  // Methods
  godMode?: (actor: CheatMenu_Game_Actor) => void;
  godMode_off?: (actor: CheatMenu_Game_Actor) => void;
  initialize?: () => void;
  update_menu?: () => void;
  append_title?: (title: string) => void;

  initialValues: Partial<ICheatMenu>;
}

declare class CheatMenu_Game_Actor extends Game_Actor {
  godMode?: boolean;
  godMode_interval?: NodeJS.Timeout;

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
  CheatMenu?: ICheatMenu | {};
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
