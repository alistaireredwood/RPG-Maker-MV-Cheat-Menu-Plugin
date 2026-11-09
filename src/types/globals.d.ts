declare class CheatMenu_Game_Actor extends Game_Actor {
  gainHpBackup?: (value: number) => void;
  setHpBackup?: (hp: number) => void;

  gainMpBackup?: (value: number) => void;
  setMpBackup?: (mp: number) => void;

  gainTpBackup?: (value: number) => void;
  setTpBackup?: (tp: number) => void;

  canPaySkillCostBackup?: (skill: DataSkill) => boolean;
  paySkillCostBackup?: (skill: number) => void;
}

declare class Game_System {
  /** persisted CheatMenu state (keys of CheatMenu.initialValues) */
  CheatMenu?: Record<string, unknown>;
  onBeforeSave(): void;
}

declare class DataManager {
  static default_loadGame?: (saveFileId: number) => boolean;
  static default_setupNewGame?: () => void;
  static default_saveGame?: (saveFileId: number) => boolean;
  // don't know why I needed to re-declare those
  static loadGame: ((saveFileId: number) => boolean) | undefined;
  static setupNewGame: () => void;
  static saveGame: ((saveFileId: number) => boolean) | undefined;
  static maxSavefiles(): number;
}
