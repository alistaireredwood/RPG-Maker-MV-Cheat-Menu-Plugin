/** Green "on" / red "off" label for toggle rows. */
export const onOffLabel = (on: boolean): string =>
  on
    ? '<span class="status-on">on</span>'
    : '<span class="status-off">off</span>';

/** Plays the "enabled" (1) or "disabled" (2) system sound. */
export const playToggleSound = (on: boolean): void =>
  SoundManager.playSystemSound(on ? 1 : 2);
