import {
  DICTIONARY_SECTIONS,
  toDictionaryFile,
  type DictionaryFile,
  type DictionarySection,
} from '@src/shared/game/dictionary.ts';
import type { ImportResult } from '@src/shared/game/dictionarySources.ts';
import {
  withCustomNames,
  type NameOverrides,
} from '@src/shared/game/variableNames.ts';

export type Message = { ok: boolean; text: string };

export const namesCount = (count: number): string =>
  `${count} name${count === 1 ? '' : 's'}`;

/**
 * Everything the menus show, the user's own variable names included, so the
 * file can be shared or put next to the plugin of another install.
 */
export function buildExport(
  labels: Readonly<Record<DictionarySection, readonly (string | null)[]>>,
  overrides: NameOverrides,
  game?: string,
): { file: DictionaryFile; count: number } {
  const file = toDictionaryFile(
    {
      variables: withCustomNames(labels.variables, overrides),
      switches: labels.switches,
    },
    game,
  );
  const count = DICTIONARY_SECTIONS.reduce(
    (sum, section) => sum + Object.keys(file[section]?.byId ?? {}).length,
    0,
  );
  return { file, count };
}

export function exportMessage(count: number, copied: boolean): Message {
  if (!copied) return { ok: false, text: 'Could not copy to the clipboard' };
  return { ok: true, text: `Copied ${namesCount(count)} to the clipboard` };
}

export function parseJson(text: string): { value: unknown } | undefined {
  try {
    return { value: JSON.parse(text) };
  } catch {
    return undefined;
  }
}

const fileGame = (raw: unknown): string | undefined =>
  raw !== null &&
  typeof raw === 'object' &&
  typeof (raw as { game?: unknown }).game === 'string'
    ? (raw as { game: string }).game
    : undefined;

/**
 * A dictionary of another game is imported anyway — a renamed or translated
 * release keeps the ids — but the user is told.
 */
export function importMessage(
  name: string,
  raw: unknown,
  result: ImportResult,
  currentGame?: string,
): Message {
  if (!result.ok) return { ok: false, text: `${name}: ${result.error}` };
  let text = `Imported ${namesCount(result.size)} from ${name}`;
  if (result.warnings > 0) {
    const count = result.warnings;
    text += `, ${count} warning${count === 1 ? '' : 's'} (see the console, F8)`;
  }
  const game = fileGame(raw);
  if (game !== undefined && currentGame !== undefined && game !== currentGame) {
    text += `. It was written for "${game}"`;
  }
  return { ok: true, text };
}
