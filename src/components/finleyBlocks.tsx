import React from 'react';

/**
 * Finley design blocks — ONE renderer for every assistant response, so we don't
 * build a bespoke card per answer type. A handler produces a `Block[]` (tiles,
 * rows, a section divider, a note…) and <FinleyBlocks> draws them in the shared
 * .fly-skin language. New response types = assemble blocks; no new component, no
 * ChatMessage branch.
 *
 * Domain → blocks lives in the `*Blocks()` builders at the bottom; rendering
 * lives in one place here. Shared by the admin portal and the customer app via
 * @goflexibl/finley-core — extend here, do not fork per-app.
 */

type Tone = 'ok' | 'warn' | 'neutral' | 'accent' | 'ink';
type Amt = { text: string; tone?: Tone; muted?: boolean };

export type Block =
  | { t: 'header'; title: string; subtitle?: string }
  | { t: 'tiles'; items: Array<{ label: string; value: string; sub?: string; tone?: Tone }> }
  | { t: 'text'; content: string; muted?: boolean }            // supports **bold**
  | { t: 'chip'; text: string }
  | { t: 'divider'; label: string; amounts?: Amt[] }
  | { t: 'group'; label: string; tone?: Tone }
  | { t: 'rows'; items: Array<{ title: string; titleMuted?: string; subtitle?: string; right?: Amt[] }> }
  | { t: 'note'; title?: string; body: string };

const INK = (t?: Tone) =>
  t === 'ok' ? 'var(--ok)' : t === 'warn' ? 'var(--warn)' : t === 'accent' ? 'var(--accent)' : t === 'ink' ? 'var(--ink)' : 'var(--ink-2)';
const TILE = (t?: Tone) =>
  t === 'ok' ? { fg: 'var(--ok)', bg: 'var(--ok-bg)', line: 'var(--ok-line)' }
    : t === 'warn' ? { fg: 'var(--warn)', bg: 'var(--warn-bg)', line: 'var(--warn-line)' }
      : { fg: 'var(--ink-2)', bg: 'var(--panel-2)', line: 'var(--line)' };

