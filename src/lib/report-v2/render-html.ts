// report-v2 — deterministic HTML renderer.
//
// Turns a ComposedReport into semantic HTML using stable class names (no inline
// styles), so the host page/PDF shell supplies the CSS. Pure and side-effect free:
// same ComposedReport → same string. A @react-pdf renderer will consume the same
// ComposedReport later without touching the engine.
import type { ComposedReport, ReportBlock } from './types';

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function renderBlock(b: ReportBlock): string {
  const isAxis = b.layer === 'axis' && b.meta != null;
  const meta = isAxis
    ? `<span class="rp-chip" data-band="${esc(String(b.meta!.band ?? ''))}">${esc(String(b.meta!.code ?? ''))}</span>`
    : '';
  // Axis blocks carry their measured values as data-* so any CSS/PDF layer (meters,
  // pentagon, band styling) can read them without re-deriving from the score.
  const dataAttrs = isAxis
    ? ` data-band="${esc(String(b.meta!.band ?? ''))}"` +
      ` data-position="${esc(String(b.meta!.position ?? ''))}"` +
      ` data-intensity="${esc(String(b.meta!.intensity ?? ''))}"`
    : '';
  const body = b.body.map(p => `<p class="rp-body">${esc(p)}</p>`).join('');
  return (
    `<article class="rp-block" data-layer="${esc(b.layer)}" id="${esc(b.id)}"${dataAttrs}>` +
    `<h3 class="rp-block-h">${meta}<span>${esc(b.heading)}</span></h3>` +
    body +
    `</article>`
  );
}

export function renderReportHtml(report: ComposedReport): string {
  const sections = report.sections
    .map(
      s =>
        `<section class="rp-section" id="section:${esc(s.id)}">` +
        `<h2 class="rp-section-h">${esc(s.title)}</h2>` +
        s.blocks.map(renderBlock).join('') +
        `</section>`,
    )
    .join('');

  return (
    `<div class="rp" data-tier="${esc(report.tier)}" data-lang="${esc(report.lang)}" ` +
    `data-content-version="${esc(report.contentVersion)}" data-signature="${esc(report.signature)}">` +
    sections +
    `</div>`
  );
}
