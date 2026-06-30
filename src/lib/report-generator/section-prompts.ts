import type { ReportInput } from './types';
import type { AxisData } from './axis-display';
import { behavioralContext, strengthLabel } from './axis-display';
import { getTypeName } from './type-names';

interface PromptCtx {
  input: ReportInput;
  axes: AxisData;
  typeCode: string; // convenience alias for input.score.type
}

const SYSTEM = `You are writing content for PsyID's "Career Compass" — a premium 20-page personality and career report.

Your writing must be:
- Direct and warm (like a smart, honest friend, not a consultant)
- Specific to this person's EXACT scores, not generic personality content
- Actionable — concrete, career-relevant insights
- Clean HTML that uses only the CSS classes listed in each prompt
- Free of MBTI jargon, Myers-Briggs trademarks, or cognitive function notation (Ni/Ne/Ti/Te)

You may lightly reference Carl Jung's framework ("Jung observed that..." or "what researchers call...").
Do not reference MBTI, Myers-Briggs, or specific function names.
Return ONLY the requested HTML. No markdown, no commentary, no preamble.`;

export function getSystemPrompt(): string {
  return SYSTEM;
}

export function introPrompt(ctx: PromptCtx): string {
  const { input, axes, typeCode } = ctx;
  const { score } = input;
  const typeName = getTypeName(typeCode);
  const nearNote = score.nearBoundary.length
    ? `Their scores are near the boundary on: ${score.nearBoundary.join(', ')} — meaning they're more balanced on those axes than others.`
    : 'All four of their axes show clear direction.';

  return `Write the welcome page (page 2) for a Career Compass report.

Person's type: ${typeCode} — ${typeName}
Profile code: ${axes.profileId}
${nearNote}

Write the body-pad content. Required structure:
1. <div class="eye">— Hi, welcome —</div>
2. <h1>[punchy 4-6 word title, e.g. "Let's keep this simple."]</h1>
3. <p class="lede">2–3 sentence intro. Explain that they took a personality assessment, their result is ${typeCode}, and this 20-page report is built around that. Mention their specific type name: "${typeName}".</p>
4. <p>1 paragraph: what this report is NOT (not a horoscope, not a life sentence, not going to tell them exactly what job to take). What it IS — a practical lens on how they're wired and what kinds of work fit that wiring.</p>
5. <h3>How to read this</h3>
6. <p>2–3 sentences on how to use the report. Suggest reading in order first, then returning to specific sections. Mention careers page is page 13 for those who want to skip ahead.</p>
7. <p style="margin-top:24px;color:var(--ink);font-weight:600">[A short, warm closing line like "Alright. Let's meet you." — 5 words max]</p>

Start your response directly with <div class="eye">. No preamble.`;
}

export function typeOverviewPrompt(ctx: PromptCtx): string {
  const { input, axes, typeCode } = ctx;
  const { score } = input;
  const typeName = getTypeName(typeCode);
  const { energy, world, decisions, structure } = axes;
  const nearNote = score.nearBoundary.length
    ? `Note: near-boundary on ${score.nearBoundary.join(', ')} — write about these with nuance, not extremes.`
    : '';

  const rarity: Record<string, string> = {
    INTJ: '2', INTP: '3', ENTJ: '3', ENTP: '3',
    INFJ: '2', INFP: '4', ENFJ: '3', ENFP: '8',
    ISTJ: '12', ISFJ: '14', ESTJ: '9', ESFJ: '12',
    ISTP: '5', ISFP: '9', ESTP: '4', ESFP: '9',
  };
  const rarityPct = rarity[typeCode] ?? '5';

  return `Write page 5: "What your type actually means."

Person's profile:
- Type: ${typeCode} — "${typeName}"
- Energy: ${energy.label} at ${energy.pct}% (${strengthLabel(energy.pct)})
- World view: ${world.label} at ${world.pct}% (${strengthLabel(world.pct)})
- Decisions: ${decisions.label} at ${decisions.pct}% (${strengthLabel(decisions.pct)})
- Structure: ${structure.label} at ${structure.pct}% (${strengthLabel(structure.pct)})
${nearNote}

Behavioral context:
- Energy: ${behavioralContext('EI', energy.pole, energy.pct)}
- World view: ${behavioralContext('SN', world.pole, world.pct)}
- Decisions: ${behavioralContext('TF', decisions.pole, decisions.pct)}
- Structure: ${behavioralContext('JP', structure.pole, structure.pct)}

Write the body-pad content. Required structure:
1. <div class="eye">— Meet your type —</div>
2. <h1>${typeName}.</h1>
3. <p class="lede">[2-sentence hook: what makes this specific combination immediately recognizable in real life. Be concrete, not vague.]</p>
4. <p>[2–3 sentences: what it actually means to be this type day-to-day. What they naturally do, how they move through the world. Weave together at least 2 of the 4 axes.]</p>
5. <p>[2–3 sentences: their signature tension or paradox — the thing that is both their gift and their friction point. Specific to this exact combination.]</p>
6. <h3>The short version of you</h3>
7. A list of exactly 5 items:
<ul style="list-style:none;display:flex;flex-direction:column;gap:8px;margin:8px 0 20px;font-size:15px">
  <li style="display:flex;gap:10px"><span style="color:var(--orange);font-weight:700">✦</span><span><strong>[Bold claim]</strong> [brief specific explanation, 1 sentence]</span></li>
  (repeat × 5, each covering a different trait of this type)
</ul>
8. <div class="callout">Start with: "Only about ${rarityPct}% of people share your type." Then 2 sentences on what this means for them — why standard advice hasn't fit, and why this report is different.</div>
9. <h3>Why career decisions feel hard for you</h3>
10. <p>[1 paragraph: the specific reason this type struggles with standard career advice. Name the tension. Be honest.]</p>

Start with <div class="eye">. No preamble.`;
}

