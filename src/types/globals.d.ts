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
  CheatMenu?: ICheatMenu | {};
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

// Minimal NW.js typings — only what core/popout.ts uses
declare interface NWWindow {
  window: Window;
  on(event: 'loaded' | 'closed' | 'close' | string, cb: (...args: any[]) => void): void;
  close(force?: boolean): void;
  focus(): void;
  setAlwaysOnTop(top: boolean): void;
}

declare const nw: {
  Window: {
    open(url: string, options: Record<string, unknown>, callback: (win: NWWindow) => void): void;
    get(win?: Window): NWWindow;
  };
};
