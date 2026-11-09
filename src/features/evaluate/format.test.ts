import { describe, expect, it } from 'vitest';
import { escapeHtml, formatError, formatValue, truncate } from './format.ts';

describe('evaluate result formatting', () => {
  it('formats primitives, strings and functions', () => {
    expect(formatValue(undefined)).toBe('undefined');
    expect(formatValue(null)).toBe('null');
    expect(formatValue(42)).toBe('42');
    expect(formatValue('a"b')).toBe('"a\\"b"');
    expect(formatValue(function named() {})).toBe('[Function named]');
  });

  it('pretty-prints objects and survives circular ones', () => {
    expect(formatValue({ a: 1 })).toBe('{\n  "a": 1\n}');
    class Game_Thing {
      self: unknown = this;
    }
    expect(formatValue(new Game_Thing())).toBe('[Game_Thing]');
  });

  it('formats errors by name and message', () => {
    expect(formatError(new TypeError('x is undefined'))).toBe(
      'TypeError: x is undefined',
    );
    expect(formatError('plain')).toBe('"plain"');
  });

  it('escapes HTML and truncates long results', () => {
    expect(escapeHtml('<b a="1">&</b>')).toBe(
      '&lt;b a=&quot;1&quot;&gt;&amp;&lt;/b&gt;',
    );
    expect(truncate('x'.repeat(2005))).toMatch(/^x{2000}\n… \(5 more chars/);
    expect(truncate('short')).toBe('short');
  });
});
