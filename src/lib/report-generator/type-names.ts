export const TYPE_NAMES: Record<string, string> = {
  ENTP: 'The Spark Architect',
  ENTJ: 'The Strategic Builder',
  ENFP: 'The Possibility Engine',
  ENFJ: 'The Human Catalyst',
  INTP: 'The Logic Mapper',
  INTJ: 'The Blueprint Mind',
  INFP: 'The Meaning Seeker',
  INFJ: 'The Pattern Weaver',
  ESTP: 'The Momentum Builder',
  ESTJ: 'The Execution Engine',
  ESFP: 'The Live Wire',
  ESFJ: 'The Community Anchor',
  ISTP: 'The Precision Solver',
  ISTJ: 'The Reliable Architect',
  ISFP: 'The Quiet Artist',
  ISFJ: 'The Devoted Guardian',
};

export function getTypeName(typeCode: string): string {
  return TYPE_NAMES[typeCode] ?? 'The Unique Mind';
}
