export const onOffLabel = (on: boolean): string =>
  on
    ? '<span class="status-on">on</span>'
    : '<span class="status-off">off</span>';

export const playToggleSound = (on: boolean): void =>
  SoundManager.playSystemSound(on ? 1 : 2);
