import { entryMatches, type VariableEntry } from './displayNames.ts';

export type ValueType = 'number' | 'string' | 'array' | 'object';

export const VALUE_TYPES: readonly ValueType[] = [
  'number',
  'string',
  'array',
  'object',
];

export type VariableFilter = {
  /** keys without a name, labelled `#0042` */
  showUnnamed: boolean;
  /** 0, null, NaN, '', false, undefined */
  hideFalsy: boolean;
  /** empty = all */
  types: ValueType[];
  /** inclusive; numbers only */
  min: number | null;
  max: number | null;
};

export const defaultFilter = (): VariableFilter => ({
  showUnnamed: false,
  hideFalsy: false,
  types: [],
  min: null,
  max: null,
});

export function valueType(value: unknown): ValueType | null {
  if (Array.isArray(value)) return 'array';
  if (value === null) return null;
  const type = typeof value;
  return type === 'number' || type === 'string' || type === 'object'
    ? type
    : null;
}

function inRange(value: unknown, { min, max }: VariableFilter): boolean {
  if (min === null && max === null) return true;
  if (typeof value !== 'number' || Number.isNaN(value)) return false;
  return (min === null || value >= min) && (max === null || value <= max);
}

export function matchesFilter(
  entry: VariableEntry,
  value: unknown,
  filter: VariableFilter,
): boolean {
  if (!entry.named && !filter.showUnnamed) return false;
  if (filter.hideFalsy && !value) return false;
  if (filter.types.length > 0) {
    const type = valueType(value);
    if (type === null || !filter.types.includes(type)) return false;
  }
  return inRange(value, filter);
}

export const variableMatches = (
  entry: VariableEntry,
  keyword: string,
  value: unknown,
  filter: VariableFilter,
): boolean =>
  matchesFilter(entry, value, filter) && entryMatches(entry, keyword);

export const isDefaultFilter = (filter: VariableFilter): boolean =>
  !filter.showUnnamed &&
  !filter.hideFalsy &&
  filter.types.length === 0 &&
  filter.min === null &&
  filter.max === null;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const finiteOrNull = (value: unknown): number | null =>
  typeof value === 'number' && Number.isFinite(value) ? value : null;

/**
 * `readSlice` copies a saved `filter` as it is, so a save from another plugin
 * version (or an edited one) could carry anything — each field is checked on
 * its own and falls back to its default.
 */
export function normalizeFilter(raw: unknown): VariableFilter {
  const filter = defaultFilter();
  if (!isRecord(raw)) return filter;
  if (typeof raw.showUnnamed === 'boolean') {
    filter.showUnnamed = raw.showUnnamed;
  }
  if (typeof raw.hideFalsy === 'boolean') filter.hideFalsy = raw.hideFalsy;
  const types = raw.types;
  if (Array.isArray(types)) {
    filter.types = VALUE_TYPES.filter((type) => types.includes(type));
  }
  filter.min = finiteOrNull(raw.min);
  filter.max = finiteOrNull(raw.max);
  return filter;
}

/** Typed range bound: `null` clears it, `undefined` = not a number. */
export function parseBound(text: string): number | null | undefined {
  const trimmed = text.trim();
  if (trimmed === '') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : undefined;
}
