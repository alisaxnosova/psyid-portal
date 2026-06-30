import type { RenoScore } from '@/lib/renoScore';

export interface AxisInfo {
  pole: string;
  pct: number;
  spectrumPos: number; // CSS left% for spectrum thumb
  label: string;
  axisName: string;
  oppositeLabel: string;
  description: string;
}

export interface AxisData {
  energy: AxisInfo;
  world: AxisInfo;
  decisions: AxisInfo;
  structure: AxisInfo;
  profileId: string; // e.g. "E62N77T52P72"
}

export function computeAxes(score: RenoScore): AxisData {
  const { pct } = score;

  // Energy: E on LEFT of spectrum, I on RIGHT → thumb.left = 100 - pct.E
  const energy: AxisInfo = pct.E >= 50
    ? { pole: 'E', pct: pct.E, spectrumPos: 100 - pct.E, label: 'Extravert', axisName: 'Energy', oppositeLabel: 'Introvert', description: 'You get energy from people and action.' }
    : { pole: 'I', pct: pct.I, spectrumPos: 100 - pct.E, label: 'Introvert', axisName: 'Energy', oppositeLabel: 'Extravert', description: 'You recharge in solitude and focused work.' };

  // World: S on LEFT, N on RIGHT → thumb.left = pct.N
  const world: AxisInfo = pct.N >= 50
    ? { pole: 'N', pct: pct.N, spectrumPos: pct.N, label: 'Intuitive', axisName: 'World view', oppositeLabel: 'Sensor', description: 'You see patterns, possibilities, what could be.' }
    : { pole: 'S', pct: pct.S, spectrumPos: pct.N, label: 'Sensor', axisName: 'World view', oppositeLabel: 'Intuitive', description: 'You focus on facts, details, and what\'s real.' };

  // Decisions: T on LEFT, F on RIGHT → thumb.left = pct.F
  const decisions: AxisInfo = pct.T >= 50
    ? { pole: 'T', pct: pct.T, spectrumPos: pct.F, label: 'Thinker', axisName: 'Decisions', oppositeLabel: 'Feeler', description: 'Logic edges out feeling in how you decide.' }
    : { pole: 'F', pct: pct.F, spectrumPos: pct.F, label: 'Feeler', axisName: 'Decisions', oppositeLabel: 'Thinker', description: 'People and values guide how you decide.' };

  // Structure: J on LEFT, P on RIGHT → thumb.left = pct.P
  const structure: AxisInfo = pct.J >= 50
    ? { pole: 'J', pct: pct.J, spectrumPos: pct.P, label: 'Planner', axisName: 'Structure', oppositeLabel: 'Perceiver', description: 'You prefer things decided, ordered, and done.' }
    : { pole: 'P', pct: pct.P, spectrumPos: pct.P, label: 'Perceiver', axisName: 'Structure', oppositeLabel: 'Planner', description: 'You like keeping options open and adapting as you go.' };

  const profileId = `${energy.pole}${energy.pct}${world.pole}${world.pct}${decisions.pole}${decisions.pct}${structure.pole}${structure.pct}`;

  return { energy, world, decisions, structure, profileId };
}

export function radarPoints(score: RenoScore): string {
  const { pct } = score;
  const cx = 180, cy = 180, r = 150;
  const topY    = Math.round(cy - (pct.E / 100) * r);
  const rightX  = Math.round(cx + (pct.N / 100) * r);
  const bottomY = Math.round(cy + (pct.T / 100) * r);
  const leftX   = Math.round(cx - (pct.P / 100) * r);
  return `${cx},${topY} ${rightX},${cy} ${cx},${bottomY} ${leftX},${cy}`;
}

export function strengthLabel(pct: number): string {
  if (pct >= 81) return 'very strongly';
  if (pct >= 61) return 'strongly';
  if (pct >= 41) return 'moderately';
  return 'mildly';
}

