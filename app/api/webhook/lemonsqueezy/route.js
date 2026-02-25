import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-signature');
    const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

    // 1. Verify Signature (Security)
    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(rawBody).digest('hex');

    if (signature !== digest) {
      console.error('Invalid Lemon Squeezy signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data;

    console.log(`[Webhook] Received event: ${eventName}`);

    // 2. Handle order_created
    if (eventName === 'order_created') {
      const scanId = customData?.scan_id;

      if (!scanId) {
        console.error('No scan_id found in webhook custom_data');
        return NextResponse.json({ error: 'Missing scan_id' }, { status: 400 });
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

      console.log(`[Webhook] Scan ${scanId} marked as PAID successfully.`);
    }

    return NextResponse.json({ received: true });

  } catch (err) {
    console.error('[Webhook Error]:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
