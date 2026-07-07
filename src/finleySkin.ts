// Finley design system — ported from the Claude Design handoff ("Finley Chat.html").
// Scoped under `.fly-skin` so it only styles the chat panel. Light slate panel,
// indigo accent, spark-glyph header, finding-style bubbles, rounded composer.
//
// Single source of truth: both the admin portal (ui-admin-portal) and the
// customer app (ui-app-new) inject this string via a <style> tag in their chat
// panel root. Do not fork per-app — extend here.
export const FINLEY_SKIN = `
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

.fly-skin{
  --ink:#2b3245; --ink-2:#48506a; --ink-3:#727a93; --ink-4:#9aa1b5;
  --line:#e7e9f0; --line-2:#f0f1f6; --surface:#ffffff; --panel:#fbfbfd; --panel-2:#f4f5f9;
  --accent:#5a54e6; --accent-ink:#3b34a8; --accent-50:#f1f1fd; --accent-100:#e7e6fb; --accent-ring:#cfcdf6;
  --ok:#1f9d6b; --ok-bg:#eafaf2; --ok-line:#bfe9d4;
  --warn:#b7791f; --warn-bg:#fdf6e7; --warn-line:#f0dcae;
  --bad:#d6453c; --bad-bg:#fdeeed; --bad-line:#f6cbc7;
  --mono:'JetBrains Mono',ui-monospace,monospace;
  --ui-font:'Hanken Grotesk',system-ui,sans-serif;
  --r-md:11px; --r-lg:15px; --pad:18px;
  --shadow-card:0 1px 2px rgba(24,26,42,.05),0 1px 1px rgba(24,26,42,.03);
  font-family:var(--ui-font); color:var(--ink); background:var(--panel) !important;
  -webkit-font-smoothing:antialiased;
}
.fly-skin *{ box-sizing:border-box; }

/* glyph avatar */
.fly-skin .fly-glyph{ display:inline-grid; place-items:center; flex:none; border-radius:9px;
  background:linear-gradient(142deg,#8aa0ff,var(--accent)); color:#fff;
  box-shadow:0 2px 6px -1px color-mix(in oklab,var(--accent) 50%,transparent); font-weight:700; }
.fly-skin .fly-glyph.is-glow{ box-shadow:0 3px 12px -2px color-mix(in oklab,var(--accent) 60%,transparent),0 0 0 3px color-mix(in oklab,var(--accent) 12%,transparent); }

/* header */
.fly-skin .fly-header{ display:flex; align-items:center; gap:11px; padding:13px var(--pad);
  background:var(--surface); border-bottom:1px solid var(--line); }
.fly-skin .fly-header-text{ line-height:1.12; min-width:0; }
.fly-skin .fly-header-name{ font-size:16px; font-weight:700; letter-spacing:-.01em; color:var(--ink); display:flex; align-items:center; gap:7px; }
.fly-skin .fly-header-beta{ font-size:9px; font-weight:700; letter-spacing:.08em; color:var(--accent-ink); background:var(--accent-100); padding:2px 5px; border-radius:5px; }
.fly-skin .fly-header-role{ font-size:11.5px; color:var(--ink-3); margin-top:2px; white-space:nowrap; }
.fly-skin .fly-header-ctrls{ margin-left:auto; display:flex; gap:2px; }
.fly-skin .fly-icbtn{ width:32px; height:32px; display:grid; place-items:center; border:none; background:transparent; color:var(--ink-3); border-radius:8px; transition:.15s; }
.fly-skin .fly-icbtn:hover{ background:var(--panel-2); color:var(--ink); }

/* thread + messages */
.fly-skin .fly-thread{ display:flex; flex-direction:column; gap:16px; }
.fly-skin .fly-msg{ display:flex; gap:10px; align-items:flex-start; }
.fly-skin .fly-msg--user{ justify-content:flex-end; }
.fly-skin .fly-bubble--user{ background:var(--accent); color:#fff; font-size:14px; line-height:1.5;
  padding:10px 14px; border-radius:16px 16px 4px 16px; max-width:84%;
  box-shadow:0 2px 8px -3px color-mix(in oklab,var(--accent) 55%,transparent); white-space:pre-wrap; }
.fly-skin .fly-bubble--finley{ background:var(--surface); border:1px solid var(--line); border-radius:4px 16px 16px 16px;
  padding:13px 15px; flex:1; min-width:0; box-shadow:var(--shadow-card); }
.fly-skin .fly-text{ font-size:14px; line-height:1.58; color:var(--ink-2); margin:0; white-space:pre-wrap; word-wrap:break-word; }
.fly-skin .fly-text strong{ color:var(--ink); font-weight:700; }

/* designed cards — shared block renderer (fee summary, breakdown, reconciliation, remediation) */
.fly-skin .fly-row{ display:flex; align-items:baseline; gap:12px; padding:8px 0; border-top:1px solid var(--line-2); }
.fly-skin .fly-amt{ font-family:var(--mono); font-size:13.5px; font-weight:600; white-space:nowrap; }
.fly-skin .fly-grp{ font-size:11px; font-weight:700; letter-spacing:.02em; color:var(--ink-2); margin:15px 0 1px; display:flex; align-items:center; gap:7px; }

/* action buttons */
.fly-skin .fly-action{ display:flex; flex-wrap:wrap; gap:8px; margin-top:12px; }
.fly-skin .fly-btn{ display:inline-flex; align-items:center; gap:7px; border-radius:9px; font-size:13px; font-weight:600;
  padding:9px 14px; border:1px solid transparent; transition:.15s; font-family:inherit; cursor:pointer; }
.fly-skin .fly-btn--primary{ background:var(--accent); color:#fff; box-shadow:0 2px 8px -3px color-mix(in oklab,var(--accent) 60%,transparent); }
.fly-skin .fly-btn--primary:hover{ filter:brightness(1.07); transform:translateY(-1px); }
.fly-skin .fly-btn--soft{ background:var(--surface); border-color:var(--line); color:var(--ink-2); }
.fly-skin .fly-btn--soft:hover{ border-color:var(--ink-4); color:var(--ink); }

/* thinking */
.fly-skin .fly-thinking{ display:inline-flex; align-items:center; gap:10px; padding:10px 14px; background:var(--surface);
  border:1px solid var(--line); border-radius:4px 16px 16px 16px; box-shadow:var(--shadow-card); }
.fly-skin .fly-thinking-dots{ display:inline-flex; gap:4px; }
.fly-skin .fly-thinking-dots span{ width:6px; height:6px; border-radius:50%; background:var(--accent); animation:flybob 1.1s infinite ease-in-out; }
.fly-skin .fly-thinking-dots span:nth-child(2){ animation-delay:.16s; } .fly-skin .fly-thinking-dots span:nth-child(3){ animation-delay:.32s; }
@keyframes flybob{ 0%,80%,100%{ transform:translateY(0); opacity:.45; } 40%{ transform:translateY(-4px); opacity:1; } }
.fly-skin .fly-thinking-label{ font-size:13px; color:var(--ink-3); }

/* welcome */
.fly-skin .fly-welcome{ padding:30px var(--pad) 6px; }
.fly-skin .fly-welcome-title{ font-size:22px; font-weight:700; letter-spacing:-.02em; margin:18px 0 8px; color:var(--ink); }
.fly-skin .fly-welcome-sub{ font-size:14px; line-height:1.55; color:var(--ink-2); margin:0; max-width:34ch; }
.fly-skin .fly-welcome-sub strong{ color:var(--ink); font-weight:600; }

/* suggested prompt cards */
.fly-skin .fly-prompts{ display:flex; flex-direction:column; gap:9px; padding:18px var(--pad); }
.fly-skin .fly-prompt{ display:flex; align-items:center; gap:12px; text-align:left; width:100%;
  background:var(--surface); border:1px solid var(--line); border-radius:var(--r-md); padding:12px 13px;
  color:var(--ink); font-size:13.5px; font-weight:500; box-shadow:var(--shadow-card); transition:.16s; cursor:pointer; }
.fly-skin .fly-prompt:hover{ border-color:var(--accent-ring); box-shadow:0 4px 14px -6px color-mix(in oklab,var(--accent) 40%,transparent); transform:translateY(-1px); }
.fly-skin .fly-prompt-ic{ width:30px; height:30px; flex:none; border-radius:8px; display:grid; place-items:center; background:var(--accent-100); color:var(--accent-ink); }
.fly-skin .fly-prompt-label{ flex:1; line-height:1.3; }
.fly-skin .fly-prompt-go{ color:var(--ink-4); }

/* composer */
.fly-skin .fly-composer{ padding:12px var(--pad) 14px; background:var(--surface); border-top:1px solid var(--line); }
.fly-skin .fly-composer-box{ display:flex; align-items:flex-end; gap:8px; background:var(--panel); border:1px solid var(--line);
  border-radius:var(--r-lg); padding:8px 8px 8px 14px; transition:.16s; }
.fly-skin .fly-composer-box:focus-within{ border-color:var(--accent-ring); box-shadow:0 0 0 4px color-mix(in oklab,var(--accent) 10%,transparent); background:var(--surface); }
.fly-skin .fly-input{ flex:1; border:none; background:transparent; resize:none; outline:none; font-family:inherit; font-size:14px;
  line-height:1.5; color:var(--ink); padding:5px 0; max-height:120px; }
.fly-skin .fly-input::placeholder{ color:var(--ink-4); }
.fly-skin .fly-send{ width:34px; height:34px; flex:none; border:none; border-radius:9px; background:var(--line); color:var(--ink-4);
  display:grid; place-items:center; transition:.16s; }
.fly-skin .fly-send.is-ready{ background:var(--accent); color:#fff; box-shadow:0 3px 10px -3px color-mix(in oklab,var(--accent) 60%,transparent); }
.fly-skin .fly-send.is-ready:hover{ filter:brightness(1.08); transform:translateY(-1px); }
.fly-skin .fly-send:disabled{ cursor:default; }
.fly-skin .fly-composer-foot{ font-size:11px; color:var(--ink-4); text-align:center; margin-top:9px; }
`;
