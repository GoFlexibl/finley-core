import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * What one interchange story takes and where its money comes from, as the
 * partner's feed dialog draws it and as the admin portal previews it before
 * pushing it.
 *
 * It lives here because it was written twice: ninety lines of near-identical
 * JSX in ui-app-new and ui-admin-portal, kept in sync by hand, where the whole
 * point of the preview is that it shows exactly what the partner will read. A
 * drift between the two is a preview that lies.
 *
 * One story is one piece of work. This used to draw a task, because a card
 * carried a partner's whole dashboard split into several: a reader opened one
 * title and found five plans under it, none of which the title was about. The
 * split happens before a story now, so there is a plan here and not a list of
 * them.
 *
 * Figures are the backend's own strings. Nothing here computes or formats a
 * partner's money; the only number this file makes is a count of accounts the
 * backend supplied, turned into words, and a bar whose width the backend sent.
 */

/** One lever behind a story. The count is a lever's alone: one account is on
 * several levers, so a count across the story above would claim more of them
 * than the partner has.
 *
 * Reach is shown in accounts, because an account is what a partner manages and
 * one of them holds one or more merchants. merchant_count is what the backend
 * sent before accounts were counted, kept so a story drafted then still has a
 * true figure rather than a number under a label that no longer fits. */
export interface StoryLever {
  lever_id: string;
  name: string;
  meaning: string;
  saving_display: string;
  merchant_count?: number;
  account_count?: number;
  /** This lever's share of the story's total, as a percentage from 0 to 100,
   * computed by the backend from figures it holds and this file does not.
   * Named for its unit on purpose: the attach and churn rates two screens away
   * are ratios, and a bar drawn from 0.597 instead of 59.7 would be a hairline
   * nobody questions. Absent on a story drafted before the backend sent it,
   * and then no bar is drawn rather than a guessed one. */
  share_pct?: number;
}

/** One line of a saving: where it goes, how much, and - on a lever, never on
 * a story - how many merchants. The label names the pricing model that decides
 * which way the money goes. Drawn by the card's own figures, above this
 * block. */
export interface StoryKeeps {
  label: string;
  saving_display: string;
  merchant_count?: number;
}

/** One step of the plan: what to do, how, who does it, and the state that says
 * it is finished. It replaced three fields - what qualifies, what your
 * merchants do, what your acquirer does - which a partner read as description
 * and could not start from. */
export interface StoryPlanStep {
  what: string;
  detail: string;
  /** One of exactly three the backend validates to. A step nobody owns is not
   * a step, and a model free to name an owner invents a team the partner does
   * not have. */
  owner: 'you' | 'acquirer' | 'merchants';
  done_when: string;
}

/** The colours and radius this block borrows from the app drawing it, so the
 * same markup reads as native in both. Each app passes its own design tokens;
 * this package does not own a second palette. */
export interface StoryWorkTokens {
  ink: string;
  inkSoft: string;
  hair: string;
  hairSoft: string;
  /** The page behind a card: the fill of a step's acceptance box. */
  paper: string;
  /** A card's own surface: the fill of an owner chip, which has to read as
   * raised off the acceptance box it sits in. */
  card: string;
  /** The filled part of a source's share bar. */
  brand: string;
  /** The fill and border of a step's number. */
  brandTint: string;
  brandRing: string;
  /** The one owner the partner is: their chip is filled, not outlined. */
  brandDeep: string;
}

/** A count a partner reads, with the noun to match it and a separator, because
 * a four-digit count with none misreads next to money that has one. */
const counted = (count: number, one: string, many: string): string =>
  `${count.toLocaleString('en-US')} ${count === 1 ? one : many}`;

export const accountsText = (count: number): string => counted(count, 'account', 'accounts');

export const merchantsText = (count: number): string => counted(count, 'merchant', 'merchants');

/**
 * How far one lever reaches, named for whatever the backend counted.
 *
 * Accounts when it counted accounts, merchants when the story predates that and
 * only has the old figure. Never a guess between the two: one account holds one
 * or more merchants, so printing a merchant count under the word accounts would
 * overstate the reach of every partner whose merchants share accounts, and this
 * is a figure on a partner's feed.
 */