const withBold = (s: string) =>
  s.split(/(\*\*[^*]+\*\*)/).map((seg, i) =>
    seg.startsWith('**') && seg.endsWith('**')
      ? <strong key={i} style={{ color: 'var(--ink)', fontWeight: 700 }}>{seg.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{seg}</React.Fragment>
  );

const Dot: React.FC<{ tone?: Tone }> = ({ tone }) => (
  <span style={{ width: 5, height: 5, borderRadius: '50%', background: tone ? INK(tone) : 'var(--ink-4)' }} />
);

const RightCol: React.FC<{ amounts?: Amt[] }> = ({ amounts }) =>
  !amounts?.length ? null : (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
      {amounts.map((a, i) =>
        a.muted
          ? <span key={i} style={{ fontSize: 11, color: 'var(--ink-4)' }}>{a.text}</span>
          : <span key={i} className="fly-amt" style={{ color: INK(a.tone), fontSize: 12.5 }}>{a.text}</span>
      )}
    </div>
  );

const BlockView: React.FC<{ b: Block }> = ({ b }) => {
  switch (b.t) {
    case 'header':
      return (
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-.01em' }}>{b.title}</div>
          {b.subtitle && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2, fontFamily: 'var(--mono)' }}>{b.subtitle}</div>}
        </div>
      );
    case 'tiles':
      return (
        <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
          {b.items.map((it, i) => {
            const c = TILE(it.tone);
            return (
              <div key={i} style={{ flex: 1, background: c.bg, border: `1px solid ${c.line}`, borderRadius: 11, padding: '10px 11px' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.04em', textTransform: 'uppercase', color: c.fg }}>{it.label}</div>
                <div style={{ fontFamily: 'var(--mono)', fontSize: 18, fontWeight: 700, color: c.fg, marginTop: 5, lineHeight: 1 }}>{it.value}</div>
                {it.sub && <div style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 4 }}>{it.sub}</div>}
              </div>
            );
          })}
        </div>
      );
    case 'text':
      return <div style={{ fontSize: 12.5, lineHeight: 1.5, color: b.muted ? 'var(--ink-3)' : 'var(--ink-2)', marginTop: 12 }}>{withBold(b.content)}</div>;
    case 'chip':
      return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 9, padding: '5px 10px', background: 'var(--panel-2)', border: '1px solid var(--line)', borderRadius: 8, fontSize: 11, color: 'var(--ink-3)', fontFamily: 'var(--mono)' }}>
          {b.text}
        </div>
      );
    case 'divider':
      return (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '22px 0 2px' }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--ink)', letterSpacing: '.01em' }}>{b.label}</div>
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          {b.amounts?.map((a, i) => <div key={i} style={{ fontFamily: 'var(--mono)', fontSize: 11, fontWeight: 600, color: INK(a.tone) }}>{a.text}</div>)}
        </div>
      );
    case 'group':
      return <div className="fly-grp"><Dot tone={b.tone} />{b.label}</div>;
    case 'rows':
      return (
        <>
          {b.items.map((r, i) => (
            <div className="fly-row" key={i}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.35 }}>
                  {r.title}{r.titleMuted && <span style={{ color: 'var(--ink-3)', fontWeight: 500 }}> {r.titleMuted}</span>}
                </div>
                {r.subtitle && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{r.subtitle}</div>}
              </div>
              <RightCol amounts={r.right} />
            </div>
          ))}
        </>
      );
    case 'note':
      return (
        <div style={{ display: 'flex', gap: 9, marginTop: 15, padding: '11px 12px', background: 'var(--accent-50)', border: '1px solid var(--accent-100)', borderRadius: 11 }}>
          <div style={{ color: 'var(--accent)', flex: 'none', marginTop: 1 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          </div>
          <div style={{ fontSize: 12, lineHeight: 1.5, color: 'var(--ink-2)' }}>
            {b.title && <strong style={{ color: 'var(--accent-ink)', fontWeight: 700 }}>{b.title} </strong>}
            {b.body}
          </div>
        </div>
      );
  }
};

export const FinleyBlocks: React.FC<{ blocks: Block[] }> = ({ blocks }) => (
  <div>{blocks.map((b, i) => <BlockView key={i} b={b} />)}</div>
);

// ── domain → blocks builders ─────────────────────────────────────────────────
const usd0 = (n: number) => `$${Math.round(Math.abs(n || 0)).toLocaleString('en-US')}`;
const num = (n: number) => Math.round(n || 0).toLocaleString('en-US');
const feeParts = (desc: string): [string, string | undefined] => {
  const m = /^(.*?)(\s*\([^)]*\))\s*$/.exec(desc || '');
  return m ? [m[1], m[2].trim()] : [desc || '', undefined];
};

const appendNotes = (blocks: Block[], notes: string[]) => {
  (notes || []).forEach((n) => { if (n) blocks.push({ t: 'note', body: n }); });
  return blocks;
};

