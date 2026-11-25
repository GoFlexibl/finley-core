import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { StoryWorkBlock, merchantsText, type StoryLever, type StoryPlanStep, type StoryWorkTokens } from './StoryWork';

// The words, without the styles MUI renders around them.
const words = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const TOKENS: StoryWorkTokens = {
  ink: '#1f2a3a',
  inkSoft: '#3a4658',
  faint: '#9aa3b5',
  hairSoft: '#eef0f5',
  rMd: '12px',
};

const PLAN: StoryPlanStep[] = [
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
];

const LEVERS: StoryLever[] = [
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
];

const raw = (plan: StoryPlanStep[] = PLAN, levers: StoryLever[] = LEVERS) =>
  renderToStaticMarkup(<StoryWorkBlock plan={plan} levers={levers} tokens={TOKENS} />);
const drawn = (plan?: StoryPlanStep[], levers?: StoryLever[]) => words(raw(plan, levers));

describe('what a story takes', () => {
  it('shows the plan without being asked, each step owned', () => {
    const out = drawn();

    expect(out).toContain('The plan');
    expect(out).toContain('Pass the tax amount and the line-item detail');
    expect(out).toContain('Done when both levels reach the clearing record');
    expect(out).toContain('You');
    expect(out).toContain('Your acquirer');
  });

  it('numbers the steps in the order they would be done', () => {
    const out = drawn();

    expect(out.indexOf('1')).toBeLessThan(out.indexOf('Pass the tax amount'));
    expect(out.indexOf('Pass the tax amount')).toBeLessThan(out.indexOf('Map the fields'));
  });

  it('shows the levers the money comes from', () => {
    const out = drawn();

    expect(out).toContain('Where it comes from');
    expect(out).toContain('$7,606');
    expect(out).toContain('Across 12 merchants');
    // A lever the dashboard counted no merchants on says nothing about them.
    expect(out).not.toContain('Across 0 merchants');
  });

  it('is not a control, and carries no title or figure of its own', () => {
    // The story's own title and total are the card's. This used to be a task
    // inside a card, with a name and an amount repeated here.
    const out = raw();

    expect(out).not.toContain('aria-expanded');
    expect(words(out)).not.toContain('$14,813');
  });

  it('says nothing about a plan a story has none of', () => {
    const out = drawn([]);

    expect(out).not.toContain('The plan');
    expect(out).toContain('Where it comes from');
  });

  it('draws no heading at all for a story with neither', () => {
    const out = drawn([], []);

    expect(out).not.toContain('The plan');
    expect(out).not.toContain('Where it comes from');
  });

  it('counts merchants only on a lever', () => {
    // One merchant is on several levers, so a count across the story would
    // claim more merchants than the partner has.
    expect(drawn()).not.toMatch(/\(\d+ merchants?\)/);
  });

  it('counts one merchant in the singular', () => {
    expect(merchantsText(1)).toBe('1 merchant');
    expect(merchantsText(2)).toBe('2 merchants');
  });
});
