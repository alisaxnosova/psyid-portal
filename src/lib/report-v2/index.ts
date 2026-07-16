// report-v2 — public surface.
//
// Usage:
//   const positions = positionsFromV12(scoreSessionV12(session.answers));
//   const report = composeReport({ positions, tier: 'basic', lang: 'en', holder });
//   const html = renderReportHtml(report);
//   const key = reportKey(report);   // cache/idempotency key, keyed by profile
import { AXES, type AxisCode } from '@/data/reno-axes';
import type { RenoScoreV12 } from '@/lib/renoScoreV12';
import type { ComposedReport, Positions } from './types';

export { composeReport, CONTENT_VERSION, type ComposeInput } from './compose';
export { renderReportHtml } from './render-html';
export type {
  ComposedReport,
  ReportSection,
  ReportBlock,
  ReportTier,
  ReportHolder,
  Positions,
  Lang,
} from './types';
export type { ContentCell, ReportLayer } from './content';

/** Extract the 0..100 positions the engine needs from a five-axis v1.2 score. */
export function positionsFromV12(score: RenoScoreV12): Positions {
  return AXES.reduce((acc, a) => {
    acc[a.code] = score.byCode[a.code].position;
    return acc;
  }, {} as Record<AxisCode, number>);
}

/**
 * Reproducibility / cache key. A report is a pure function of these four, so two
 * test takers with the same profile share one cache entry, and a content-version
 * bump re-renders everyone deterministically.
 */
export function reportKey(report: Pick<ComposedReport, 'signature' | 'contentVersion' | 'tier' | 'lang'>): string {
  const sig = report.signature.replace(/\s+/g, '');
  return `psyid:report-v2:${report.contentVersion}:${report.tier}:${report.lang}:${sig}`;
}
