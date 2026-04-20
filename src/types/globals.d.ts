declare interface ICheatMenu {
  initialized: boolean;
  isCheatMenuOpen: boolean;
  isOverlayOpenable: boolean;
  position: number;
  menuUpdateTimer: NodeJS.Timeout;

  cheatSelected: number;
  cheatSelectedActor: number;
  amounts: number[];
  amountIndex: number;

  savedPositions: SavedPosition[];

  // Methods
  godMode?: (actor: CheatMenu_Game_Actor) => void;
  godMode_off?: (actor: CheatMenu_Game_Actor) => void;
  initialize?: () => void;
  updateMenu?: () => void;
  appendTitle?: (title: string) => void;

  initialValues: Partial<ICheatMenu>;
}

declare class CheatMenu_Game_Actor extends Game_Actor {
  godMode?: boolean;
  godModeInterval?: NodeJS.Timeout;

  gainHpBackup?: (value: number) => void;
  setHpBackup?: (hp: number) => void;

  gainMpBackup?: (value: number) => void;
  setMpBackup?: (mp: number) => void;

  gainTpBackup?: (value: number) => void;
  setTpBackup?: (tp: number) => void;

  /** Backup of Game_BattlerBase.prototype.paySkillCost */
  // paySkillCostBackup: (skill: DataSkill) => void;
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
