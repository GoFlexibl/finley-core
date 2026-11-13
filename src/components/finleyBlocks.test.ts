import { describe, expect, it } from 'vitest';
import { breakdownBlocks, planBlocks, reconBlocks, summaryBlocks } from './finleyBlocks';
import { cleanMarkdown } from '../utils/chatHelpers';

const NON_ASCII = /[^\x00-\x7F]/;

const plan = {
  period: 'Sep 2026',
  provider: { name: 'Stripe', model: 'IC+', chain: 'contract -> billing', fixVerb: 'Edit rate -> save' },
  recoverable: {
    undercharge: 1200,
    overcharge: 340.4,
    clusters: [
      { reason: 'per_item_rate_mismatch', direction: 'over', feeDescription: 'Per item (card)', merchantCount: 3, dollarImpact: 340.4 },
      { reason: 'contracted_but_not_billed', direction: 'under', feeDescription: 'Monthly fee', merchantCount: 2, dollarImpact: 1200 },
    ],
  },
  blockedOnData: {
    exposure: 900,
    merchantsAffected: 4,
    clusters: [{ reason: 'no_contract_on_file', feeDescription: 'Volume', merchantCount: 4, exposureAmount: 900 }],
  },
};

describe('designed cards are plain ASCII', () => {
  it('remediation plan: ASCII minus, arrows and separators', () => {
    const text = JSON.stringify(planBlocks(plan));
    expect(text).not.toMatch(NON_ASCII);
    expect(text).toContain('"-$340"');
    expect(text).toContain('"+$1,200"');
    expect(text).toContain('contract -> billing');
    expect(text).toContain('Sep 2026 | Stripe | IC+');
    expect(text).toContain('3 merchants | net over');
  });

  it('fees verification summary', () => {
    const sm = {
      label: 'Stripe',
      periodsCount: 2,
      totals: { under: 10, over: 20, coverage: 90, verRate: 80, mis: 3 },
      periods: [{ label: 'Sep 2026', merchants: 5, verified: 4, under: 10, over: 20 }],
    };
    const text = JSON.stringify(summaryBlocks(sm));
    expect(text).not.toMatch(NON_ASCII);
    expect(text).toContain('"-$20"');
    expect(text).toContain('Stripe | 2 periods');
  });

  it('portfolio breakdown and reconciliation', () => {
    const bd = {
      period: 'Sep 2026',
      sections: [{
        dir: 'overcharged', total: 50, itemCount: 2, merchantCount: 1,
        fees: [{ name: 'Fee', items: 2, merchants: 1, amt: 50 }],
        merchants: [{ name: 'M', mid: '123', items: 2, amt: 50 }],
      }],
    };
    const r = {
      label: 'Nuvei', periodsCount: 1,
      totals: { unmAmt: 5, unm: 1, missStmtRev: 0, missStmt: 0, coverage: 100, reconRate: 99, missRes: 0 },
      periods: [{ label: 'Sep 2026', merchants: 3, reconciled: 2, unmatched: 5, missingStatements: 1 }],
    };
    expect(JSON.stringify(breakdownBlocks(bd))).not.toMatch(NON_ASCII);
    expect(JSON.stringify(reconBlocks(r))).not.toMatch(NON_ASCII);
  });
});

describe('cleanMarkdown', () => {
  it('turns bullets into ASCII hyphens', () => {
    expect(cleanMarkdown('**Fees**\n* one\n- two')).toBe('Fees\n- one\n- two');
  });
});
