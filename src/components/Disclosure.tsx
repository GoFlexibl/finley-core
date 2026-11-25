import React from 'react';
import { Box } from '@mui/material';

/**
 * A chevron that opens something below it.
 *
 * Not a link: nothing is navigated to. A link's underline and blue say "this
 * takes you somewhere", and when it does not, the only thing telling you what
 * state you are in is the verb in its label ("What it takes" / "Hide what it
 * takes"). The chevron carries the state instead, so the control shows what it
 * will do without having to be read.
 *
 * It lives here rather than in either app because the story task block does,
 * and that block is drawn by both of them. The partner app has this same
 * control twice more (common/Disclosure.tsx and merchantReconciliationBeta).
 * Neither was folded into this one: common/Disclosure takes a count the
 * forecast page passes and this does not, so consolidating them is its own
 * change rather than a quiet behaviour swap.
 *
 * Colours come from the app drawing it, like every other part of the block.
 */

export interface DisclosureTokens {
  inkSoft: string;
  hairSoft: string;
}

export const Chevron: React.FC<{ open: boolean }> = ({ open }) => (
  // A plain svg, not Box component="svg". MUI reads width and height as system
  // props, so width="14" became the CSS `width: 14`, which has no unit and is
  // dropped: the chevron lost its size and drew at the browser's default,
  // squeezing its own label into a column three words tall.
  <svg
    width="14"
    height="14"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
    style={{
      flex: 'none',
      transform: open ? 'rotate(180deg)' : 'none',
      transition: 'transform .15s',
    }}
  >
    <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Short. The chevron says "opens"; the label only needs to say what. */
export const Disclosure: React.FC<{
  open: boolean;
  onToggle: () => void;
  label: string;
  tokens: DisclosureTokens;
}> = ({ open, onToggle, label, tokens }) => (
  <Box
    component="button"
    type="button"
    onClick={onToggle}
    aria-expanded={open}
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      marginTop: '12px',
      padding: '6px 10px 6px 6px',
      border: 0,
      borderRadius: '8px',
      background: 'transparent',
      color: tokens.inkSoft,
      font: 'inherit',
      fontSize: 13,
      fontWeight: 700,
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      '&:hover': { background: tokens.hairSoft },
      // Inset, because the card that holds these clips its overflow and an
      // outline painted outside the border box is clipped to a hairline.
      '&:focus-visible': { outline: 'none', boxShadow: `inset 0 0 0 2px ${tokens.inkSoft}` },
    }}
  >
    <Chevron open={open} />
    {label}
  </Box>
);
