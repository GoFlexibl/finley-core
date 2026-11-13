/// <reference types="vite/client" />
/**
 * Guard: every string Finley shows a user is plain ASCII (team rule 6, CLAUDE.md
 * Conventions). It reads what can reach a screen with the TypeScript parser: string
 * literals, template literal text and JSX text. Comments are never collected, and a
 * "/*" inside a string cannot hide the rest of a file, because nothing is stripped by
 * pattern. Values are checked as they render (escapes decoded).
 */
import * as ts from 'typescript';
import { describe, expect, it } from 'vitest';

const SOURCES = import.meta.glob<string>(['./**/*.ts', './**/*.tsx', '!./**/*.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
});

/** Not shown to anyone: the byte-order mark that opens the CSV export so Excel reads UTF-8. */
const NOT_SHOWN = /\uFEFF/g;

/** Every piece of text in `code` that can reach a screen, decoded. */
const visibleText = (fileName: string, code: string): string[] => {
  const kind = fileName.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS;
  const sf = ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true, kind);
  const found: string[] = [];
  const visit = (node: ts.Node): void => {
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateHead(node) ||
      ts.isTemplateMiddle(node) ||
      ts.isTemplateTail(node) ||
      ts.isJsxText(node)
    ) {
      found.push(node.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(sf);
  return found;
};

const nonAscii = (fileName: string, code: string): string[] =>
  visibleText(fileName, code)
    .filter((text) => /[^\x00-\x7F]/.test(text.replace(NOT_SHOWN, '')))
    .map((text) => text.trim());

describe('the scanner', () => {
  it('reads strings, templates and JSX text, and skips comments', () => {
    const code = [
      '// a comment \u2014 exempt',
      '/* a block comment \u00b7 exempt */',
      "const a = 'one \u00b7 two';",
      'const b = `three ${a} four \u2192 five`;',
      'const c = <p>six \u2026</p>;',
    ].join('\n');
    expect(nonAscii('x.tsx', code)).toEqual(['one \u00b7 two', 'four \u2192 five', 'six \u2026']);
  });

  it('a "/*" inside a string does not hide the rest of the file', () => {
    const code = ['const accept = "image/*";', "const label = 'Saving\u2026';", '// */'].join('\n');
    expect(nonAscii('x.ts', code)).toEqual(['Saving\u2026']);
  });

  it('checks escapes as they render', () => {
    expect(nonAscii('x.ts', "const d = '\\u2014';")).toEqual(['\u2014']);
  });
});

describe('plain ASCII in user-visible strings', () => {
  it('reads every source file', () => {
    expect(Object.keys(SOURCES)).toContain('./components/finleyBlocks.tsx');
  });

  it.each(Object.entries(SOURCES))('%s', (path, code) => {
    expect(nonAscii(path, code)).toEqual([]);
  });
});
