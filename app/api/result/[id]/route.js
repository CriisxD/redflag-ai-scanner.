import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { getScan } = require('@/lib/db');
    const scan = getScan(id);

    if (!scan) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const analysis = scan.analysis_json ? JSON.parse(scan.analysis_json) : null;

    // Always return score and risk level
    const result = {
      toxicScore: scan.score || 0,
      riskLevel: scan.risk_label || 'Unknown',
      paid: scan.paid === 1,
    };

    // Only include full analysis if paid
    if (scan.paid === 1 && analysis) {
      result.ghostingProbability = analysis.ghostingProbability || 0;
      result.attachmentStyle = analysis.attachmentStyle || 'Unknown';
      result.whatYouAttract = analysis.whatYouAttract || '';
      result.hiddenRedFlag = analysis.hiddenRedFlag || '';
      result.topRedFlags = analysis.topRedFlags || [];
      result.savageComments = analysis.savageComments || [];
      result.datingPercentile = analysis.datingPercentile || 0;
      result.finalVerdict = analysis.finalVerdict || '';
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[Result] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
