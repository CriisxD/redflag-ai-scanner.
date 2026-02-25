import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { scanId } = await req.json();

    if (!scanId) {
      return NextResponse.json({ error: 'Missing scanId' }, { status: 400 });
    }

    // LemonSqueezy Checkout URL
    // The variant ID comes from your LemonSqueezy product
    const VARIANT_ID = process.env.LEMON_SQUEEZY_VARIANT_ID || 'eae71b99-bc07-42a4-a237-c2ed88657720';
    const STORE_SLUG = process.env.LEMON_SQUEEZY_STORE_SLUG || 'redflag-ai-scanner';

    const origin = req.headers.get('origin') || 'https://redflagscanner.xyz';

    // Build LemonSqueezy checkout URL with custom data
    const checkoutUrl = new URL(`https://${STORE_SLUG}.lemonsqueezy.com/checkout/buy/${VARIANT_ID}`);
    
    // Pass scan_id as custom data so the webhook can identify which scan to unlock
    checkoutUrl.searchParams.set('checkout[custom][scan_id]', scanId);
    
    // Redirect back to the scan results page after payment
    checkoutUrl.searchParams.set('checkout[custom][redirect_url]', `${origin}/scan?payment=success&scan_id=${scanId}`);
    
    // Embed mode for cleaner UX (optional)
    // checkoutUrl.searchParams.set('embed', '1');

    console.log(`[Checkout] Generated LemonSqueezy URL for scan: ${scanId}`);

    return NextResponse.json({ url: checkoutUrl.toString() });
    
  } catch (err) {
    console.error('[Checkout] Error:', err);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}
