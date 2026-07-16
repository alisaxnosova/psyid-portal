// report-v2 — the 32 archetype words (L2 headline layer).
//
// Every profile resolves to one word: the dominant pole of each of the five axes
// (Energy O/W · Info C/A · Decision L/V · Structure D/F · Emotion S/R) forms a
// 5-letter code, and each of the 2^5 = 32 codes is one archetype word + definition.
// The word is the report's title and the product's marketing hook ("Word.").
//
// EN is final. RU is draft — the word translation is a branding decision (translate,
// or keep the English word as a codename); `tx()` falls back to EN wherever ru is ''.
import type { AxisCode, Bilingual } from '@/data/reno-axes';
import type { Positions } from './types';

export interface Archetype {
  code: string;            // 5-letter pole code, e.g. 'WAVFS'
  n: number;               // 1..32, catalogue index
  word: Bilingual;
  definition: Bilingual;
}

const A = (
  n: number,
  code: string,
  wordEn: string,
  defEn: string,
  wordRu = '',
  defRu = '',
): Archetype => ({ n, code, word: { en: wordEn, ru: wordRu }, definition: { en: defEn, ru: defRu } });

export const ARCHETYPES: Record<string, Archetype> = Object.fromEntries(
  [
    A(1, 'OCLDS', 'Commanding', 'decides on the facts, then builds the structure to make it land.',
      'Командующий', 'решает по фактам и выстраивает структуру, чтобы довести дело до результата.'),
    A(2, 'OCLDR', 'Relentless', 'the same will to close and control — with urgency behind it.',
      'Неудержимый', 'та же воля добиваться и держать под контролем — но с напором.'),
    A(3, 'OCLFS', 'Pragmatic', "fixes what's in front of them, unhurried, no plan required.",
      'Прагматик', 'решает то, что перед глазами; без спешки и без плана.'),
    A(4, 'OCLFR', 'Kinetic', 'quick, hot, alive on the live problem.',
      'Кинетик', 'быстрый и азартный; оживает на живой задаче.'),
    A(5, 'OCVDS', 'Dependable', 'holds the people and the logistics together, without being asked.',
      'Надёжный', 'держит людей и дела вместе — спокойно и без напоминаний.'),
    A(6, 'OCVDR', 'Protective', 'organizes around people and feels every stake.',
      'Оберегающий', 'организует всё вокруг людей и остро чувствует ставки.'),
    A(7, 'OCVFS', 'Unbothered', 'present, warm, and unhurried by the room.',
      'Невозмутимый', 'здесь и сейчас, тёплый и неспешный; в ритме момента.'),
    A(8, 'OCVFR', 'Spirited', 'lively and immediate; feeling right on the surface.',
      'Задорный', 'живой и непосредственный; чувство прямо на поверхности.'),
    A(9, 'OALDS', 'Strategic', 'turns pattern into plan, then moves people through it.',
      'Стратег', 'превращает закономерность в план и ведёт по нему людей.'),
    A(10, 'OALDR', 'Ambitious', 'the same vision-to-plan drive, powered by urgency.',
      'Амбициозный', 'тот же ход «из видения — в план», усиленный срочностью.'),
    A(11, 'OALFS', 'Inventive', 'thinks out loud, tests everything, keeps the options open.',
      'Изобретательный', 'думает вслух, проверяет идеи, держит варианты открытыми.'),
    A(12, 'OALFR', 'Electric', 'idea-play at speed; sparks and provokes.',
      'Искрящий', 'игра идей на скорости; искрит и провоцирует.'),
    A(13, 'OAVDS', 'Inspiring', 'carries a vision for people and organizes them toward it.',
      'Вдохновляющий', 'несёт видение для людей и собирает их вокруг него.'),
    A(14, 'OAVDR', 'Fervent', 'a vision for people, carried with visible conviction.',
      'Пламенный', 'видение для людей, несомое с явной убеждённостью.'),
    A(15, 'OAVFS', 'Buoyant', 'possibility and warmth, easy in the current.',
      'Окрылённый', 'возможности и тепло; легко держится в потоке.'),
    A(16, 'OAVFR', 'Exuberant', 'radiates possibility; momentum straight from feeling.',
      'Ликующий', 'излучает возможности; движется на чувстве.'),
    A(17, 'WCLDS', 'Meticulous', 'the detail right, and the system to keep it right.',
      'Дотошный', 'деталь — верна, и есть система, чтобы её удержать.'),
    A(18, 'WCLDR', 'Exacting', 'precision with real stakes; errors land hard.',
      'Взыскательный', 'точность с реальными ставками; ошибки бьют больно.'),
    A(19, 'WCLFS', 'Studious', 'takes it apart alone, until it makes sense.',
      'Вдумчивый', 'разбирает в одиночку, пока не станет ясно.'),
    A(20, 'WCLFR', 'Probing', 'digs at the problem in private, with intensity.',
      'Испытующий', 'в одиночку и настойчиво докапывается до сути.'),
    A(21, 'WCVDS', 'Steadfast', 'steady care, given quietly, no credit needed.',
      'Стойкий', 'тихая, постоянная забота — без нужды в признании.'),
    A(22, 'WCVDR', 'Tender', 'quiet, dutiful care that feels every bit of it.',
      'Нежный', 'тихая, ответственная забота, прочувствованная сполна.'),
    A(23, 'WCVFS', 'Gentle', 'present and kind in small, concrete ways.',
      'Мягкий', 'рядом и по-доброму, в малых конкретных делах.'),
    A(24, 'WCVFR', 'Attuned', "reads the room's feeling before it's spoken.",
      'Чуткий', 'читает чувство комнаты раньше, чем его произнесут.'),
    A(25, 'WALDS', 'Incisive', 'cuts to the underlying structure and names it.',
      'Проницательный', 'доходит до глубинной структуры и называет её.'),
    A(26, 'WALDR', 'Searching', 'drives at the deep structure, and never quite stops.',
      'Ищущий', 'пробивается к глубинной сути и почти не останавливается.'),
    A(27, 'WALFS', 'Inquisitive', 'follows the question wherever it leads, for its own sake.',
      'Любознательный', 'идёт за вопросом, куда бы он ни вёл, ради него самого.'),
    A(28, 'WALFR', 'Absorbed', 'disappears into the idea; consumed by the chase.',
      'Поглощённый', 'растворяется в идее; захвачен погоней за ней.'),
    A(29, 'WAVDS', 'Principled', "quiet conviction, moving steadily toward what's right.",
      'Принципиальный', 'тихая убеждённость; ровно движется к тому, что верно.'),
    A(30, 'WAVDR', 'Earnest', 'conviction felt deeply and held close.',
      'Искренний', 'убеждённость, прочувствованная глубоко и хранимая внутри.'),
    A(31, 'WAVFS', 'Contemplative', 'an inner world of meaning, guided by what feels true.',
      'Созерцатель', 'внутренний мир смысла; ориентир — то, что ощущается истинным.'),
    A(32, 'WAVFR', 'Idealistic', 'meaning and imagination, felt at full intensity.',
      'Идеалист', 'смысл и воображение, прочувствованные во всю силу.'),
  ].map(a => [a.code, a]),
);

/** Dominant pole of each axis → the 5-letter archetype code (balanced axes lean plus). */
export function archetypeCode(positions: Positions): string {
  const pole = (code: AxisCode, plus: string, minus: string) =>
    positions[code] >= 50 ? plus : minus;
  return (
    pole('EO', 'O', 'W') +
    pole('IF', 'C', 'A') +
    pole('DB', 'L', 'V') +
    pole('SP', 'D', 'F') +
    pole('ER', 'S', 'R')
  );
}

export function archetypeFor(positions: Positions): Archetype {
  return ARCHETYPES[archetypeCode(positions)];
}
