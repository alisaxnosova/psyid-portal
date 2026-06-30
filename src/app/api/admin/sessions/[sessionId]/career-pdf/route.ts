import { NextRequest, NextResponse } from 'next/server';
import { kvGet } from '@/lib/upstash';

export const maxDuration = 60;

function verifyAdmin(req: NextRequest): boolean {
  const token = req.headers.get('Authorization')?.replace('Bearer ', '');
  return !!token && !!process.env.ADMIN_SECRET && token === process.env.ADMIN_SECRET;
}

const CHROMIUM_URL =
  'https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar';

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
      defaultViewport: { width: 794, height: 1123 },
      executablePath: await chromium.executablePath(CHROMIUM_URL),
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'load', timeout: 30000 });
      // Brief pause to let web fonts render
      await new Promise(r => setTimeout(r, 1500));

      const pdf = await page.pdf({
        format: 'A4',
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
