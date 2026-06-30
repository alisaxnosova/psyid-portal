import { NextRequest, NextResponse } from 'next/server';
import { kvGet } from '@/lib/upstash';

export const maxDuration = 60;

function verifyAdmin(req: NextRequest): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  return !!token && !!process.env.ADMIN_SECRET && token === process.env.ADMIN_SECRET;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  if (!verifyAdmin(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { sessionId } = await params;
  const html = await kvGet<string>(`psyid:career-report:${sessionId}`);
  if (!html) return NextResponse.json({ error: 'Report not found — generate it first' }, { status: 404 });

  try {
    // @sparticuz/chromium checks AWS_EXECUTION_ENV to decide which lib bundle to
    // extract (al2.tar.br vs al2023.tar.br) and whether to set LD_LIBRARY_PATH.
    // Vercel doesn't set this var, so the libs never unpack and libnss3.so is
    // missing at runtime. Setting it before the first import fixes cold starts.
    process.env['AWS_EXECUTION_ENV'] ??= 'AWS_Lambda_nodejs20.x';

    const chromium = (await import('@sparticuz/chromium')).default;
    const puppeteer = (await import('puppeteer-core')).default;

    const browser = await puppeteer.launch({
      args: [...chromium.args, '--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 794, height: 1123, deviceScaleFactor: 2 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    try {
      const page = await browser.newPage();

      // Strip the viewer wrapper for PDF — render each .page at its natural size
      const pdfHtml = html.replace('</head>', `<style>
        html,body{margin:0;padding:0;background:#fff}
        .viewer{display:block!important;gap:0!important;padding:0!important;background:#fff!important}
        .page-label{display:none!important}
        .page{
          width:794px!important;height:1123px!important;
          min-height:0!important;max-height:1123px!important;
          overflow:hidden!important;
          page-break-after:always;break-after:page;
          margin:0!important;
        }
        .page.back{page-break-after:auto!important;break-after:auto!important}
      </style></head>`);

      await page.setContent(pdfHtml, { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise(r => setTimeout(r, 1500));

      const pdf = await page.pdf({
        width: '794px',
        height: '1123px',
        printBackground: true,
        displayHeaderFooter: false,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
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
