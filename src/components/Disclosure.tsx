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
 * and that block is drawn by both of them. The partner app had this same
 * control hand-rolled twice already (common/Disclosure.tsx and
 * merchantReconciliationBeta); this is the one both apps can import.
 *
 * Colours come from the app drawing it, like every other part of the block.
 */

export interface DisclosureTokens {
  inkSoft: string;
  hairSoft: string;
}

export const Chevron: React.FC<{ open: boolean }> = ({ open }) => (
  <Box
    component="svg"
    width="14"
    height="14"
    viewBox="0 0 12 12"
    fill="none"
    aria-hidden="true"
    sx={{ flex: 'none', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .15s' }}
  >
    <path d="M3 4.5l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </Box>
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
      '&:hover': { background: tokens.hairSoft },
    }}
  >
    <Chevron open={open} />
    {label}
  </Box>
);
