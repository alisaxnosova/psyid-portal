import type { RenoScore } from '@/lib/renoScore';
import type { AxisData, AxisInfo } from './axis-display';
import { radarPoints } from './axis-display';
import { getTypeName } from './type-names';

// ─── CSS ────────────────────────────────────────────────────────────────────

export const REPORT_CSS = `
:root{
  --navy:#0A1138;--blue:#3E5BE0;--blue-s:#7A93F2;
  --coral:#FF6B6B;--orange:#FF8A4C;--gold:#FFC074;
  --paper:#F8F4ED;--paper-2:#F0EAE0;
  --ink:#15183A;--ink-s:#525574;--ink-m:#8B8FA8;
  --line:#E4DDD0;
  --sans:'Inter',system-ui,-apple-system,Segoe UI,sans-serif;
  --page-w:794px;
}
*{box-sizing:border-box;margin:0;padding:0}
html{background:#1C1C28}
body{font-family:var(--sans);-webkit-font-smoothing:antialiased}
.viewer{display:flex;flex-direction:column;align-items:center;gap:48px;padding:56px 32px 80px}
.page-label{font-family:var(--sans);font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.4);align-self:flex-start;width:var(--page-w);max-width:100%;font-weight:500}
.page-label b{color:rgba(255,255,255,.75);font-weight:600}
.page{width:var(--page-w);max-width:100%;position:relative;overflow:hidden;font-size:15px;line-height:1.55;min-height:1123px;display:flex;flex-direction:column}
.page-header{display:flex;justify-content:space-between;align-items:center;padding:24px 40px;border-bottom:1px solid var(--line)}
.page-header .brand{font-size:18px;font-weight:800;letter-spacing:-.025em;color:var(--ink)}
.page-header .brand i{color:var(--orange);font-style:normal}
.page-header .pg{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-m);font-weight:500}
.page-footer{padding:16px 40px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-m);font-weight:500}
.dot-row{display:flex;gap:4px}
.dot-row span{width:5px;height:5px;border-radius:50%;background:var(--line)}
.dot-row span.on{background:linear-gradient(135deg,var(--orange),var(--coral))}
.light{background:var(--paper)}
.white{background:#fff}
.dark{background:radial-gradient(ellipse 55% 45% at 85% 85%,rgba(255,165,72,.5) 0%,transparent 55%),radial-gradient(ellipse 45% 40% at 20% 20%,rgba(70,110,224,.5) 0%,transparent 55%),linear-gradient(150deg,#080F38 0%,#1B2B7A 50%,#3D1860 80%,#7A2A2A 100%);color:#fff}
.dark .page-header{border-bottom:1px solid rgba(255,255,255,.1)}
.dark .page-header .brand{color:#fff}
.dark .page-header .brand i{color:var(--gold)}
.dark .page-header .pg{color:rgba(255,255,255,.5)}
.dark .page-footer{border-top:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.4)}
.dark .dot-row span{background:rgba(255,255,255,.2)}
.body-pad{flex:1;padding:48px 56px}
.eye{font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:var(--orange);font-weight:600;margin-bottom:14px}
.dark .eye{color:rgba(255,255,255,.6)}
h1{font-size:42px;font-weight:800;letter-spacing:-.03em;line-height:1.05;color:var(--ink)}
.dark h1{color:#fff}
h2{font-size:30px;font-weight:800;letter-spacing:-.025em;line-height:1.15;color:var(--ink);margin-bottom:18px}
.dark h2{color:#fff}
h3{font-size:18px;font-weight:700;letter-spacing:-.01em;color:var(--ink);margin-bottom:10px}
.dark h3{color:#fff}
p{font-size:15px;color:var(--ink-s);line-height:1.65;margin-bottom:14px}
.dark p{color:rgba(255,255,255,.75)}
p.lede{font-size:19px;line-height:1.55;color:var(--ink);margin:14px 0 24px;max-width:54ch;font-weight:500}
.dark p.lede{color:rgba(255,255,255,.9)}
strong{color:var(--ink);font-weight:700}
.dark strong{color:#fff}
.cover{height:1123px;background:radial-gradient(ellipse 70% 60% at 90% 95%,rgba(255,165,72,.75) 0%,transparent 55%),radial-gradient(ellipse 55% 45% at 70% 80%,rgba(255,90,90,.65) 0%,transparent 55%),radial-gradient(ellipse 50% 50% at 22% 30%,rgba(70,110,224,.8) 0%,transparent 55%),linear-gradient(140deg,#080F38 0%,#1B2B7A 35%,#3D1860 60%,#A83040 80%,#FF8A4C 100%);color:#fff}
.cover-top{display:flex;justify-content:space-between;align-items:center;padding:32px 40px;border-bottom:1px solid rgba(255,255,255,.12)}
.cover-top .brand{font-size:22px;font-weight:800;letter-spacing:-.025em}
.cover-top .brand i{color:var(--gold);font-style:normal}
.cover-top .meta{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.6);text-align:right;line-height:1.7;font-weight:500}
.cover-center{flex:1;display:flex;flex-direction:column;justify-content:center;padding:30px 56px 0;gap:8px}
.cover-center .doc{font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:rgba(255,255,255,.6);margin-bottom:12px;font-weight:600}
.cover-center .big{font-size:88px;font-weight:900;letter-spacing:-.035em;line-height:.95}
.cover-center .big em{font-style:italic;font-weight:800}
.cover-center .sub{font-size:18px;font-weight:400;color:rgba(255,255,255,.8);margin-top:24px;max-width:44ch;line-height:1.5}
.cover-center .type{font-size:20px;font-weight:600;letter-spacing:-.01em;margin-top:36px;background:linear-gradient(95deg,var(--coral),var(--gold));-webkit-background-clip:text;background-clip:text;color:transparent}
.cover-center .codes{display:flex;gap:10px;margin-top:18px}
.cc{padding:11px 19px;border-radius:11px;font-weight:800;font-size:19px;color:#fff;background:linear-gradient(135deg,var(--coral),var(--orange))}
.cover-bottom{margin:0 40px;padding:26px 0;border-top:1px solid rgba(255,255,255,.12);display:flex;justify-content:space-between;align-items:flex-end;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.55);font-weight:500}
.callout{background:var(--paper-2);border-left:4px solid var(--coral);padding:18px 22px;border-radius:8px;margin:22px 0;color:var(--ink);line-height:1.6;font-size:15px}
.callout b{font-weight:700}
.tip{background:#FFF6E8;border:1px solid #FFD08A;border-radius:14px;padding:18px 22px;margin:22px 0}
.tip .tlbl{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#B86A00;margin-bottom:6px}
.tip p{color:var(--ink);margin:0;font-size:14.5px}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:22px 0}
.card{background:#fff;border:1px solid var(--line);border-radius:16px;padding:22px}
.card.dim{background:var(--paper-2);border:none}
.card .lbl{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;margin-bottom:10px}
.card .lbl.or{color:var(--orange)}
.card .lbl.bl{color:var(--blue)}
.card .lbl.co{color:var(--coral)}
.card ul{list-style:none;display:flex;flex-direction:column;gap:10px}
.card li{display:flex;gap:10px;align-items:flex-start;font-size:14.5px;color:var(--ink-s);line-height:1.55}
.card li .dot{flex:none;width:6px;height:6px;border-radius:50%;background:var(--orange);margin-top:7px}
.axis-row{display:flex;align-items:center;gap:14px;margin-bottom:14px}
.axis-row .nm{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--ink-m);width:90px;flex:none;font-weight:600}
.axis-row .bar{flex:1;height:8px;background:var(--line);border-radius:999px;overflow:hidden}
.axis-row .bar .fill{height:100%;background:linear-gradient(90deg,var(--blue),var(--coral));border-radius:999px}
.axis-row .vv{font-size:13px;font-weight:700;color:var(--ink);width:44px;text-align:right}
.dicho{background:var(--paper);border:1px solid var(--line);border-radius:18px;padding:24px;margin:18px 0}
.dicho .dh{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.dicho .dt{font-size:18px;font-weight:700;color:var(--ink)}
.dicho .ds{font-size:12px;font-weight:700;color:var(--orange);background:rgba(255,138,76,.12);padding:5px 11px;border-radius:999px}
.spec{position:relative;margin-bottom:24px;padding-bottom:26px}
.spec .lbls{display:flex;justify-content:space-between;margin-bottom:8px}
.spec .lbls span{font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-m);font-weight:600}
.spec .trk{height:12px;border-radius:999px;background:linear-gradient(90deg,var(--blue) 0%,#9AABEC 30%,#F5BABA 70%,var(--coral) 100%);position:relative}
.spec .thmb{position:absolute;top:50%;transform:translate(-50%,-50%);width:22px;height:22px;border-radius:50%;background:#fff;border:3px solid var(--ink);box-shadow:0 4px 12px rgba(0,0,0,.2)}
.career{background:#fff;border:1px solid var(--line);border-radius:14px;padding:14px 18px;display:flex;align-items:center;gap:14px;margin-bottom:10px}
.career .ci{width:38px;height:38px;border-radius:10px;display:grid;place-items:center;flex:none;background:linear-gradient(135deg,var(--navy),var(--blue));color:#fff;font-weight:700;font-size:13px}
.career .nm{font-weight:700;font-size:15px;color:var(--ink)}
.career .desc{font-size:13px;color:var(--ink-m);margin-top:2px}
.career .right{margin-left:auto;text-align:right}
.career .pct{font-size:13px;font-weight:700;color:var(--orange)}
.career .fb{height:4px;border-radius:999px;background:var(--line);margin-top:6px;overflow:hidden;width:72px}
.career .fb .ff{height:100%;background:linear-gradient(90deg,var(--blue),var(--coral));border-radius:999px}
.tbl{width:100%;border-collapse:separate;border-spacing:0;margin:18px 0;font-size:14px;background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.tbl th{text-align:left;padding:12px 16px;font-size:10.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--ink-m);background:var(--paper-2);font-weight:700}
.tbl td{padding:14px 16px;border-top:1px solid var(--line);color:var(--ink-s);line-height:1.55;vertical-align:top}
.tbl td b{color:var(--ink);font-weight:700}
.checklist{display:flex;flex-direction:column;gap:9px;margin:16px 0}
.check{display:flex;gap:12px;align-items:flex-start;padding:12px 16px;background:#fff;border:1px solid var(--line);border-radius:11px}
.check .box{width:17px;height:17px;border:1.5px solid var(--ink-m);border-radius:5px;flex:none;margin-top:1px}
.check .txt{font-size:14.5px;color:var(--ink);line-height:1.5}
.check .txt b{font-weight:700}
.week{background:#fff;border:1px solid var(--line);border-radius:16px;padding:20px 22px;margin-bottom:14px}
.week .wh{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px}
.week .wt{font-size:17px;font-weight:800;color:var(--ink);letter-spacing:-.01em}
.week .wn{font-size:11px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:var(--coral)}
.week ul{list-style:none;display:flex;flex-direction:column;gap:8px;margin-top:6px}
.week li{font-size:14px;color:var(--ink-s);padding-left:18px;position:relative;line-height:1.55}
.week li:before{content:"→";position:absolute;left:0;color:var(--orange);font-weight:700}
.toc{margin-top:24px}
.tr{display:grid;grid-template-columns:40px 1fr auto;gap:16px;padding:13px 0;border-bottom:1px dashed var(--line);align-items:baseline}
.tr .n{font-size:12px;color:var(--ink-m);font-weight:600}
.tr .tt{font-size:15.5px;color:var(--ink);font-weight:600}
.tr .tt .sb{display:block;font-size:13px;color:var(--ink-m);font-weight:400;margin-top:2px}
.tr .pp{font-size:12px;color:var(--ink-m);font-weight:600}
.back{height:560px;background:var(--ink);color:#fff;display:flex;flex-direction:column;justify-content:space-between;padding:56px}
.back .brand{font-size:30px;font-weight:800;letter-spacing:-.025em}
.back .brand i{color:var(--orange);font-style:normal}
.back .tag{font-size:20px;font-weight:500;color:rgba(255,255,255,.75);max-width:38ch;margin-top:14px;line-height:1.45}
.back .bot{display:flex;justify-content:space-between;align-items:flex-end;padding-top:24px;border-top:1px solid rgba(255,255,255,.1);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.4);font-weight:500}
.back .url{color:var(--orange);font-size:14px;letter-spacing:.06em;text-transform:lowercase;font-weight:700}

@media print {
  @page { size: A4 portrait; margin: 0; }
  html, body {
    background: white !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .viewer { gap: 0; padding: 0; background: white; width: 210mm; }
  .page-label { display: none; }
  .page {
    page-break-after: always;
    break-after: page;
    width: 210mm;
    height: 297mm;
    min-height: 0 !important;
    max-height: 297mm;
    overflow: hidden;
    box-sizing: border-box;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  .page.back { page-break-after: auto; break-after: auto; }
  .card, .callout, .tip, .career, .week, .check, .dicho, svg {
    break-inside: avoid;
    page-break-inside: avoid;
  }
  .cover, .dark, .back,
  .cover *, .dark *, .back * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }
}
`;