function axisPagePrompt(
  ctx: PromptCtx,
  axisKey: 'energy' | 'world' | 'decisions' | 'structure',
  sliderNum: 1 | 2 | 3 | 4,
  sliderLabel: string,
): string {
  const { input, axes, typeCode } = ctx;
  const axis = axes[axisKey];
  const behavCtx = behavioralContext(
    axisKey === 'energy' ? 'EI' : axisKey === 'world' ? 'SN' : axisKey === 'decisions' ? 'TF' : 'JP',
    axis.pole,
    axis.pct,
  );
  const pctNote = axis.pct < 55
    ? `At ${axis.pct}%, they are mildly ${axis.label.toLowerCase()} — very close to the center. Write nuanced content that acknowledges they use both sides.`
    : axis.pct >= 80
    ? `At ${axis.pct}%, this is a very strong preference — write about the pronounced version of this trait.`
    : `At ${axis.pct}%, this is a clear but not extreme preference.`;

  const careerImplication: Record<string, string> = {
    energy_E: 'Pure solo work for extended periods will slowly drain them, even if the work itself is interesting. They need people in their week — not constantly, but consistently.',
    energy_I: 'Jobs that require constant social performance (all-day meetings, heavy customer interaction) will quietly grind them down. They need protected focus time built into their role.',
    world_N: 'Roles that are purely execution-based — doing the same defined task repeatedly — will bore them fast. They need conceptual variety and room to contribute ideas, not just output.',
    world_S: 'Abstract, big-picture strategy work with no concrete deliverables will feel ungrounded. They do their best work when theory connects to tangible, verifiable results.',
    decisions_T: 'Environments that run purely on relationship politics — where being liked matters more than being right — will frustrate them. They need to be able to say what they actually think.',
    decisions_F: 'Highly transactional, impersonal work cultures — where it\'s "just business" and feelings are irrelevant — will drain their sense of purpose. They need their work to feel like it matters to people.',
    structure_J: 'Roles with no clear structure, vague deliverables, and constant pivoting will frustrate and exhaust them. They need defined outcomes, even if the path to get there is their own.',
    structure_P: 'Rigid roles where every hour is scheduled and every process is fixed will feel like wearing clothes that don\'t fit. They need some level of open-endedness built into their work.',
  };
  const ciKey = `${axisKey}_${axis.pole}` as keyof typeof careerImplication;
  const implication = careerImplication[ciKey] ?? `Their ${axis.pct}% ${axis.label.toLowerCase()} score shapes what kinds of work will feel natural vs. draining.`;

  return `Write page ${5 + sliderNum}: "${sliderLabel} axis deep dive."

Person's profile:
- Type: ${typeCode}
- This axis: ${axis.label} at ${axis.pct}% (opposite: ${axis.oppositeLabel})
- ${pctNote}
- Behavioral profile: ${behavCtx}

Write the body-pad content for this axis page. Required structure:

1. <div class="eye">— Slider ${sliderNum} of 4 · ${sliderLabel} —</div>
2. <h1>[1–2 line punchy title that captures THEIR specific position. E.g. for E62: "You charge up around people." For I81: "Your best thinking happens alone."]</h1>
[A spectrum diagram with their score is automatically inserted after the h1. Do NOT describe the diagram.]
3. <h3>[Subheading: what this looks like in their specific week — use the score to describe concrete reality]</h3>
4. <p>[1–2 paragraphs: concrete, specific description of what ${axis.pct}% ${axis.label.toLowerCase()} looks like in daily life. Be specific about the nuance at this score — not a caricature of the extreme.]</p>
5. [If strong score (>65): add a flip-side paragraph — what to watch for. If mild score (<55): acknowledge the balance they have and what that means.]
6. <div class="tip"><div class="tlbl">→ Career implication</div><p>${implication}</p></div>

IMPORTANT: Do NOT include the spectrum diagram, badge, or any score display HTML. Those are inserted automatically.
Start with <div class="eye">. No preamble.`;
}