export const reachText = (lever: Pick<StoryLever, 'account_count' | 'merchant_count'>): string => {
  if (lever.account_count) return accountsText(lever.account_count);
  if (lever.merchant_count) return merchantsText(lever.merchant_count);
  return '';
};

/**
 * How wide to draw a lever's bar, or nothing at all.
 *
 * The clamp is not arithmetic on a partner's money: it is the guard that keeps
 * a backend sending 120, or a negative, from drawing a bar out of its track.
 * A share this file cannot read leaves the bar out, because a bar of a guessed
 * width is a claim about the breakdown and this is a partner's feed.
 */
export const barWidth = (share?: number): string | null => {
  if (typeof share !== 'number' || !Number.isFinite(share) || share <= 0) return null;
  return `${Math.min(share, 100)}%`;
};

/** What each owner is called in front of a partner. The backend validates to
 * the key; this is the only place the words live. */
const OWNER: Record<StoryPlanStep['owner'], string> = {
  you: 'You',
  acquirer: 'Your acquirer',
  // The backend's key is still "merchants"; what a partner reads is accounts,
  // which is the level they manage and the noun the rest of the app uses.
  merchants: 'Your accounts',
};

/**
 * A section label, and a real heading element with it.
 *
 * It was a Typography default, so "The plan" and "The sources" rendered as
 * paragraphs: a reader on a screen reader had nothing to jump between and
 * nothing naming what they were in, four steps deep into a dialog that draws
 * no title of its own.
 */
const LABEL = {
  margin: 0,
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: '.075em',
  textTransform: 'uppercase' as const,
};

/** Figures line up down a column only if their digits are one width. */
const FIGURES = { fontVariantNumeric: 'tabular-nums' };