// ─── Helpers ────────────────────────────────────────────────────────────────

function dotRow(filled: number): string {
  const count = 6;
  const dots = Array.from({ length: count }, (_, i) =>
    `<span${i < filled ? ' class="on"' : ''}></span>`,
  ).join('');
  return `<div class="dot-row">${dots}</div>`;
}

function pageShell(
  className: string,
  headerLabel: string,
  pageNum: number,
  dotsOn: number,
  profileId: string,
  bodyContent: string,
): string {
  const pg = String(pageNum).padStart(2, '0');
  return `<div class="page ${className}">
  <div class="page-header"><div class="brand">Psy<i>ID</i></div><div class="pg">${headerLabel} · p. ${pg}</div></div>
  <div class="body-pad">${bodyContent}</div>
  <div class="page-footer"><div>Nº ${profileId} · PsyID</div>${dotRow(dotsOn)}<div>p. ${pg}</div></div>
</div>`;
}

// ─── Programmatic Pages ──────────────────────────────────────────────────────

export function coverPage(
  axes: AxisData,
  typeCode: string,
  year: number,
): string {
  const typeName = getTypeName(typeCode);
  const letters = typeCode.split('');
  return `<div class="page cover">
  <div class="cover-top">
    <div class="brand">Psy<i>ID</i></div>
    <div class="meta">Your Career Compass<br/>Nº ${axes.profileId} · ${year}</div>
  </div>
  <div class="cover-center">
    <div class="doc">— PsyID · Your Career Compass —</div>
    <div class="big">Find work<br/>that fits<br/>how you're<br/><em>actually wired.</em></div>
    <div class="sub">A friendly 20-page guide to your personality and the careers that match it — built just for you.</div>
    <div class="type">${typeName} · ${typeCode}</div>
    <div class="codes">${letters.map(l => `<div class="cc">${l}</div>`).join('')}</div>
  </div>
  <div class="cover-bottom">
    <div>Profile · ${axes.profileId}</div>
    <div>Made with care · psyid.me</div>
  </div>
</div>`;
}

