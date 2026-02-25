'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ResultPaywall from '@/components/ResultPaywall';

function PaywallPageInner() {
  const searchParams = useSearchParams();
  const [scanResult, setScanResult] = useState(null);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  useEffect(() => {
    // Check if returning from successful payment
    const paymentStatus = searchParams.get('payment');
    const scanIdFromUrl = searchParams.get('scan_id');

    if (paymentStatus === 'success' && scanIdFromUrl) {
      // User just paid — fetch the scan from Supabase and unlock
      setIsPaymentSuccess(true);
      fetchPaidResult(scanIdFromUrl);
      return;
    }

    // Normal flow: load from sessionStorage
    const savedResult = sessionStorage.getItem('lastScanResult');
    if (savedResult) {
      setScanResult(JSON.parse(savedResult));
    }
  }, []);

  const fetchPaidResult = async (scanId) => {
    try {
      const res = await fetch(`/api/result/${scanId}`);
      const json = await res.json();
      setScanResult({
        scanId: json.scanId,
        aiResult: json.aiResult,
        isUnlocked: true 
      });
    } catch (err) {
      console.error('Error fetching paid result:', err);
    }
  };

  const handleCheckout = async () => {
    // Get scanId from the stored result
    const scanId = scanResult?.scanId;

    if (!scanId) {
      // Fallback: if there's a direct checkout_url already
      if (scanResult?.checkoutUrl) {
        window.location.href = scanResult.checkoutUrl;
        return;
      }
      console.error('No scanId available for checkout');
      return;
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId }),
      });
      const json = await res.json();

      if (json.url) {
        window.location.href = json.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    }
  };

  return (
    <ResultPaywall 
      onCheckout={handleCheckout} 
      aiResult={scanResult?.aiResult || scanResult}
      forcedUnlocked={isPaymentSuccess || scanResult?.isUnlocked}
    />
  );
}

export default function PaywallPage() {
  return (
    <Suspense>
      <PaywallPageInner />
    </Suspense>
  );
}
