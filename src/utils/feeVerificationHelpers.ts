/**
 * Pure, stateless helpers for the Fees-Verification Finley flow.
 *
 * Per-page intent detection and fee-context formatting in one place. Prime
 * candidates to move server-side later (let the backend agent decide intent from
 * `page_context` instead of the client matching regexes). String in, value out —
 * no component state, no stores.
 */

/**
 * Detect an imperative status change ("mark this overcharged", "put it back to
 * review"). Returns the target status, or null when the text is a question or
 * carries no change verb.
 */
export const detectFvStatusIntent = (q: string): string | null => {
  const s = q.toLowerCase().trim();
  if (/\?\s*$/.test(s)) return null;
  if (/^(should|can|could|would|do|does|is|are|what|why|how|which|will|may|if)\b/.test(s)) return null;
  if (!/\b(mark|set|change|move|put|revert|reset|undo|flag|classify|make|tag|switch)\b/.test(s)) return null;
  if (/needs?\s*review|put.*back|revert|reset|undo|back to review/.test(s)) return 'needs_review';
  if (/overcharg/.test(s)) return 'overcharged';
  if (/undercharg/.test(s)) return 'undercharged';
  if (/review/.test(s)) return 'reviewed';
  if (/mismatch/.test(s)) return 'mismatch';
  return null;
};

/**
 * Detect a portfolio-level breakdown QUESTION (over/undercharged across the
 * period). Returns the requested slice, or null when it isn't a breakdown ask.
 */
export const detectFvBreakdownIntent = (q: string): 'overcharged' | 'undercharged' | 'both' | null => {
  const s = q.toLowerCase();
  if (!/(break ?down|break it|breakout|by fee|by merchant|portfolio|which fee|which merchant|biggest|top |distribut|split|drill|where.*com|what.*driv)/.test(s)) return null;
  const over = /overcharg|overbill/.test(s);
  const under = /undercharg|underbill/.test(s);
  if (over && !under) return 'overcharged';
  if (under && !over) return 'undercharged';
  return 'both';
};

/** Summary/KPI question about the fees-verification period(s). */
export const detectFvSummaryIntent = (q: string): boolean =>
  /summar|overview|recap|key metric|\bkpi|how.*(doing|look)|coverage|verification rate|how many|overall/.test(q.toLowerCase());

/**
 * Build a plain-text context describing a fee across all three sources
 * (statement / merchant profile / residual), so the Claude backend can answer
 * free-form questions about it with full grounding.
 */
export const buildFeeContext = (ctx: any): string => {
  const money = (n: any) => (n == null ? 'not found' : `$${Number(n).toFixed(2)}`);
  const lines = [
    `Fee: ${ctx.description}`,
    `Period: ${ctx.period}`,
    `STATEMENT amount billed: ${money(ctx.amount)}`,
    ctx.profileItem
      ? `PROFILE contracted item: ${ctx.profileItem}`
      : `PROFILE: no matching contracted item effective this period`,
    ctx.profileRate != null
      ? `PROFILE contracted rate: ${ctx.profileRate}${ctx.profileRateMethod ? ` (${ctx.profileRateMethod})` : ''}`
      : `PROFILE contracted rate: none effective this period`,
    ctx.expectedAmount != null
      ? `Expected amount from contract: ${money(ctx.expectedAmount)}`
      : `Expected amount from contract: n/a (no effective rate)`,
    ctx.count != null ? `Applies to ${ctx.count} item(s)/transaction(s) on the statement` : null,
    ctx.effectiveDate ? `PROFILE fee effective (start) date: ${ctx.effectiveDate}` : null,
    `RESIDUAL Merchant Revenue PI: ${money(ctx.residualRevenuePI)}`,
    `RESIDUAL Remit Payout: ${money(ctx.residualRemitPayout)}`,
    ctx.variance != null ? `Variance (statement - expected): ${money(ctx.variance)}` : null,
    `Verdict: ${ctx.verdict}`,
    ctx.note ? `Note: ${ctx.note}` : null,
    ctx.bundledItems?.length
      ? `Bundled sub-lines (${ctx.bundledItems.length}): ${ctx.bundledItems
          .map((b: any) => `${b.description} $${Number(b.amount).toFixed(2)}`)
          .join('; ')}`
      : null,
    ctx.portfolioDigest ? `\n--- PERIOD-WIDE DATA (use for portfolio/period questions) ---\n${ctx.portfolioDigest}` : null,
  ];
  return lines.filter(Boolean).join('\n');
};