export function tocPage(axes: AxisData, typeCode: string, profileId: string): string {
  const { energy, world, decisions, structure } = axes;
  const body = `<div class="eye">— What's inside —</div>
<h1>Your roadmap.</h1>
<div class="toc">
  <div class="tr"><span class="n">01</span><span class="tt">Your profile at a glance<span class="sb">The four sliders, one chart</span></span><span class="pp">p. 04</span></div>
  <div class="tr"><span class="n">02</span><span class="tt">What "${typeCode}" actually means<span class="sb">Your type, in plain terms</span></span><span class="pp">p. 05</span></div>
  <div class="tr"><span class="n">03</span><span class="tt">How you get your energy<span class="sb">${energy.label} at ${energy.pct}</span></span><span class="pp">p. 06</span></div>
  <div class="tr"><span class="n">04</span><span class="tt">How you see the world<span class="sb">${world.label} at ${world.pct}</span></span><span class="pp">p. 07</span></div>
  <div class="tr"><span class="n">05</span><span class="tt">How you make decisions<span class="sb">${decisions.label} at ${decisions.pct}</span></span><span class="pp">p. 08</span></div>
  <div class="tr"><span class="n">06</span><span class="tt">How you handle plans<span class="sb">${structure.label} at ${structure.pct}</span></span><span class="pp">p. 09</span></div>
  <div class="tr"><span class="n">07</span><span class="tt">Your superpowers<span class="sb">Five things you're better at than most people</span></span><span class="pp">p. 10</span></div>
  <div class="tr"><span class="n">08</span><span class="tt">Your trip-ups<span class="sb">Where the same wiring works against you</span></span><span class="pp">p. 11</span></div>
  <div class="tr"><span class="n">09</span><span class="tt">How others see you<span class="sb">vs. how you really are</span></span><span class="pp">p. 12</span></div>
  <div class="tr"><span class="n">10</span><span class="tt">Careers that fit you<span class="sb">Twelve directions, ranked</span></span><span class="pp">p. 13</span></div>
  <div class="tr"><span class="n">11</span><span class="tt">Workplaces that energize you<span class="sb">What to look for</span></span><span class="pp">p. 14</span></div>
  <div class="tr"><span class="n">12</span><span class="tt">Workplaces that drain you<span class="sb">What to avoid</span></span><span class="pp">p. 15</span></div>
  <div class="tr"><span class="n">13</span><span class="tt">Money, risk, and starting things<span class="sb">A quick honest read</span></span><span class="pp">p. 16</span></div>
  <div class="tr"><span class="n">14</span><span class="tt">Relationships at work and home<span class="sb">A short chapter, but important</span></span><span class="pp">p. 17</span></div>
  <div class="tr"><span class="n">15</span><span class="tt">Your 30-day plan<span class="sb">What to actually do next</span></span><span class="pp">p. 18</span></div>
  <div class="tr"><span class="n">16</span><span class="tt">One last thing<span class="sb">A closing note</span></span><span class="pp">p. 19</span></div>
</div>`;
  return pageShell('light', 'Contents', 3, 2, profileId, body);
}

