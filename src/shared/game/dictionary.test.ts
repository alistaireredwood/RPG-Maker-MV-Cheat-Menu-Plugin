import { describe, expect, it, vi } from 'vitest';
import {
  applyDictionary,
  DICTIONARY_FORMAT,
  EMPTY_DICTIONARY,
  findConflicts,
  mergeDictionaries,
  parseDictionary,
  toDictionaryFile,
  type Dictionary,
} from './dictionary.ts';
import { systemNameLabels } from './systemNames.ts';

const parse = (raw: unknown) => {
  const warn = vi.fn<(message: string) => void>();
  return { dictionary: parseDictionary(raw, warn), warn };
};

const entries = <K, V>(map: ReadonlyMap<K, V>) => [...map.entries()];

describe('parseDictionary', () => {
  it('reads byId and byName of variables and switches', () => {
    const { dictionary, warn } = parse({
      format: 1,
      game: 'Some Game',
      variables: { byId: { 203: 'Sanity' }, byName: { 疲労度: 'Fatigue' } },
      switches: { byId: { '12': 'Boss defeated' } },
    });
    expect(warn).not.toHaveBeenCalled();
    expect(entries(dictionary!.variables.byId)).toEqual([[203, 'Sanity']]);
    expect(entries(dictionary!.variables.byName)).toEqual([
      ['疲労度', 'Fatigue'],
    ]);
    expect(entries(dictionary!.switches.byId)).toEqual([[12, 'Boss defeated']]);
    expect(dictionary!.switches.byName.size).toBe(0);
  });

  it('format is optional, so an extension can skip it', () => {
    const { dictionary } = parse({ variables: { byId: { 1: 'Gold' } } });
    expect(entries(dictionary!.variables.byId)).toEqual([[1, 'Gold']]);
  });

  it('trims names and byName keys', () => {
    const { dictionary } = parse({
      variables: { byId: { 1: '  Gold ' }, byName: { ' 日 ': ' Day ' } },
    });
    expect(dictionary!.variables.byId.get(1)).toBe('Gold');
    expect(dictionary!.variables.byName.get('日')).toBe('Day');
  });

  it('skips invalid entries with a warning and keeps the valid ones', () => {
    const { dictionary, warn } = parse({
      variables: {
        byId: { 0: 'Zero', '-1': 'Neg', '1.5': 'Frac', abc: 'Text', 2: 7 },
        byName: { '': 'Empty key', a: '  ', b: 'B' },
      },
      switches: { byId: { 3: 'Three', '03': 'Padded' } },
    });
    expect(entries(dictionary!.variables.byId)).toEqual([]);
    expect(entries(dictionary!.variables.byName)).toEqual([['b', 'B']]);
    expect(entries(dictionary!.switches.byId)).toEqual([[3, 'Three']]);
    expect(warn).toHaveBeenCalledTimes(8);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('variables.byId["abc"]'),
    );
  });

  it('a section or list of the wrong kind is skipped with a warning', () => {
    const { dictionary, warn } = parse({
      variables: ['Gold'],
      switches: { byId: 'x', byName: { a: 'A' } },
    });
    expect(dictionary!.variables.byId.size).toBe(0);
    expect(entries(dictionary!.switches.byName)).toEqual([['a', 'A']]);
    expect(warn).toHaveBeenCalledTimes(2);
  });

  it('ignores sections it does not know, so newer files still load', () => {
    const { dictionary, warn } = parse({
      items: { byId: { 1: 'Potion' } },
      variables: { byId: { 1: 'Gold' } },
    });
    expect(warn).not.toHaveBeenCalled();
    expect(dictionary!.variables.byId.get(1)).toBe('Gold');
  });

  it('rejects a value that is not an object', () => {
    for (const raw of [null, 'text', [], 3]) {
      const { dictionary, warn } = parse(raw);
      expect(dictionary).toBeNull();
      expect(warn).toHaveBeenCalledOnce();
    }
  });

  it('rejects a newer or broken format instead of guessing its layout', () => {
    for (const format of [DICTIONARY_FORMAT + 1, 0, 1.5, '1']) {
      const { dictionary, warn } = parse({
        format,
        variables: { byId: { 1: 'Gold' } },
      });
      expect(dictionary).toBeNull();
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('format'));
    }
  });
});

