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

  it('autoIdLabels on (the default, Switches): #0042 only when nothing is named', () => {
    const options = { autoIdLabels: true };
    expect(systemNameLabels(['', 'Gold', ''], options)).toEqual([
      null,
      'Gold',
      null,
    ]);
    expect(systemNameLabels(['', '', ''], options)).toEqual([null, '#1', '#2']);
  });

  it('autoIdLabels off (Variables): unnamed ids are null even when nothing is named', () => {
    const options = { autoIdLabels: false };
    expect(systemNameLabels(['', 'Gold', ''], options)).toEqual([
      null,
      'Gold',
      null,
    ]);
    expect(systemNameLabels(['', '', ''], options)).toEqual([null, null, null]);
  });

  it('caches each option separately', () => {
    const names = ['', '', ''];
    const off = systemNameLabels(names, { autoIdLabels: false });
    const on = systemNameLabels(names);
    expect(on).toEqual([null, '#1', '#2']);
    expect(systemNameLabels(names, { autoIdLabels: false })).toBe(off);
    expect(systemNameLabels(names)).toBe(on);
  });
});
