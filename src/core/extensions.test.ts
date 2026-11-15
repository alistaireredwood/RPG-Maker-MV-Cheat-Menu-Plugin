import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Feature } from './feature.ts';
import { installExtensions, type ExtensionDescriptor } from './extensions.ts';
import { findMenu, getFeatures } from './registry.ts';

const api = { marker: 'api' };
type Api = typeof api;

let seq = 0;
function makeFeature(
  overrides: Partial<Feature<object>> = {},
): Feature<object> {
  const id = `ext.test.f${++seq}`;
  return {
    id,
    state: { n: seq },
    menus: [{ id, name: id, render: () => {} }],
    ...overrides,
  };
}

function descriptor(
  features: Feature<object>[],
  overrides: Partial<ExtensionDescriptor<Api>> = {},
): ExtensionDescriptor<Api> {
  return {
    name: `ext${seq}`,
    apiVersion: 1,
    setup: () => features,
    ...overrides,
  };
}

const isRegistered = (f: Feature<object>) => getFeatures().includes(f);

let target: { CheatMenuExtensions?: unknown };
let error: ReturnType<typeof vi.spyOn>;
let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  target = {};
  error = vi.spyOn(console, 'error').mockImplementation(() => {});
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});
afterEach(() => vi.restoreAllMocks());

const install = () => installExtensions(target, { api, apiVersion: 1 });
const queue = () =>
  target.CheatMenuExtensions as { push(...d: unknown[]): unknown };

describe('extension queue', () => {
  it('registers extensions queued before install, in order, and runs onInit', () => {
    const onInit = vi.fn();
    const a = makeFeature({ onInit });
    const b = makeFeature();
    target.CheatMenuExtensions = [descriptor([a]), descriptor([b])];
    install();

    expect(isRegistered(a) && isRegistered(b)).toBe(true);
    const ids = getFeatures().map((f) => f.id);
    expect(ids.indexOf(a.id)).toBeLessThan(ids.indexOf(b.id));
    expect(onInit).toHaveBeenCalledWith(a.state);
    expect(findMenu(a.menus[0].id)).toBeDefined();
  });

  it('passes the api to setup', () => {
    const setup = vi.fn(() => []);
    target.CheatMenuExtensions = [descriptor([], { setup })];
    install();
    expect(setup).toHaveBeenCalledWith(api);
  });

  it('registers extensions pushed after install immediately', () => {
    install();
    const f = makeFeature();
    queue().push(descriptor([f]));
    expect(isRegistered(f)).toBe(true);
  });

  it('ignores extensions pushed after the registration window closed', () => {
    const host = install();
    host.close();
    const setup = vi.fn(() => [makeFeature()]);
    queue().push(descriptor([], { name: 'late', setup }));
    expect(setup).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"late"'));
  });

  it('warns about and drops a non-array queue value', () => {
    target.CheatMenuExtensions = { something: true };
    install();
    expect(warn).toHaveBeenCalled();
    const f = makeFeature();
    queue().push(descriptor([f]));
    expect(isRegistered(f)).toBe(true);
  });
});

describe('extension isolation', () => {
  it('a throwing setup is logged with the extension name and does not stop the others', () => {
    const ok = makeFeature();
    target.CheatMenuExtensions = [
      descriptor([], {
        name: 'broken',
        setup: () => {
          throw new Error('boom');
        },
      }),
      descriptor([ok]),
    ];
    install();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('"broken"'),
      expect.any(Error),
    );
    expect(isRegistered(ok)).toBe(true);
  });

  it('an id collision rejects the whole extension', () => {
    install();
    const first = makeFeature();
    queue().push(descriptor([first]));

    const fresh = makeFeature();
    const clash = makeFeature({ id: first.id });
    queue().push(descriptor([fresh, clash], { name: 'clashing' }));

    expect(isRegistered(fresh)).toBe(false);
    expect(isRegistered(clash)).toBe(false);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('"clashing"'),
      expect.any(Error),
    );
  });

  it('requires the ext. prefix on feature and menu ids', () => {
    install();
    const noPrefix = makeFeature({ id: 'gold' });
    const menuNoPrefix = makeFeature({
      menus: [{ id: 'gold', name: '', render: () => {} }],
    });
    queue().push(descriptor([noPrefix], { name: 'p1' }));
    queue().push(descriptor([menuNoPrefix], { name: 'p2' }));
    expect(isRegistered(noPrefix)).toBe(false);
    expect(isRegistered(menuNoPrefix)).toBe(false);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('"p1"'),
      expect.objectContaining({ message: expect.stringContaining('"ext."') }),
    );
  });

  it('rejects migrateV1', () => {
    install();
    const f = makeFeature({ migrateV1: () => ({}) });
    queue().push(descriptor([f]));
    expect(isRegistered(f)).toBe(false);
    expect(error).toHaveBeenCalled();
  });

  it('skips an extension built for another api version without running it', () => {
    install();
    const setup = vi.fn(() => [makeFeature()]);
    queue().push(descriptor([], { name: 'future', apiVersion: 2, setup }));
    expect(setup).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('"future"'));
  });

  it('rejects malformed descriptors', () => {
    install();
    queue().push(null);
    queue().push({ name: 'noSetup', apiVersion: 1 });
    queue().push(() => []);
    expect(error).toHaveBeenCalledTimes(3);
  });

  it('rejects a setup that does not return an array', () => {
    install();
    queue().push(
      descriptor([], {
        name: 'single',
        setup: () => makeFeature() as unknown as Feature<object>[],
      }),
    );
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining('"single"'),
      expect.any(Error),
    );
  });

  it('a throwing onInit is isolated', () => {
    install();
    const f = makeFeature({
      onInit: () => {
        throw new Error('init');
      },
    });
    queue().push(descriptor([f]));
    expect(isRegistered(f)).toBe(true);
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining(`${f.id}.onInit`),
      expect.any(Error),
    );
  });
});
