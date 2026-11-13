/// <reference types="vite/client" />
/**
 * Guard: every string Finley shows a user is plain ASCII (team rule 6, CLAUDE.md
 * Conventions). Comments are exempt, so they are stripped before the check; what is
 * left is code, string literals and JSX text, which is what reaches a screen.
 */
import { describe, expect, it } from 'vitest';

const SOURCES = import.meta.glob<string>(['./**/*.ts', './**/*.tsx', '!./**/*.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

const withoutComments = (code: string): string =>
  code
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|\s)\/\/.*$/gm, '$1');

describe('plain ASCII in user-visible strings', () => {
  it('reads every source file', () => {
    expect(Object.keys(SOURCES)).toContain('./components/finleyBlocks.tsx');
  });

  it.each(Object.entries(SOURCES))('%s', (_path, code) => {
    const offending = withoutComments(code)
      .split('\n')
      .filter((line) => /[^\x00-\x7F]/.test(line))
      .map((line) => line.trim());
    expect(offending).toEqual([]);
  });
});
