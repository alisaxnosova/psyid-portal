import type { ReportInput, GeneratedSections } from './types';
import type { AxisData } from './axis-display';
import { generateSection } from './generateSection';
import {
  introPrompt,
  typeOverviewPrompt,
  energyAxisPrompt,
  perceptionAxisPrompt,
  decisionAxisPrompt,
  organizationAxisPrompt,
  superpowersPrompt,
  blindSpotsPrompt,
  misreadsPrompt,
  careersPrompt,
  goodEnvironmentsPrompt,
  badEnvironmentsPrompt,
  moneyRiskPrompt,
  relationshipsPrompt,
  actionPlanPrompt,
  closingPrompt,
} from './section-prompts';

interface Section {
  key: keyof GeneratedSections;
  promptFn: (ctx: { input: ReportInput; axes: AxisData; typeCode: string }) => string;
}

const SECTIONS: Section[] = [
  { key: 'intro',             promptFn: introPrompt },
  { key: 'typeOverview',      promptFn: typeOverviewPrompt },
  { key: 'energyAxis',        promptFn: energyAxisPrompt },
  { key: 'perceptionAxis',    promptFn: perceptionAxisPrompt },
  { key: 'decisionAxis',      promptFn: decisionAxisPrompt },
  { key: 'organizationAxis',  promptFn: organizationAxisPrompt },
  { key: 'superpowers',       promptFn: superpowersPrompt },
  { key: 'blindSpots',        promptFn: blindSpotsPrompt },
  { key: 'misreads',          promptFn: misreadsPrompt },
  { key: 'careers',           promptFn: careersPrompt },
  { key: 'goodEnvironments',  promptFn: goodEnvironmentsPrompt },
  { key: 'badEnvironments',   promptFn: badEnvironmentsPrompt },
  { key: 'moneyRisk',         promptFn: moneyRiskPrompt },
  { key: 'relationships',     promptFn: relationshipsPrompt },
  { key: 'actionPlan',        promptFn: actionPlanPrompt },
  { key: 'closing',           promptFn: closingPrompt },
];

async function withConcurrency<T>(
  tasks: (() => Promise<T>)[],
  limit: number,
): Promise<T[]> {
  const results = new Array<T>(tasks.length);
  let i = 0;

  async function worker() {
    while (i < tasks.length) {
      const idx = i++;
      results[idx] = await tasks[idx]();
    }
  }

  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

export async function generateAllSections(
  input: ReportInput,
  axes: AxisData,
): Promise<GeneratedSections> {
  const ctx = { input, axes, typeCode: input.score.type };

  const tasks = SECTIONS.map(section => () =>
    generateSection(section.promptFn(ctx)),
  );

  // Max 4 concurrent Claude calls to avoid rate limiting
  const results = await withConcurrency(tasks, 4);

  const sections = {} as GeneratedSections;
  SECTIONS.forEach((section, i) => {
    sections[section.key] = results[i];
  });

  return sections;
}
