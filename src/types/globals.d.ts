declare class Game_System {
  /** persisted cheat menu state — see core/persistence.ts */
  CheatMenu?: Record<string, unknown>;
  onBeforeSave(): void;
}

// the vendored MV typings have no scenes — only what bootHook.ts patches
declare class Scene_Boot {
  start(): void;
}
