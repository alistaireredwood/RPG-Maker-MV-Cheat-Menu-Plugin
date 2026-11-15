const NUMBER_RE = /^[+-]?(\d+\.?\d*|\.\d+)$/;

// Text stays a string: some games / plugins keep text in variables. Empty
// input means 0, the engine's value for an unset variable.
export function parseVariableInput(text: string): number | string {
  const trimmed = text.trim();
  if (trimmed === '') return 0;
  if (NUMBER_RE.test(trimmed)) return Number(trimmed);
  return text;
}
