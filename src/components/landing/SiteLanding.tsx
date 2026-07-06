'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { PsidNav } from './PsidNav';
import { PsidFooter } from './PsidFooter';

const AXIS_COLORS = ['#2244E0', '#6A85F0', '#8A5CD6', '#FF7A3D', '#FF5A5A'];

/* ── Pentagon-web radar (ported from the vault) ── */
function PentagonRadar({ values, labels, codes, size = 300, theme = 'light' }: {
  values: number[]; labels: string[]; codes: string[]; size?: number; theme?: 'light' | 'gradient';
}) {
  const light = theme === 'light';
  const ring = light ? '#E0D9CE' : 'rgba(255,255,255,0.16)';
  const axis = light ? '#E0D9CE' : 'rgba(255,255,255,0.20)';
  const textFill = light ? '#8A8FA8' : 'rgba(255,255,255,0.68)';
  const codeFill = light ? '#0E1230' : '#ffffff';
  const fill = light ? 'rgba(255,122,61,0.14)' : 'rgba(255,165,72,0.20)';
  const stroke = light ? '#FF7A3D' : 'rgba(255,255,255,0.9)';

  const n = values.length, cx = size / 2, cy = size / 2, maxR = size / 2 - 40, step = 360 / n, padX = 46;
  const polar = (r: number, i: number): [number, number] => {
    const a = (i * step - 90) * Math.PI / 180;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const rings = [1, 2, 3, 4].map((ri) => Array.from({ length: n }, (_, i) => polar((ri / 4) * maxR, i).map((v) => v.toFixed(1)).join(',')).join(' '));
  const dataPts = values.map((v, i) => polar(v * maxR, i));
  const dataStr = dataPts.map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' ');

  return (
    <svg viewBox={`${-padX} 0 ${size + 2 * padX} ${size}`} width={size + 2 * padX} height={size} fill="none">
      {rings.map((r, i) => <polygon key={i} points={r} fill="none" stroke={ring} strokeWidth="1" />)}
      {values.map((_, i) => { const [x, y] = polar(maxR, i); return <line key={i} x1={cx} y1={cy} x2={x.toFixed(1)} y2={y.toFixed(1)} stroke={axis} strokeWidth="1" />; })}
      <polygon points={dataStr} fill={fill} stroke={stroke} strokeWidth="2" strokeLinejoin="round" />
      {dataPts.map((p, i) => <circle key={i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r="4.5" fill="#fff" stroke={AXIS_COLORS[i % 5]} strokeWidth="2.5" />)}
      {labels.map((lab, i) => {
        const [lx, ly] = polar(maxR + 22, i);
        const anchor = lx < cx - 2 ? 'end' : lx > cx + 2 ? 'start' : 'middle';
        const dy = ly < cy - 2 ? -2 : ly > cy + 2 ? 11 : 4;
        return (
          <g key={i}>
            <text x={lx.toFixed(1)} y={ly.toFixed(1)} dy={dy} textAnchor={anchor} fontFamily="Geist Mono, monospace" fontSize="9" letterSpacing="1.2" fill={textFill}>{lab.toUpperCase()}</text>
            <text x={lx.toFixed(1)} y={ly.toFixed(1)} dy={dy + 12} textAnchor={anchor} fontFamily="Geist, system-ui" fontWeight="800" fontSize="12" fill={codeFill}>{codes[i]}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ── Passport card ── */
const CODE = [['W', '2'], ['A', '4', 'on'], ['V', '3'], ['F', '4', 'on'], ['S', '2']];
function PassportCard() {
  return (
    <div className="profile-card">
      <div className="pc-head"><span>Personality Passport</span><span className="pc-no">Nº 0001</span></div>
      <div className="pc-body">
        <div className="pc-avatar">L</div>
        <dl className="pc-meta">
          <dt>Name</dt><dd>Lis</dd>
          <dt>Archetype</dt><dd>The Reflective Explorer</dd>
          <dt>Decisions</dt><dd>the following morning</dd>
        </dl>
      </div>
      <div className="pc-code">
        {CODE.map(([p, b, on], i) => <div key={i} className={`code-chip sm${on ? ' active' : ''}`}>{p}<span className="bd">{b}</span></div>)}
      </div>
      <div className="pc-foot"><span className="pc-date">Issued today</span><span className="pc-seal">SEEN</span></div>
    </div>
  );
}

const AXES = [
  ['O · W', 'Energy Orientation', 'Outward to people and action, or inward to reflection.', '#2244E0'],
  ['C · A', 'Information Focus', 'The concrete and present, or the pattern behind it.', '#6A85F0'],
  ['L · V', 'Decision Basis', 'Weighing a call by logic, or by values and impact.', '#8A5CD6'],
  ['D · F', 'Structure Preference', 'Meeting the day with a plan, or keeping it open.', '#FF7A3D'],
  ['S · R', 'Emotional Response', 'Meeting pressure steady, or reacting with intensity.', '#FF5A5A'],
];

const SIG = [
  ['Energy', 'W', '2', 'Inward', 'var(--ax1)'],
  ['Information', 'A', '4', 'Abstract', 'var(--ax2)'],
  ['Decision', 'V', '3', 'Values', 'var(--ax3)'],
  ['Structure', 'F', '4', 'Flexible', 'var(--ax4)'],
  ['Emotion', 'S', '2', 'Steady', 'var(--ax5)'],
];

const STEPS = [
  ['1', 'Answer', 'You answer, we read', '20 minutes of real-life scenarios — not a test that feels like one. Each choice maps to one of five axes.', 'var(--grad-blue)'],
  ['2', 'Read', 'A passport, not a verdict', 'Within a day you get your passport in plain language, every claim carrying a confidence score. No horoscope.', 'var(--grad-coral)'],
  ['3', 'Use', 'Pick the next thing', 'It ends in small experiments to try this month — work, habits, rest. A starting line, not a label.', 'var(--ink)'],
];

const FAQS = [
  ['Is this just a personality quiz?', 'No. The quizzes online hand you a label and a horoscope. PsyID gives you a document where every line ties back to what you actually chose — and carries a confidence score, so you know how sure we are.'],
  ['What are the five axes?', 'Energy, Information, Decision, Structure and Emotional Response. The first four are the classic MBTI dimensions; the fifth — how you meet pressure — is new in ReNo v1.1, and it keeps the other four cleaner.'],
  ['Will it box me in?', 'Your passport is a starting line, not a sentence. It reports each axis as a band, 0–5, and shows its confidence — nothing gets flattened into a single label. People change, and it says so.'],
  ['How long does it take?', 'About 20 minutes, on any screen. Your passport arrives digitally within a day; the printed copy ships within five.'],
  ['Who sees my results?', 'You do. Results are private by default. You decide whether to share your card — nothing is published or sold, ever.'],
];

function FaqItem({ q, a, open, onToggle }: { q: string; a: string; open: boolean; onToggle: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [h, setH] = useState(0);
  useEffect(() => { if (ref.current) setH(ref.current.scrollHeight); }, [a]);
  return (
    <div className={`faq-item${open ? ' open' : ''}`}>
      <button className="faq-q" onClick={onToggle} aria-expanded={open}>{q} <span className="ic">+</span></button>
      <div className="faq-a" style={{ maxHeight: open ? h : 0 }}><div ref={ref}><p>{a}</p></div></div>
    </div>
  );
}

export default function SiteLanding() {
  const [openFaq, setOpenFaq] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = rootRef.current?.querySelectorAll('.rv');
    if (!els) return;
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="psid-site" ref={rootRef}>
      {/* HERO */}
      <header className="psid-hero grad-ground" id="top">
        <PsidNav />

        <div className="wrap">
          <div>
            <span className="hero-badge"><span className="badge-dot" />ReNo v1.1 · Five axes</span>
            <h1>Know who you <span className="g">actually</span> are.</h1>
            <p className="lede">PsyID reads you across five axes and hands back a passport you keep — a clear, honest map of how you think, decide and recharge. Not a label. A language for who you already are.</p>
            <div className="cta">
              <Link className="btn btn-orange" href="/reno">Take the test →</Link>
              <a className="btn btn-ghost-white" href="#code">See a sample</a>
            </div>
            <div className="reassure">
              <div className="it"><span className="n">20 min</span><span className="l">on any screen</span></div>
              <div className="it"><span className="n">5 axes</span><span className="l">measured, not guessed</span></div>
              <div className="it"><span className="n">94</span><span className="l">questions, no filler</span></div>
            </div>
          </div>
          <div className="heroviz"><div className="pcard-wrap"><PassportCard /></div></div>
        </div>
      </header>

      {/* FIVE AXES */}
      <section className="psid-sec" id="axes">
        <div className="wrap">
          <div className="psid-head rv">
            <div className="eyebrow blue">The five axes</div>
            <h2>Five axes of <span className="o">character</span>.</h2>
            <p>Every personality is a blend. ReNo places you on five independent scales and reports each as a pole and a band, 0–5 — together they read as your signature, like W2 · A4 · V3 · F4 · S2.</p>
          </div>
          <div className="axes-grid">
            <div className="rv" style={{ display: 'grid', placeItems: 'center' }}>
              <PentagonRadar values={[0.32, 0.71, 0.54, 0.68, 0.38]} labels={['Energy', 'Info', 'Decision', 'Structure', 'Emotion']} codes={['W2', 'A4', 'V3', 'F4', 'S2']} size={320} theme="light" />
            </div>
            <div className="axis-rows rv">
              {AXES.map(([poles, name, desc, color], i) => (
                <div className="axis-row" key={name}>
                  <div className="ax-dot" style={{ background: color }}>{poles.split(' · ')[0]}</div>
                  <div>
                    <div className="ax-name">{name}{i === 4 && <span className="new">new</span>}</div>
                    <div className="ax-desc">{desc}</div>
                  </div>
                  <div className="ax-poles">{poles}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="psid-sec paper2" id="how">
        <div className="wrap">
          <div className="psid-head rv">
            <div className="eyebrow orange">How it works</div>
            <h2>Three steps. One <span className="o">document</span> you keep.</h2>
            <p>No clinical questionnaire, no jargon. You work through real-life scenarios — and you get something real to hold at the end.</p>
          </div>
          <div className="psid-3">
            {STEPS.map(([num, k, title, body, bg]) => (
              <div className="step rv" key={num}>
                <div className="num" style={{ background: bg }}>{num}</div>
                <div className="k">{k}</div>
                <h3>{title}</h3>
                <p>{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* YOUR CODE (dark) */}
      <section className="psid-sec ink" id="code">
        <div className="wrap">
          <div className="inside-grid">
            <div className="rv">
              <div className="psid-head" style={{ marginBottom: 28 }}>
                <div className="eyebrow white">Your signature</div>
                <h2>One code.<br />Five letters.<br /><span className="o">All you.</span></h2>
                <p>Your raw scores are the record; the band, 0–5, is how you read them. Every reliability number runs on the raw score — the letters just make it human.</p>
              </div>
              <div className="sig-inline white" style={{ fontSize: 26 }}>
                W2<span className="dot" />A4<span className="dot" />V3<span className="dot" />F4<span className="dot" />S2
              </div>
            </div>
            <div className="rv">
              <div className="sig-code dark">
                {SIG.map(([axis, letter, band, pole, ax]) => (
                  <div className="sig-slot" style={{ ['--ax' as string]: ax }} key={axis}>
                    <div className="ss-axis">{axis}</div>
                    <div className="ss-code"><b>{letter}</b><span>{band}</span></div>
                    <div className="ss-pole">{pole}</div>
                  </div>
                ))}
              </div>
              <blockquote className="pull-quote dark" style={{ marginTop: 30 }}>The raw score is the record. The band only <b>reads</b> it.</blockquote>
              <div className="pull-quote-by" style={{ color: 'rgba(255,255,255,.4)' }}><span className="rule" />ReNo Methodology · §05</div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="psid-sec" style={{ paddingBottom: 0 }}>
        <div className="wrap" style={{ maxWidth: 860, textAlign: 'center' }}>
          <blockquote className="pull-quote rv" style={{ border: 'none', padding: 0, fontSize: 34, lineHeight: 1.3 }}>
            “I expected a quiz. I got a document that finally gave <b>language</b> to how I move through the world.”
          </blockquote>
          <div className="pull-quote-by rv" style={{ justifyContent: 'center', marginTop: 24 }}><span className="rule" />Daniel R. · 34 · Berlin</div>
        </div>
      </section>

      {/* PRICING */}
      <section className="psid-sec" id="price">
        <div className="wrap">
          <div className="psid-head rv">
            <div className="eyebrow blue">Pricing</div>
            <h2>Two ways to <span className="o">begin</span>.</h2>
            <p>One-time. No subscription. Digital instantly; the printed copy ships free.</p>
          </div>
          <div className="psid-price">
            <div className="price rv">
              <span className="pk">Standard</span>
              <div className="amt"><sup>$</sup>4.99</div>
              <div className="pn">The full passport, printed and digital.</div>
              <ul>
                <li><span className="ck">✓</span> Your five-axis personality passport</li>
                <li><span className="ck">✓</span> Printed copy, ships in 5 days</li>
                <li><span className="ck">✓</span> Digital version + shareable card</li>
                <li><span className="ck">✓</span> Next-steps experiment list</li>
              </ul>
              <Link className="btn btn-ink" href="/register">Begin →</Link>
            </div>
            <div className="price feat rv">
              <span className="ribbon">Recommended</span>
              <span className="pk">Passport + Consult</span>
              <div className="amt"><sup>$</sup>49.99</div>
              <div className="pn">Everything in Standard, plus a human to walk you through it.</div>
              <ul>
                <li><span className="ck">✓</span> Everything in Standard</li>
                <li><span className="ck">✓</span> 45-min consult with a psychologist</li>
                <li><span className="ck">✓</span> Personalised next-steps plan</li>
                <li><span className="ck">✓</span> Follow-up questions for 30 days</li>
              </ul>
              <Link className="btn btn-orange" href="/register">Begin →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="psid-sec paper2">
        <div className="wrap faq-grid">
          <div className="psid-head rv" style={{ marginBottom: 0 }}>
            <div className="eyebrow orange">Questions</div>
            <h2>Good to <span className="b">ask</span>.</h2>
            <p>The things people email us before they start.</p>
          </div>
          <div className="faq-list rv">
            {FAQS.map(([q, a], i) => (
              <FaqItem key={i} q={q} a={a} open={openFaq === i} onToggle={() => setOpenFaq(openFaq === i ? -1 : i)} />
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <div className="psid-final-wrap">
        <div className="wrap">
          <div className="psid-final grad-ground rv">
            <h2>Meet yourself in <span className="g">twenty minutes</span>.</h2>
            <p>Five axes. One passport. A map you’ll actually use.</p>
            <div className="cta">
              <Link className="btn btn-orange" href="/reno">Take the test →</Link>
              <a className="btn btn-ghost-white" href="#code">See a sample</a>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <PsidFooter />
    </div>
  );
}