export function snapshotPage(axes: AxisData, score: RenoScore, typeCode: string, profileId: string): string {
  const { energy, world, decisions, structure } = axes;
  const typeName = getTypeName(typeCode);
  const pts = radarPoints(score);

  const body = `<div class="eye">— Your snapshot —</div>
<h1>Four sliders.<br/>One you.</h1>
<p class="lede">Each number below shows how strongly you leaned toward one side. Higher = more clearly that side. Nothing is "good" or "bad" — these are just your defaults.</p>

<div style="display:grid;grid-template-columns:1.05fr .95fr;gap:30px;align-items:start;margin-top:8px">
  <div>
    <div class="axis-row"><span class="nm">Energy</span><div class="bar"><div class="fill" style="width:${energy.pct}%"></div></div><span class="vv">${energy.pct}%</span></div>
    <div style="font-size:13px;color:var(--ink-m);margin:-6px 0 14px 104px">→ ${energy.label}. ${energy.description}</div>
    <div class="axis-row"><span class="nm">World view</span><div class="bar"><div class="fill" style="width:${world.pct}%"></div></div><span class="vv">${world.pct}%</span></div>
    <div style="font-size:13px;color:var(--ink-m);margin:-6px 0 14px 104px">→ ${world.label}. ${world.description}</div>
    <div class="axis-row"><span class="nm">Decisions</span><div class="bar"><div class="fill" style="width:${decisions.pct}%"></div></div><span class="vv">${decisions.pct}%</span></div>
    <div style="font-size:13px;color:var(--ink-m);margin:-6px 0 14px 104px">→ ${decisions.label}. ${decisions.description}</div>
    <div class="axis-row"><span class="nm">Structure</span><div class="bar"><div class="fill" style="width:${structure.pct}%"></div></div><span class="vv">${structure.pct}%</span></div>
    <div style="font-size:13px;color:var(--ink-m);margin:-6px 0 0 104px">→ ${structure.label}. ${structure.description}</div>
    <div style="margin-top:30px;padding:20px;background:var(--paper-2);border-radius:14px">
      <div class="eye" style="color:var(--blue);margin-bottom:10px">— Your code —</div>
      <div style="display:flex;gap:10px">${typeCode.split('').map(l => `<div class="cc">${l}</div>`).join('')}</div>
      <div style="margin-top:12px;font-size:14px;color:var(--ink)"><strong>${typeName}</strong> — see pages 5–9 for what this means.</div>
    </div>
  </div>
  <div>
    <svg viewBox="0 0 360 360" fill="none" style="width:100%;height:auto;display:block">
      <defs>
        <radialGradient id="rg1" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#FF8A4C" stop-opacity=".75"/>
          <stop offset="60%" stop-color="#FF6B6B" stop-opacity=".4"/>
          <stop offset="100%" stop-color="#FF8A4C" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <g stroke="var(--line)" stroke-width="1" fill="none">
        <circle cx="180" cy="180" r="150"/><circle cx="180" cy="180" r="112"/>
        <circle cx="180" cy="180" r="75"/><circle cx="180" cy="180" r="37"/>
        <line x1="180" y1="20" x2="180" y2="340"/>
        <line x1="20" y1="180" x2="340" y2="180"/>
      </g>
      <polygon points="${pts}" fill="url(#rg1)" stroke="var(--coral)" stroke-width="2"/>
      <g fill="var(--ink)">
        ${pts.split(' ').map(p => { const [x,y] = p.split(','); return `<circle cx="${x}" cy="${y}" r="6"/>`; }).join('')}
      </g>
      <g font-size="11" font-weight="700" fill="var(--ink-s)" text-anchor="middle">
        <text x="180" y="16">ENERGY · ${score.pct.E}</text>
        <text x="180" y="352">DECISIONS · ${score.pct.T}</text>
      </g>
      <g font-size="11" font-weight="700" fill="var(--ink-s)">
        <text x="345" y="184" text-anchor="end">WORLD · ${score.pct.N}</text>
        <text x="15" y="184">STRUCTURE · ${score.pct.P}</text>
      </g>
    </svg>
    <div style="margin-top:14px;font-size:13px;color:var(--ink-m);text-align:center;font-style:italic">Your shape, mapped. Each point shows how far you lean on that slider.</div>
  </div>
</div>`;

  return pageShell('white', 'Snapshot', 4, 3, profileId, body);
}

