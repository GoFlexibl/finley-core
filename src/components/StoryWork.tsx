import React from 'react';
import { Box, Typography } from '@mui/material';

/**
 * What one interchange story takes and where its money comes from, as the
 * partner's feed panel draws it and as the admin portal previews it before
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
 * partner's money; the only number this file makes is a count of merchants the
 * backend supplied, turned into words.
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
  muted: string;
  hair: string;
  hairSoft: string;
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
 * A section heading, which is what these are. They were 10.5px uppercase in the
 * palest ink the app has, which at 2.3:1 on the panel's own background is under
 * half the contrast small text is meant to have: the two headings that say what
 * a partner is looking at were the least readable thing on the page.
 */
const heading = (color: string) => ({
  fontSize: 13.5,
  fontWeight: 700,
  color,
  lineHeight: 1.4,
});

export const StoryWorkBlock: React.FC<{
  plan: StoryPlanStep[];
  levers: StoryLever[];
  tokens: StoryWorkTokens;
}> = ({ plan, levers, tokens }) => (
  // Open, and not a card inside the card. Opening the story is opening the
  // plan: it is the reason a partner opened it at all, and a second click to
  // reach it hid the only thing on the page they can act on.
  <Box sx={{ marginTop: '4px' }}>
    {plan.length > 0 && (
      <Box sx={{ marginTop: '16px' }}>
        <Typography sx={heading(tokens.ink)}>The plan</Typography>
        {plan.map((step, at) => (
          <Box
            // Two steps can read the same, so the position is the only key
            // that is certainly unique.
            key={`${at}-${step.what}`}
            sx={{ display: 'flex', gap: '11px', marginTop: '11px' }}
          >
            <Box
              sx={{
                flex: 'none',
                width: 19,
                height: 19,
                borderRadius: '50%',
                background: tokens.hairSoft,
                color: tokens.inkSoft,
                fontSize: 11,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: '2px',
              }}
            >
              {at + 1}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: tokens.ink, lineHeight: 1.45 }}>
                {step.what}
              </Typography>
              {step.detail && (
                <Typography sx={{ fontSize: 13, lineHeight: 1.55, color: tokens.inkSoft, marginTop: '2px' }}>
                  {step.detail}
                </Typography>
              )}
              {/* The acceptance line, which is the only thing on the step a
                  partner can check off, so it is readable ink. What keeps it
                  quieter than the detail above is its size, not a colour nobody
                  can read: only the two words that frame it stay muted. */}
              {step.done_when && (
                <Typography sx={{ fontSize: 12.5, lineHeight: 1.5, color: tokens.inkSoft, marginTop: '4px' }}>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      background: tokens.hairSoft,
                      borderRadius: '5px',
                      padding: '1px 7px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: tokens.ink,
                      marginRight: '6px',
                    }}
                  >
                    {OWNER[step.owner]}
                  </Box>
                  <Box component="span" sx={{ color: tokens.muted }}>
                    Done when
                  </Box>{' '}
                  {step.done_when}
                </Typography>
              )}
            </Box>
          </Box>
        ))}
      </Box>
    )}

    {levers.length > 0 && (
      <Box
        sx={{
          marginTop: '26px',
          borderTop: plan.length > 0 ? `1px solid ${tokens.hair}` : 'none',
          paddingTop: plan.length > 0 ? '18px' : 0,
        }}
      >
        <Typography sx={heading(tokens.ink)}>The sources</Typography>
        {/* One source per row, closed by a hairline. Every row used to be three
            full-width blocks with the money floated against a name that wraps,
            so the figures landed at a different height each time and nothing
            marked where one source ended: four of them read as one paragraph of
            near-identical card names. The right column owns the numbers now, so
            the money can be read down without reading a single name. */}
        {levers.map((lever, at) => {
          const reach = reachText(lever);
          return (
            <Box
              key={lever.lever_id}
              sx={{
                padding: '14px 0',
                borderBottom: at < levers.length - 1 ? `1px solid ${tokens.hairSoft}` : 'none',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'baseline' }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.45, color: tokens.ink }}>
                  {lever.name}
                </Typography>
                <Box sx={{ textAlign: 'right', whiteSpace: 'nowrap', flex: 'none' }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 700, color: tokens.ink }}>
                    {lever.saving_display}
                  </Typography>
                  {reach && (
                    <Typography sx={{ fontSize: 11.5, color: tokens.muted, marginTop: '1px' }}>{reach}</Typography>
                  )}
                </Box>
              </Box>
              {lever.meaning && (
                <Typography sx={{ fontSize: 13, lineHeight: 1.55, color: tokens.inkSoft, marginTop: '6px' }}>
                  {lever.meaning}
                </Typography>
              )}
            </Box>
          );
        })}
      </Box>
    )}
  </Box>
);