export const planBlocks = (p: any, notes: string[] = []): Block[] => {
  const rec = p.recoverable || {}, blk = p.blockedOnData || {}, prov = p.provider || {};
  const blocks: Block[] = [
    { t: 'header', title: 'Remediation plan', subtitle: [p.period, prov.name, prov.model].filter(Boolean).join(' · ') },
    { t: 'tiles', items: [
      { label: 'Recoverable now', value: usd0(rec.undercharge), sub: 'undercharge to collect', tone: 'ok' },
      { label: 'To refund', value: usd0(rec.overcharge), sub: 'overcharge to adjust', tone: 'warn' },
      { label: 'Blocked', value: usd0(blk.exposure), sub: 'needs contract data', tone: 'neutral' },
    ] },
  ];
  if (p.concentration) blocks.push({ t: 'text', content: `${p.concentration.topClusters} of ${p.concentration.ofClusters} clusters drive **${Math.round(p.concentration.coversPct)}%** of the recoverable variance, so a few batch fixes clear most of it.` });
  if (prov.chain) blocks.push({ t: 'chip', text: String(prov.chain).replace(/->/g, '→') });
  blocks.push({ t: 'divider', label: 'Fix billing now', amounts: [
    ...(rec.undercharge > 0 ? [{ text: `+${usd0(rec.undercharge)}`, tone: 'ok' as Tone }] : []),
    ...(rec.overcharge > 0 ? [{ text: `−${usd0(rec.overcharge)}`, tone: 'warn' as Tone }] : []),
  ] });
  const GROUPS = [
    { reasons: ['per_item_rate_mismatch'], label: 'Re-sync rate to contract', tone: 'ok' as Tone },
    { reasons: ['contracted_but_not_billed'], label: 'Enable billing: contracted, not billed', tone: 'ok' as Tone },
    { reasons: ['flat_fee_amount_mismatch'], label: 'Correct amount: overcharge to refund', tone: 'warn' as Tone },
  ];
  for (const g of GROUPS) {
    const rows = (rec.clusters || []).filter((c: any) => g.reasons.includes(c.reason)).sort((a: any, b: any) => b.dollarImpact - a.dollarImpact);
    if (!rows.length) continue;
    blocks.push({ t: 'group', label: g.label, tone: g.tone });
    blocks.push({ t: 'rows', items: rows.map((c: any) => {
      const isOver = c.direction === 'over';
      const [main, paren] = feeParts(c.feeDescription);
      return { title: main, titleMuted: paren, subtitle: c.reason === 'per_item_rate_mismatch' ? `${num(c.merchantCount)} merchants · net ${c.direction}` : `${num(c.merchantCount)} merchants`,
        right: [{ text: `${isOver ? '−' : '+'}${usd0(isOver ? (c.overAmount || c.dollarImpact) : (c.underAmount || c.dollarImpact))}`, tone: isOver ? 'warn' : 'ok' }] };
    }) });
  }
  if (prov.fixVerb) blocks.push({ t: 'note', title: 'How every fix above is applied.', body: String(prov.fixVerb).replace(/->/g, '→') });
  if (blk.clusters?.length) {
    blocks.push({ t: 'divider', label: 'Blocked on data', amounts: [{ text: `${usd0(blk.exposure)} · ${num(blk.merchantsAffected)} merch.`, tone: 'neutral' }] });
    blocks.push({ t: 'text', muted: true, content: 'Not lost, only unverifiable until the missing contract data is loaded. Sorted by exposure:' });
    const bt = (c: any) => c.reason === 'discount_rate_not_effective' ? `Load ${c.feeDescription} rates`
      : c.reason === 'fee_not_yet_contracted' ? `Add ${c.feeDescription} to contract`
        : c.reason === 'no_contract_on_file' ? 'Load pricing profiles'
          : c.reason === 'profile_not_yet_effective' ? `Activate ${c.feeDescription} rate` : c.feeDescription;
    const bs = (c: any) => c.reason === 'discount_rate_not_effective' ? `${num(c.merchantCount)} merchants · pass-through discount unverifiable`
      : c.reason === 'no_contract_on_file' ? `${num(c.merchantCount)} merchants · ${c.feeDescription} billing, no contract`
        : `${num(c.merchantCount)} merchants · no contracted basis`;
    blocks.push({ t: 'rows', items: [...blk.clusters].sort((a: any, b: any) => b.exposureAmount - a.exposureAmount).slice(0, 6)
      .map((c: any) => ({ title: bt(c), subtitle: bs(c), right: [{ text: usd0(c.exposureAmount), tone: 'neutral' as Tone }] })) });
  }
  return appendNotes(blocks, notes);
};

