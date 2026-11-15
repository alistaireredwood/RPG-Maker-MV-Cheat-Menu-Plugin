import { beforeEach, describe, expect, it } from 'vitest';
import {
  beginValueInputPass,
  endValueInputPass,
  markValueInputRendered,
  widgetState,
} from './widgetState.ts';

const draft = (text: string) => ({ text, caret: text.length });

describe('value input drafts across renders', () => {
  beforeEach(() => {
    widgetState.valueInputDrafts = {};
    widgetState.activeValueInputKey = null;
  });

  const render = (...inputKeys: string[]) => {
    beginValueInputPass();
    inputKeys.forEach(markValueInputRendered);
    endValueInputPass();
  };

  it('two inputs on screen keep their drafts (the 1 s refresh)', () => {
    widgetState.valueInputDrafts = { min: draft('1'), max: draft('9') };
    widgetState.activeValueInputKey = 'max';
    render('min', 'max');
    render('min', 'max');
    expect(widgetState.valueInputDrafts).toEqual({
      min: draft('1'),
      max: draft('9'),
    });
    expect(widgetState.activeValueInputKey).toBe('max');
  });

  it('drops the draft and focus of an input that is no longer drawn', () => {
    widgetState.valueInputDrafts = { 'variable:12': draft('5') };
    widgetState.activeValueInputKey = 'variable:12';
    render('variable:13');
    expect(widgetState.valueInputDrafts).toEqual({});
    expect(widgetState.activeValueInputKey).toBeNull();
  });

  it('a render without inputs (main grid) drops every draft', () => {
    widgetState.valueInputDrafts = { min: draft('1') };
    widgetState.activeValueInputKey = 'min';
    render();
    expect(widgetState.valueInputDrafts).toEqual({});
    expect(widgetState.activeValueInputKey).toBeNull();
  });
});
