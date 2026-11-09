const svgIcon = (paths: string) =>
  `<svg viewBox="0 0 16 16" width="13" height="13" fill="none" stroke="currentColor" ` +
  `stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

const BOX =
  '<path d="M12 9.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h3.5"/>';

export const ICON_POP_OUT = svgIcon(
  BOX + '<path d="M9 2h5v5"/><path d="M14 2 7.5 8.5"/>',
);

export const ICON_POP_IN = svgIcon(
  BOX + '<path d="M14 2 8 8"/><path d="M8 4v4h4"/>',
);
