import type { MenuBuilder } from '@src/core/ui/builder.ts';
import type { Resource, ResourceChange } from '@src/shared/game/resources.ts';

const LABELS: [ResourceChange, (who: string, stat: Resource) => string][] = [
  ['zero', (who, stat) => `${who} ${stat} to 0`],
  ['one', (who, stat) => `${who} ${stat} to 1`],
  ['half', (who, stat) => `${who} Half ${stat}`],
  ['full', (who, stat) => `${who} Full ${stat}`],
];

const GROUPS: [title: string, aliveOnly: boolean][] = [
  ['Alive', true],
  ['All', false],
];

/** Takes 8 keys. */
export function resourceCheats(
  ui: MenuBuilder,
  who: string,
  stat: Resource,
  apply: (change: ResourceChange, aliveOnly: boolean) => void,
): void {
  for (const [title, aliveOnly] of GROUPS) {
    ui.title(title);
    for (const [change, label] of LABELS) {
      ui.cheat(label(who, stat), 'Activate', () => {
        apply(change, aliveOnly);
        SoundManager.playSystemSound(1);
      });
    }
  }
}
