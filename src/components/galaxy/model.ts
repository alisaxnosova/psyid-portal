/**
 * PsyID "personality universe" — data model.
 *
 * Everything the galaxy draws is generated from a `Profile` (per-axis pole + strength)
 * plus the five fixed `AXES`. Distance-from-center and node size are proportional to
 * each axis's strength, so balanced traits hug the core and extreme traits fling out.
 *
 * This is the single source of truth shared by the canvas engine (GalaxyCanvas) and the
 * portal detail cards. Ported from the design handoff (Part B — Personality DNA).
 */

export type Lang = 'en' | 'ru';
export type Bi = Record<Lang, string>;

export interface Pole { L: string; name: Bi; desc: Bi }
export interface AxisDef {
  key: string;
  name: Bi;
  en: string;      // short EN tag used on labels
  hue: string;
  plus: Pole;      // the "+" pole
  minus: Pole;     // the "−" pole
  link: Bi;        // what this axis feeds (footer line on the core card)
}

// Axis hues are meaning-bearing — never approximate. Order is fixed.
export const AXES: AxisDef[] = [
  {
    key: 'energy', name: { ru: 'Энергия', en: 'Energy' }, en: 'Energy', hue: '#3A63F0',
    plus: { L: 'O', name: { ru: 'Наружу', en: 'Outward' }, desc: {
      ru: 'Ты заряжаешься от людей и движения: чем больше вокруг жизни и общения, тем ты живее.',
      en: 'You recharge from people and motion — the more life and contact around you, the more alive you feel.' } },
    minus: { L: 'W', name: { ru: 'Внутрь', en: 'Inward' }, desc: {
      ru: 'Энергию ты черпаешь изнутри — в тишине и работе один на один. Толпа скорее тратит тебя, чем заряжает.',
      en: 'You draw energy from within — in quiet and one-on-one work. A crowd spends you rather than charges you.' } },
    link: { ru: 'Питает созвездие «Энергия и выгорание».', en: 'Feeds the "Energy & burnout" constellation.' },
  },
  {
    key: 'info', name: { ru: 'Информация', en: 'Information' }, en: 'Information', hue: '#6A85F0',
    plus: { L: 'C', name: { ru: 'Конкретика', en: 'Concrete' }, desc: {
      ru: 'Ты доверяешь фактам, деталям и опыту. Сначала — что есть на самом деле, потом теории.',
      en: 'You trust facts, detail and experience. First what is actually there, then the theory.' } },
    minus: { L: 'A', name: { ru: 'Абстракция', en: 'Abstract' }, desc: {
      ru: 'Ты живёшь идеями и смыслами: сначала ловишь общую картину и связи, а детали — потом.',
      en: 'You live in ideas and meaning: you catch the whole picture and the links first, details later.' } },
    link: { ru: 'Одна из осей, задающих подбор направлений.', en: 'One of the axes that drives direction matching.' },
  },
  {
    key: 'decision', name: { ru: 'Решения', en: 'Decision' }, en: 'Decision', hue: '#8A5CD6',
    plus: { L: 'L', name: { ru: 'Логика', en: 'Logic' }, desc: {
      ru: 'Выбор ты проверяешь расчётом и принципами. Верно то, что логично и последовательно.',
      en: 'You test a choice by reasoning and principle. What is right is what is logical and consistent.' } },
    minus: { L: 'V', name: { ru: 'Ценности', en: 'Values' }, desc: {
      ru: 'Выбор ты сверяешь с ценностями и людьми. Правильное для тебя должно быть ещё и своим.',
      en: 'You weigh a choice against values and people. For you, the right call also has to be yours.' } },
    link: { ru: 'Влияет на направления и на созвездие «Стиль в команде».', en: 'Shapes directions and the "Team style" constellation.' },
  },
  {
    key: 'structure', name: { ru: 'Структура', en: 'Structure' }, en: 'Structure', hue: '#FF7A3D',
    plus: { L: 'D', name: { ru: 'Порядок', en: 'Order' }, desc: {
      ru: 'Тебе спокойнее с планом, списком и ясным финишем. Определённость — это опора, а не клетка.',
      en: 'A plan, a list and a clear finish steady you. Certainty is support, not a cage.' } },
    minus: { L: 'F', name: { ru: 'Гибкость', en: 'Flexible' }, desc: {
      ru: 'Любишь открытые рамки и простор для манёвра. Лучшие решения приходят, когда есть воздух.',
      en: 'You like open frames and room to move. Your best decisions arrive when there is air.' } },
    link: { ru: 'Одна из осей, задающих ритм работы.', en: 'One of the axes that sets your working rhythm.' },
  },
  {
    key: 'emotion', name: { ru: 'Реакция', en: 'Emotion' }, en: 'Emotion', hue: '#FF5A5A',
    plus: { L: 'S', name: { ru: 'Ровно', en: 'Steady' }, desc: {
      ru: 'Внутри у тебя ровный тыл. Ты редко идёшь на поводу у всплесков и в напряжённый момент — опора для других.',
      en: 'You keep a level core. You rarely ride the spikes, and in a tense moment you are the anchor for others.' } },
    minus: { L: 'R', name: { ru: 'Живо', en: 'Reactive' }, desc: {
      ru: 'Ты чувствуешь ярко и быстро. Эмоции — твой радар: они приходят первыми и подсказывают, что важно.',
      en: 'You feel vividly and fast. Emotion is your radar — it arrives first and tells you what matters.' } },
    link: { ru: 'Питает созвездие «Энергия и выгорание».', en: 'Feeds the "Energy & burnout" constellation.' },
  },
];

