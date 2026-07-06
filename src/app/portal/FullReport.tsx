'use client';

import React from 'react';
import { logout } from '@/lib/useAuth';
import type { Holder } from './PassportView';

/* ────────────────────────────────────────────────────────────
   Full personality report — the client-facing report a passport
   stamp opens into. Ported from mockups/personality-portal.html,
   driven by real user data + authentic answer-key axis content.
   ──────────────────────────────────────────────────────────── */

export interface ReportAxis {
  key: string; name: string; left: string; right: string;
  val: number; bandLabel: string; poleLabel: string;
  dims: { label: string; text: string }[];
}
export interface ReportAssessment {
  id: string; no: string; date: string; code: string;
  vals: number[]; confidence: number; tier: string;
  profile: string; summary: string;
  strengths: string[]; watch: string[];
  careers: { n: string; d: string; fit: number }[];
  exps: { l: string; h: string; p: string }[];
  axes?: ReportAxis[];
}

/* Per-temperament prose (placeholder-authentic; refined later via the sheet). */
const TEMP: Record<string, {
  type: string[]; watch: string[]; counter: string[];
  misreads: { say: string; real: string }[];
  up: string[]; down: string[];
  money: string; moneyDo: string[]; moneyAvoid: string[];
  rel: string; relNeed: string[]; relFriction: string[];
}> = {
  NF: {
    type: [
      'You lead with meaning. Where others see tasks, you see people and possibility — and you are at your best when the work connects to something you believe in.',
      'You read a room fast and adjust to it, which makes people trust you quickly. The same warmth that makes you magnetic can make it hard to say no, so your growth centers on protecting your focus.',
    ],
    watch: ['Saying yes before checking your bandwidth', 'Taking on others’ emotions as your own', 'Avoiding a needed conflict to keep the peace', 'Chasing meaning and losing the practical thread'],
    counter: ['A 24-hour rule on new commitments', 'Name whose feeling it is before you carry it', 'Say the small disagreement early', 'Anchor each idea to one concrete next step'],
    misreads: [
      { say: '"They’re too idealistic."', real: 'You hold a high bar because you can see what things could become — it drives real change, not naivety.' },
      { say: '"They just want to be liked."', real: 'You optimize for trust because that’s what makes people and teams move.' },
      { say: '"They’re scattered."', real: 'You run several threads because you see how they connect, not because you’ve lost the plot.' },
      { say: '"They’re too sensitive."', real: 'You feel the undercurrent in a room — it’s a source of insight, not fragility.' },
    ],
    up: ['A mission you believe in', 'Warm teams that decide together', 'Room to shape ideas and people', 'Autonomy and variety'],
    down: ['Cold, transactional cultures', 'Rigid process with no room to improve it', 'Long stretches of solitary detail work', 'Constant conflict with no repair'],
    money: 'You’re moved by stories and meaning more than spreadsheets, which is a strength for backing the right people and a risk when the numbers deserve a harder look. Build a floor so your optimism runs on top of security, not instead of it.',
    moneyDo: ['Automate savings so values-led choices sit on a floor', 'Give to causes deliberately, within a set budget'],
    moneyAvoid: ['Lending or backing on warmth alone', 'Ignoring the terms because the mission is good'],
    rel: 'You give warmth generously and sense needs before they’re spoken. The growth edge is letting yourself be cared for too, and naming a disagreement while it’s still small.',
    relNeed: ['People who ask about you, not just accept your care', 'Genuine appreciation — it lands hard for you'],
    relFriction: ['Avoiding a hard talk until it’s overdue', 'Over-giving, then feeling unseen'],
  },
  NT: {
    type: [
      'You build models of the world and stress-test them. You’re driven to understand how things work and to make them work better — competence and logic matter deeply to you.',
      'You’re independent and future-focused, comfortable challenging consensus when the reasoning doesn’t hold. Your growth centers on the human layer: bringing people along, not just being right.',
    ],
    watch: ['Debating a point past its usefulness', 'Sounding dismissive of feelings', 'Over-optimizing before shipping', 'Underinvesting in relationships'],
    counter: ['Ask if being right is worth the cost here', 'Name one strength before you critique', 'Ship at 80% and iterate', 'Schedule the human check-ins you’d skip'],
    misreads: [
      { say: '"They’re arrogant."', real: 'You’re confident in reasoning you’ve tested — and usually happy to update it when shown a better argument.' },
      { say: '"They’re cold."', real: 'You lead with logic in public and care in private; the warmth is real, just quieter.' },
      { say: '"They overcomplicate things."', real: 'You see the second-order effects others miss — it looks like complexity, it’s foresight.' },
      { say: '"They never switch off."', real: 'Thinking is how you rest; a good problem is genuinely energizing for you.' },
    ],
    up: ['Hard problems and real autonomy', 'Competent people who argue ideas', 'Clear goals, freedom on the how', 'Room to build and experiment'],
    down: ['Micromanagement and busywork', 'Decisions made on politics, not merit', 'Repetitive execution with no design', 'Emotional conflict with no logic to resolve it'],
    money: 'You treat money as a system to optimize and are comfortable with calculated risk. The trap is over-confidence in your own model — the best move is a boring, automated core so your bets sit on a stable base.',
    moneyDo: ['Automate a diversified core, then take defined swings', 'Decide rules in advance to beat in-the-moment bias'],
    moneyAvoid: ['Assuming your model is the whole picture', 'Tinkering constantly instead of letting it compound'],
    rel: 'You show love through problem-solving, reliability, and undivided attention on what matters. The growth edge is offering presence and validation before jumping to the fix.',
    relNeed: ['Directness and intellectual respect', 'Space to think without it read as distance'],
    relFriction: ['Fixing when they wanted to be heard', 'Debating a feeling instead of feeling it'],
  },
  SF: {
    type: [
      'You’re practical and people-centered. You notice what’s actually needed and quietly make it happen — reliability and care are your signature.',
      'You value harmony, loyalty, and things done properly. Your growth centers on protecting your own needs as well as you protect everyone else’s.',
    ],
    watch: ['Over-giving until you’re depleted', 'Avoiding change even when it’s due', 'Taking criticism personally', 'Saying yes to keep the peace'],
    counter: ['Schedule your own recovery like an appointment', 'Try one small change on purpose', 'Separate the feedback from your worth', 'Practice a kind, clear no'],
    misreads: [
      { say: '"They’re a pushover."', real: 'Your kindness is a choice, not weakness — you have firm limits when something matters.' },
      { say: '"They resist change."', real: 'You protect what works and the people it serves; give the reason and you’ll adapt.' },
      { say: '"They’re not ambitious."', real: 'Your ambition is measured in impact on real people, not titles.' },
      { say: '"They’re too emotional."', real: 'You read the human temperature of a situation accurately — it’s practical intelligence.' },
    ],
    up: ['Clear expectations and appreciation', 'Helping real people directly', 'Stable, warm, cooperative teams', 'Practical, hands-on work'],
    down: ['Constant ambiguity and shifting goals', 'Impersonal, purely competitive cultures', 'Conflict left unresolved', 'Being taken for granted'],
    money: 'You’re careful and security-minded, which serves you well — the risk is being so cautious you under-invest, or over-giving to others before securing yourself. Pay yourself first, then be generous.',
    moneyDo: ['Automate savings and keep a solid buffer', 'Set a giving budget so generosity is sustainable'],
    moneyAvoid: ['Helping others financially before you’re secure', 'Avoiding investing out of caution'],
    rel: 'You’re loyal, attentive, and steady — the person who remembers the details and shows up. The growth edge is asking for what you need directly, before resentment builds.',
    relNeed: ['Reliability and appreciation', 'To be asked, not assumed'],
    relFriction: ['Silent over-giving turning to resentment', 'Avoiding the conversation that would clear the air'],
  },
  ST: {
    type: [
      'You’re grounded, direct, and results-driven. You trust what’s proven, act decisively, and get things done — people rely on you to deliver.',
      'You value competence, order, and follow-through. Your growth centers on flexibility and reading the human side that logic alone can miss.',
    ],
    watch: ['Dismissing ideas that aren’t proven yet', 'Coming across as blunt', 'Resisting change to a working system', 'Overlooking how people feel about the plan'],
    counter: ['Give a new idea one honest test', 'Add the “why” and a softer edge', 'Ask what a change could unlock', 'Check the room before you finalize'],
    misreads: [
      { say: '"They’re inflexible."', real: 'You defend what works until there’s real evidence for a change — then you move fast.' },
      { say: '"They’re harsh."', real: 'You’re direct to be efficient and fair; there’s respect underneath the bluntness.' },
      { say: '"They’re not creative."', real: 'You innovate in execution — making things faster, cleaner, and more reliable.' },
      { say: '"They only care about results."', real: 'Delivering is how you show you care; you keep your word.' },
    ],
    up: ['Clear goals and real ownership', 'Competent, no-drama teams', 'Tangible, measurable results', 'Efficient systems and standards'],
    down: ['Vague direction and endless theory', 'Disorganized, chaotic environments', 'Decisions with no accountability', 'Feelings-heavy conflict with no clear fix'],
    money: 'You’re practical and disciplined with money, which is a real edge. The trap is being so focused on the concrete that you miss longer-term or higher-upside plays — let a portion work harder.',
    moneyDo: ['Automate savings and stick to the plan', 'Allocate a defined slice to longer-term growth'],
    moneyAvoid: ['Keeping everything ultra-safe and under-investing', 'Judging every option only by the near-term number'],
    rel: 'You show love through action, reliability, and providing — you do what you say. The growth edge is putting the feeling into words, not just the deed.',
    relNeed: ['Directness and follow-through', 'Respect for your competence'],
    relFriction: ['Solving when they wanted comfort', 'Leaving the feeling unspoken'],
  },
};

