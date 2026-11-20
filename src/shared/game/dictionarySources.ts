import { updateMenu } from '@src/core/ui/render.ts';
import {
  applyDictionary,
  findConflicts,
  mergeDictionaries,
  parseDictionary,
  type Dictionary,
  type DictionarySection,
} from './dictionary.ts';

/** Lowest priority first. */
const KINDS = ['extension', 'file'] as const;
export type DictionaryKind = (typeof KINDS)[number];

const FILE_NAME = 'Cheat_Menu.dictionary.json';
// relative to index.html, as RPG Maker loads its own plugins and data
const FILE_PATH = `js/plugins/${FILE_NAME}`;

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

function receiveFile(xhr: XMLHttpRequest): void {
  // file:// (NW.js) answers with status 0, a server with 200 / 404
  if (xhr.status >= 400 || !xhr.responseText.trim()) return;
  let raw: unknown;
  try {
    raw = JSON.parse(xhr.responseText);
  } catch (e) {
    console.warn(`[CheatMenu] ${FILE_NAME} is not valid JSON:`, e);
    return;
  }
  addDictionary('file', FILE_NAME, raw);
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
  if (!merged) merged = mergeDictionaries(sources.map((s) => s.dictionary));
  return merged;
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