export const BAND_WORDS: Record<Lang, string[]> = {
  ru: ['в балансе', 'лёгкий наклон', 'заметный наклон', 'выраженный', 'сильный', 'очень сильный'],
  en: ['balanced', 'a slight lean', 'a clear lean', 'pronounced', 'strong', 'very strong'],
};

/** Band 0–5 from a score (distance to a pole, 0..100). Display only. */
export function bandFromScore(s: number): number {
  return s < 8 ? 0 : s <= 20 ? 1 : s <= 40 ? 2 : s <= 60 ? 3 : s <= 80 ? 4 : 5;
}

export type PoleSide = 'plus' | 'minus';
export interface AxisScore { t: PoleSide; s: number }   // pole + strength 0..100
export type Profile = AxisScore[];                        // in AXES order (length 5)

/** Profile code, e.g. "W2·A4·V3·F4·S2". */
export function codeOf(profile: Profile): string {
  return profile
    .map((a, i) => (a.t === 'plus' ? AXES[i].plus : AXES[i].minus).L + bandFromScore(a.s))
    .join('·');
}

/** A resolved, language-aware view of one axis of a profile — used by the core detail card. */
export function axisView(a: AxisScore, i: number, lang: Lang) {
  const ax = AXES[i];
  const side = a.t === 'plus' ? ax.plus : ax.minus;
  const opp = a.t === 'plus' ? ax.minus : ax.plus;
  const band = bandFromScore(a.s);
  return {
    ax, side, opp, band, score: a.s,
    code: side.L + band,
    name: ax.name[lang],
    en: ax.en,
    poleName: side.name[lang],
    otherName: opp.name[lang],
    body: side.desc[lang],
    foot: ax.link[lang],
    bandWord: BAND_WORDS[lang][band],
    hue: ax.hue,
  };
}

// ── Graph ────────────────────────────────────────────────────────────────────
const TAU = Math.PI * 2;
const CR = 200;                                   // core ring radius (world units)
const reachOf = (s: number) => 0.2 + 0.8 * (s / 100);   // score → distance factor
const sizeOf = (s: number) => 6.5 + (s / 100) * 8.5;    // score → planet size

export type NodeType = 'center' | 'core' | 'module' | 'leaf' | 'session' | 'dust';