/* Expanded explanation for each derived strength (keyed by the chip label). */
const STRENGTH_EXPLAIN: Record<string, string> = {
  'Contagious enthusiasm': 'Your energy is visible and it spreads — you can walk into a flat room and leave it motivated. People rally around the things you get excited about, and that momentum is genuinely hard to fake.',
  'Depth of thought': 'You think below the surface, sitting with an idea until you truly understand it. Where others skim, you find the insight that actually matters — which is why people bring you the hard questions.',
  'Eye for detail': 'You notice the specifics others miss — the small error, the missing step, the thing that’s slightly off. It makes your work reliable and precise, and it quietly saves everyone from bigger problems later.',
  'Imagination': 'You see what could be, not just what is. You connect unrelated ideas and generate possibilities most people wouldn’t think of — the source of your best, most original work.',
  'Systematic thinking': 'You break complex problems into clear, logical parts. You find the underlying structure and build solutions that hold together under pressure.',
  'Empathy': 'You read what people are feeling before they say it, and you make them feel understood. It builds trust fast and makes you the person others open up to.',
  'Organization': 'You bring order to chaos — plans, systems, and follow-through. You’re the person who makes sure things actually get done, on time and without loose ends.',
  'Flexibility': 'You adapt easily when things change, staying calm and resourceful when a plan falls apart. You improvise well and keep options open until the moment is right.',
};

