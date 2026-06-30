import { NextRequest, NextResponse } from 'next/server';
import { kvGet } from '@/lib/upstash';

export const maxDuration = 60;

function verifyAdmin(req: NextRequest): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  return !!token && !!process.env.ADMIN_SECRET && token === process.env.ADMIN_SECRET;
}

// Must match the installed @sparticuz/chromium-min version (149.0.0)
const CHROMIUM_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v149.0.0/chromium-v149.0.0-pack.tar';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;
  const html = await kvGet<string>(`psyid:career-report:${sessionId}`);
  if (!html) return NextResponse.json({ error: 'Report not found — generate it first' }, { status: 404 });

  try {
    const chromium = (await import('@sparticuz/chromium-min')).default;
    const puppeteer = (await import('puppeteer-core')).default;

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 1 },
      executablePath: await chromium.executablePath(CHROMIUM_URL),
      headless: true,
    });

    try {
      const page = await browser.newPage();

      // Inject PDF overrides directly — more reliable than @media print in Puppeteer
      const PDF_OVERRIDES = `<style>
        html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
        .viewer {
          display: block !important;
          gap: 0 !important;
          padding: 0 !important;
          background: white !important;
          width: 794px !important;
          align-items: unset !important;
        }
        .page-label { display: none !important; }
        .page {
          width: 794px !important;
          height: 1123px !important;
          min-height: 0 !important;
          max-height: 1123px !important;
          overflow: hidden !important;
          break-after: page !important;
          page-break-after: always !important;
          margin: 0 !important;
          box-sizing: border-box !important;
        }
        .page.back { break-after: auto !important; page-break-after: auto !important; }
      </style>`;
      const pdfHtml = html.replace('</head>', PDF_OVERRIDES + '</head>');

      await page.setContent(pdfHtml, { waitUntil: 'load', timeout: 30000 });
      // Wait for Google Fonts to load
      await new Promise(r => setTimeout(r, 2000));

      const pdf = await page.pdf({
        width: '794px',
        height: '1123px',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        displayHeaderFooter: false,
      });

      return new NextResponse(pdf as unknown as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="career-compass-${sessionId.slice(0, 8)}.pdf"`,
        },
      });
    } finally {
      await browser.close();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[career-pdf]', message);
    return NextResponse.json({ error: 'PDF generation failed', detail: message }, { status: 500 });
  }
}
