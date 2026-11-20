import { getMenuDocument } from './popout.ts';

type NwClipboard = { set(data: string, type: 'text'): void };

function copyWithNw(text: string): boolean {
  try {
    // NW.js runtime module, not bundled
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const gui = require('nw.gui') as {
      Clipboard: { get(): NwClipboard };
    };
    gui.Clipboard.get().set(text, 'text');
    return true;
  } catch {
    return false;
  }
}

// navigator.clipboard.writeText needs Chromium 66; MV 1.6 runs 65
function copyWithSelection(text: string): boolean {
  const doc = getMenuDocument();
  // select() takes the focus, which would otherwise fall to <body>
  const focused = doc.activeElement as HTMLElement | null;
  const textarea = doc.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  doc.body.appendChild(textarea);
  textarea.select();
  try {
    return doc.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
    focused?.focus();
  }
}

/** `false` when neither NW.js nor the browser let the text through. */
export const copyToClipboard = (text: string): boolean =>
  copyWithNw(text) || copyWithSelection(text);
