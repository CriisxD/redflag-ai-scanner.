import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // Fetch from Supabase
    const { data: scan, error } = await supabase
      .from('scans')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !scan) {
      console.error('[Result API] Not found or error:', error);
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    const aiResult = scan.ai_result;
    const isPaid = scan.payment_status === 'paid' || scan.payment_status === 'free'; // In dev 'free' might be allowed

    return NextResponse.json({
      scanId: scan.id,
      aiResult: aiResult,
      paymentStatus: scan.payment_status,
      isUnlocked: isPaid,
      targetName: scan.target_name,
      createdAt: scan.created_at
    });

  } catch (err) {
    console.error('[Result API] Critical Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
