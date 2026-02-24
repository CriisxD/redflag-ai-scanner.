import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const { getScan } = require('@/lib/db');
    const scan = getScan(id);

    if (!scan) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({
      status: scan.status,
      score: scan.score,
      riskLabel: scan.risk_label,
    });
  } catch (err) {
    console.error('[Status] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