export function energyAxisPrompt(ctx: PromptCtx): string {
  return axisPagePrompt(ctx, 'energy', 1, 'How you get your energy');
}

export function perceptionAxisPrompt(ctx: PromptCtx): string {
  return axisPagePrompt(ctx, 'world', 2, 'How you see the world');
}

export function decisionAxisPrompt(ctx: PromptCtx): string {
  return axisPagePrompt(ctx, 'decisions', 3, 'How you make decisions');
}

export function organizationAxisPrompt(ctx: PromptCtx): string {
  return axisPagePrompt(ctx, 'structure', 4, 'How you handle plans');
}

export function superpowersPrompt(ctx: PromptCtx): string {
  const { input, axes, typeCode } = ctx;
  const { energy, world, decisions, structure } = axes;

  return `Write page 10: "Your superpowers."

Person's profile:
- Type: ${typeCode}
- ${energy.label} ${energy.pct}%, ${world.label} ${world.pct}%, ${decisions.label} ${decisions.pct}%, ${structure.label} ${structure.pct}%

Write exactly 5 strengths that naturally emerge from this specific combination of axes. Make them SPECIFIC — not vague traits like "creative" or "empathetic," but precise descriptions of things this type actually does better than most people in workplace settings.

Required structure:
<div class="eye">— Five things you're better at than most people —</div>
<h1>Your superpowers.</h1>
<p class="lede">[1–2 sentence intro: not vague praise, but a direct statement about what this section covers and why these specific 5 things matter for career]</p>
<div class="two-col" style="grid-template-columns:1fr;gap:14px">
  For each of 5 strengths:
  <div class="card">
    <div class="lbl or">— 0[N] —</div>
    <h3>[Clear, bold strength name in 3–7 words]</h3>
    <p style="margin:0;font-size:14.5px">[2–3 sentences: specific description of HOW this type does this, in what contexts it shows up, and why it's genuinely valuable in careers. No fluff.]</p>
  </div>
</div>

The 5 strengths MUST emerge from this person's specific axis combination, not generic type content.
Start with <div class="eye">. No preamble.`;
}

export function blindSpotsPrompt(ctx: PromptCtx): string {
  const { input, axes, typeCode } = ctx;
  const { energy, world, decisions, structure } = axes;

  return `Write page 11: "Your trip-ups."

Person's profile:
- Type: ${typeCode}
- ${energy.label} ${energy.pct}%, ${world.label} ${world.pct}%, ${decisions.label} ${decisions.pct}%, ${structure.label} ${structure.pct}%

Write exactly 6 specific blind spots that naturally arise from this type's wiring. These are the shadow side of their strengths. They should show up most when under stress or boredom. Be honest but not harsh — the tone is "this is real, here's what to do about it."

Required structure:
<div class="eye">— Where the same wiring works against you —</div>
<h1>Your trip-ups.</h1>
<p class="lede">[1–2 sentences: frame these as the cost of their strengths, not character flaws. They show up when stressed or bored.]</p>
<div class="two-col">
  For each of 6 blind spots:
  <div class="card dim">
    <div class="lbl co">— Trip-up 0[N] —</div>
    <h3>[Clear, honest blind spot name in 4–8 words]</h3>
    <p style="margin:0;font-size:14px">[2–3 sentences: specific, honest description of how this shows up in real life for this type. Include what the actual cost is. No sugarcoating.]</p>
  </div>
</div>

Make these genuinely specific to ${typeCode}, not generic "everyone does this" content.
Start with <div class="eye">. No preamble.`;
}

