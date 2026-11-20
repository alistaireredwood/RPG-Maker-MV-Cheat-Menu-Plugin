import { getMenuDocument } from './popout.ts';

export type PickedFile = { name: string; text: string };

// A cancelled dialog fires no event to clean up after, so the input of the
// previous pick is removed by the next one: at most one stays behind.
let lastInput: HTMLInputElement | null = null;

/**
 * Opens the system file dialog. Call it from a click or key handler: the
 * browser opens the dialog only in answer to the user. Nothing is reported
 * when the dialog is cancelled, since no event says so.
 */
export function pickTextFile(
  accept: string,
  onPicked: (file: PickedFile) => void,
  onError: (error: unknown) => void,
): void {
  // in the overlay's document, so the dialog opens over the pop-out window
  const doc = getMenuDocument();
  lastInput?.remove();
  const input = doc.createElement('input');
  lastInput = input;
  input.type = 'file';
  input.accept = accept;
  input.style.display = 'none';
  input.addEventListener('change', () => {
    const file = input.files?.[0];
    input.remove();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      onPicked({ name: file.name, text: String(reader.result) });
    reader.onerror = () => onError(reader.error);
    reader.readAsText(file);
  });
  // attached because some Chromium versions ignore click() on a detached input
  doc.body.appendChild(input);
  input.click();
}
