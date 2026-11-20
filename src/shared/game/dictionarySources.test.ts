import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { prefsStorageKey } from '@src/core/preferencesFormat.ts';

class FakeXhr {
  static last: FakeXhr | null = null;
  static count = 0;
  url = '';
  status = 0;
  responseText = '';
  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor() {
    FakeXhr.last = this;
    FakeXhr.count++;
  }
  open(_method: string, url: string) {
    this.url = url;
  }
  overrideMimeType() {}
  send() {}
  respond(status: number, text: string) {
    this.status = status;
    this.responseText = text;
    this.onload?.();
  }
}

type Sources = typeof import('./dictionarySources.ts');
let sources: Sources;
let warn: ReturnType<typeof vi.spyOn>;
const updateMenu = vi.fn();

beforeEach(async () => {
  vi.resetModules();
  FakeXhr.last = null;
  FakeXhr.count = 0;
  vi.stubGlobal('XMLHttpRequest', FakeXhr);
  vi.doMock('@src/core/ui/render.ts', () => ({ updateMenu }));
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  sources = await import('./dictionarySources.ts');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  updateMenu.mockClear();
});

const names = ['', '正気度', '', 'Gold'];
const base = [null, '正気度', null, 'Gold'];
const labels = () => sources.dictionaryLabels('variables', names, base);
const file = () => FakeXhr.last!;

describe('dictionary sources', () => {
  it('without any dictionary the base labels come back as they are', () => {
    expect(labels()).toBe(base);
  });

  it('applies an extension dictionary', () => {
    sources.addDictionary('extension', 'ext "a"', {
      variables: { byId: { 2: 'Fatigue' }, byName: { 正気度: 'Sanity' } },
    });
    expect(labels()).toEqual([null, 'Sanity', 'Fatigue', 'Gold']);
  });

  it('the file wins over extensions, whatever arrives first', () => {
    labels();
    file().respond(0, JSON.stringify({ variables: { byId: { 2: 'File' } } }));
    sources.addDictionary('extension', 'ext "a"', {
      variables: { byId: { 2: 'Ext', 3: 'Ext gold' } },
    });
    expect(labels()).toEqual([null, '正気度', 'File', 'Ext gold']);
  });

  it('between extensions the later one wins, with a warning naming both', () => {
    sources.addDictionary('extension', 'ext "a"', {
      variables: { byId: { 2: 'A' } },
    });
    sources.addDictionary('extension', 'ext "b"', {
      variables: { byId: { 2: 'B' } },
    });
    expect(labels()[2]).toBe('B');
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/ext "b".*ext "a".*variables\.byId\[2\]/),
    );
  });

  it('warnings about bad entries name the source', () => {
    sources.addDictionary('extension', 'ext "a"', {
      variables: { byId: { x: 'X' } },
    });
    expect(warn).toHaveBeenCalledWith(
      expect.stringMatching(/ext "a".*variables\.byId\["x"\]/),
    );
  });

  it('keeps returning the same array until a dictionary is added', () => {
    sources.addDictionary('extension', 'ext "a"', {
      variables: { byId: { 2: 'A' } },
    });
    const first = labels();
    expect(labels()).toBe(first);
    sources.addDictionary('extension', 'ext "b"', {
      variables: { byId: { 3: 'B' } },
    });
    expect(labels()).not.toBe(first);
    expect(labels()).toEqual([null, '正気度', 'A', 'B']);
  });
});

describe('dictionary file', () => {
  it('is requested once, on the first use, from next to the plugin', () => {
    expect(FakeXhr.count).toBe(0);
    labels();
    labels();
    expect(FakeXhr.count).toBe(1);
    expect(file().url).toBe('js/plugins/Cheat_Menu.dictionary.json');
  });

  it('redraws the menu when it arrives', () => {
    labels();
    file().respond(200, JSON.stringify({ switches: { byId: { 1: 'On' } } }));
    expect(updateMenu).toHaveBeenCalledOnce();
    expect(
      sources.dictionaryLabels('switches', ['', ''], ['#1', null]),
    ).toEqual(['#1', 'On']);
  });

  it('a missing file is the usual case and stays silent', () => {
    labels();
    file().onerror?.();
    expect(warn).not.toHaveBeenCalled();
    expect(labels()).toBe(base);
  });

  it('a 404 or an empty answer is a missing file as well', () => {
    labels();
    file().respond(404, 'Not found');
    expect(warn).not.toHaveBeenCalled();
    expect(updateMenu).not.toHaveBeenCalled();
  });

  it('broken JSON is reported, not thrown', () => {
    labels();
    expect(() => file().respond(0, '{ "variables": ')).not.toThrow();
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('Cheat_Menu.dictionary.json'),
      expect.any(SyntaxError),
    );
    expect(labels()).toBe(base);
  });
});

