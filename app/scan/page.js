'use client';

import { Suspense, useEffect, useState } from 'react';
import ResultPaywall from '@/components/ResultPaywall';
// import { useRouter } from 'next/navigation';

function PaywallPageInner() {
  // const router = useRouter();
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    const savedResult = sessionStorage.getItem('lastScanResult');
    if (savedResult) {
      setScanResult(JSON.parse(savedResult));
    }
  }, []);

  const handleStripeCheckout = async () => {
    if (scanResult?.checkout_url) {
      window.location.href = scanResult.checkout_url;
    } else {
      console.error('No checkout URL found');
    }
  };

  return (
    <ResultPaywall 
      onCheckout={handleStripeCheckout} 
      aiResult={scanResult}
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
