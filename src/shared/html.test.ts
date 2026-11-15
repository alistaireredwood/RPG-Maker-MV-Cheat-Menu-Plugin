import { describe, expect, it } from 'vitest';
import { escapeHtml } from './html.ts';

describe('escapeHtml', () => {
  it('escapes markup characters', () => {
    expect(escapeHtml('<b a="1">&</b>')).toBe(
      '&lt;b a=&quot;1&quot;&gt;&amp;&lt;/b&gt;',
    );
  });
});