export const StoryWorkBlock: React.FC<{
  plan: StoryPlanStep[];
  levers: StoryLever[];
  tokens: StoryWorkTokens;
  /** The story's own total, already formatted by the backend, for the line
   * that says what the bars are shares of. Without it the bars still draw and
   * the line does not, because a footnote naming no figure explains nothing. */
  total?: string;
}> = ({ plan, levers, tokens, total }) => {
  const bars = levers.some((lever) => barWidth(lever.share_pct) !== null);

  return (
    // Open, and not a card inside the card. Opening the story is opening the
    // plan: it is the reason a partner opened it at all, and a second click to
    // reach it hid the only thing on the page they can act on.
    <Box>
      {plan.length > 0 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px' }}>
            <Typography component="h3" sx={{ ...LABEL, color: tokens.inkSoft }}>
              The plan
            </Typography>
            {/* How much there is to read, before the reading starts. The plan
                is the only part of a story whose length a partner cannot see
                at a glance, because the steps are long enough that the fourth
                is off the screen. */}
            <Typography sx={{ ...FIGURES, fontSize: 12, color: tokens.inkSoft, flex: 'none' }}>
              {counted(plan.length, 'step', 'steps')}
            </Typography>
          </Box>

          <Box component="ol" sx={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column' }}>
            {plan.map((step, at) => {
              const last = at === plan.length - 1;
              return (
                <Box
                  component="li"
                  // Two steps can read the same, so the position is the only
                  // key that is certainly unique.
                  key={`${at}-${step.what}`}
                  sx={{ display: 'grid', gridTemplateColumns: '32px 1fr', columnGap: '16px' }}
                >
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box
                      component="span"
                      sx={{
                        ...FIGURES,
                        width: 32,
                        height: 32,
                        flex: 'none',
                        borderRadius: '50%',
                        background: tokens.brandTint,
                        border: `1px solid ${tokens.brandRing}`,
                        boxSizing: 'border-box',
                        display: 'grid',
                        placeItems: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        color: tokens.ink,
                      }}
                    >
                      {at + 1}
                    </Box>
                    {/* The thread down the margin, which is what makes four
                        tall steps read as one sequence rather than four
                        paragraphs that happen to be numbered. */}
                    {!last && <Box component="span" sx={{ flex: 1, width: '1px', background: tokens.hair, margin: '6px 0' }} />}
                  </Box>

                  <Box sx={{ padding: last ? '4px 0 8px' : '4px 0 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <Typography sx={{ fontSize: 16, fontWeight: 600, lineHeight: '24px', color: tokens.ink }}>
                      {step.what}
                    </Typography>
                    {step.detail && (
                      <Typography sx={{ fontSize: 14, lineHeight: '20px', color: tokens.inkSoft }}>{step.detail}</Typography>
                    )}
                    {/* The acceptance line, which is the only thing on the step
                        a partner can check off, so it gets a surface of its own
                        and the owner sits on top of it rather than inline. */}
                    {step.done_when && (
                      <Box
                        sx={{
                          marginTop: '4px',
                          background: tokens.paper,
                          border: `1px solid ${tokens.hairSoft}`,
                          borderRadius: '8px',
                          padding: '10px 12px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                        }}
                      >
                        <Box>
                          <Box
                            component="span"
                            sx={{
                              display: 'inline-block',
                              fontSize: 12,
                              fontWeight: 700,
                              borderRadius: '8px',
                              padding: '2px 8px',
                              // The partner's own step is filled; the two they
                              // have to ask someone else for are outlined. A
                              // plan is read for what it asks of you first.
                              ...(step.owner === 'you'
                                ? { background: tokens.brandDeep, color: tokens.card }
                                : { background: tokens.card, border: `1px solid ${tokens.hair}`, color: tokens.ink }),
                            }}
                          >
                            {OWNER[step.owner]}
                          </Box>
                        </Box>
                        <Typography sx={{ fontSize: 12, lineHeight: '18px', color: tokens.inkSoft }}>
                          <Box component="span" sx={{ fontWeight: 700, color: tokens.ink }}>
                            Done when
                          </Box>{' '}
                          {step.done_when}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      )}

      {levers.length > 0 && (
        <Box
          sx={{
            marginTop: plan.length > 0 ? '20px' : 0,
            borderTop: plan.length > 0 ? `1px solid ${tokens.hair}` : 'none',
            paddingTop: plan.length > 0 ? '28px' : 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <Typography component="h3" sx={{ ...LABEL, color: tokens.inkSoft }}>
            The sources
          </Typography>

          {/* One table, not four free-floating rows. Every row used to be three
              full-width blocks with the money floated against a name that
              wraps, so the figures landed at a different height each time and
              nothing marked where one source ended: four of them read as one
              paragraph of near-identical card names. */}
          <Box sx={{ border: `1px solid ${tokens.hair}`, borderRadius: '12px', overflow: 'hidden' }}>
            {levers.map((lever, at) => {
              const reach = reachText(lever);
              const width = barWidth(lever.share_pct);
              return (
                <Box
                  key={lever.lever_id}
                  sx={{
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    borderTop: at > 0 ? `1px solid ${tokens.hair}` : 'none',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <Typography sx={{ fontSize: 14, fontWeight: 600, lineHeight: '20px', color: tokens.ink }}>
                        {lever.name}
                      </Typography>
                      {lever.meaning && (
                        <Typography sx={{ fontSize: 13, lineHeight: '18px', color: tokens.inkSoft }}>{lever.meaning}</Typography>
                      )}
                    </Box>
                    <Box sx={{ textAlign: 'right', flex: 'none', whiteSpace: 'nowrap' }}>
                      <Typography sx={{ ...FIGURES, fontSize: 16, fontWeight: 700, lineHeight: '20px', color: tokens.ink }}>
                        {lever.saving_display}
                      </Typography>
                      {reach && (
                        <Typography sx={{ ...FIGURES, fontSize: 12, lineHeight: '18px', color: tokens.inkSoft, marginTop: '4px' }}>
                          {reach}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  {width && (
                    // Decoration, as far as a screen reader is concerned: the
                    // figure it is a picture of is on the line above it.
                    <Box aria-hidden="true" sx={{ height: 4, background: tokens.hairSoft, borderRadius: '999px', overflow: 'hidden' }}>
                      <Box sx={{ width, height: '100%', background: tokens.brand, borderRadius: '999px' }} />
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {bars && total && (
            <Typography sx={{ fontSize: 12, lineHeight: '18px', color: tokens.inkSoft }}>
              Bars show each source&apos;s share of the{' '}
              <Box component="span" sx={{ ...FIGURES, fontWeight: 700, color: tokens.ink }}>
                {total}
              </Box>{' '}
              total.
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};
