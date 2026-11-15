// Minimal NW.js typings — only what core/popout.ts uses
declare interface NWWindow {
  window: Window;
  on(
    event: 'loaded' | 'closed' | 'close' | string,
    cb: (...args: any[]) => void,
  ): void;
  close(force?: boolean): void;
  focus(): void;
  setAlwaysOnTop(top: boolean): void;
}

declare const nw: {
  Window: {
    open(
      url: string,
      options: Record<string, unknown>,
      callback: (win: NWWindow) => void,
    ): void;
    get(win?: Window): NWWindow;
  };
};
