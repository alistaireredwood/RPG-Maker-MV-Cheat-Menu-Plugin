// A dictionary fills in variable / switch names a game left blank and
// translates the ones it has. It changes only the labels in the menu, never
// the game's data.

/** Bumped when the layout of a dictionary changes; new sections keep it. */
export const DICTIONARY_FORMAT = 1;

export const DICTIONARY_SECTIONS = ['variables', 'switches'] as const;
export type DictionarySection = (typeof DICTIONARY_SECTIONS)[number];

export type NameSection = {
  /** id → name; wins over `byName` */
  byId?: Readonly<Record<number, string>>;
  /** name from System.json → name shown instead (e.g. a translation) */
  byName?: Readonly<Record<string, string>>;
};

/** An extension's `names`, and the sections of a dictionary file. */
export type DictionaryNames = Partial<Record<DictionarySection, NameSection>>;

export type DictionaryFile = DictionaryNames & {
  format: number;
  /** `$dataSystem.gameTitle` of the game the names were written for */
  game?: string;
};

export type SectionNames = {
  readonly byId: ReadonlyMap<number, string>;
  readonly byName: ReadonlyMap<string, string>;
};

export type Dictionary = Readonly<Record<DictionarySection, SectionNames>>;

const emptySection = (): SectionNames => ({
  byId: new Map(),
  byName: new Map(),
});

export const EMPTY_DICTIONARY: Dictionary = {
  variables: emptySection(),
  switches: emptySection(),
};

type Warn = (message: string) => void;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

// `03` or `1e2` would name an id other than the one the author sees
const ID_PATTERN = /^[1-9]\d*$/;

const nameOf = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() ? value.trim() : null;

function readList<K>(
  raw: unknown,
  path: string,
  toKey: (key: string) => K | null,
  keyError: string,
  warn: Warn,
): Map<K, string> {
  const list = new Map<K, string>();
  if (raw === undefined) return list;
  if (!isRecord(raw)) {
    warn(`${path} is not an object — skipped`);
    return list;
  }
  for (const rawKey of Object.keys(raw)) {
    const where = `${path}[${JSON.stringify(rawKey)}]`;
    const key = toKey(rawKey);
    const name = nameOf(raw[rawKey]);
    if (key === null) warn(`${where}: ${keyError} — skipped`);
    else if (name === null) warn(`${where}: name must be text — skipped`);
    else list.set(key, name);
  }
  return list;
}

function readSection(
  raw: unknown,
  section: DictionarySection,
  warn: Warn,
): SectionNames {
  if (raw === undefined) return emptySection();
  if (!isRecord(raw)) {
    warn(`${section} is not an object — skipped`);
    return emptySection();
  }
  return {
    byId: readList(
      raw.byId,
      `${section}.byId`,
      (key) => (ID_PATTERN.test(key) ? Number(key) : null),
      'id must be a positive integer',
      warn,
    ),
    byName: readList(
      raw.byName,
      `${section}.byName`,
      (key) => key.trim() || null,
      'name to replace must not be blank',
      warn,
    ),
  };
}

/**
 * Hand-written files are expected to have typos, so a bad entry is skipped
 * on its own. Only a file that isn't a dictionary at all, or one of a newer
 * format, is rejected as a whole (`null`).
 */
export function parseDictionary(raw: unknown, warn: Warn): Dictionary | null {
  if (!isRecord(raw)) {
    warn('expected an object with "variables" and / or "switches"');
    return null;
  }
  const format = raw.format;
  if (
    format !== undefined &&
    !(
      Number.isInteger(format) &&
      Number(format) >= 1 &&
      Number(format) <= DICTIONARY_FORMAT
    )
  ) {
    warn(
      `unsupported format ${JSON.stringify(format)}, this Cheat Menu reads format ${DICTIONARY_FORMAT} — skipped`,
    );
    return null;
  }
  return {
    variables: readSection(raw.variables, 'variables', warn),
    switches: readSection(raw.switches, 'switches', warn),
  };
}

function mergeMaps<K>(maps: ReadonlyMap<K, string>[]): Map<K, string> {
  const merged = new Map<K, string>();
  for (const map of maps) map.forEach((name, key) => merged.set(key, name));
  return merged;
}