// Generates the dichotomy block (spectrum bar) — inserted into axis pages
export function dichoBlock(axis: AxisInfo): string {
  const posLabel = axis.label;
  const negLabel = axis.oppositeLabel;
  // Determine left/right labels for the spectrum
  const [leftLabel, rightLabel] = axis.pole === 'E'
    ? ['Extravert', 'Introvert']
    : axis.pole === 'I'
    ? ['Extravert', 'Introvert']
    : axis.pole === 'N' || axis.pole === 'S'
    ? ['Sensor', 'Intuitive']
    : axis.pole === 'T' || axis.pole === 'F'
    ? ['Thinker', 'Feeler']
    : ['Planner', 'Perceiver'];

  const titleParts = [posLabel, 'vs.', negLabel];
  const badge = `${axis.pole} · ${axis.pct}%`;

  return `<div class="dicho">
  <div class="dh"><div class="dt">${titleParts[0]} <span style="color:var(--ink-m);font-weight:500">vs.</span> ${titleParts[2]}</div><div class="ds">${badge}</div></div>
  <div class="spec">
    <div class="lbls"><span>${leftLabel}</span><span>${rightLabel}</span></div>
    <div class="trk"><div class="thmb" style="left:${axis.spectrumPos}%"></div></div>
  </div>
</div>`;
}

// Injects the dicho block into Claude-generated axis page content (after </h1>)
export function injectDichoBlock(claudeHtml: string, axis: AxisInfo): string {
  const h1End = claudeHtml.indexOf('</h1>');
  if (h1End === -1) return claudeHtml;
  return (
    claudeHtml.slice(0, h1End + 5) +
    '\n' + dichoBlock(axis) +
    claudeHtml.slice(h1End + 5)
  );
}

export function backCoverPage(profileId: string, typeCode: string): string {
  return `<div class="page back">
  <div>
    <div class="brand">Psy<i>ID</i></div>
    <div class="tag">Your career, your wiring, your next move — in one friendly report.</div>
  </div>
  <div class="bot">
    <div>© ${new Date().getFullYear()} PsyID · Nº ${profileId} · ${typeCode}</div>
    <div class="url">psyid.me</div>
  </div>
</div>`;
}

// ─── Page wrapper factory ─────────────────────────────────────────────────────

export function wrapContentPage(
  className: 'light' | 'white',
  headerLabel: string,
  pageNum: number,
  dotsOn: number,
  profileId: string,
  bodyContent: string,
): string {
  return pageShell(className, headerLabel, pageNum, dotsOn, profileId, bodyContent);
}
