import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { scanId } = await req.json();

    if (!scanId) {
      return NextResponse.json({ error: 'Missing scanId' }, { status: 400 });
    }

    const stripeKey = process.env.STRIPE_SECRET_KEY;

    // Demo mode: no Stripe key → just mark as paid and return
    if (!stripeKey) {
      console.log('[Checkout] No Stripe key, using demo mode — auto-unlocking');
      const { markPaid } = require('@/lib/db');
      markPaid(scanId, 'demo-session');
      return NextResponse.json({ demo: true, url: null });
    }

    // Real Stripe checkout
    const stripe = require('stripe')(stripeKey);

    const origin = req.headers.get('origin') || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: '🚩 RedFlag AI — Full Analysis',
              description: 'Complete red flag analysis with sarcastic commentary and shareable image',
            },
            unit_amount: 399, // $3.99
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/result/${scanId}?paid=true`,
      cancel_url: `${origin}/result/${scanId}`,
      metadata: {
        scanId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[Checkout] Error:', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
