const MAX_RESULT_LENGTH = 2000;

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function formatValue(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'function')
    return `[Function ${value.name || 'anonymous'}]`;
  if (value !== null && typeof value === 'object') {
    try {
      // game objects can be circular or huge — fall back to their type name
      return JSON.stringify(value, null, 2) ?? String(value);
    } catch {
      return `[${value.constructor?.name ?? 'Object'}]`;
    }
  }
  return String(value);
}

export function formatError(e: unknown): string {
  return e instanceof Error ? `${e.name}: ${e.message}` : formatValue(e);
}

export function truncate(text: string): string {
  return text.length > MAX_RESULT_LENGTH
    ? `${text.slice(0, MAX_RESULT_LENGTH)}\n… (${text.length - MAX_RESULT_LENGTH} more chars, full result in console)`
    : text;
}
