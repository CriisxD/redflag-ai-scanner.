'use client';

import { useState, useEffect } from 'react';

export default function ScannerProgress({ chatData, onComplete, targetName }) {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPreHook, setShowPreHook] = useState(false);

  const datingIntelligencePhrases = [
    `🕵️ Leyendo tu historial de humillaciones...`,
    `🚩 Contando las veces que te clavaron el visto...`,
    `🤡 Calculando la longitud de tus testamentos...`,
    `⚖️ Cuantificando el desinterés de ${targetName || 'tu casi-algo'}...`,
    `🔥 Recolectando los peores "jajaja"...`,
    `💀 Casi listo para destruir tu esperanza...`
  ];

  // Removed image loading effects

  // Loading bar effect (5 seconds total)
  useEffect(() => {
    const totalDuration = 5000;
    const intervalTime = 50; 
    const increment = 100 / (totalDuration / intervalTime);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev + increment >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + increment;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, []);

  // Phrase changing effect
  useEffect(() => {
    const phraseInterval = 1000; 
    const phraseTimer = setInterval(() => {
      setPhraseIndex((prev) => Math.min(prev + 1, datingIntelligencePhrases.length - 1));
    }, phraseInterval);
    return () => clearInterval(phraseTimer);
  }, [datingIntelligencePhrases.length]);

  // API Call
  useEffect(() => {
    const startScan = async () => {
      try {
        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            textData: chatData?.condensedText,
            targetName: targetName || 'Sujeto Anónimo'
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          
          if (response.status === 429 || errData.error === 'limit_reached' || errData.error === 'daily_limit') {
            setError(errData.message || 'Límite alcanzado. Vuelve mañana.');
            return;
          }

          throw new Error(errData.details || errData.error || 'Failed to scan');
        }
        
        const data = await response.json();
        setScanResult(data);
        sessionStorage.setItem('lastScanResult', JSON.stringify(data));
      } catch (err) {
        console.error('Scan Error:', err);
        setError(err.message);
      }
    };

    if (chatData) {
      startScan();
    }
  }, [chatData, targetName]);

  // Transition Logic
  useEffect(() => {
    if (progress >= 100 && scanResult) {
      setShowPreHook(true);
      const timeout = setTimeout(() => {
        onComplete(scanResult);
      }, 1200);
      return () => clearTimeout(timeout);
    } else if (progress >= 100 && error) {
      onComplete({ error });
    }
  }, [progress, scanResult, error, onComplete]);

  return (
    <div className="scanner-container">
      <div className="bg-matrix" />
      <div className="bg-overlay" />
      <div className="laser-scanner" />

      <div className="content-wrapper">
        {!showPreHook ? (
          <>
            <div className="progress-section">
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="progress-text">{Math.floor(progress)}%</div>
            </div>
            <div className="anxiety-text-container">
              <p key={phraseIndex} className="anxiety-phrase">
                {datingIntelligencePhrases[phraseIndex]}
              </p>
            </div>
          </>
        ) : (
          <div className="pre-hook-container">
            <span className="hook-icon">{scanResult?.verdict_icon || '⚠️'}</span>
            <h2 className="hook-text">
              {scanResult?.shock_verdict 
                ? `VEREDICTO: ${scanResult.shock_verdict}` 
                : "Humillación detectada."}
            </h2>
            <p className="hook-subtext">Compilando el expediente de toxicidad...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .scanner-container {
          position: fixed; inset: 0; width: 100vw; height: 100vh; background-color: #000; overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999;
          font-family: var(--font-body);
        }
        .bg-matrix {
          position: absolute; inset: 0; background: #050505;
          background-image: linear-gradient(rgba(175, 82, 222, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(175, 82, 222, 0.1) 1px, transparent 1px);
          background-size: 20px 20px; z-index: 1; opacity: 0.3;
        }
        .bg-overlay { position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%); z-index: 2; }
        .laser-scanner {
          position: absolute; left: 0; width: 100%; height: 2px; background: var(--accent-red);
          box-shadow: 0 0 15px var(--accent-red); z-index: 3; animation: scanLine 2.5s linear infinite alternate;
        }
        @keyframes scanLine { 0% { top: 0%; } 100% { top: 100%; } }
        .content-wrapper { position: relative; z-index: 10; width: 90%; max-width: 480px; text-align: center; }
        .progress-bar-container { width: 100%; height: 4px; background: rgba(255, 255, 255, 0.1); border-radius: 2px; overflow: hidden; margin-bottom: 20px; }
        .progress-bar-fill { height: 100%; background: var(--accent-red); transition: width 0.1s linear; box-shadow: 0 0 10px var(--accent-red); }
        .progress-text { font-family: var(--font-terminal); font-size: 3.5rem; color: #fff; margin-bottom: 20px; }
        .anxiety-phrase { font-family: var(--font-terminal); font-weight: 700; font-size: 0.9rem; color: var(--accent-red); text-transform: uppercase; letter-spacing: 0.1em; animation: textPop 0.4s both; }
        .pre-hook-container { animation: textPop 0.5s both; }
        .hook-icon { font-size: 3rem; display: block; margin-bottom: 20px; filter: drop-shadow(0 0 15px var(--accent-red-glow)); }
        .hook-text { font-family: var(--font-terminal); font-size: 2rem; color: #fff; line-height: 1.2; margin-bottom: 10px; }
        .hook-subtext { color: var(--accent-amber); font-weight: 700; font-size: 0.8rem; letter-spacing: 0.1em; text-transform: uppercase; }
        @keyframes textPop { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
