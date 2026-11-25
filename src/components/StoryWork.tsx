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

/** One lever behind a story. The merchant count is a lever's alone: one
 * merchant is on several levers, so a count across the story above would claim
 * more merchants than the partner has. */
export interface StoryLever {
  lever_id: string;
  name: string;
  meaning: string;
  saving_display: string;
  merchant_count: number;
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
  faint: string;
  hairSoft: string;
  rMd: string;
}

/** A count a partner reads, with the noun to match it. */
export const merchantsText = (count: number): string => (count === 1 ? '1 merchant' : `${count} merchants`);

/** What each owner is called in front of a partner. The backend validates to
 * the key; this is the only place the words live. */
const OWNER: Record<StoryPlanStep['owner'], string> = {
  you: 'You',
  acquirer: 'Your acquirer',
  merchants: 'Your merchants',
};

const label = (color: string) => ({
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: '.075em',
  textTransform: 'uppercase' as const,
  color,
  lineHeight: 1.35,
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
        <Typography sx={label(tokens.faint)}>The plan</Typography>
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
              {step.done_when && (
                <Typography sx={{ fontSize: 12.5, color: tokens.faint, marginTop: '3px' }}>
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      background: tokens.hairSoft,
                      borderRadius: '5px',
                      padding: '1px 7px',
                      fontSize: 11,
                      fontWeight: 700,
                      color: tokens.inkSoft,
                      marginRight: '6px',
                    }}
                  >
                    {OWNER[step.owner]}
                  </Box>
                  Done when {step.done_when}
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
          marginTop: '16px',
          borderTop: plan.length > 0 ? `1px solid ${tokens.hairSoft}` : 'none',
          paddingTop: plan.length > 0 ? '14px' : 0,
        }}
      >
        <Typography sx={label(tokens.faint)}>Where it comes from</Typography>
        {levers.map((lever) => (
          <Box key={lever.lever_id} sx={{ marginTop: '9px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
              <Typography sx={{ fontSize: 13.5, lineHeight: 1.5, color: tokens.inkSoft }}>{lever.name}</Typography>
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: tokens.ink, whiteSpace: 'nowrap' }}>
                {lever.saving_display}
              </Typography>
            </Box>
            {lever.merchant_count > 0 && (
              <Typography sx={{ fontSize: 12.5, color: tokens.faint, marginTop: '2px' }}>
                Across {merchantsText(lever.merchant_count)}
              </Typography>
            )}
            {lever.meaning && (
              <Typography sx={{ fontSize: 13, lineHeight: 1.55, color: tokens.inkSoft, marginTop: '3px' }}>
                {lever.meaning}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    )}
  </Box>
);