export function behavioralContext(axis: 'EI' | 'SN' | 'TF' | 'JP', pole: string, pct: number): string {
  if (axis === 'EI') {
    if (pole === 'E') {
      if (pct >= 81) return 'Maximum Extravert: responds very quickly in social situations, initiates contact, energizes groups, uncomfortable with long solitude, processes ideas by talking.';
      if (pct >= 61) return 'Strong Extravert: comfortable in large groups, many acquaintances, thinks out loud, needs regular social stimulation, drained by extended isolation.';
      if (pct >= 41) return 'Moderate Extravert: prefers social settings but genuinely needs alone time too, energized by collaboration, thinks better when verbalizing ideas.';
      return 'Mild Extravert: leans social but comfortable in both modes, somewhat prefers interaction but not dependent on it.';
    } else {
      if (pct >= 81) return 'Maximum Introvert: needs significant solitude, very small trusted circle, extensively processes before speaking, drained quickly by large social events.';
      if (pct >= 61) return 'Strong Introvert: values depth over breadth in relationships, needs substantial alone time after social events, thinks carefully before speaking.';
      if (pct >= 41) return 'Moderate Introvert: prefers smaller groups, selective with social energy, needs quiet time to recover, tends to think before speaking.';
      return 'Mild Introvert: slightly prefers solitude but functions comfortably in social settings, selective but not avoidant.';
    }
  }
  if (axis === 'SN') {
    if (pole === 'N') {
      if (pct >= 81) return 'Maximum Intuitive: highly abstract, theoretical, future-focused, easily misses immediate facts and details, sees patterns and possibilities everywhere.';
      if (pct >= 61) return 'Strong Intuitive: naturally jumps to the big picture, connects ideas across domains, trusts hunches, often ahead of others on trends.';
      if (pct >= 41) return 'Moderate Intuitive: balances concrete and abstract, notices patterns while still tracking details when needed.';
      return 'Mild Intuitive: leans toward ideas and possibilities but stays grounded in practical reality.';
    } else {
      if (pct >= 81) return 'Maximum Sensor: highly detail-focused, precise, practical, follows step-by-step processes, trusts only what can be verified directly.';
      if (pct >= 61) return 'Strong Sensor: detail-oriented, reliable, prefers proven methods, excellent at execution and accuracy.';
      if (pct >= 41) return 'Moderate Sensor: grounded in practical reality, checks facts, balances concrete and conceptual.';
      return 'Mild Sensor: generally practical but can engage with abstract ideas when needed.';
    }
  }
  if (axis === 'TF') {
    if (pole === 'T') {
      if (pct >= 81) return 'Maximum Thinker: highly analytical, objective decisions, detached from emotional factors, values logical consistency above all.';
      if (pct >= 61) return 'Strong Thinker: leads with logic, can set aside emotions for fairness, may seem cold but is consistent and principled.';
      if (pct >= 41) return 'Moderate Thinker: uses logic first but considers people\'s feelings, analytical but not dismissive of emotion.';
      return 'Mild Thinker: slightly more analytical than emotional, can access both lenses easily.';
    } else {
      if (pct >= 81) return 'Maximum Feeler: deeply people-focused, decisions driven by values and harmony, very empathetic, may struggle with impersonal or "cold" decisions.';
      if (pct >= 61) return 'Strong Feeler: considers impact on people first, values-driven, creates harmony, may find purely analytical environments difficult.';
      if (pct >= 41) return 'Moderate Feeler: genuinely considers both people and logic, naturally empathetic but can make tough calls when needed.';
      return 'Mild Feeler: leans people-oriented but can engage analytically without discomfort.';
    }
  }
  // JP
  if (pole === 'J') {
    if (pct >= 81) return 'Maximum Planner: everything in its place, plans far ahead, strongly dislikes uncertainty and changes to the plan, highly systematic.';
    if (pct >= 61) return 'Strong Planner: prefers decided things, dislikes ambiguity, works to a system, uncomfortable with sudden changes.';
    if (pct >= 41) return 'Moderate Planner: prefers structure but can adapt, makes plans and usually sticks to them, somewhat uncomfortable with open-endedness.';
    return 'Mild Planner: leans toward structure but comfortable with moderate flexibility.';
  } else {
    if (pct >= 81) return 'Maximum Perceiver: highly spontaneous, resists fixed plans, collects options, thrives on change and novelty, may struggle to complete things.';
    if (pct >= 61) return 'Strong Perceiver: prefers keeping options open, adapts on the fly, bursts of intense focus, dislikes rigid schedules.';
    if (pct >= 41) return 'Moderate Perceiver: spontaneous and adaptable, works best with soft deadlines, creative in open-ended situations.';
    return 'Mild Perceiver: leans flexible but can work within structure when needed.';
  }
}
