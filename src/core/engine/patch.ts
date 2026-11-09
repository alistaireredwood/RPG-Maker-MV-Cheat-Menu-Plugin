type AnyFn = (...args: never[]) => unknown;

type MethodKeys<T> = {
  [K in keyof T]-?: T[K] extends AnyFn ? K : never;
}[keyof T];

/**
 * Replaces `target[name]` with `wrap(original)`. The wrapper receives the
 * original method (call it with `.apply(this, args)` / `.call(this, ...)`).
 *
 * Returns `restore()`, which puts the original back — unless someone patched
 * the method again on top of ours, in which case restoring would drop their
 * patch, so it is left alone.
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
  const patched = wrap(original);
  target[name] = patched;

  return () => {
    if (target[name] === patched) target[name] = original;
  };
}
