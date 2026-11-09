declare class Game_System {
  /** persisted cheat menu state — see core/persistence.ts */
  CheatMenu?: Record<string, unknown>;
  onBeforeSave(): void;
}