const dict = (raw: unknown): Dictionary => parseDictionary(raw, () => {})!;

describe('mergeDictionaries', () => {
  it('a later dictionary wins per entry, the rest is kept', () => {
    const merged = mergeDictionaries([
      dict({ variables: { byId: { 1: 'Low', 2: 'Only low' } } }),
      dict({ variables: { byId: { 1: 'High' }, byName: { a: 'A' } } }),
    ]);
    expect(entries(merged.variables.byId)).toEqual([
      [1, 'High'],
      [2, 'Only low'],
    ]);
    expect(entries(merged.variables.byName)).toEqual([['a', 'A']]);
  });

  it('no dictionaries give an empty one', () => {
    expect(mergeDictionaries([])).toEqual(EMPTY_DICTIONARY);
  });
});

describe('findConflicts', () => {
  it('lists entries both dictionaries name differently', () => {
    const conflicts = findConflicts(
      dict({
        variables: { byId: { 1: 'A', 2: 'Same' }, byName: { x: 'X' } },
        switches: { byId: { 5: 'On' } },
      }),
      dict({
        variables: { byId: { 1: 'B', 2: 'Same' }, byName: { x: 'Y' } },
        switches: { byId: { 6: 'Off' } },
      }),
    );
    expect(conflicts).toEqual(['variables.byId[1]', 'variables.byName["x"]']);
  });
});

describe('applyDictionary', () => {
  const section = dict({
    variables: {
      byId: { 2: 'Fatigue', 3: 'By id' },
      byName: { 正気度: 'Sanity', 日数: 'Day' },
    },
  }).variables;

  it('byId → byName (System.json name) → base label', () => {
    const names = ['', '正気度', '', '日数', 'Gold'];
    const base = systemNameLabels(names, { autoIdLabels: false });
    expect(applyDictionary(section, names, base)).toEqual([
      null,
      'Sanity',
      'Fatigue',
      'By id',
      'Gold',
    ]);
  });

  it('matches byName against a padded System.json name', () => {
    const names = ['', ' 正気度 '];
    expect(applyDictionary(section, names, [null, ' 正気度 '])).toEqual([
      null,
      'Sanity',
    ]);
  });

  it('does not turn #0042 labels of a game that names nothing into hidden ids', () => {
    // a switch list where nothing is named labels every id by number;
    // naming one of them must not make the rest disappear
    const names = Array<string>(5).fill('');
    const base = systemNameLabels(names);
    expect(applyDictionary(section, names, base)).toEqual([
      null,
      '#1',
      'Fatigue',
      'By id',
      '#4',
    ]);
  });

  it('ignores ids beyond the list and leaves the base untouched', () => {
    const names = ['', 'Gold'];
    const base = systemNameLabels(names);
    const before = [...base];
    const big = dict({ variables: { byId: { 9: 'Far' } } }).variables;
    expect(applyDictionary(big, names, base)).toEqual([null, 'Gold']);
    expect(base).toEqual(before);
  });

  it('an empty section returns the base itself, keeping it cacheable', () => {
    const names = ['', 'Gold'];
    const base = systemNameLabels(names);
    expect(applyDictionary(EMPTY_DICTIONARY.switches, names, base)).toBe(base);
  });
});

describe('toDictionaryFile', () => {
  it('writes every named id as byId, nothing as byName', () => {
    expect(
      toDictionaryFile(
        { variables: [null, 'Gold', null, ' Day '], switches: [null, '  '] },
        'Some Game',
      ),
    ).toEqual({
      format: DICTIONARY_FORMAT,
      game: 'Some Game',
      variables: { byId: { 1: 'Gold', 3: 'Day' } },
      switches: { byId: {} },
    });
  });

  it('reads back as the same names', () => {
    const file = toDictionaryFile({ variables: [null, 'Gold'] });
    const { dictionary, warn } = parse(JSON.parse(JSON.stringify(file)));
    expect(warn).not.toHaveBeenCalled();
    expect(entries(dictionary!.variables.byId)).toEqual([[1, 'Gold']]);
    expect(file).not.toHaveProperty('game');
  });
});
