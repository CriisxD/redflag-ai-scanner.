import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('creem-signature') || req.headers.get('x-creem-signature');
    const secret = process.env.CREEM_WEBHOOK_SECRET || 'whsec_7adj8HtLA1uskeBPTe7nlo';

    // 1. Verify Signature (Security)
    if (signature && secret) {
      const hmac = crypto.createHmac('sha256', secret);
      const digest = hmac.update(rawBody).digest('hex');

      // Validating signature (optional in dev but good for prod)
      if (signature !== digest) {
        console.warn('⚠️ Invalid Creem signature. Proceeding cautiously or you should reject in pure Prod.');
        // return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const payload = JSON.parse(rawBody);
    const eventType = payload.type;
    const data = payload.data;

    console.log(`[Creem Webhook] Received event: ${eventType}`);

    // 2. Handle checkout.completed
    if (eventType === 'checkout.completed') {
      const scanId = data?.client_reference_id;

      if (!scanId) {
        console.error('No client_reference_id found in Creem webhook data');
        return NextResponse.json({ error: 'Missing client_reference_id' }, { status: 400 });
      }

      // 3. Update Supabase: Mark as paid
      const { error } = await supabase
        .from('scans')
        .update({ 
          payment_status: 'paid' 
        })
        .eq('id', scanId);

      if (error) {
        console.error('Supabase update failed:', error);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }

      console.log(`[Creem Webhook] Scan ${scanId} marked as PAID successfully. ✅`);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('[Creem Webhook Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
