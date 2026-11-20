import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

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
