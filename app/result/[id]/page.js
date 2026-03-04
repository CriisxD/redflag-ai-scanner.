'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import ResultPaywall from '@/components/ResultPaywall';

export default function ResultPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResult();
  }, [id]);

  const fetchResult = async () => {
    try {
      const res = await fetch(`/api/result/${id}`);
      if (!res.ok) {
        throw new Error('No se pudo encontrar el reporte.');
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    // Construct Creem checkout URL based on ID
    // Pass the scan_id as client_reference_id for the webhook
    const CREEM_CHECKOUT_URL = "https://www.creem.io/payment/prod_36caBKBHKOxbOmqbApPgqc";
    const checkoutUrl = `${CREEM_CHECKOUT_URL}?client_reference_id=${id}`;
    window.location.href = checkoutUrl;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p>Sincronizando Dossier...</p>
        <style jsx>{`
          .loading-container {
            height: 100vh; width: 100vw; background: #050505;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: #E0B0FF; gap: 20px; font-family: 'Playfair Display', serif;
          }
          .spinner {
            width: 40px; height: 40px; border: 3px solid rgba(224, 176, 255, 0.1);
            border-top-color: #E0B0FF; border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="error-container">
        <h1>Lectura No Encontrada</h1>
        <p>El identificador del expediente no existe o ha expirado.</p>
        <button onClick={() => router.push('/')}>Volver al Inicio</button>
        <style jsx>{`
          .error-container {
            height: 100vh; width: 100vw; background: #050505;
            display: flex; flex-direction: column; align-items: center; justify-content: center;
            color: #FFF3E0; gap: 20px; text-align: center; padding: 20px;
          }
          h1 { font-family: 'Playfair Display', serif; color: #E0B0FF; }
          button {
            padding: 12px 24px; border-radius: 50px; border: 1px solid #E0B0FF;
            background: transparent; color: #E0B0FF; font-weight: 700; cursor: pointer;
          }
        `}</style>
      </div>
    );
  }

  return (
    <ResultPaywall 
      aiResult={data.aiResult} 
      onCheckout={handleCheckout}
      // ResultPaywall internal state 'isUnlocked' will handle the display logic
      // We can pass an initial unlocked state if we know they paid
      forcedUnlocked={data.isUnlocked} 
    />
  );
}