function Radar({ vals, size = 260, accent = '#FF7A3D' }: { vals: number[]; size?: number; accent?: string }) {
  const c = size / 2, maxR = size / 2 - 18;
  const ang = [-90, 0, 90, 180].map(d => (d * Math.PI) / 180);
  const pts = vals.map((v, i) => {
    const r = maxR * (0.16 + 0.84 * v);
    return [c + r * Math.cos(ang[i]!), c + r * Math.sin(ang[i]!)];
  });
  const rings = [1, 0.72, 0.46, 0.22];
  const axPt = (i: number, r: number) => [c + maxR * r * Math.cos(ang[i]!), c + maxR * r * Math.sin(ang[i]!)];
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ display: 'block' }}>
      <g stroke="rgba(14,18,48,.14)" strokeWidth="1" fill="none">
        {rings.map((r, k) => <polygon key={k} points={[0, 1, 2, 3].map(i => axPt(i, r).join(',')).join(' ')} />)}
        {[0, 1, 2, 3].map(i => <line key={i} x1={c} y1={c} x2={axPt(i, 1)[0]} y2={axPt(i, 1)[1]} />)}
      </g>
      <polygon points={pts.map(p => p.join(',')).join(' ')} fill={accent + '22'} stroke={accent} strokeWidth="2" />
      {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r="4.5" fill={accent} />)}
    </svg>
  );
}

