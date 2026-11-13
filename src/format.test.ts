import { describe, expect, it } from 'vitest';
import { formatCell, formatCompact, formatKpiValue } from './format';

describe('formatCell', () => {
  it('shows a missing value as a plain hyphen', () => {
    expect(formatCell(null)).toBe('-');
    expect(formatCell(undefined, 'gpv')).toBe('-');
  });

  it('keeps an ASCII minus on negative numbers, numeric strings and percentages', () => {
    expect(formatCell(-12.5)).toBe('-12.5');
    expect(formatCell('-0.75', 'margin')).toBe('-0.75%');
    expect(formatCell(-3, 'year')).toBe('-3');
  });
});

describe('formatKpiValue / formatCompact', () => {
  it('keeps an ASCII minus on compact negatives', () => {
    expect(formatCompact(-2_400_000)).toBe('-2.40M');
    expect(formatCompact(-18_200)).toBe('-18.2K');
    expect(formatKpiValue('-5530000.000000')).toBe('-5.53M');
  });
});
