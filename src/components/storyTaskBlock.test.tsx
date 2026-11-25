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

describe('a task in a story panel', () => {
  it('leads with the work and what it is worth', () => {
    const out = drawn(TASK);

    expect(out).toContain('Send Level 2 and Level 3 data with commercial card payments');
    expect(out).toContain('$14,813');
  });

  it('heads the split with where the savings go', () => {
    // Not "who keeps it": the question a partner is asking of these two
    // figures is where their money went, not who owns it.
    expect(drawn(TASK)).toContain('Where the savings go');
  });

  it('names the pricing model on each line, and counts merchants only on a lever', () => {
    // One merchant is on several levers, so a count across the task would
    // claim more merchants than the partner has. The backend sends the model
    // in the label, so a bracket here is the model, never a count.
    const out = drawn(TASK);

    expect(out).toContain('Yours as margin (buy rate)');
    expect(out).toContain('Your merchants keep this (interchange plus)');
    expect(out).not.toContain(' merchants)');
    expect(out).toContain('Across 12 merchants');
  });

  it('folds what it takes away until it is asked for', () => {
    const out = drawn(TASK);

    expect(out).toContain('What it takes');
    expect(out).not.toContain('Both Level 2 and Level 3 have to be there.');
  });

  it('offers nothing to open when there was nothing to write', () => {
    const out = drawn({ ...TASK, qualification: [], merchant_action: '', acquirer_action: '' });

    expect(out).not.toContain('What it takes');
    expect(out).toContain('Where it comes from');
  });

  it('lists every lever with the figure the backend sent', () => {
    const out = drawn(TASK);

    expect(out).toContain('Visa Commercial Corporate Credit Card Not Present - CEDP');
    expect(out).toContain('$7,606');
    expect(out).toContain('$7,207');
    // A lever the dashboard counted no merchants on says nothing about them.
    expect(out).not.toContain('Across 0 merchants');
  });

  it('counts one merchant in the singular', () => {
    expect(merchantsText(1)).toBe('1 merchant');
    expect(merchantsText(2)).toBe('2 merchants');
  });
});