export function misreadsPrompt(ctx: PromptCtx): string {
  const { input, typeCode } = ctx;

  return `Write page 12: "How others see you vs. how you really are."

Person's type: ${typeCode}

Write 4 common misreads — things other people assume about this type that aren't quite right. Each row needs a "what they say" and "what's actually going on."

Required structure:
<div class="eye">— The gap between the story and the truth —</div>
<h1>How others see<br/>you vs. how you<br/>really are.</h1>
<p>[1 introductory sentence: every type gets misread. Here are the 4 most common ones for ${typeCode}.]</p>
<table class="tbl">
  <thead><tr><th style="width:36%">What they say</th><th>What's actually going on</th></tr></thead>
  <tbody>
    For each of 4 misreads:
    <tr>
      <td><b>"[The accusation or assumption — in quotes, as if someone said it]"</b></td>
      <td>[2–3 sentences explaining what's really happening. Be insightful and a little surprising. The real explanation should make the reader feel understood, not defensive.]</td>
    </tr>
  </tbody>
</table>
<div class="callout">[1–2 sentences of nuanced advice: when the feedback they keep getting is actually valid vs. when it's just people not understanding their type.]</div>

Start with <div class="eye">. No preamble.`;
}

export function careersPrompt(ctx: PromptCtx): string {
  const { input, axes, typeCode } = ctx;
  const { energy, world, decisions, structure } = axes;

  const gradients = [
    'linear-gradient(135deg,var(--navy),var(--blue))',
    'linear-gradient(135deg,var(--blue),var(--blue-s))',
    'linear-gradient(135deg,var(--coral),var(--orange))',
    'linear-gradient(135deg,var(--orange),var(--gold))',
  ];

  return `Write page 13: "Careers that fit you."

Person's profile:
- Type: ${typeCode}
- ${energy.label} ${energy.pct}%, ${world.label} ${world.pct}%, ${decisions.label} ${decisions.pct}%, ${structure.label} ${structure.pct}%

Generate exactly 12 career directions ranked by fit percentage, highest to lowest. These should be specific career directions (not vague categories like "creative fields") where this type's combination of traits becomes a real competitive advantage. Fit % is how well the day-to-day shape of the work matches their wiring — not earning potential.

Required structure:
<div class="eye">— Twelve directions, ranked by fit —</div>
<h1>Where you<br/>tend to thrive.</h1>
<p class="lede">[1–2 sentences: these are career directions where their specific wiring is an asset, ranked by how well the work shape matches them, not by salary]</p>

For each career 01–12, alternate between these gradient styles in order:
${gradients.map((g, i) => `${i + 1}. style="background:${g}"`).join('\n')}
Then repeat.

Format each career as:
<div class="career"><div class="ci" style="background:[GRADIENT]">0[N]</div><div><div class="nm">[Specific career title]</div><div class="desc">[10–15 word specific description of why it fits]</div></div><div class="right"><div class="pct">[XX]%</div><div class="fb"><div class="ff" style="width:[XX]%"></div></div></div></div>

Fit percentages should range from ~95% (top match) to ~72% (12th match). Vary them realistically — not all clustered.

Start with <div class="eye">. No preamble.`;
}

export function goodEnvironmentsPrompt(ctx: PromptCtx): string {
  const { input, axes, typeCode } = ctx;
  const { energy, world, decisions, structure } = axes;

  return `Write page 14: "Workplaces that energize you."

Person's profile:
- Type: ${typeCode}
- ${energy.label} ${energy.pct}%, ${world.label} ${world.pct}%, ${decisions.label} ${decisions.pct}%, ${structure.label} ${structure.pct}%

Write exactly 10 workplace conditions that genuinely energize this type — specific enough to use as a checklist when evaluating a job offer.

Required structure:
<div class="eye">— What to look for in a job —</div>
<h1>Workplaces that<br/>energize you.</h1>
<p class="lede">[1 sentence: the job title matters less than these conditions. Use this list when evaluating a role.]</p>
<div class="checklist">
  For each of 10 conditions:
  <div class="check"><div class="box"></div><div class="txt"><b>[3–6 word condition label.]</b> [10–18 word specific explanation of what this looks like and why it matters for this type.]</div></div>
</div>
<p style="margin-top:14px"><strong>Quick test:</strong> [1–2 sentences: tell them how to score themselves — count the boxes their current job checks, and what the score means]</p>

Make these specific to ${typeCode}'s combination of traits — not generic "good workplace" advice.
Start with <div class="eye">. No preamble.`;
}

