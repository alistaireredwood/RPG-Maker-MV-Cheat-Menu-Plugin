import { defineFeature } from '@src/core/feature.ts';
import { currentGameTitle } from '@src/core/preferences.ts';
import type { MenuBuilder } from '@src/core/ui/builder.ts';
import { copyToClipboard } from '@src/core/ui/clipboard.ts';
import { pickTextFile } from '@src/core/ui/filePicker.ts';
import { updateMenu } from '@src/core/ui/render.ts';
import {
  dictionarySources,
  hasImportedDictionary,
  importDictionary,
  namedLabels,
  removeImportedDictionary,
  type SourceInfo,
} from '@src/shared/game/dictionarySources.ts';
import { countNames, nameOverrides } from '@src/shared/game/variableNames.ts';
import { escapeHtml } from '@src/shared/html.ts';
import {
  buildExport,
  exportMessage,
  importMessage,
  namesCount,
  parseJson,
  type Message,
} from './transfer.ts';

// Imports, exports and lists the names the Variables and Switches menus show.
// The imported dictionary is a per-game preference (in dictionarySources),
// so only the last message lives here.

let message: Message | null = null;

function show(next: Message): void {
  message = next;
  if (next.ok) SoundManager.playSystemSound(1);
  else SoundManager.playBuzzer();
  updateMenu();
}

function importFile(): void {
  pickTextFile(
    '.json,application/json',
    ({ name, text }) => {
      const parsed = parseJson(text);
      if (!parsed) {
        show({ ok: false, text: `${name}: not valid JSON` });
        return;
      }
      const result = importDictionary(name, parsed.value);
      show(importMessage(name, parsed.value, result, currentGameTitle()));
    },
    (error) => {
      console.error('[CheatMenu] dictionary import:', error);
      show({ ok: false, text: 'Could not read the file' });
    },
  );
}

function exportToClipboard(): void {
  const { file, count } = buildExport(
    {
      variables: namedLabels('variables', $dataSystem.variables),
      switches: namedLabels('switches', $dataSystem.switches),
    },
    nameOverrides(),
    currentGameTitle(),
  );
  show(exportMessage(count, copyToClipboard(JSON.stringify(file, null, 2))));
}

function removeImported(): void {
  if (!removeImportedDictionary()) {
    SoundManager.playBuzzer();
    return;
  }
  show({ ok: true, text: 'Removed the imported dictionary' });
}

const sourceLabel = (source: SourceInfo): string =>
  source.kind === 'imported' ? `Imported: ${source.name}` : source.name;

function renderSources(ui: MenuBuilder, sources: SourceInfo[]): void {
  ui.title('Names from', 'highest first');
  const custom = countNames(nameOverrides());
  if (custom > 0) {
    ui.wideDescription(`Your variable names: ${namesCount(custom)}`);
  }
  // full width: a file name doesn't fit the middle cell of a row
  for (const source of sources) {
    ui.wideDescription(
      `${escapeHtml(sourceLabel(source))}: ${namesCount(source.size)}`,
    );
  }
  ui.wideDescription('The game (System.json)');
}

export default defineFeature({
  id: 'dictionary',
  menus: [
    {
      id: 'dictionary',
      name: 'Dictionary',
      tier: 'advanced',
      render(ui) {
        const sources = dictionarySources();

        ui.cheatTitle();
        ui.title('Dictionary');
        ui.wideDescription(
          'Names for the Variables and Switches menus: fills in the ones the ' +
            'game left blank and translates the others. Only the labels in ' +
            'the menu change, never the game data.',
        );
        renderSources(ui, sources);

        ui.section('cheat-menu-buttons-section', () =>
          ui.buttonRow([
            { label: 'Import file…', onActivate: importFile },
            { label: 'Copy all names', onActivate: exportToClipboard },
          ]),
        );
        if (hasImportedDictionary()) {
          ui.button({ label: 'Remove imported', onActivate: removeImported });
        }

        if (message) {
          const cls = message.ok ? '' : ' class="error-text"';
          ui.wideDescription(`<span${cls}>${escapeHtml(message.text)}</span>`);
        }
      },
    },
  ],
});