export const summaryBlocks = (sm: any, notes: string[] = []): Block[] => {
  const t = sm.totals;
  return appendNotes([
    { t: 'header', title: 'Fees Verification', subtitle: `${sm.label} · ${sm.periodsCount} period${sm.periodsCount === 1 ? '' : 's'}` },
    { t: 'tiles', items: [
      { label: 'Undercharged', value: usd0(t.under), sub: 'billed below contract', tone: 'ok' },
      { label: 'Overcharged', value: usd0(t.over), sub: 'billed above contract', tone: 'warn' },
    ] },
    { t: 'text', content: `**${t.coverage.toFixed(1)}%** profile coverage · **${t.verRate.toFixed(1)}%** verified · ${num(t.mis)} with mismatches` },
    { t: 'group', label: 'Per period' },
    { t: 'rows', items: sm.periods.map((p: any) => ({
      title: p.label, subtitle: `${num(p.merchants)} merchants · ${num(p.verified)} verified`,
      right: [{ text: `+${usd0(p.under)}`, tone: 'ok' }, { text: `−${usd0(p.over)}`, tone: 'warn' }],
    })) },
  ], notes);
};

export const breakdownBlocks = (bd: any, notes: string[] = []): Block[] => {
  const blocks: Block[] = [{ t: 'header', title: 'Portfolio breakdown', subtitle: bd.period }];
  for (const sec of bd.sections) {
    const isOver = sec.dir === 'overcharged';
    const tone: Tone = isOver ? 'warn' : 'ok';
    if (sec.empty) { blocks.push({ t: 'text', muted: true, content: `No ${sec.dir} items in ${bd.period}.` }); continue; }
    blocks.push({ t: 'divider', label: isOver ? 'Overcharged' : 'Undercharged', amounts: [{ text: `${usd0(sec.total)} · ${num(sec.itemCount)} items · ${num(sec.merchantCount)} merch.`, tone }] });
    blocks.push({ t: 'group', label: 'Top fees', tone });
    blocks.push({ t: 'rows', items: sec.fees.map((f: any) => ({ title: f.name, subtitle: `${num(f.items)} item${f.items === 1 ? '' : 's'} · ${num(f.merchants || 0)} merchant${f.merchants === 1 ? '' : 's'}`, right: [{ text: usd0(f.amt), tone }] })) });
    blocks.push({ t: 'group', label: 'Top merchants' });
    blocks.push({ t: 'rows', items: sec.merchants.map((m: any) => ({ title: m.name, subtitle: `${m.mid} · ${num(m.items)} item${m.items === 1 ? '' : 's'}`, right: [{ text: usd0(m.amt), tone }] })) });
  }
  return appendNotes(blocks, notes);
};

export const reconBlocks = (r: any, notes: string[] = []): Block[] => {
  const t = r.totals;
  const blocks: Block[] = [
    { t: 'header', title: 'Reconciliation', subtitle: `${r.label} · ${r.periodsCount} period${r.periodsCount === 1 ? '' : 's'}` },
    { t: 'tiles', items: [
      { label: 'Unmatched fees', value: usd0(t.unmAmt), sub: `${num(t.unm)} merchants`, tone: 'warn' },
      { label: 'Missing stmt rev.', value: usd0(t.missStmtRev), sub: `${num(t.missStmt)} statements`, tone: 'neutral' },
    ] },
    { t: 'text', content: `**${t.coverage.toFixed(1)}%** statement coverage · **${t.reconRate.toFixed(1)}%** reconciled · ${num(t.missRes)} missing residual` },
  ];
  if (r.ranked) {
    blocks.push({ t: 'group', label: `Top periods by ${r.ranked.metricLabel}`, tone: 'warn' });
    blocks.push({ t: 'rows', items: r.ranked.entries.map((e: any) => ({ title: e.label, right: [{ text: e.value, tone: 'neutral' }] })) });
  } else {
    blocks.push({ t: 'group', label: 'Per period' });
    blocks.push({ t: 'rows', items: (r.periods || []).map((p: any) => ({
      title: p.label, subtitle: `${num(p.merchants)} merchants · ${num(p.reconciled)} reconciled`,
      right: [{ text: usd0(p.unmatched), tone: 'warn' }, { text: `${num(p.missingStatements)} missing`, muted: true }],
    })) });
  }
  return appendNotes(blocks, notes);
};
