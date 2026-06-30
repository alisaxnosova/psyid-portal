import type { ReportInput } from './types';
import { computeAxes } from './axis-display';
import { generateAllSections } from './orchestrator';
import {
  REPORT_CSS,
  coverPage,
  tocPage,
  snapshotPage,
  backCoverPage,
  wrapContentPage,
  injectDichoBlock,
} from './page-builders';

function pageLabel(num: number, total: number, title: string): string {
  return `<div class="page-label">Page <b>${String(num).padStart(2, '0')} / ${total}</b> — ${title}</div>`;
}

export async function generateReport(input: ReportInput): Promise<string> {
  const { score, code } = input;
  const typeCode = score.type;
  const axes = computeAxes(score);
  const { profileId } = axes;
  const year = new Date().getFullYear();

  // Generate all 16 AI sections in parallel (max 4 concurrent)
  const sections = await generateAllSections(input, axes);

  // Pages with dot counts (how many of 6 dots are filled)
  const dots = (pageNum: number) => Math.min(pageNum - 1, 6);

  // Axis pages: inject the dicho block after </h1>
  const energyContent   = injectDichoBlock(sections.energyAxis,       axes.energy);
  const worldContent    = injectDichoBlock(sections.perceptionAxis,    axes.world);
  const decisionContent = injectDichoBlock(sections.decisionAxis,      axes.decisions);
  const structureContent = injectDichoBlock(sections.organizationAxis, axes.structure);

  const pages = [
    pageLabel(1,  20, 'Cover')                      + coverPage(axes, typeCode, year),
    pageLabel(2,  20, 'Welcome')                     + wrapContentPage('light',  'Welcome',    2,  dots(2),  profileId, sections.intro),
    pageLabel(3,  20, 'Contents')                    + tocPage(axes, typeCode, profileId),
    pageLabel(4,  20, 'Profile at a glance')         + snapshotPage(axes, score, typeCode, profileId),
    pageLabel(5,  20, 'Your type')                   + wrapContentPage('light',  'Your type',  5,  dots(5),  profileId, sections.typeOverview),
    pageLabel(6,  20, 'Energy')                      + wrapContentPage('white',  'Slider 1 · Energy',     6,  dots(6),  profileId, energyContent),
    pageLabel(7,  20, 'World view')                  + wrapContentPage('light',  'Slider 2 · World view', 7,  dots(7),  profileId, worldContent),
    pageLabel(8,  20, 'Decisions')                   + wrapContentPage('white',  'Slider 3 · Decisions',  8,  dots(8),  profileId, decisionContent),
    pageLabel(9,  20, 'Structure')                   + wrapContentPage('light',  'Slider 4 · Structure',  9,  dots(9),  profileId, structureContent),
    pageLabel(10, 20, 'Superpowers')                 + wrapContentPage('white',  'Strengths',  10, dots(10), profileId, sections.superpowers),
    pageLabel(11, 20, 'Trip-ups')                    + wrapContentPage('light',  'Blind spots',11, dots(11), profileId, sections.blindSpots),
    pageLabel(12, 20, 'Misreads')                    + wrapContentPage('white',  'Misreads',   12, dots(12), profileId, sections.misreads),
    pageLabel(13, 20, 'Careers')                     + wrapContentPage('light',  'Careers',    13, dots(13), profileId, sections.careers),
    pageLabel(14, 20, 'Workplaces that energize you')+ wrapContentPage('white',  'Workplaces', 14, dots(14), profileId, sections.goodEnvironments),
    pageLabel(15, 20, 'Workplaces that drain you')   + wrapContentPage('light',  'Workplaces', 15, dots(15), profileId, sections.badEnvironments),
    pageLabel(16, 20, 'Money & risk')                + wrapContentPage('white',  'Money & Risk',16, dots(16), profileId, sections.moneyRisk),
    pageLabel(17, 20, 'Relationships')               + wrapContentPage('light',  'Relationships',17,dots(17), profileId, sections.relationships),
    pageLabel(18, 20, '30-day plan')                 + wrapContentPage('white',  'Your plan',  18, dots(18), profileId, sections.actionPlan),
    pageLabel(19, 20, 'Closing')                     + wrapContentPage('light',  'Closing',    19, dots(19), profileId, sections.closing),
    pageLabel(20, 20, 'Back cover')                  + backCoverPage(profileId, typeCode),
  ];

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>PsyID Career Compass · ${typeCode}${code ? ` · ${code}` : ''}</title>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"/>
<style>${REPORT_CSS}</style>
</head>
<body>
<div class="viewer">
${pages.join('\n')}
</div>
</body>
</html>`;
}

export type { ReportInput } from './types';