export interface GNode {
  id: string; type: NodeType;
  x: number; y: number; z: number; r: number; color: string;
  locked?: boolean; latest?: boolean; axisIndex?: number;
  label?: string; sub?: string; refKey?: string;
}
export interface GEdge { a: string; b: string; w: number; pent?: boolean }
export interface Graph { nodes: GNode[]; edges: GEdge[]; pent: { x: number; y: number; z: number }[] }

export interface ModuleDef { key: string; axis: number; locked: boolean }
export interface SessionDef { key: string; latest?: boolean }

export interface BuildOpts {
  modules?: ModuleDef[];
  sessions?: number | SessionDef[];
  dust?: number;          // dust-halo particle count (decorative)
  pentagonWeb?: boolean;  // weave adjacent cores
}

/** Build the node graph for a profile. Positions are computed from scores. */
export function buildGraph(profile: Profile, opts: BuildOpts = {}): Graph {
  const nodes: GNode[] = [];
  const edges: GEdge[] = [];
  const pent: Graph['pent'] = [];
  const add = (n: GNode) => (nodes.push(n), n);
  const link = (a: GNode, b: GNode, w = 1, pentWeb = false) => edges.push({ a: a.id, b: b.id, w, pent: pentWeb });

  const center = add({ id: 'me', type: 'center', x: 0, y: 0, z: 0, r: 7.5, color: '#ffffff', label: codeOf(profile), sub: 'ядро' });

  // 5 cores on a tilted pentagon; distance & size = f(score)
  const cores = profile.map((a, i) => {
    const ang = -Math.PI / 2 + i * (TAU / 5);
    const d = CR * reachOf(a.s);
    const c = add({
      id: 'core-' + i, type: 'core', axisIndex: i,
      x: Math.cos(ang) * d, y: Math.sin(ang) * d * 0.62, z: Math.sin(ang) * d * 0.72,
      r: sizeOf(a.s), color: AXES[i].hue, label: (a.t === 'plus' ? AXES[i].plus : AXES[i].minus).L + bandFromScore(a.s),
      sub: AXES[i].en,
    });
    link(center, c, 1.3);
    return c;
  });

  // pentagon web between adjacent cores
  if (opts.pentagonWeb ?? true) for (let i = 0; i < cores.length; i++) link(cores[i], cores[(i + 1) % 5], 0.55, true);

  // pentagon frame ring (drawn separately, larger)
  for (let i = 0; i < 5; i++) {
    const ang = -Math.PI / 2 + i * (TAU / 5), d = CR * 1.16;
    pent.push({ x: Math.cos(ang) * d, y: Math.sin(ang) * d * 0.62, z: Math.sin(ang) * d * 0.72 });
  }

  // module constellations on distinct axes (+ leaf children when unlocked)
  (opts.modules ?? []).forEach((m, mi) => {
    const parent = cores[m.axis];
    if (!parent) return;
    const ang = Math.atan2(parent.z, parent.x) + (mi % 2 ? 0.5 : -0.5), R = 118;
    const mod = add({
      id: 'mod-' + mi, type: 'module', locked: m.locked, refKey: m.key,
      x: parent.x + Math.cos(ang) * R * 0.5 * 0.7, y: parent.y + (mi % 2 ? -46 : 48), z: parent.z + Math.sin(ang) * R * 0.5 * 0.7,
      r: m.locked ? 6.5 : 9.5, color: parent.color,
    });
    link(parent, mod, m.locked ? 0.5 : 1);
    if (!m.locked) {
      for (let ci = 0; ci < 3; ci++) {
        const aa = (ci / 3) * TAU + mi;
        const leaf = add({
          id: 'mod-' + mi + '-c' + ci, type: 'leaf', color: parent.color,
          x: mod.x + Math.cos(aa) * 42, y: mod.y + Math.sin(aa) * 30, z: mod.z + Math.cos(aa + 1) * 42, r: 3.6,
        });
        link(mod, leaf, 0.4);
      }
    }
  });

  // time strand — sessions twisting outward, gold, latest brightest
  const sessionDefs: SessionDef[] = typeof opts.sessions === 'number'
    ? Array.from({ length: opts.sessions }, (_, i) => ({ key: 's' + i, latest: i === (opts.sessions as number) - 1 }))
    : (opts.sessions ?? []);
  let prev = center;
  sessionDefs.forEach((sd, i) => {
    const ang = i * 2.15, rad = 40 + i * 26;
    const s = add({
      id: 'ses-' + i, type: 'session', latest: sd.latest, refKey: sd.key,
      x: Math.cos(ang) * rad, y: Math.sin(ang) * rad * 0.5 - 14, z: Math.sin(ang) * rad - 14 - i * 18,
      r: sd.latest ? 8 : 5.4, color: '#EBD98A',
    });
    link(prev, s, 0.75);
    prev = s;
  });

  // dust halo — flattened, faintly spiralled disk (decorative galaxy body)
  const dust = opts.dust ?? 0;
  for (let i = 0; i < dust; i++) {
    const r = 46 + Math.pow(Math.random(), 0.7) * 250;
    const ang = Math.random() * TAU + r * 0.01;
    const hue = AXES[Math.floor(((ang % TAU) / TAU) * 5) % 5].hue;
    add({
      id: 'dust-' + i, type: 'dust', color: Math.random() < 0.55 ? '#cdd8ff' : hue,
      x: Math.cos(ang) * r, y: (Math.random() - 0.5) * 46 + Math.sin(ang) * r * 0.1, z: Math.sin(ang) * r,
      r: Math.random() * 1.6 + 0.7,
    });
  }

  return { nodes, edges, pent };
}

