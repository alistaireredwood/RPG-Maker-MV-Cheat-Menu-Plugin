export type NumberAccept = 'integer' | 'decimal';

/**
 * Drops characters a number can't contain. The order (a stray `-` or a second
 * `.`) is left loose on purpose: the field's `onCommit` still rejects what it
 * can't parse, and a strict filter would fight the user mid-edit.
 */
export function sanitizeNumberText(text: string, accept: NumberAccept): string {
  let result = '';
  let hasDot = false;
  for (const char of text) {
    if (char >= '0' && char <= '9') result += char;
    else if (char === '-' && result === '') result = '-';
    else if (char === '.' && accept === 'decimal' && !hasDot) {
      result += char;
      hasDot = true;
    }
  }
  return result;
}
