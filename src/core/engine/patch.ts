type AnyFn = (...args: never[]) => unknown;

type MethodKeys<T> = {
  [K in keyof T]-?: T[K] extends AnyFn ? K : never;
}[keyof T];

/**
 * `restore()` puts the original back — unless someone patched
 * the method again on top of ours, in which case restoring would drop their
 * patch, so it is left alone. Patching an inherited method (e.g. on a single
 * game object) adds an own property; restoring removes it again.
 */
export function patchMethod<T extends object, K extends MethodKeys<T>>(
  target: T,
  name: K,
  wrap: (original: T[K]) => T[K],
): () => void {
  const original = target[name];
  if (typeof original !== 'function') {
    throw new TypeError(
      `[CheatMenu] patchMethod: "${String(name)}" is not a method`,
    );
  }
  const wasOwn = Object.prototype.hasOwnProperty.call(target, name);
  const patched = wrap(original);
  target[name] = patched;

  return () => {
    if (target[name] !== patched) return;
    if (wasOwn) target[name] = original;
    else delete target[name];
  };
}