// ── Sample profiles (demo selector + the decorative marketing hero) ──
export interface ProfilePreset { key: string; name: Bi; note: Bi; axes: Profile }
export const PROFILES: ProfilePreset[] = [
  { key: 'reflective', name: { ru: 'Рефлексивный исследователь', en: 'The Reflective Explorer' },
    note: { ru: 'Смешанный профиль: две оси выражены, остальные ближе к центру.', en: 'A mixed profile: two axes pronounced, the rest nearer the center.' },
    axes: [{ t: 'minus', s: 30 }, { t: 'minus', s: 70 }, { t: 'minus', s: 50 }, { t: 'minus', s: 70 }, { t: 'plus', s: 30 }] },
  { key: 'balanced', name: { ru: 'Универсал — всё в балансе', en: 'The All-Rounder' },
    note: { ru: 'Почти по центру на каждой оси. Плотное ядро без явных краёв.', en: 'Near center on every axis. A tight knot with no sharp edges.' },
    axes: [{ t: 'plus', s: 7 }, { t: 'minus', s: 11 }, { t: 'plus', s: 5 }, { t: 'minus', s: 9 }, { t: 'minus', s: 6 }] },
  { key: 'vivid', name: { ru: 'Ярко выраженный', en: 'The Vivid One' },
    note: { ru: 'Сильный крен по всем пяти осям. Очень «читаемый» характер.', en: 'A strong lean on all five axes. A very legible character.' },
    axes: [{ t: 'plus', s: 92 }, { t: 'plus', s: 86 }, { t: 'plus', s: 90 }, { t: 'plus', s: 88 }, { t: 'plus', s: 90 }] },
  { key: 'leader', name: { ru: 'Двигатель-командир', en: 'The Driver' },
    note: { ru: 'Наружу, логикой и порядком. Берёт на себя, структурирует, ведёт.', en: 'Outward, by logic and order. Takes charge, structures, leads.' },
    axes: [{ t: 'plus', s: 78 }, { t: 'plus', s: 44 }, { t: 'plus', s: 84 }, { t: 'plus', s: 80 }, { t: 'plus', s: 40 }] },
];
export const DEFAULT_PROFILE = PROFILES[0];
