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
  /** persisted cheat menu state — see core/persistence.ts */
  CheatMenu?: Record<string, unknown>;
  onBeforeSave(): void;
}