export function badEnvironmentsPrompt(ctx: PromptCtx): string {
  const { input, axes, typeCode } = ctx;
  const { energy, world, decisions, structure } = axes;

  return `Write page 15: "Workplaces that drain you."

Person's profile:
- Type: ${typeCode}
- ${energy.label} ${energy.pct}%, ${world.label} ${world.pct}%, ${decisions.label} ${decisions.pct}%, ${structure.label} ${structure.pct}%

Write exactly 7 work environment types that drain this type — and for each, explain WHY specifically (not just "it's boring").

Required structure:
<div class="eye">— What to run from —</div>
<h2>Workplaces that<br/>drain you.</h2>
<p>[1 sentence: these aren't roles they can't do — they're environments where the daily texture of the work works against their wiring, and every year there costs more than it should.]</p>
<table class="tbl">
  <thead><tr><th>Environment</th><th>Why it drains you</th></tr></thead>
  <tbody>
    For each of 7 environments:
    <tr><td><b>[4–7 word environment type]</b></td><td>[2 sentences: specific explanation of WHY this drains ${typeCode} — the exact mechanism, not just "you don't like it."]</td></tr>
  </tbody>
</table>
<div class="callout">[1–2 sentences: honest advice — if their current job has 3+ of these and they've been there 2+ years, the question isn't whether to change but what kind of change and how soon. Reference the action plan page.]</div>

Start with <div class="eye">. No preamble.`;
}

export function moneyRiskPrompt(ctx: PromptCtx): string {
  const { input, axes, typeCode } = ctx;
  const { structure, decisions } = axes;

  return `Write page 16: "Money, risk, and starting things."

Person's profile:
- Type: ${typeCode}
- Decisions: ${decisions.label} ${decisions.pct}%
- Structure: ${structure.label} ${structure.pct}%

Write 3 honest, specific observations about how this type tends to relate to money, risk, and entrepreneurship — based on their actual axis scores.

Required structure:
<div class="eye">— A quick honest read —</div>
<h1>Money, risk,<br/>and starting things.</h1>
<p>[1 sentence intro: career talk is also money talk. Three things worth knowing.]</p>

Section 1: Risk (title based on their Structure score — ${structure.label}s take risk differently than planners)
<h3>[Title about their risk profile]</h3>
<p>[1–2 paragraphs: honest assessment of how this type takes risks. Be specific about their ${structure.pct}% ${structure.label.toLowerCase()} wiring and what that means for impulsive vs. strategic risk-taking. The specific edge case where their type gets into trouble.]</p>

Section 2: Money management
<h3>[Title about earning vs. saving]</h3>
<p>[1 paragraph: honest truth about how this type tends to handle money. What they're good at and what trips them up. Based on their specific combination.]</p>

Section 3: Starting things (relevant given their ${structure.label} tendency)
<h3>[Title about their relationship to starting and finishing things]</h3>
<p>[1 paragraph: honest about what they do well and the specific trap they fall into]</p>
<div class="tip"><div class="tlbl">→ One specific move</div><p>[1–2 sentences: a single concrete, actionable thing they can do this week based on their specific money/risk profile]</p></div>

Start with <div class="eye">. No preamble.`;
}

export function relationshipsPrompt(ctx: PromptCtx): string {
  const { input, axes, typeCode } = ctx;
  const { energy, decisions } = axes;

  return `Write page 17: "Relationships at work and home."

Person's profile:
- Type: ${typeCode}
- Energy: ${energy.label} ${energy.pct}%
- Decisions: ${decisions.label} ${decisions.pct}%

Write a concise, honest chapter about how this type shows up with other people — both at work and at home. Keep it short (this is a brief chapter, not a relationship report).

Required structure:
<div class="eye">— A short chapter, but important —</div>
<h2>How you show up<br/>with other people.</h2>
<p>[1 sentence intro: career and people are tangled. Their wiring shows up in how they connect.]</p>

<h3>At work</h3>
<p>[1–2 paragraphs: honest description of how this type shows up with colleagues. What they're naturally good at with people. What they're naturally not good at. The specific thing that surprises others about them.]</p>
<p>[1 paragraph: a specific practical note — what systems or habits help this type compensate for their natural blind spots in workplace relationships]</p>

<h3>At home</h3>
<p>[1–2 paragraphs: how this type shows up in personal relationships. What their inner circle looks like. The one thing the people closest to them often misunderstand about them — and what they can say to help.]</p>

<div class="callout">[1–2 sentences: one specific, slightly surprising truth about how this type comes across to people who love them — something they probably haven't been told directly before.]</div>

Keep total length under 380 words. Start with <div class="eye">. No preamble.`;
}

