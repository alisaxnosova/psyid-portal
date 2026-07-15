import type { Metadata } from 'next';
import Link from 'next/link';
import { PsidNav } from '@/components/landing/PsidNav';
import { PsidFooter } from '@/components/landing/PsidFooter';

export const metadata: Metadata = {
  title: 'The ReNo Method — PsyID',
  description: 'How PsyID reads you: five axes, a pole and a band, and an honest confidence on every claim. The shape of the ReNo method.',
};

const AXES = [
  ['O', 'Energy Orientation', 'Where your energy comes from — the outer world of people and action, or the inner one of reflection.', '#2244E0'],
  ['C', 'Information Focus', 'What you trust as real — the concrete and present, or the pattern and possibility behind it.', '#6A85F0'],
  ['L', 'Decision Basis', 'How you weigh a call — through impersonal logic, or through values and human impact.', '#8A5CD6'],
  ['D', 'Structure Preference', 'How you meet the day — with a settled plan, or by keeping your options open.', '#FF7A3D'],
  ['S', 'Emotional Response', 'How you meet pressure — steady and even, or reactive and intense. New in ReNo v1.2.', '#FF5A5A'],
];

const BANDS = [
  ['5', '#FF5A5A', 'Maximal', 'the trait leads how you behave'],
  ['4', '#FF7A3D', 'Strong', 'clear and consistent'],
  ['3', '#8A5CD6', 'Pronounced', 'present, situational'],
  ['2', '#6A85F0', 'Moderate', 'a mild lean'],
  ['1', '#2244E0', 'Slight', 'barely distinguishable'],
  ['0', '', 'Balanced', 'no meaningful lean'],
];

export default function MethodologyPage() {
  return (
    <div className="psid-site">
      {/* HERO */}
      <header className="method-hero grad-ground">
        <PsidNav />

        <div className="wrap">
          <div className="eyebrow white" style={{ marginBottom: 18 }}>The ReNo Method</div>
          <h1>Five axes. One honest <span className="g">picture of you</span>.</h1>
          <p className="lede">ReNo is the instrument behind every PsyID passport. Here is the shape of how it reads you — enough to trust the result, without handing over the recipe.</p>
        </div>
      </header>

      {/* WHAT IT MEASURES */}
      <section className="psid-sec">
        <div className="wrap">
          <div className="psid-head">
            <div className="eyebrow blue">What it measures</div>
            <h2>Not a type. <span className="o">Five dials.</span></h2>
            <p>Most tests sort you into a box and stop. ReNo reads you along five independent axes — four that trace decades of personality science, and one we added to keep the rest honest. Each dial has its own reading; together they describe a person, not a label.</p>
          </div>
          <div className="axis-rows">
            {AXES.map(([pole, name, desc, color], i) => (
              <div className="axis-row" key={name}>
                <div className="ax-dot" style={{ background: color }}>{pole}</div>
                <div>
                  <div className="ax-name">{name}{i === 4 && <span className="new">new</span>}</div>
                  <div className="ax-desc">{desc}</div>
                </div>
                <div className="ax-poles" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW A SCORE READS */}
      <section className="psid-sec paper2">
        <div className="wrap">
          <div className="inside-grid">
            <div>
              <div className="psid-head" style={{ marginBottom: 24 }}>
                <div className="eyebrow orange">How a score reads</div>
                <h2>A pole, and a band.</h2>
              </div>
              <div className="prose">
                <p>Each axis is measured on a continuous scale, then translated into something you can actually read: a <b>pole</b> — which way you lean — and a <b>band</b> from 0 to 5 for how strongly.</p>
                <p>The band is a reading aid, never the maths. Every calculation runs on your underlying score; the band just says it in plain language. Each reading also carries a <b>confidence level</b> — so you always know how sure the instrument is, and when an axis is genuinely balanced, it tells you.</p>
              </div>
              <div className="sig-inline" style={{ fontSize: 24, marginTop: 6 }}>
                W2<span className="dot" />A4<span className="dot" />V3<span className="dot" />F4<span className="dot" />S2
              </div>
              <div className="ax-desc" style={{ marginTop: 8, maxWidth: '40ch' }}>Together, the five read as your signature.</div>
            </div>
            <div className="band-scale">
              {BANDS.map(([digit, bg, label, note]) => (
                <div className={`band-row${digit === '0' ? ' b0' : ''}`} key={digit}>
                  <div className="b-digit" style={bg ? { background: bg } : undefined}>{digit}</div>
                  <div className="b-range" />
                  <div className="b-read"><b>{label}</b> — <span>{note}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WHERE IT COMES FROM */}
      <section className="psid-sec ink">
        <div className="wrap">
          <div className="inside-grid">
            <div>
              <div className="psid-head" style={{ marginBottom: 20 }}>
                <div className="eyebrow white">Where it comes from</div>
                <h2>Grounded, then <span className="o">extended</span>.</h2>
              </div>
              <div className="prose">
                <p>The first four axes describe things you may already recognise — how you draw energy, what you trust as information, how you decide, and how you meet the day.</p>
                <p>The fifth, <b>Emotional Response</b>, is the newer piece: it captures how you handle pressure. Adding it keeps the other four cleaner and truer to you, instead of quietly bleeding into them.</p>
              </div>
            </div>
            <div>
              <blockquote className="pull-quote dark">The core holds; <b>the shadow grows</b>. That is why re-testing means something.</blockquote>
              <div className="pull-quote-by" style={{ color: 'rgba(255,255,255,.4)' }}><span className="rule" />ReNo Methodology</div>
            </div>
          </div>
        </div>
      </section>

      {/* HONEST BY DESIGN */}
      <section className="psid-sec">
        <div className="wrap">
          <div className="psid-head" style={{ marginBottom: 28 }}>
            <div className="eyebrow blue">Honest by design</div>
            <h2>What we show, and what we hold back.</h2>
          </div>
          <div className="callout">
            <div className="eyebrow mute">A note on the method</div>
            <p>The full instrument — the questions, the scoring key, and the calibration behind the bands — is proprietary and still in validation. This page is the shape of the method, not the machinery. We would rather show you our reasoning than our recipe.</p>
          </div>
          <div className="method-cta">
            <Link className="btn btn-orange" href="/reno">Take the test →</Link>
            <Link className="btn btn-ghost" href="/">Back to home</Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <PsidFooter />
    </div>
  );
}
