import { ACTION_KEYS } from '@src/core/ui/keyAllocator.ts';

// Every snippet uses APIs that MV and MZ share with the same signatures, so
// one list serves both.

export type Snippet = { label: string; code: string };
export type SnippetGroup = { name: string; snippets: readonly Snippet[] };

export const RESERVED_KEYS = 3;
export const MAX_SNIPPETS_PER_GROUP = ACTION_KEYS.length - RESERVED_KEYS - 2;

export const SNIPPET_GROUPS: readonly SnippetGroup[] = [
  {
    name: 'Gold & items',
    snippets: [
      { label: 'Gold +10000', code: '$gameParty.gainGold(10000)' },
      { label: 'Item #1 ×10', code: '$gameParty.gainItem($dataItems[1], 10)' },
      { label: 'Weapon #1', code: '$gameParty.gainItem($dataWeapons[1], 1)' },
      { label: 'Armor #1', code: '$gameParty.gainItem($dataArmors[1], 1)' },
    ],
  },
  {
    name: 'Variables & switches',
    snippets: [
      { label: 'Read variable', code: '$gameVariables.value(1)' },
      { label: 'Set variable', code: '$gameVariables.setValue(1, 100)' },
      { label: 'Set switch', code: '$gameSwitches.setValue(1, true)' },
      {
        label: 'Self switch A of event 1',
        code: "$gameSelfSwitches.setValue([$gameMap.mapId(), 1, 'A'], true)",
      },
    ],
  },
  {
    name: 'Map & player',
    snippets: [
      {
        label: 'Where am I',
        code: '[$gameMap.mapId(), $gamePlayer.x, $gamePlayer.y]',
      },
      {
        label: 'Teleport (map, x, y)',
        code: '$gamePlayer.reserveTransfer(1, 10, 10, 0, 0)',
      },
      {
        label: 'List map events',
        code: '$gameMap.events().map(e => [e.eventId(), e.event().name, e.x, e.y])',
      },
      { label: 'Run common event', code: '$gameTemp.reserveCommonEvent(1)' },
    ],
  },
  {
    name: 'Actors',
    snippets: [
      {
        label: 'Party ids & names',
        code: '$gameParty.members().map(a => [a.actorId(), a.name()])',
      },
      {
        label: 'Recover all',
        code: '$gameParty.members().forEach(a => a.recoverAll())',
      },
      {
        label: 'Level 50',
        code: '$gameActors.actor(1).changeLevel(50, false)',
      },
      { label: 'Learn skill', code: '$gameActors.actor(1).learnSkill(1)' },
    ],
  },
  {
    name: 'Battle & scenes',
    snippets: [
      {
        label: 'Kill all enemies',
        code: '$gameTroop.members().forEach(e => e.setHp(0))',
      },
      { label: 'Leave battle', code: 'BattleManager.abort()' },
      { label: 'Open save screen', code: 'SceneManager.push(Scene_Save)' },
      {
        label: 'Shop with item #1',
        code: 'SceneManager.push(Scene_Shop)\nSceneManager.prepareNextScene([[0, 1, 0, 0]], false)',
      },
    ],
  },
];

export function insertSnippet(script: string, code: string): string {
  const kept = script.trimEnd();
  return kept === '' ? code : `${kept}\n${code}`;
}

export type PluginInfo = { name: string; description: string };

/**
 * `$plugins` comes from the game's plugins.js, which games and patchers
 * edit by hand — malformed entries are skipped instead of breaking the help.
 */
export function activePlugins(plugins: unknown): PluginInfo[] {
  if (!Array.isArray(plugins)) return [];
  const result: PluginInfo[] = [];
  for (const plugin of plugins) {
    if (plugin === null || typeof plugin !== 'object') continue;
    const { name, status, description } = plugin as Record<string, unknown>;
    if (typeof name !== 'string' || status !== true) continue;
    result.push({
      name,
      description: typeof description === 'string' ? description : '',
    });
  }
  return result;
}

export const pluginParametersSnippet = (name: string): string =>
  `PluginManager.parameters(${JSON.stringify(name)})`;
