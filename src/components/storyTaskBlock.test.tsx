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
    { label: 'Yours as margin (Buy Rate)', saving_display: '$5,000' },
    { label: 'Your merchants keep this (IC++)', saving_display: '$9,813' },
  ],
  plan: [
    {
      what: 'Pass the tax amount and the line-item detail',
      detail: 'Both Level 2 and Level 3 have to be there.',
      owner: 'you',
      done_when: 'both levels reach the clearing record',
    },
    {
      what: 'Map the fields',
      detail: '',
      owner: 'acquirer',
      done_when: 'they land in the right positions',
    },
  ],
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
  // It collapsed behind its own title for a few hours. The plan is the reason
  // a partner opened the story, and every task carries a different one, so a
  // second click hid the only thing on the card they can act on.
  const raw = (task: StoryTask) => renderToStaticMarkup(<StoryTaskBlock task={task} tokens={TOKENS} />);

  it('leads with the work and what it is worth', () => {
    const out = drawn(TASK);

    expect(out).toContain('Send Level 2 and Level 3 data with commercial card payments');
    expect(out).toContain('$14,813');
  });

  it('shows the plan without being asked, each step owned', () => {
    const out = drawn(TASK);

    expect(out).toContain('The plan');
    expect(out).toContain('Pass the tax amount and the line-item detail');
    expect(out).toContain('Done when both levels reach the clearing record');
    expect(out).toContain('You');
    expect(out).toContain('Your acquirer');
  });

  it('shows the split and the levers with it', () => {
    const out = drawn(TASK);

    expect(out).toContain('Where the savings go');
    expect(out).toContain('Where it comes from');
    expect(out).toContain('Across 12 merchants');
    // A lever the dashboard counted no merchants on says nothing about them.
    expect(out).not.toContain('Across 0 merchants');
  });

  it('is not a control any more', () => {
    // Nothing opens or closes, so nothing claims to.
    expect(raw(TASK)).not.toContain('aria-expanded');
  });

  it('says nothing about a plan a task has none of', () => {
    const out = drawn({ ...TASK, plan: [] });

    expect(out).not.toContain('The plan');
    expect(out).toContain('Where it comes from');
  });

  it('names the pricing model on each line, and counts merchants only on a lever', () => {
    // One merchant is on several levers, so a count across the task would
    // claim more merchants than the partner has. The backend sends the model
    // in the label, so a bracket here is the model, never a count.
    const out = drawn(TASK);

    expect(out).toContain('Yours as margin (Buy Rate)');
    expect(out).toContain('Your merchants keep this (IC++)');
    expect(out).not.toMatch(/\(\d+ merchants?\)/);
  });

  it('counts one merchant in the singular', () => {
    expect(merchantsText(1)).toBe('1 merchant');
    expect(merchantsText(2)).toBe('2 merchants');
  });
});
