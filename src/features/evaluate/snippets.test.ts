import { describe, expect, it } from 'vitest';
import {
  activePlugins,
  insertSnippet,
  MAX_SNIPPETS_PER_GROUP,
  pluginParametersSnippet,
  SNIPPET_GROUPS,
} from './snippets.ts';

describe('SNIPPET_GROUPS', () => {
  it('has groups, each with a name and at least one snippet', () => {
    expect(SNIPPET_GROUPS.length).toBeGreaterThan(0);
    for (const group of SNIPPET_GROUPS) {
      expect(group.name.trim()).not.toBe('');
      expect(group.snippets.length).toBeGreaterThan(0);
    }
  });

  it('group names are unique', () => {
    const names = SNIPPET_GROUPS.map((g) => g.name);
    expect(new Set(names).size).toBe(names.length);
  });

  it('every group fits into the free action keys', () => {
    for (const group of SNIPPET_GROUPS) {
      expect(group.snippets.length).toBeLessThanOrEqual(MAX_SNIPPETS_PER_GROUP);
    }
  });

  const all = SNIPPET_GROUPS.flatMap((group) =>
    group.snippets.map((snippet) => ({ group: group.name, ...snippet })),
  );

  it.each(all)('$group / $label: has a label and code', (snippet) => {
    expect(snippet.label.trim()).not.toBe('');
    expect(snippet.code.trim()).not.toBe('');
  });

  it.each(all)('$group / $label: parses as JavaScript', ({ code }) => {
    expect(() => new Function(code)).not.toThrow();
  });
});

describe('insertSnippet', () => {
  it('empty script → just the snippet', () => {
    expect(insertSnippet('', 'a()')).toBe('a()');
    expect(insertSnippet('  \n', 'a()')).toBe('a()');
  });

  it('appends on a new line and keeps the existing script', () => {
    expect(insertSnippet('x()', 'a()')).toBe('x()\na()');
    expect(insertSnippet('x()\n\n  ', 'a()')).toBe('x()\na()');
  });
});

describe('pluginParametersSnippet', () => {
  it('quotes the plugin name safely', () => {
    expect(pluginParametersSnippet('VisuMZ_Core')).toBe(
      'PluginManager.parameters("VisuMZ_Core")',
    );
    const tricky = pluginParametersSnippet('a"b\\c');
    expect(() => new Function(tricky)).not.toThrow();
    expect(tricky).toBe('PluginManager.parameters("a\\"b\\\\c")');
  });
});

describe('activePlugins', () => {
  const plugin = (name: string, status: boolean, description = '') => ({
    name,
    status,
    description,
    parameters: {},
  });

  it('only active plugins, in plugins.js order', () => {
    expect(
      activePlugins([
        plugin('B', true, 'second'),
        plugin('Off', false),
        plugin('A', true),
      ]),
    ).toEqual([
      { name: 'B', description: 'second' },
      { name: 'A', description: '' },
    ]);
  });

  it.each([undefined, null, 'x', {}])('%s → empty list', (plugins) => {
    expect(activePlugins(plugins)).toEqual([]);
  });

  it('skips malformed entries', () => {
    expect(
      activePlugins([null, { status: true }, plugin('A', true), 'x']),
    ).toEqual([{ name: 'A', description: '' }]);
  });
});
