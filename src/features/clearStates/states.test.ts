import { describe, expect, it } from 'vitest';
import { summarizeNames } from './states.ts';

describe('summarizeNames', () => {
  it('lists every name up to the limit', () => {
    expect(summarizeNames([])).toBe('');
    expect(summarizeNames(['Poison', 'Blind'])).toBe('Poison, Blind');
    expect(summarizeNames(['A', 'B', 'C', 'D'])).toBe('A, B, C, D');
  });

  it('counts the names past the limit', () => {
    expect(summarizeNames(['A', 'B', 'C', 'D', 'E', 'F'])).toBe(
      'A, B, C, D +2 more',
    );
    expect(summarizeNames(['A', 'B'], 1)).toBe('A +1 more');
  });
});
