export const onOffLabel = (on: boolean): string =>
  on
    ? '<span class="status-on">true</span>'
    : '<span class="status-off">false</span>';

export const playToggleSound = (on: boolean): void =>
  SoundManager.playSystemSound(on ? 1 : 2);
