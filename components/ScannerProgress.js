'use client';

import { useState, useEffect } from 'react';

export default function ScannerProgress({ imageFiles, onComplete, targetName, context = {} }) {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [showPreHook, setShowPreHook] = useState(false);

  const datingIntelligencePhrases = [
    `🔍 Analizando dinámica de conversación...`,
    `📡 Detectando patrones de interés...`,
    `⚖️ Evaluando desbalance emocional...`,
    `👻 Calculando probabilidad de ghosting...`,
    `🎯 Generando veredicto estratégico...`,
    `✨ Casi listo. Ajustando detalles finales...`
  ];

  // Load the images into URLs
  useEffect(() => {
    if (imageFiles && imageFiles.length > 0) {
      const urls = imageFiles.map(file => URL.createObjectURL(file));
      setImageUrls(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    }
  }, [imageFiles]);

  // Cycle through images
  useEffect(() => {
    if (imageUrls.length > 1) {
      const cycleInterval = setInterval(() => {
        setActiveImageIndex(prev => (prev + 1) % imageUrls.length);
      }, 2000);
      return () => clearInterval(cycleInterval);
    }
  }, [imageUrls]);

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
        const base64Images = await Promise.all(
          imageFiles.map(file => new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
          }))
        );

        const response = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            images: base64Images,
            targetName,
            context
          })
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
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

    if (imageFiles && imageFiles.length > 0) {
      startScan();
    }
  }, [imageFiles, targetName]);

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
      {imageUrls.length > 0 && (
        <div 
          className="bg-image"
          style={{ backgroundImage: `url(${imageUrls[activeImageIndex]})` }}
          key={activeImageIndex}
        />
      )}
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
            <span className="hook-icon">💡</span>
            <h2 className="hook-text">Patrón de interés desigual identificado.</h2>
            <p className="hook-subtext">Generando informe completo...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .scanner-container {
          position: fixed; inset: 0; width: 100vw; height: 100vh; background-color: #000; overflow: hidden;
          display: flex; flex-direction: column; align-items: center; justify-content: center; z-index: 9999;
          font-family: 'Inter', -apple-system, sans-serif;
        }
        .bg-image {
          position: absolute; inset: 0; background-size: cover; background-position: center;
          filter: grayscale(100%) brightness(0.4) contrast(1.2); z-index: 1;
          animation: fadeZoom 2.5s ease-out forwards;
        }
        @keyframes fadeZoom { from { opacity: 0; transform: scale(1.1); } to { opacity: 1; transform: scale(1); } }
        .bg-overlay { position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 0%, rgba(0,0,0,0.8) 100%); z-index: 2; }
        .laser-scanner {
          position: absolute; left: 0; width: 100%; height: 2px; background: #39ff14;
          box-shadow: 0 0 15px #39ff14; z-index: 3; animation: scanLine 2.5s linear infinite alternate;
        }
        @keyframes scanLine { 0% { top: 0%; } 100% { top: 100%; } }
        .content-wrapper { position: relative; z-index: 10; width: 90%; max-width: 480px; text-align: center; }
        .progress-bar-container { width: 100%; height: 12px; background: rgba(255, 255, 255, 0.1); border-radius: 6px; overflow: hidden; margin-bottom: 20px; }
        .progress-bar-fill { height: 100%; background: #39ff14; transition: width 0.1s linear; box-shadow: 0 0 10px #39ff14; }
        .progress-text { font-family: 'Inter Black', sans-serif; font-size: 3.5rem; color: #fff; margin-bottom: 20px; }
        .anxiety-phrase { font-weight: 700; font-size: 1rem; color: #39ff14; text-transform: uppercase; letter-spacing: 0.1em; animation: textPop 0.4s both; }
        .pre-hook-container { animation: textPop 0.5s both; }
        .hook-icon { font-size: 3rem; display: block; margin-bottom: 20px; }
        .hook-text { font-family: 'Inter Black', sans-serif; font-size: 1.8rem; color: #fff; line-height: 1.2; margin-bottom: 10px; }
        .hook-subtext { color: #af52de; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; }
        @keyframes textPop { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
