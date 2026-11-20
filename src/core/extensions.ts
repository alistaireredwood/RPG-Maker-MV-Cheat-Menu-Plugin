import type { Feature } from './feature.ts';
import { emit, registerFeatures } from './registry.ts';

export const EXTENSION_ID_PREFIX = 'ext.';

/**
 * What a game-specific extension pushes onto `window.CheatMenuExtensions`:
 * `setup`, `names` or both.
 */
export type ExtensionDescriptor<Api, Names = unknown> = {
  /** Shown in error messages — the features' ids are unknown until `setup` ran. */
  name: string;
  /** Major version of the api the extension was written against. */
  apiVersion: number;
  setup?(api: Api): readonly Feature<object>[];
  /**
   * A field rather than an `api` call: a Cheat Menu that predates it ignores
   * the field and still loads the features.
   */
  names?: Names;
};

export type ExtensionOptions<Api> = {
  api: Api;
  apiVersion: number;
  /** Receives `names` of every extension that loaded. */
  onNames?: (extensionName: string, names: unknown) => void;
};

export type ExtensionQueue<Api> = {
  push(...descriptors: ExtensionDescriptor<Api>[]): void;
};

export type ExtensionHost = {
  /** Later pushes are ignored with a warning. */
  close(): void;
};

type QueueTarget = { CheatMenuExtensions?: unknown };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

function checkFeatures(features: unknown): readonly Feature<object>[] {
  if (!Array.isArray(features)) {
    throw new TypeError('setup() must return an array of features');
  }
  for (const feature of features as Feature<object>[]) {
    // the prefix keeps extensions clear of built-in ids, present and future
    if (!feature.id.startsWith(EXTENSION_ID_PREFIX)) {
      throw new Error(
        `feature id "${feature.id}" must start with "${EXTENSION_ID_PREFIX}"`,
      );
    }
    for (const menu of feature.menus) {
      if (!menu.id.startsWith(EXTENSION_ID_PREFIX)) {
        throw new Error(
          `menu id "${menu.id}" must start with "${EXTENSION_ID_PREFIX}"`,
        );
      }
    }
    // v1 saves predate extensions, there is nothing to migrate from
    if (feature.migrateV1) {
      throw new Error(`"${feature.id}": migrateV1 is not supported`);
    }
  }
  return features;
}

function isDescriptor(
  descriptor: unknown,
): descriptor is Record<string, unknown> & { name: string } {
  if (!isRecord(descriptor) || typeof descriptor.name !== 'string') {
    return false;
  }
  const { setup, names } = descriptor;
  return setup === undefined
    ? names !== undefined
    : typeof setup === 'function';
}

function loadNames<Api>(
  name: string,
  names: unknown,
  options: ExtensionOptions<Api>,
): void {
  if (names === undefined || !options.onNames) return;
  try {
    options.onNames(name, names);
  } catch (e) {
    console.error(`[CheatMenu] extension "${name}": names failed to load:`, e);
  }
}

function load<Api>(descriptor: unknown, options: ExtensionOptions<Api>): void {
  if (!isDescriptor(descriptor)) {
    console.error(
      '[CheatMenu] invalid extension, expected { name, apiVersion, setup and / or names }:',
      descriptor,
    );
    return;
  }
  const { name } = descriptor;

  if (descriptor.apiVersion !== options.apiVersion) {
    console.warn(
      `[CheatMenu] extension "${name}" needs api v${String(descriptor.apiVersion)}, this Cheat Menu provides v${options.apiVersion} — skipped`,
    );
    return;
  }

  const { setup } = descriptor as ExtensionDescriptor<Api>;
  let features: readonly Feature<object>[] = [];
  try {
    if (setup) {
      features = checkFeatures(setup(options.api));
      registerFeatures(features);
    }
  } catch (e) {
    console.error(`[CheatMenu] extension "${name}" failed to load:`, e);
    return;
  }
  emit('onInit', features);
  loadNames(name, descriptor.names, options);
}

/**
 * Plugins load in `plugins.js` order, so an extension may run before or after
 * Cheat Menu: before, it leaves its descriptor in an array; after, `push` is
 * already ours and registers right away.
 */
export function installExtensions<Api>(
  target: QueueTarget,
  options: ExtensionOptions<Api>,
): ExtensionHost {
  let open = true;

  const pending = target.CheatMenuExtensions;
  if (pending !== undefined && !Array.isArray(pending)) {
    console.warn(
      '[CheatMenu] window.CheatMenuExtensions is not an array — ignored:',
      pending,
    );
  }

  const queue: ExtensionQueue<Api> = {
    push(...descriptors) {
      for (const descriptor of descriptors) {
        if (open) {
          load(descriptor, options);
        } else {
          const name = isRecord(descriptor) ? String(descriptor.name) : '?';
          console.warn(
            `[CheatMenu] extension "${name}" was registered after the game booted — ignored. Load it from plugins.js.`,
          );
        }
      }
    },
  };
  target.CheatMenuExtensions = queue;

  if (Array.isArray(pending)) queue.push(...pending);

  return {
    close() {
      open = false;
    },
  };
}
