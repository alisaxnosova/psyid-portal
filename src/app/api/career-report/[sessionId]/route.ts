import { NextRequest, NextResponse } from 'next/server';
import { kvGet } from '@/lib/upstash';

// Public endpoint — serves the report HTML for the portal view
// Access is intentionally open since the sessionId is the only "key"
// and reports contain no PII beyond personality type
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;
  const html = await kvGet<string>(`psyid:career-report:${sessionId}`);

  if (!html) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  // Inject auto-print script if ?print=true
  const printMode = _req.nextUrl.searchParams.get('print') === 'true';
  const finalHtml = printMode
    ? html.replace('</body>', '<script>window.addEventListener("load",function(){setTimeout(function(){window.print();},600);});</script></body>')
    : html;

  return new NextResponse(finalHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
