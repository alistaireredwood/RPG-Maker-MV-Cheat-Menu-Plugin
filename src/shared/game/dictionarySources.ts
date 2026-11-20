import { definePreference } from '@src/core/preferences.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import {
  applyDictionary,
  dictionarySize,
  dictionaryToFile,
  findConflicts,
  mergeDictionaries,
  parseDictionary,
  type Dictionary,
  type DictionarySection,
} from './dictionary.ts';
import { systemNameLabels } from './systemNames.ts';

/** Lowest priority first; an imported dictionary goes above all of them. */
const KINDS = ['extension', 'file'] as const;
export type DictionaryKind = (typeof KINDS)[number];

const DICTIONARY_FILE_NAME = 'Cheat_Menu.dictionary.json';
// relative to index.html, as RPG Maker loads its own plugins and data
const FILE_PATH = `js/plugins/${DICTIONARY_FILE_NAME}`;

type Source = { kind: DictionaryKind; name: string; dictionary: Dictionary };

const sources: Source[] = [];
let merged: Dictionary | null = null;
let fileRequested = false;

type CachedLabels = {
  dictionary: Dictionary;
  systemNames: readonly string[];
  base: readonly (string | null)[];
  labels: readonly (string | null)[];
};
const cache = new Map<DictionarySection, CachedLabels>();

const rank = (kind: DictionaryKind) => KINDS.indexOf(kind);

// Per game, like the user's own names: an imported dictionary describes the
// game, so a new game or another save must not drop it. Stored already
// cleaned by `parseDictionary`, but read through it again, since
// localStorage is easy to edit by hand.
type StoredImport = { name: string; file: unknown };
const importPref = definePreference('dictionary', {
  imported: null as StoredImport | null,
});

let importedFrom: StoredImport | null | undefined;
let imported: { name: string; dictionary: Dictionary } | null = null;

function currentImport(): typeof imported {
  const stored = importPref.get().imported;
  if (stored !== importedFrom) {
    importedFrom = stored;
    const dictionary =
      stored && typeof stored.name === 'string'
        ? parseDictionary(stored.file, () => {})
        : null;
    imported = dictionary ? { name: stored!.name, dictionary } : null;
    merged = null;
  }
  return imported;
}

function warnConflicts(added: Source): void {
  for (const source of sources) {
    if (source === added || source.kind !== added.kind) continue;
    const conflicts = findConflicts(source.dictionary, added.dictionary);
    if (conflicts.length > 0) {
      console.warn(
        `[CheatMenu] dictionary ${added.name} overrides ${source.name} for: ${conflicts.join(', ')}`,
      );
    }
  }
}

/** `name` goes into warnings, e.g. `extension "example"`. */
export function addDictionary(
  kind: DictionaryKind,
  name: string,
  raw: unknown,
): void {
  const dictionary = parseDictionary(raw, (message) =>
    console.warn(`[CheatMenu] dictionary ${name}: ${message}`),
  );
  if (!dictionary) return;
  const source: Source = { kind, name, dictionary };
  // stable: within a kind, the later source keeps the higher priority
  const at = sources.filter((s) => rank(s.kind) <= rank(kind)).length;
  sources.splice(at, 0, source);
  warnConflicts(source);
  merged = null;
}

// Warnings, not skipped entries: a section of the wrong type is one warning
// however many names it held.
export type ImportResult =
  { ok: true; size: number; warnings: number } | { ok: false; error: string };

/** Replaces the previous import. `name` is shown in the source list. */
export function importDictionary(name: string, raw: unknown): ImportResult {
  const warnings: string[] = [];
  const dictionary = parseDictionary(raw, (message) => {
    warnings.push(message);
    console.warn(`[CheatMenu] dictionary ${name}: ${message}`);
  });
  if (!dictionary) {
    return { ok: false, error: warnings[0] ?? 'not a dictionary' };
  }
  const size = dictionarySize(dictionary);
  if (size === 0) return { ok: false, error: 'no names in it' };
  importPref.update((value) => {
    value.imported = { name, file: dictionaryToFile(dictionary) };
  });
  return { ok: true, size, warnings: warnings.length };
}

/**
 * Also `true` for a stored import that no longer parses (localStorage edited
 * by hand), so it can still be removed from the menu.
 */
export const hasImportedDictionary = (): boolean =>
  importPref.get().imported !== null;

export function removeImportedDictionary(): boolean {
  if (!hasImportedDictionary()) return false;
  importPref.reset();
  return true;
}

export type SourceInfo = {
  kind: DictionaryKind | 'imported';
  name: string;
  size: number;
};

/** Highest priority first. */
export function dictionarySources(): SourceInfo[] {
  requestFile();
  const current = currentImport();
  const list: SourceInfo[] = sources
    .map(({ kind, name, dictionary }) => ({
      kind,
      name,
      size: dictionarySize(dictionary),
    }))
    .reverse();
  if (current) {
    list.unshift({
      kind: 'imported',
      name: current.name,
      size: dictionarySize(current.dictionary),
    });
  }
  return list;
}

function receiveFile(xhr: XMLHttpRequest): void {
  // file:// (NW.js) answers with status 0, a server with 200 / 404
  if (xhr.status >= 400 || !xhr.responseText.trim()) return;
  let raw: unknown;
  try {
    raw = JSON.parse(xhr.responseText);
  } catch (e) {
    console.warn(`[CheatMenu] ${DICTIONARY_FILE_NAME} is not valid JSON:`, e);
    return;
  }
  addDictionary('file', DICTIONARY_FILE_NAME, raw);
  // the menu may already be drawn without it
  updateMenu();
}

/**
 * Requested on first use rather than from `bootstrap()`: a local file
 * arrives long before anyone reads the labels, and the menu is redrawn if
 * not. Most games have no such file, so a missing one is not an error.
 */
function requestFile(): void {
  if (fileRequested) return;
  fileRequested = true;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', FILE_PATH);
  xhr.overrideMimeType('application/json');
  xhr.onload = () => receiveFile(xhr);
  xhr.onerror = () => {};
  xhr.send();
}

function dictionary(): Dictionary {
  const current = currentImport();
  if (!merged) {
    const all = sources.map((s) => s.dictionary);
    if (current) all.push(current.dictionary);
    merged = mergeDictionaries(all);
  }
  return merged;
}

/**
 * What the dictionary and System.json name, `null` for the rest. Leaves the
 * menus' cache alone, for a one-off read such as an export.
 */
export function namedLabels(
  section: DictionarySection,
  systemNames: readonly string[],
): readonly (string | null)[] {
  requestFile();
  return applyDictionary(
    dictionary()[section],
    systemNames,
    systemNameLabels(systemNames, { autoIdLabels: false }),
  );
}

/**
 * `base` with dictionary names applied. The same array comes back until a
 * dictionary is added, so lists can keep caching by identity.
 */
export function dictionaryLabels(
  section: DictionarySection,
  systemNames: readonly string[],
  base: readonly (string | null)[],
): readonly (string | null)[] {
  requestFile();
  const current = dictionary();
  const cached = cache.get(section);
  if (
    cached?.dictionary === current &&
    cached.systemNames === systemNames &&
    cached.base === base
  ) {
    return cached.labels;
  }
  const labels = applyDictionary(current[section], systemNames, base);
  cache.set(section, { dictionary: current, systemNames, base, labels });
  return labels;
}
