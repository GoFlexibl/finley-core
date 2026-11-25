import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import { Chevron, Disclosure } from './Disclosure';

/**
 * One task of an interchange story, as the partner's feed panel draws it and
 * as the admin portal previews it before pushing it.
 *
 * It lives here because it was written twice: ninety lines of near-identical
 * JSX in ui-app-new and ui-admin-portal, kept in sync by hand, where the whole
 * point of the preview is that it shows exactly what the partner will read. A
 * drift between the two is a preview that lies.
 *
 * Figures are the backend's own strings. Nothing here computes or formats a
 * partner's money; the only number this file makes is a count of merchants the
 * backend supplied, turned into words.
 */

/** One lever inside a task. The merchant count is a lever's alone: one
 * merchant is on several levers, so a count across the task above would claim
 * more merchants than the partner has. */
export interface StoryLever {
  lever_id: string;
  name: string;
  meaning: string;
  saving_display: string;
  merchant_count: number;
}

/** One line of a saving: where it goes, how much, and - on a lever, never on
 * a task - how many merchants. The label names the pricing model that decides
 * which way the money goes; the sentence explaining that is said once, on the
 * card, so it is not repeated under every task here. */
export interface StoryKeeps {
  label: string;
  saving_display: string;
  merchant_count?: number;
}

/** The work it would take, and the levers whose savings it would get. Their
 * figures add up to the task's, and the tasks add up to the total on the
 * card. */
export interface StoryTask {
  task_id: string;
  name: string;
  saving_display: string;
  goes_to: StoryKeeps[];
  qualification: string[];
  merchant_action: string;
  acquirer_action: string;
  levers: StoryLever[];
}

/** The colours and radius this block borrows from the app drawing it, so the
 * same markup reads as native in both. Each app passes its own design tokens;
 * this package does not own a second palette. */
export interface StoryTaskTokens {
  ink: string;
  inkSoft: string;
  faint: string;
  hairSoft: string;
  brand: string;
  rMd: string;
}

/** A count a partner reads, with the noun to match it. */
export const merchantsText = (count: number): string => (count === 1 ? '1 merchant' : `${count} merchants`);

const label = (color: string) => ({
  fontSize: 10.5,
  fontWeight: 700,
  letterSpacing: '.075em',
  textTransform: 'uppercase' as const,
  color,
  lineHeight: 1.35,
});

const DetailText: React.FC<{ title: string; text: string; tokens: StoryTaskTokens }> = ({ title, text, tokens }) => (
  <Box sx={{ marginTop: '14px' }}>
    <Typography sx={label(tokens.faint)}>{title}</Typography>
    <Typography sx={{ fontSize: 13.5, lineHeight: 1.6, color: tokens.inkSoft, marginTop: '5px' }}>{text}</Typography>
  </Box>
);

export const StoryTaskBlock: React.FC<{ task: StoryTask; tokens: StoryTaskTokens }> = ({ task, tokens }) => {
  // The task itself, and what it takes inside it. Both start closed: a story
  // of four tasks opened all the way is a wall, and the reader came to pick
  // one piece of work, not to read every piece at once.
  const [open, setOpen] = useState(false);
  const [takes, setTakes] = useState(false);
  const hasDetail = task.qualification.length > 0 || task.merchant_action !== '' || task.acquirer_action !== '';

  return (
    <Box sx={{ border: `1px solid ${tokens.hairSoft}`, borderRadius: tokens.rMd, marginTop: '12px', overflow: 'hidden' }}>
      {/* The whole row is the control, not a chevron beside it: the title is
          what a reader aims at, and a target the width of the card is one
          nobody misses. The chevron sits left of the title so it stays put
          when a long name wraps. */}
      <Box
        component="button"
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
          width: '100%',
          padding: '16px 18px',
          border: 0,
          background: 'transparent',
          font: 'inherit',
          color: tokens.ink,
          textAlign: 'left',
          cursor: 'pointer',
          '&:hover': { background: tokens.hairSoft },
          // Inset: this card clips its overflow for the rounded hover, and an
          // outline painted outside the border box would be clipped with it.
          '&:focus-visible': { outline: 'none', boxShadow: `inset 0 0 0 2px ${tokens.inkSoft}` },
        }}
      >
        <Box sx={{ marginTop: '3px', color: tokens.inkSoft, display: 'flex' }}>
          <Chevron open={open} />
        </Box>
        <Typography sx={{ flex: 1, fontSize: 15, fontWeight: 700, color: tokens.ink, lineHeight: 1.4 }}>
          {task.name}
        </Typography>
        <Typography sx={{ fontSize: 16, fontWeight: 700, color: tokens.ink, whiteSpace: 'nowrap' }}>
          {task.saving_display}
        </Typography>
      </Box>

      {open && (
      <Box sx={{ padding: '0 18px 16px' }}>

      {task.goes_to.length > 0 && (
        <Box sx={{ marginTop: '3px' }}>
          <Typography sx={label(tokens.faint)}>Where the savings go</Typography>
          {task.goes_to.map((row) => (
            <Box key={row.label} sx={{ display: 'flex', justifyContent: 'space-between', gap: '12px', marginTop: '6px' }}>
              <Typography sx={{ fontSize: 13.5, lineHeight: 1.5, color: tokens.inkSoft }}>
                {row.label}
                {row.merchant_count ? ` (${merchantsText(row.merchant_count)})` : ''}
              </Typography>
              <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: tokens.ink, whiteSpace: 'nowrap' }}>
                {row.saving_display}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {hasDetail && (
        <>
          <Disclosure open={takes} onToggle={() => setTakes(!takes)} label="What it takes" tokens={tokens} />

          {takes && (
            <Box>
              {task.qualification.length > 0 && (
                <Box sx={{ marginTop: '14px' }}>
                  <Typography sx={label(tokens.faint)}>What qualifies</Typography>
                  <Box component="ul" sx={{ margin: '5px 0 0', paddingLeft: '18px' }}>
                    {task.qualification.map((line, at) => (
                      <Box
                        component="li"
                        // Two lines of a task can read the same, so the
                        // position is the only key that is certainly unique.
                        key={`${at}-${line}`}
                        sx={{ fontSize: 13.5, lineHeight: 1.6, color: tokens.inkSoft, marginTop: '4px' }}
                      >
                        {line}
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
              {task.merchant_action && (
                <DetailText title="What your merchants do" text={task.merchant_action} tokens={tokens} />
              )}
              {task.acquirer_action && (
                <DetailText title="What your acquirer does" text={task.acquirer_action} tokens={tokens} />
              )}
            </Box>
          )}
        </>
      )}

      <Box sx={{ marginTop: '16px', borderTop: `1px solid ${tokens.hairSoft}`, paddingTop: '12px' }}>
        <Typography sx={label(tokens.faint)}>Where it comes from</Typography>
        {task.levers.map((lever) => (
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
      </Box>
      )}
    </Box>
  );
};
