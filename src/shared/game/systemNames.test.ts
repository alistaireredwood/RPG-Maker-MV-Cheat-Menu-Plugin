import { describe, expect, it } from 'vitest';
import { systemNameLabels } from './systemNames.ts';

describe('systemNameLabels', () => {
  it('keeps names and hides unnamed ids when the game names any entry', () => {
    expect(systemNameLabels(['', 'Gold', '', 'Day'])).toEqual([
      null,
      'Gold',
      null,
      'Day',
    ]);
  });

  it('labels every id by number when all names are blank', () => {
    const names = Array<string>(12).fill('');
    expect(systemNameLabels(names)).toEqual([
      null,
      '#01',
      '#02',
      '#03',
      '#04',
      '#05',
      '#06',
      '#07',
      '#08',
      '#09',
      '#10',
      '#11',
    ]);
  });

  it('treats the unused slot 0 as neither named nor labelled', () => {
    expect(systemNameLabels(['ignored', '', ''])).toEqual([null, '#1', '#2']);
  });
});
