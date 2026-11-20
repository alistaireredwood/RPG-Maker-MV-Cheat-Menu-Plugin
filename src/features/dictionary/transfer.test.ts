import { describe, expect, it } from 'vitest';
import { DICTIONARY_FORMAT } from '@src/shared/game/dictionary.ts';
import {
  buildExport,
  exportMessage,
  importMessage,
  namesCount,
  parseJson,
} from './transfer.ts';

describe('buildExport', () => {
  it('writes what the menus show, the user names over the variables', () => {
    const { file, count } = buildExport(
      {
        variables: [null, 'Gold', null, 'Day'],
        switches: [null, null, 'Boss defeated'],
      },
      { 2: 'Quest', 3: 'Today' },
      'Some Game',
    );
    expect(file).toEqual({
      format: DICTIONARY_FORMAT,
      game: 'Some Game',
      variables: { byId: { 1: 'Gold', 2: 'Quest', 3: 'Today' } },
      switches: { byId: { 2: 'Boss defeated' } },
    });
    expect(count).toBe(4);
  });

  it('a game that names nothing exports an empty dictionary', () => {
    const { count } = buildExport(
      { variables: [null, null], switches: [null] },
      {},
    );
    expect(count).toBe(0);
  });
});

describe('messages', () => {
  it('counts names in singular and plural', () => {
    expect(namesCount(1)).toBe('1 name');
    expect(namesCount(0)).toBe('0 names');
    expect(namesCount(12)).toBe('12 names');
  });

  it('reports an export', () => {
    expect(exportMessage(3, true)).toEqual({
      ok: true,
      text: 'Copied 3 names to the clipboard',
    });
    expect(exportMessage(3, false).ok).toBe(false);
  });

  it('reports an import, skipped entries and a file of another game', () => {
    const result = { ok: true as const, size: 5, warnings: 2 };
    expect(importMessage('a.json', {}, result, 'Mine').text).toBe(
      'Imported 5 names from a.json, 2 warnings (see the console, F8)',
    );
    expect(
      importMessage(
        'a.json',
        { game: 'Other' },
        { ...result, warnings: 0 },
        'Mine',
      ).text,
    ).toBe('Imported 5 names from a.json. It was written for "Other"');
    expect(
      importMessage(
        'a.json',
        { game: 'Mine' },
        { ...result, warnings: 0 },
        'Mine',
      ).text,
    ).toBe('Imported 5 names from a.json');
  });

  it('reports a rejected import with the file name', () => {
    expect(
      importMessage('a.json', [], { ok: false, error: 'no names in it' }),
    ).toEqual({ ok: false, text: 'a.json: no names in it' });
  });
});

describe('parseJson', () => {
  it('tells broken JSON from a parsed null', () => {
    expect(parseJson('{ "a": ')).toBeUndefined();
    expect(parseJson('null')).toEqual({ value: null });
  });
});
