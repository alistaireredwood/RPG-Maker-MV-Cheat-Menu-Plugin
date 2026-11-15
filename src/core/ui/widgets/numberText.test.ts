import { describe, expect, it } from 'vitest';
import { sanitizeNumberText } from './numberText.ts';

describe('sanitizeNumberText', () => {
  it('integer: keeps digits and a leading minus', () => {
    expect(sanitizeNumberText('123', 'integer')).toBe('123');
    expect(sanitizeNumberText('-45', 'integer')).toBe('-45');
    expect(sanitizeNumberText('1a2b3', 'integer')).toBe('123');
    expect(sanitizeNumberText('1.5', 'integer')).toBe('15');
    expect(sanitizeNumberText('1-2', 'integer')).toBe('12');
    expect(sanitizeNumberText('--3', 'integer')).toBe('-3');
    expect(sanitizeNumberText(' 7 ', 'integer')).toBe('7');
  });

  it('decimal: also keeps the first dot', () => {
    expect(sanitizeNumberText('-1.5', 'decimal')).toBe('-1.5');
    expect(sanitizeNumberText('1.2.3', 'decimal')).toBe('1.23');
    expect(sanitizeNumberText('.5', 'decimal')).toBe('.5');
    expect(sanitizeNumberText('abc', 'decimal')).toBe('');
    expect(sanitizeNumberText('1e3', 'decimal')).toBe('13');
  });

  it('a prefix sanitizes to the caret position in the result', () => {
    const text = '1a2.3.4';
    const caret = 5; // after the second '.'
    const clean = sanitizeNumberText(text, 'decimal');
    const pos = sanitizeNumberText(text.slice(0, caret), 'decimal').length;
    expect(clean).toBe('12.34');
    expect(clean.slice(0, pos)).toBe('12.3');
  });
});
