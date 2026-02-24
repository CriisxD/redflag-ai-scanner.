import { NextResponse } from 'next/server';

export async function POST(req) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });
  }

  try {
    const stripe = require('stripe')(stripeKey);
    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const scanId = session.metadata?.scanId;

      if (scanId) {
        const { markPaid } = require('@/lib/db');
        markPaid(scanId, session.id);
        console.log(`[Webhook] Scan ${scanId} marked as paid`);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[Webhook] Error:', err.message);
    return NextResponse.json({ error: 'Webhook failed' }, { status: 400 });
  }
}
