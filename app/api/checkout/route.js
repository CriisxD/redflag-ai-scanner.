import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { scanId } = await req.json();

    if (!scanId) {
      return NextResponse.json({ error: 'Missing scanId' }, { status: 400 });
    }

    // Creem Checkout URL
    const CREEM_CHECKOUT_URL = "https://www.creem.io/payment/prod_36caBKBHKOxbOmqbApPgqc";
    
    // Build Creem checkout URL with custom data (client_reference_id)
    const checkoutUrl = new URL(CREEM_CHECKOUT_URL);
    checkoutUrl.searchParams.set('client_reference_id', scanId);
    
    // Optional: Pass redirect URL if Creem supports it via querystring
    // checkoutUrl.searchParams.set('success_url', `${origin}/scan?payment=success&scan_id=${scanId}`);

    console.log(`[Checkout] Generated Creem URL for scan: ${scanId}`);

    return NextResponse.json({ url: checkoutUrl.toString() });
    
  } catch (err) {
    console.error('[Checkout] Error:', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
