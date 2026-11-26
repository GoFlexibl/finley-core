import { describe, expect, it } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  StoryWorkBlock,
  accountsText,
  merchantsText,
  reachText,
  type StoryLever,
  type StoryPlanStep,
  type StoryWorkTokens,
  barWidth,
} from './StoryWork';

// The words, without the styles MUI renders around them.
const words = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

const TOKENS: StoryWorkTokens = {
  ink: '#1f2a3a',
  inkSoft: '#3a4658',
  hair: '#e8eaf0',
  hairSoft: '#eef0f5',
  paper: '#f4f6f9',
  card: '#ffffff',
  brand: '#7FABFF',
  brandTint: '#eef4ff',
  brandRing: '#d4e3ff',
  brandDeep: '#4f76e6',
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
    account_count: 12,
    merchant_count: 19,
  },
  {
    lever_id: 'visa.enrich.cedp_business',
    name: 'Visa Commercial Small Business Credit Card Not Present - CEDP',
    meaning: '',
    saving_display: '$7,207',
    account_count: 0,
    merchant_count: 0,
  },
];

const raw = (plan: StoryPlanStep[] = PLAN, levers: StoryLever[] = LEVERS, total?: string) =>
  renderToStaticMarkup(<StoryWorkBlock plan={plan} levers={levers} tokens={TOKENS} total={total} />);
const drawn = (plan?: StoryPlanStep[], levers?: StoryLever[], total?: string) => words(raw(plan, levers, total));

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

    expect(out).toContain('The sources');
    expect(out).toContain('$7,606');
    expect(out).toContain('12 accounts');
    // A lever the dashboard counted nothing on says nothing about its reach.
    expect(out).not.toContain('0 accounts');
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
    expect(out).toContain('The sources');
  });

  it('draws no heading at all for a story with neither', () => {
    const out = drawn([], []);

    expect(out).not.toContain('The plan');
    expect(out).not.toContain('The sources');
  });

  it('counts the reach only on a lever', () => {
    // One account is on several levers, so a count across the story would
    // claim more of them than the partner has.
    expect(drawn()).not.toMatch(/\(\d+ accounts?\)/);
  });

  it('counts one of each in the singular, and separates the thousands', () => {
    expect(accountsText(1)).toBe('1 account');
    expect(accountsText(2)).toBe('2 accounts');
    expect(accountsText(3567)).toBe('3,567 accounts');
    expect(merchantsText(1)).toBe('1 merchant');
    expect(merchantsText(7126)).toBe('7,126 merchants');
  });

  it('says accounts when the backend counted them', () => {
    expect(reachText({ account_count: 12, merchant_count: 19 })).toBe('12 accounts');
  });

  it('falls back to merchants for a story drafted before accounts were counted', () => {
    // An account holds one or more merchants, so printing the old merchant count
    // under the word accounts would overstate the partner's reach.
    expect(reachText({ merchant_count: 19 })).toBe('19 merchants');
  });

  it('says nothing at all when neither count is there', () => {
    expect(reachText({})).toBe('');
    expect(reachText({ account_count: 0, merchant_count: 0 })).toBe('');
  });
});

describe('the share of the total each source is', () => {
  it('draws no bar for a story the backend sent no share with', () => {
    // Every story drafted before the backend counted shares. A bar of a
    // guessed width is a claim about the breakdown, on a partner's feed.
    expect(barWidth(undefined)).toBeNull();
    expect(raw()).not.toContain('border-radius:999px');
  });

  it('draws the bar at the width the backend sent', () => {
    const html = raw(PLAN, [{ ...LEVERS[0], share_pct: 59.7 }]);

    expect(html).toContain('width:59.7%');
  });

  it('keeps a bar inside its track whatever the backend sends', () => {
    // Not arithmetic on a partner's money: the guard that stops a share of
    // 120, or a negative one, from drawing outside the rail.
    expect(barWidth(120)).toBe('100%');
    expect(barWidth(0)).toBeNull();
    expect(barWidth(-4)).toBeNull();
    expect(barWidth(Number.NaN)).toBeNull();
  });

  it('says what the bars are shares of, and only when it has the figure', () => {
    // The figure is its own span, so the emotion rule for it lands between the
    // two halves of the sentence in the static markup.
    const withTotal = drawn(PLAN, [{ ...LEVERS[0], share_pct: 59.7 }], '$2,346,903');
    expect(withTotal).toContain('share of the');
    expect(withTotal).toContain('$2,346,903 total.');

    // A footnote naming no figure explains nothing.
    expect(drawn(PLAN, [{ ...LEVERS[0], share_pct: 59.7 }])).not.toContain('share of the');
    // And there is nothing to explain when no bar was drawn.
    expect(drawn(PLAN, LEVERS, '$2,346,903')).not.toContain('share of the');
  });
});

describe('what a screen reader is given', () => {
  it('names its two sections with real headings', () => {
    // They were Typography defaults, so they rendered as paragraphs: four
    // steps into a dialog that draws no title, there was nothing to jump
    // between and nothing naming what you were in.
    const html = raw();

    expect(html).toContain('<h3');
    expect(html.match(/<h3/g)).toHaveLength(2);
  });

  it('says how long the plan is before it is read', () => {
    expect(drawn()).toContain('2 steps');
    expect(drawn([PLAN[0]], LEVERS)).toContain('1 step');
  });
});
