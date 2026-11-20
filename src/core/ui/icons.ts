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

export const ICON_FILTER = svgIcon(
  '<path d="M2 3h12l-4.5 5.5V13l-3 1.5v-6Z"/>',
);

export const ICON_EDIT = svgIcon(
  '<path d="M11 2.5 13.5 5 6 12.5 3 13l.5-3Z"/><path d="M9.5 4 12 6.5"/>',
);

export const ICON_CHEVRON_LEFT = svgIcon('<path d="M10 3.5 5.5 8l4.5 4.5"/>');

export const ICON_INFO = svgIcon(
  '<circle cx="8" cy="8" r="6"/><path d="M8 7.5V11"/><path d="M8 5h.01"/>',
);
