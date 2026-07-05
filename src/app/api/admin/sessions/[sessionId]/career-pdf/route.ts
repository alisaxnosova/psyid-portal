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

      await page.setContent(html, { waitUntil: 'networkidle0', timeout: 30000 });
      // Make sure webfonts have loaded before we measure — otherwise heights
      // are computed against fallback fonts and every measurement is wrong.
      await page.evaluateHandle('document.fonts.ready');
      await new Promise(r => setTimeout(r, 800));

      // Each `.page` was designed to hold exactly one A4 page (794×1123px), but
      // the body copy is AI-generated and its length varies. When a page's
      // content is shorter it must still fill the sheet (footer pinned to the
      // bottom); when it's taller it must be scaled down to fit — never clipped
      // and never spilled onto a half-empty continuation page.
      await page.evaluate(() => {
        const PAGE_W = 794;
        const PAGE_H = 1123;

        // Flatten the on-screen viewer chrome (dark padding, gaps, labels).
        const viewer = document.querySelector('.viewer');
        if (viewer) {
          viewer.setAttribute(
            'style',
            'display:block;margin:0;padding:0;gap:0;background:#fff;width:auto;align-items:stretch;',
          );
        }
        document.querySelectorAll('.page-label').forEach(el => el.remove());

        const pages = Array.from(document.querySelectorAll<HTMLElement>('.page'));
        pages.forEach((el, idx) => {
          const isLast = idx === pages.length - 1;

          // Drop the 1123px floor and let the page collapse to its true content
          // height so we can measure whether it over- or under-flows.
          el.style.minHeight = '0';
          el.style.height = 'auto';
          el.style.maxHeight = 'none';
          el.style.overflow = 'visible';
          el.style.width = `${PAGE_W}px`;
          el.style.margin = '0';

          const naturalH = Math.ceil(el.getBoundingClientRect().height);

          if (naturalH <= PAGE_H + 8) {
            // Fits comfortably: lock to exactly one A4 page. The .body-pad
            // flex:1 spacer then pushes the footer to the bottom as designed.
            el.style.height = `${PAGE_H}px`;
            el.style.overflow = 'hidden';
            el.style.pageBreakAfter = isLast ? 'auto' : 'always';
            el.style.breakAfter = isLast ? 'auto' : 'page';
            return;
          }

          // Overflows: wrap in a fixed A4 frame and uniformly scale the whole
          // page down until it fits. The frame background is matched to the
          // page so the (small) side margins left by uniform scaling are
          // invisible. transform-origin top-center keeps it horizontally
          // centered and top-aligned, so it fills the sheet edge to edge.
          const scale = PAGE_H / naturalH;
          const bg = getComputedStyle(el).backgroundColor || '#F8F4ED';

          const frame = document.createElement('div');
          frame.setAttribute(
            'style',
            `width:${PAGE_W}px;height:${PAGE_H}px;overflow:hidden;margin:0;background:${bg};` +
              (isLast ? '' : 'page-break-after:always;break-after:page;'),
          );
          el.parentNode!.insertBefore(frame, el);
          frame.appendChild(el);

          el.style.pageBreakAfter = 'auto';
          el.style.breakAfter = 'auto';
          el.style.transformOrigin = 'top center';
          el.style.transform = `scale(${scale})`;
        });
      });

      await new Promise(r => setTimeout(r, 400));

      const pdf = await page.pdf({
        format: 'A4',
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