export default function FullReport({ a, holder, onClose }: { a: ReportAssessment; holder: Holder; onClose: () => void }) {
  const temp = TEMP[a.code.slice(1, 3)] ?? TEMP.NF!;
  const axes = a.axes ?? [];
  const strong = a.vals.map(v => Math.abs(v - 0.5) >= 0.22);
  const [openStrength, setOpenStrength] = React.useState<number | null>(0);
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

  return (
    <div className="psyr">
      <style dangerouslySetInnerHTML={{ __html: REPORT_CSS }} />

      <header className="psyr-topnav">
        <div className="psyr-wrap psyr-row">
          <div className="psyr-brand"><span className="psyr-mk" />Psy<i>ID</i></div>
          <div className="psyr-nav-right">
            <button className="psyr-back" onClick={onClose}>← Back to passport</button>
            <span className="psyr-plan">{holder.plan === 'basic' ? 'Basic' : 'Full'}</span>
            <button className="psyr-plan psyr-out" onClick={logout}>Sign out</button>
          </div>
        </div>
      </header>

      <div className="psyr-wrap">
        <div className="psyr-hero" id="snapshot">
          <div>
            <div className="psyr-eyebrow">Your personality profile</div>
            <div className="psyr-code">{a.code.split('').map((L, i) => (
              <span key={i} className={'psyr-tc' + (strong[i] ? ' hi' : '')}>{L}</span>
            ))}</div>
            <h1 className="psyr-h1">{a.profile}</h1>
            <p className="psyr-lede">{a.summary}</p>
            <div className="psyr-meta">
              <div><div className="psyr-k">Assessment</div><div className="psyr-v">{a.date}</div></div>
              <div><div className="psyr-k">Confidence</div><div className="psyr-v grad">{a.confidence.toFixed(2)}</div></div>
              <div><div className="psyr-k">Plan</div><div className="psyr-v">{holder.plan === 'basic' ? 'Basic' : 'Full profile'}</div></div>
            </div>
          </div>
          <div className="psyr-radar-card">
            <Radar vals={a.vals} />
            <div className="psyr-axis-mini">
              {axes.map(ax => (
                <div className="psyr-am" key={ax.key}><div className="psyr-k">{ax.name}</div><div className="psyr-v2">{ax.poleLabel}</div></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <nav className="psyr-secnav">
        <div className="psyr-wrap psyr-row">
          {[['type', 'Your type'], ['axes', 'The four axes'], ['strengths', 'Superpowers'], ['careers', 'Careers'], ['growth', 'Growth'], ['blindspots', 'Blind spots'], ['misreads', 'Misreads'], ['environments', 'Environments'], ['money', 'Money & risk'], ['relationships', 'Relationships']].map(([id, label]) => (
            <button key={id} onClick={() => scrollTo(id)}>{label}</button>
          ))}
        </div>
      </nav>

      <div className="psyr-wrap">
        {/* YOUR TYPE */}
        <section id="type">
          <div className="psyr-kick">Your type</div>
          <h2 className="psyr-sh">A quick read on how you’re wired</h2>
          {temp.type.map((p, i) => <p className={i === 0 ? 'psyr-plead' : 'psyr-p'} key={i}>{p}</p>)}
        </section>

        {/* FOUR AXES — authentic */}
        <section id="axes">
          <div className="psyr-kick">The four axes</div>
          <h2 className="psyr-sh">Where you land, and what it means</h2>
          {axes.map((ax, i) => (
            <div className="psyr-axis" key={ax.key}>
              <div className="psyr-axis-top">
                <span className="psyr-axis-name">{ax.name}</span>
                <span className="psyr-band">{ax.bandLabel || ax.poleLabel}</span>
              </div>
              <div className="psyr-slabels"><span>{ax.left}</span><span>{ax.right}</span></div>
              <div className="psyr-track"><div className="psyr-thumb" style={{ left: (a.vals[i]! * 100) + '%' }} /></div>
              {ax.dims.length > 0 && (
                <div className="psyr-dims">
                  {ax.dims.map((d, k) => (
                    <div className="psyr-dim" key={k}><div className="psyr-dk">{d.label}</div><div className="psyr-dv">{d.text}</div></div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </section>

        {/* SUPERPOWERS */}
        <section id="strengths">
          <div className="psyr-kick">Superpowers</div>
          <h2 className="psyr-sh">What comes easily to you</h2>
          <p className="psyr-hint">Tap a superpower to see what it means for you.</p>
          <div className="psyr-chips">
            {a.strengths.map((s, i) => (
              <button
                key={i}
                className={'psyr-chip clickable' + (openStrength === i ? ' hi' : '')}
                onClick={() => setOpenStrength(openStrength === i ? null : i)}
              >{s}</button>
            ))}
          </div>
          {openStrength !== null && a.strengths[openStrength] && (
            <div className="psyr-expand">
              <div className="psyr-expand-t">{a.strengths[openStrength]}</div>
              <p>{STRENGTH_EXPLAIN[a.strengths[openStrength]!] ?? 'One of the things that comes naturally to you — a strength you can lean on and build a role around.'}</p>
            </div>
          )}
        </section>

        {/* CAREERS */}
        <section id="careers">
          <div className="psyr-kick">Careers</div>
          <h2 className="psyr-sh">Where you’re in your element</h2>
          <div className="psyr-careers">
            {a.careers.map((c, i) => (
              <div className="psyr-career" key={i}>
                <div className="psyr-cbody">
                  <div className="psyr-cn">{c.n}</div><div className="psyr-cd">{c.d}</div>
                  <div className="psyr-fit"><div className="psyr-fill" style={{ width: c.fit * 100 + '%' }} /></div>
                </div>
                <div className="psyr-cfit">{Math.round(c.fit * 100)}</div>
              </div>
            ))}
          </div>
        </section>

        {/* GROWTH */}
        <section id="growth">
          <div className="psyr-kick">Growth plan</div>
          <h2 className="psyr-sh">A few things to try</h2>
          <div className="psyr-steps">
            {a.exps.map((e, i) => (
              <div className="psyr-step" key={i}><div className="psyr-num">{i + 1}</div><div><h4>{e.h}</h4><p>{e.p}</p></div></div>
            ))}
          </div>
        </section>

        {/* BLIND SPOTS */}
        <section id="blindspots">
          <div className="psyr-kick">Blind spots</div>
          <h2 className="psyr-sh">What quietly trips you up</h2>
          <div className="psyr-grid2">
            <div className="psyr-card warn"><h4>Watch for</h4><ul>{temp.watch.map((w, i) => <li key={i}><span className="psyr-b" />{w}</li>)}</ul></div>
            <div className="psyr-card"><h4>How to counter it</h4><ul>{temp.counter.map((w, i) => <li key={i}><span className="psyr-b" />{w}</li>)}</ul></div>
          </div>
        </section>

        {/* MISREADS */}
        <section id="misreads">
          <div className="psyr-kick">Misreads</div>
          <h2 className="psyr-sh">What people get wrong about you</h2>
          <div className="psyr-misreads">
            {temp.misreads.map((m, i) => (
              <div className="psyr-misread" key={i}>
                <div className="psyr-say"><div className="psyr-lab">What they say</div><div className="psyr-txt">{m.say}</div></div>
                <div className="psyr-real"><div className="psyr-lab">What’s actually going on</div><div className="psyr-txt">{m.real}</div></div>
              </div>
            ))}
          </div>
        </section>

        {/* ENVIRONMENTS */}
        <section id="environments">
          <div className="psyr-kick">Work environments</div>
          <h2 className="psyr-sh">Where you thrive — and where you wilt</h2>
          <div className="psyr-grid2">
            <div className="psyr-card"><h4>Energizes you</h4><ul>{temp.up.map((w, i) => <li key={i}><span className="psyr-b" />{w}</li>)}</ul></div>
            <div className="psyr-card warn"><h4>Drains you</h4><ul>{temp.down.map((w, i) => <li key={i}><span className="psyr-b" />{w}</li>)}</ul></div>
          </div>
        </section>

        {/* MONEY */}
        <section id="money">
          <div className="psyr-kick">Money & risk</div>
          <h2 className="psyr-sh">You and risk</h2>
          <p className="psyr-plead">{temp.money}</p>
          <div className="psyr-grid2">
            <div className="psyr-card"><h4>Play to it</h4><ul>{temp.moneyDo.map((w, i) => <li key={i}><span className="psyr-b" />{w}</li>)}</ul></div>
            <div className="psyr-card warn"><h4>Guard against</h4><ul>{temp.moneyAvoid.map((w, i) => <li key={i}><span className="psyr-b" />{w}</li>)}</ul></div>
          </div>
        </section>

        {/* RELATIONSHIPS */}
        <section id="relationships" style={{ borderBottom: 'none' }}>
          <div className="psyr-kick">Relationships</div>
          <h2 className="psyr-sh">How you connect</h2>
          <p className="psyr-plead">{temp.rel}</p>
          <div className="psyr-grid2">
            <div className="psyr-card"><h4>What you need</h4><ul>{temp.relNeed.map((w, i) => <li key={i}><span className="psyr-b" />{w}</li>)}</ul></div>
            <div className="psyr-card warn"><h4>Where friction shows up</h4><ul>{temp.relFriction.map((w, i) => <li key={i}><span className="psyr-b" />{w}</li>)}</ul></div>
          </div>
        </section>

        <section className="psyr-closing">
          <div className="psyr-closing-inner">
            <div className="psyr-kick" style={{ color: 'rgba(255,255,255,.55)' }}>Closing</div>
            <h2 className="psyr-sh" style={{ color: '#fff' }}>This is a snapshot, not a verdict</h2>
            <p className="psyr-p">You’ll grow, and your profile will move with you. Take the assessment again next year — a new stamp joins your passport, and you’ll see exactly how you’ve shifted.</p>
            <button className="psyr-dl" onClick={onClose}>Back to your passport ↑</button>
          </div>
        </section>
      </div>
    </div>
  );
}

const REPORT_CSS = `
.psyr{ position:fixed; inset:0; z-index:120; overflow-y:auto;
  --navy:#050C2E; --blue:#2244E0; --blue-s:#6A85F0; --coral:#FF5A5A; --orange:#FF7A3D; --gold:#FFC074;
  --paper:#F1EADD; --paper-2:#F8F3EA; --page:#FBF7F0; --page-2:#F3ECE0;
  --ink:#0E1230; --ink-s:#4F5470; --ink-m:#8A8FA8; --line:#E3DBCC;
  --sans:'Geist',system-ui,sans-serif; --mono:'Geist Mono',ui-monospace,monospace;
  font-family:var(--sans); color:var(--ink);
  background:radial-gradient(ellipse 90% 55% at 50% -8%, #FCF7EF 0%, transparent 55%), var(--paper);
  -webkit-font-smoothing:antialiased; }
.psyr i{ font-style:normal; }
.psyr button{ font-family:inherit; cursor:pointer; border:none; background:none; }
.psyr-wrap{ max-width:1080px; margin:0 auto; padding:0 28px; }
.psyr-row{ display:flex; align-items:center; justify-content:space-between; }
.psyr-topnav{ position:sticky; top:0; z-index:40; background:rgba(251,247,240,.9); backdrop-filter:blur(10px); border-bottom:1px solid var(--line); }
.psyr-topnav .psyr-row{ height:62px; }
.psyr-brand{ display:flex; align-items:center; gap:10px; font-weight:800; font-size:19px; letter-spacing:-.03em; }
.psyr-brand i{ color:var(--orange); }
.psyr-mk{ width:26px; height:26px; border-radius:8px; background:var(--ink); position:relative; }
.psyr-mk::before{ content:""; position:absolute; left:5px; top:5px; width:7px; height:7px; border-radius:50%; background:var(--blue-s); }
.psyr-mk::after{ content:""; position:absolute; right:5px; bottom:5px; width:7px; height:7px; border-radius:2px; background:var(--orange); }
.psyr-nav-right{ display:flex; align-items:center; gap:14px; }
.psyr-back{ font-size:13px; font-weight:600; color:var(--ink); border:1px solid var(--line); border-radius:999px; padding:8px 16px; }
.psyr-back:hover{ background:var(--ink); color:#fff; }
.psyr-plan{ font-family:var(--mono); font-size:11px; letter-spacing:.1em; text-transform:uppercase; padding:6px 12px; border-radius:999px; color:#fff; background:linear-gradient(135deg,var(--blue),var(--coral)); }
.psyr-out{ background:none; color:var(--ink-m); border:1px solid var(--line); }
.psyr-out:hover{ color:var(--ink); }
.psyr-hero{ padding:52px 0 40px; display:grid; grid-template-columns:1.15fr .85fr; gap:52px; align-items:center; }
.psyr-eyebrow{ font-family:var(--mono); font-size:11px; letter-spacing:.2em; text-transform:uppercase; color:var(--orange); margin-bottom:14px; }
.psyr-code{ display:flex; gap:9px; margin-bottom:18px; }
.psyr-tc{ font-family:var(--mono); font-weight:700; font-size:26px; padding:8px 15px; border-radius:11px; border:1.5px solid var(--line); background:#fff; }
.psyr-tc.hi{ background:linear-gradient(135deg,var(--coral),var(--orange)); border-color:transparent; color:#fff; }
.psyr-h1{ font-size:44px; font-weight:800; letter-spacing:-.035em; line-height:1.03; margin-bottom:14px; }
.psyr-lede{ font-size:17px; line-height:1.6; color:var(--ink-s); max-width:44ch; margin-bottom:26px; }
.psyr-meta{ display:flex; gap:26px; flex-wrap:wrap; }
.psyr-k{ font-family:var(--mono); font-size:9px; letter-spacing:.14em; text-transform:uppercase; color:var(--ink-m); margin-bottom:4px; }
.psyr-v{ font-size:15px; font-weight:600; }
.psyr-v.grad{ background:linear-gradient(95deg,var(--orange),var(--gold)); -webkit-background-clip:text; background-clip:text; color:transparent; }
.psyr-v2{ font-size:15px; font-weight:700; }
.psyr-radar-card{ background:#fff; border:1px solid var(--line); border-radius:24px; padding:26px; }
.psyr-axis-mini{ display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-top:16px; }
.psyr-am{ background:var(--paper-2); border-radius:12px; padding:10px 13px; }
.psyr-secnav{ position:sticky; top:62px; z-index:30; background:rgba(251,247,240,.92); backdrop-filter:blur(8px); border-bottom:1px solid var(--line); }
.psyr-secnav .psyr-row{ gap:6px; overflow-x:auto; padding:11px 0; justify-content:flex-start; }
.psyr-secnav button{ flex:none; font-size:13px; font-weight:500; color:var(--ink-s); padding:7px 13px; border-radius:999px; white-space:nowrap; }
.psyr-secnav button:hover{ background:var(--page-2); color:var(--ink); }
.psyr section{ padding:48px 0; border-bottom:1px solid var(--line); }
.psyr-kick{ font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase; color:var(--blue); margin-bottom:8px; }
.psyr-sh{ font-size:31px; font-weight:800; letter-spacing:-.03em; margin-bottom:20px; line-height:1.08; }
.psyr-plead{ font-size:19px; line-height:1.6; color:var(--ink); max-width:64ch; margin-bottom:18px; }
.psyr-p{ font-size:16px; line-height:1.7; color:var(--ink-s); max-width:66ch; margin-bottom:16px; }
.psyr-axis{ margin-bottom:30px; }
.psyr-axis-top{ display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; }
.psyr-axis-name{ font-size:19px; font-weight:700; }
.psyr-band{ font-family:var(--mono); font-size:12px; color:var(--orange); background:rgba(255,122,61,.1); padding:6px 13px; border-radius:999px; }
.psyr-slabels{ display:flex; justify-content:space-between; font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase; color:var(--ink-m); margin-bottom:7px; }
.psyr-track{ height:12px; border-radius:999px; position:relative; background:linear-gradient(90deg,var(--blue),#8BA0F0 30%,#F0B0B0 70%,var(--coral)); }
.psyr-thumb{ position:absolute; top:50%; transform:translate(-50%,-50%); width:22px; height:22px; border-radius:50%; background:#fff; border:3px solid var(--ink); box-shadow:0 4px 12px rgba(0,0,0,.25); }
.psyr-dims{ margin-top:18px; display:grid; grid-template-columns:1fr 1fr; gap:14px 24px; }
.psyr-dk{ font-family:var(--mono); font-size:10px; letter-spacing:.06em; text-transform:uppercase; color:var(--ink-m); margin-bottom:4px; }
.psyr-dv{ font-size:13.5px; line-height:1.55; color:var(--ink-s); }
.psyr-hint{ font-size:13px; color:var(--ink-m); margin:-8px 0 16px; }
.psyr-chips{ display:flex; flex-wrap:wrap; gap:9px; }
.psyr-chip{ padding:9px 16px; border-radius:999px; font-size:14px; font-weight:600; border:1.5px solid var(--line); background:#fff; color:var(--ink); }
.psyr-chip.hi{ background:linear-gradient(95deg,var(--orange),var(--gold)); border-color:transparent; color:#fff; }
.psyr-chip.clickable{ cursor:pointer; font-family:inherit; transition:transform .12s, box-shadow .12s; }
.psyr-chip.clickable:hover{ transform:translateY(-1px); box-shadow:0 4px 12px rgba(0,0,0,.08); }
.psyr-expand{ margin-top:18px; background:#fff; border:1px solid var(--line); border-radius:16px; padding:22px 24px; max-width:660px; animation:psyrFade .2s ease; }
.psyr-expand-t{ font-size:17px; font-weight:700; margin-bottom:8px; letter-spacing:-.01em; }
.psyr-expand p{ font-size:15px; line-height:1.6; color:var(--ink-s); }
@keyframes psyrFade{ from{ opacity:0; transform:translateY(4px); } to{ opacity:1; transform:translateY(0); } }
.psyr-careers{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.psyr-career{ background:#fff; border:1px solid var(--line); border-radius:14px; padding:15px 18px; display:flex; align-items:center; gap:16px; }
.psyr-cbody{ flex:1; min-width:0; }
.psyr-cn{ font-weight:600; font-size:15px; }
.psyr-cd{ font-size:12.5px; color:var(--ink-m); margin:2px 0 7px; }
.psyr-fit{ height:4px; border-radius:999px; background:var(--line); overflow:hidden; }
.psyr-fill{ height:100%; background:linear-gradient(90deg,var(--blue),var(--coral)); border-radius:999px; }
.psyr-cfit{ font-family:var(--mono); font-size:16px; font-weight:600; flex:none; }
.psyr-steps{ display:flex; flex-direction:column; gap:12px; }
.psyr-step{ display:grid; grid-template-columns:auto 1fr; gap:18px; align-items:start; background:#fff; border:1px solid var(--line); border-radius:16px; padding:20px 24px; }
.psyr-num{ width:38px; height:38px; border-radius:11px; display:grid; place-items:center; font-weight:800; color:#fff; background:linear-gradient(135deg,var(--coral),var(--orange)); }
.psyr-step h4{ font-size:17px; font-weight:700; margin-bottom:6px; }
.psyr-step p{ font-size:14.5px; color:var(--ink-s); line-height:1.6; }
.psyr-grid2{ display:grid; grid-template-columns:1fr 1fr; gap:22px; }
.psyr-card{ background:#fff; border:1px solid var(--line); border-radius:18px; padding:24px 26px; }
.psyr-card h4{ font-size:12px; font-family:var(--mono); letter-spacing:.14em; text-transform:uppercase; color:var(--ink-m); margin-bottom:14px; }
.psyr-card ul{ list-style:none; display:flex; flex-direction:column; gap:11px; margin:0; padding:0; }
.psyr-card li{ display:flex; gap:11px; font-size:15px; color:var(--ink-s); line-height:1.5; }
.psyr-b{ flex:none; width:6px; height:6px; border-radius:50%; margin-top:7px; background:var(--blue); }
.psyr-card.warn .psyr-b{ background:var(--coral); }
.psyr-misreads{ display:flex; flex-direction:column; gap:14px; }
.psyr-misread{ display:grid; grid-template-columns:1fr 1fr; border:1px solid var(--line); border-radius:14px; overflow:hidden; background:#fff; }
.psyr-say{ padding:18px 20px; background:var(--page-2); }
.psyr-real{ padding:18px 20px; }
.psyr-lab{ font-family:var(--mono); font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:var(--ink-m); margin-bottom:7px; }
.psyr-txt{ font-size:14.5px; color:var(--ink-s); line-height:1.55; }
.psyr-closing{ background:radial-gradient(ellipse 50% 45% at 85% 85%, rgba(255,165,72,.4) 0%, transparent 55%), radial-gradient(ellipse 45% 40% at 12% 15%, rgba(50,90,224,.4) 0%, transparent 55%), linear-gradient(150deg,#070E38 0%,#0F1E72 55%,#35105A 85%); color:#fff; border-radius:26px; padding:56px 44px; margin:48px 0; text-align:center; }
.psyr-closing-inner{ max-width:600px; margin:0 auto; }
.psyr-closing .psyr-kick{ color:rgba(255,255,255,.55); }
.psyr-closing .psyr-p{ max-width:none; color:rgba(255,255,255,.75); margin-bottom:0; }
.psyr-dl{ display:inline-flex; align-items:center; gap:10px; margin-top:26px; background:linear-gradient(95deg,#FF5C72,#FF8A45); color:#fff; font-weight:700; font-size:15px; padding:14px 28px; border-radius:999px; cursor:pointer; }
.psyr-dl:hover{ filter:brightness(1.05); }
@media (max-width:860px){
  .psyr-hero{ grid-template-columns:1fr; gap:32px; }
  .psyr-grid2,.psyr-careers,.psyr-misread,.psyr-dims{ grid-template-columns:1fr; }
  .psyr-h1{ font-size:34px; }
}
`;