describe('imported dictionary', () => {
  it('wins over the file and the extensions', () => {
    labels();
    file().respond(0, JSON.stringify({ variables: { byId: { 2: 'File' } } }));
    sources.addDictionary('extension', 'ext "a"', {
      variables: { byId: { 3: 'Ext' } },
    });
    expect(
      sources.importDictionary('mine.json', {
        variables: { byId: { 2: 'Mine' } },
      }),
    ).toEqual({ ok: true, size: 1, warnings: 0 });
    expect(labels()).toEqual([null, '正気度', 'Mine', 'Ext']);
  });

  it('replaces the previous import and can be removed', () => {
    sources.importDictionary('a.json', { variables: { byId: { 2: 'A' } } });
    sources.importDictionary('b.json', { variables: { byId: { 3: 'B' } } });
    expect(labels()).toEqual([null, '正気度', null, 'B']);
    expect(sources.removeImportedDictionary()).toBe(true);
    expect(labels()).toEqual(base);
    expect(sources.removeImportedDictionary()).toBe(false);
  });

  it('counts warnings and rejects files with nothing to use', () => {
    expect(
      sources.importDictionary('a.json', {
        variables: { byId: { 2: 'A', x: 'X' } },
      }),
    ).toEqual({ ok: true, size: 1, warnings: 1 });
    expect(sources.importDictionary('b.json', [])).toMatchObject({
      ok: false,
    });
    expect(
      sources.importDictionary('c.json', { variables: { byId: {} } }),
    ).toEqual({ ok: false, error: 'no names in it' });
    expect(sources.importDictionary('d.json', { format: 99 })).toMatchObject({
      ok: false,
      error: expect.stringContaining('format 99'),
    });
    // a rejected file keeps the import that was there
    expect(labels()[2]).toBe('A');
  });

  it('is stored per game and survives a restart', async () => {
    const items = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => items.set(key, value),
    });
    vi.stubGlobal('$dataSystem', { gameTitle: 'Game A' });
    sources.importDictionary('a.json', {
      switches: { byName: { ボス撃破: 'Boss defeated' } },
    });

    vi.resetModules();
    const fresh: Sources = await import('./dictionarySources.ts');
    expect(
      fresh.dictionaryLabels('switches', ['', 'ボス撃破'], ['', 'x']),
    ).toEqual(['', 'Boss defeated']);
    vi.stubGlobal('$dataSystem', { gameTitle: 'Game B' });
    expect(fresh.dictionarySources()).toEqual([]);
  });

  it('a stored import edited out of shape is ignored but can be removed', async () => {
    const items = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => items.set(key, value),
    });
    vi.stubGlobal('$dataSystem', { gameTitle: 'Game A' });
    items.set(
      prefsStorageKey('Game A'),
      JSON.stringify({ version: 1, dictionary: { imported: { file: 7 } } }),
    );

    vi.resetModules();
    const fresh: Sources = await import('./dictionarySources.ts');
    expect(fresh.dictionarySources()).toEqual([]);
    expect(fresh.hasImportedDictionary()).toBe(true);
    expect(fresh.removeImportedDictionary()).toBe(true);
    expect(fresh.hasImportedDictionary()).toBe(false);
  });

  it('keeps a __proto__ name through storing and reading back', () => {
    sources.importDictionary(
      'a.json',
      JSON.parse('{ "switches": { "byName": { "__proto__": "Odd" } } }'),
    );
    expect(
      sources.dictionaryLabels('switches', ['', '__proto__'], ['', 'x']),
    ).toEqual(['', 'Odd']);
  });
});

describe('dictionarySources', () => {
  it('lists the sources highest first, with their sizes', () => {
    labels();
    file().respond(0, JSON.stringify({ variables: { byId: { 2: 'F' } } }));
    sources.addDictionary('extension', 'extension "a"', {
      switches: { byId: { 1: 'A', 2: 'B' } },
    });
    sources.importDictionary('mine.json', {
      variables: { byName: { 正気度: 'Sanity' } },
    });
    expect(sources.dictionarySources()).toEqual([
      { kind: 'imported', name: 'mine.json', size: 1 },
      { kind: 'file', name: 'Cheat_Menu.dictionary.json', size: 1 },
      { kind: 'extension', name: 'extension "a"', size: 2 },
    ]);
  });
});

describe('namedLabels', () => {
  it('applies the dictionary over System.json, without #0042 labels', () => {
    sources.addDictionary('extension', 'ext "a"', {
      variables: { byId: { 2: 'Fatigue' } },
    });
    expect(sources.namedLabels('variables', names)).toEqual([
      null,
      '正気度',
      'Fatigue',
      'Gold',
    ]);
  });
});
