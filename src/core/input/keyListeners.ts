import { isMappedKey, type ActionKey } from './keymap.ts';

// legacy handlers are typed for mouse events but also get the KeyboardEvent
type KeyHandler = (event?: never) => void;

// rebuilt on every render: widgets bind their keys while the menu is drawn
let listeners: Record<string, KeyHandler> = {};

export function bindKey(key: ActionKey, handler: KeyHandler): void {
  listeners[String(key)] = handler;
}

export function clearKeyBindings(): void {
  listeners = {};
}

export function dispatchBoundKey(event: KeyboardEvent): boolean {
  if (!isMappedKey(event.key)) return false;
  const handler = listeners[event.key];
  if (!handler) return false;
  (handler as unknown as (event: Event) => void)(event);
  return true;
}
