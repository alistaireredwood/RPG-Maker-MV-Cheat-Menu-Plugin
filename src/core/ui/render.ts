// Indirection so widgets can request a re-render without importing the menu
// renderer (which imports the widgets).

let renderer: (() => void) | null = null;
let updating = false;

export function setRenderer(fn: () => void): void {
  renderer = fn;
}

/** Tears down and rebuilds the whole overlay. */
export function updateMenu(): void {
  renderer?.();
}

/**
 * True while the overlay is being rebuilt. Rebuilding removes (and so blurs)
 * focused inputs — blur handlers use this to tell that apart from the user
 * clicking away.
 */
export const isUpdatingMenu = (): boolean => updating;

export function runUpdating(fn: () => void): void {
  updating = true;
  try {
    fn();
  } finally {
    updating = false;
  }
}