export function actionPlanPrompt(ctx: PromptCtx): string {
  const { input, typeCode } = ctx;

  return `Write page 18: "Your 30-day plan."

Person's type: ${typeCode}

Write a realistic 30-day action plan — designed knowing this type's tendencies (including their weaknesses). The plan has 4 weeks with 3 tasks each. Each week's tasks should be doable but not trivial.

Required structure:
<div class="eye">— What to actually do next —</div>
<h1>Your 30-day plan.</h1>
<p class="lede">[1–2 sentences: reading doesn't change anything, doing does. Here's a small doable month — designed knowing how ${typeCode} actually behaves, including the tendency to get distracted]</p>

For each of 4 weeks:
<div class="week">
  <div class="wh"><div class="wt">Week [N] — [Theme]</div><div class="wn">[Time estimate, e.g. "3–4 hours total"]</div></div>
  <ul>
    <li>[Specific, actionable task. Start with a verb.]</li>
    <li>[Specific, actionable task.]</li>
    <li>[Specific, actionable task.]</li>
  </ul>
</div>

Week themes:
- Week 1: Notice / Assess (review what this report revealed)
- Week 2: Research (talk to people 3–10 years ahead on a path)
- Week 3: Test (smallest possible experiment on a career direction)
- Week 4: Commit (pick one small concrete move)

<div class="callout">[1–2 sentences: if they do nothing else on the list, which single task will have the highest ROI? Why?]</div>

Make the tasks specific to ${typeCode}'s wiring — reference their likely resistance points (e.g., if they're a strong P, acknowledge they'll probably skip week 3 but shouldn't).
Start with <div class="eye">. No preamble.`;
}

export function closingPrompt(ctx: PromptCtx): string {
  const { input, axes, typeCode } = ctx;
  const typeName = getTypeName(typeCode);
  const { energy, world } = axes;

  return `Write page 19: "One last thing."

Person's profile:
- Type: ${typeCode} — "${typeName}"
- ${energy.label} ${energy.pct}%, ${world.label} ${world.pct}%

Write a warm, honest, memorable closing page. Not generic inspiration — something specific to this type's particular journey and the ways their wiring can be both a gift and a challenge.

Required structure:
<div class="eye">— One last thing —</div>
<h1>[3–5 line poetic title that captures something true about this type's career path. Use <br/> tags. E.g.: "You're not lost.<br/>You're just wired<br/>for more options<br/>than most."]</h1>
<p class="lede" style="margin-top:24px">[2–3 sentences: address the specific way this type has probably received advice that didn't fit — and why. Warm, not preachy.]</p>
<p>[2–3 sentences: what this type is uniquely positioned to do in a career. The specific gift their wiring gives the world. Concrete, not generic.]</p>
<p>[2–3 sentences: honest truth about what "success" looks like for this type — it won't look like the standard path, and that's the point.]</p>
<h3>What's true for your type</h3>
<p>[2–3 sentences: what a ${typeCode} career typically looks like from the outside vs. what it actually is when it's working. Reassuring and specific.]</p>
<p>[2 sentences: what they should measure their career against — not the standard benchmarks but the ones that actually matter for this type.]</p>
<p style="margin-top:28px;color:var(--ink);font-weight:600">[Short punchy closing line — 4–7 words. Something that captures the spirit of their type and sends them off with energy. Not "good luck".]</p>
<p style="margin-top:24px;text-align:right;color:var(--ink);font-weight:500"><em>— The PsyID team</em><br/><span style="font-size:12px;color:var(--ink-m);letter-spacing:.08em">PSYID.ME · ${new Date().getFullYear()}</span></p>

Keep total under 400 words. Make it feel like a real send-off, not a generic conclusion.
Start with <div class="eye">. No preamble.`;
}
