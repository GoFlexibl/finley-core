import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StoryTaskBlock, merchantsText, type StoryTask, type StoryTaskTokens } from './StoryTaskBlock';

// The words, without the styles MUI renders around them.
const words = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const TOKENS: StoryTaskTokens = {
  ink: '#1f2a3a',
  inkSoft: '#3a4658',
  faint: '#9aa3b5',
  hairSoft: '#eef0f5',
  brand: '#7FABFF',
  rMd: '12px',
};

const TASK: StoryTask = {
  task_id: 'task-1',
  name: 'Send Level 2 and Level 3 data with commercial card payments',
  saving_display: '$14,813',
  goes_to: [
    { label: 'Yours as margin (buy rate)', saving_display: '$5,000' },
    { label: 'Your merchants keep this (interchange plus)', saving_display: '$9,813' },
  ],
  qualification: ['Both Level 2 and Level 3 have to be there.'],
  merchant_action: 'Pass the tax amount and the line-item detail.',
  acquirer_action: 'Enrol the merchants and map the fields.',
  levers: [
    {
      lever_id: 'visa.enrich.cedp_corporate',
      name: 'Visa Commercial Corporate Credit Card Not Present - CEDP',
      meaning: 'Send the extra invoice detail with the payment.',
      saving_display: '$7,606',
      merchant_count: 12,
    },
    {
      lever_id: 'visa.enrich.cedp_business',
      name: 'Visa Commercial Small Business Credit Card Not Present - CEDP',
      meaning: '',
      saving_display: '$7,207',
      merchant_count: 0,
    },
  ],
};

const drawn = (task: StoryTask) => words(renderToStaticMarkup(<StoryTaskBlock task={task} tokens={TOKENS} />));

describe('a task in a story panel, closed', () => {
  // It starts closed, so what these assert is the whole of what a reader sees
  // before they choose this piece of work. Opening it needs a DOM, which this
  // package has no runner for; the partner app drives that (StoryCard.test).
  const raw = (task: StoryTask) => renderToStaticMarkup(<StoryTaskBlock task={task} tokens={TOKENS} />);

  it('leads with the work and what it is worth', () => {
    const out = drawn(TASK);

    expect(out).toContain('Send Level 2 and Level 3 data with commercial card payments');
    expect(out).toContain('$14,813');
  });

  it('makes the title itself the control, and says it is shut', () => {
    // The whole row, not a chevron beside it: the title is what a reader aims
    // at, and a target the width of the card is one nobody misses.
    const out = raw(TASK);

    expect(out).toContain('aria-expanded="false"');
    expect(out).toMatch(/<button[^>]*>.*Send Level 2 and Level 3 data/s);
  });

  it('holds everything else back until it is opened', () => {
    const out = drawn(TASK);

    expect(out).not.toContain('Where the savings go');
    expect(out).not.toContain('Yours as margin (buy rate)');
    expect(out).not.toContain('What it takes');
    expect(out).not.toContain('Where it comes from');
    expect(out).not.toContain('Visa Commercial Corporate Credit Card Not Present - CEDP');
  });

  it('opens with a chevron rather than a blue link', () => {
    // A link's underline and blue say "this takes you somewhere". Nothing is
    // navigated to here, and the verb in a label was the only thing saying
    // which way the control would go.
    const out = raw(TASK);

    // The chevron itself, pointing down because the block is shut. Its size is
    // asserted because losing it is exactly how this broke: MUI read
    // width="14" on a Box as a style prop, emitted the unitless `width: 14`,
    // and the browser dropped it. The path still rendered, at 0x0 on one
    // control and 86x86 on the other.
    expect(out).toContain('width="14"');
    expect(out).toContain('height="14"');
    expect(out).toContain('M3 4.5l3 3 3-3');
    expect(out).not.toContain('rotate(180deg)');
    // and none of what a link looks like
    expect(out).not.toContain('text-decoration:underline');
  });

  it('counts one merchant in the singular', () => {
    expect(merchantsText(1)).toBe('1 merchant');
    expect(merchantsText(2)).toBe('2 merchants');
  });
});
