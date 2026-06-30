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

  const printMode = _req.nextUrl.searchParams.get('print') === 'true';

  // beforeprint hook forces exact page dimensions just before the dialog opens
  // This is more reliable than @media print CSS alone
  const PRINT_SCRIPT = `<script>
(function(){
  function fixPages(){
    var viewer = document.querySelector('.viewer');
    if(viewer){ viewer.style.cssText += ';display:block!important;gap:0!important;padding:0!important;background:white!important;'; }
    document.querySelectorAll('.page-label').forEach(function(el){ el.style.display='none'; });
    document.querySelectorAll('.page').forEach(function(p){
      p.style.cssText += ';height:1123px!important;max-height:1123px!important;min-height:0!important;overflow:hidden!important;page-break-after:always;break-after:page;margin:0!important;';
    });
    var last = document.querySelector('.page.back');
    if(last){ last.style.pageBreakAfter='auto'; last.style.breakAfter='auto'; }
  }
  window.addEventListener('beforeprint', fixPages);
  window.addEventListener('load', function(){ setTimeout(function(){ fixPages(); window.print(); }, 800); });
})();
</script>`;

  const finalHtml = printMode
    ? html.replace('</body>', PRINT_SCRIPT + '</body>')
    : html;

  return new NextResponse(finalHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