/** Lowest priority first: a later dictionary wins per entry. */
export function mergeDictionaries(
  dictionaries: readonly Dictionary[],
): Dictionary {
  const section = (name: DictionarySection): SectionNames => ({
    byId: mergeMaps(dictionaries.map((d) => d[name].byId)),
    byName: mergeMaps(dictionaries.map((d) => d[name].byName)),
  });
  return { variables: section('variables'), switches: section('switches') };
}

function conflictingKeys<K>(
  a: ReadonlyMap<K, string>,
  b: ReadonlyMap<K, string>,
): K[] {
  const keys: K[] = [];
  a.forEach((name, key) => {
    const other = b.get(key);
    if (other !== undefined && other !== name) keys.push(key);
  });
  return keys;
}

/** Entries `a` and `b` both name, differently — as `variables.byId[3]`. */
export function findConflicts(a: Dictionary, b: Dictionary): string[] {
  const conflicts: string[] = [];
  for (const section of DICTIONARY_SECTIONS) {
    for (const id of conflictingKeys(a[section].byId, b[section].byId)) {
      conflicts.push(`${section}.byId[${id}]`);
    }
    for (const name of conflictingKeys(a[section].byName, b[section].byName)) {
      conflicts.push(`${section}.byName[${JSON.stringify(name)}]`);
    }
  }
  return conflicts;
}

/**
 * Only labels are replaced, `null`s and `#0042`s alike, so a dictionary
 * never changes which ids `systemNameLabels` considers named — a switch list
 * of a game that names nothing keeps its `#0042` labels for the rest.
 */
export function applyDictionary(
  section: SectionNames,
  systemNames: readonly string[],
  base: readonly (string | null)[],
): readonly (string | null)[] {
  if (section.byId.size === 0 && section.byName.size === 0) return base;
  return base.map((label, id) => {
    if (id === 0) return label;
    const systemName = (systemNames[id] || '').trim();
    return (
      section.byId.get(id) ??
      (systemName ? section.byName.get(systemName) : undefined) ??
      label
    );
  });
}

/**
 * Exported names are plain `byId`: they are what the menu shows right now,
 * so they load back the same in any game version with the same ids.
 */
export function toDictionaryFile(
  labels: Partial<Record<DictionarySection, readonly (string | null)[]>>,
  game?: string,
): DictionaryFile {
  const file: DictionaryFile = { format: DICTIONARY_FORMAT };
  if (game !== undefined) file.game = game;
  for (const section of DICTIONARY_SECTIONS) {
    const list = labels[section];
    if (!list) continue;
    const byId: Record<number, string> = {};
    list.forEach((label, id) => {
      const name = nameOf(label);
      if (id > 0 && name !== null) byId[id] = name;
    });
    file[section] = { byId };
  }
  return file;
}

export const dictionarySize = (dictionary: Dictionary): number =>
  DICTIONARY_SECTIONS.reduce(
    (sum, section) =>
      sum + dictionary[section].byId.size + dictionary[section].byName.size,
    0,
  );

const toRecord = <K extends string | number>(
  map: ReadonlyMap<K, string>,
): Record<K, string> => {
  const record = {} as Record<K, string>;
  map.forEach((name, key) => {
    // a plain assignment of `__proto__` would set the prototype, not a name
    Object.defineProperty(record, key, {
      value: name,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  });
  return record;
};

/**
 * A parsed dictionary back as a file, `byName` included — unlike
 * `toDictionaryFile`, which writes what the menu shows. Kept to store an
 * import already cleaned of the entries `parseDictionary` skipped.
 */
export function dictionaryToFile(
  dictionary: Dictionary,
  game?: string,
): DictionaryFile {
  const file: DictionaryFile = { format: DICTIONARY_FORMAT };
  if (game !== undefined) file.game = game;
  for (const section of DICTIONARY_SECTIONS) {
    const { byId, byName } = dictionary[section];
    if (byId.size === 0 && byName.size === 0) continue;
    file[section] = { byId: toRecord(byId), byName: toRecord(byName) };
  }
  return file;
}
