'use client';

import { useState, useEffect } from 'react';

export default function ScannerProgress({ imageFiles, onComplete, targetName, targetZodiac }) {
  const [progress, setProgress] = useState(0);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);

  const name = targetName || '';
  const zodiac = targetZodiac || '';

  const anxietyPhrases = [
    `🔄 Iniciando escaneo de toxicidad${name ? ` para ${name}` : ''}...`,
    `🧐 Analizando micro-expresiones${name ? ` de ${name}` : ''}...`,
    `🚩 ${zodiac ? `Fusionando escáner con datos de ${zodiac}` : 'Detectando patrones de manipulación'}...`,
    `⚠️ Cruzando datos de ${name || 'esta persona'} con base de "Red Flags"...`,
    `🔮 ${zodiac ? `Veredicto astral para ${zodiac}` : 'Generando diagnóstico brutal'} listo...`
  ];

  // Load the images into URLs
  useEffect(() => {
    if (imageFiles && imageFiles.length > 0) {
      const urls = imageFiles.map(file => URL.createObjectURL(file));
      setImageUrls(urls);
      return () => urls.forEach(url => URL.revokeObjectURL(url));
    }
  }, [imageFiles]);

  // Cycle through images every 2.3 seconds if multiple exist
  useEffect(() => {
    if (imageUrls.length > 1) {
      const cycleInterval = setInterval(() => {
        setActiveImageIndex(prev => (prev + 1) % imageUrls.length);
      }, 2300);
      return () => clearInterval(cycleInterval);
    }
  }, [imageUrls]);

  // Loading bar effect (7 seconds = 7000ms)
  useEffect(() => {
    const totalDuration = 7000;
    const intervalTime = 70; // Update every 70ms
    const increment = 100 / (totalDuration / intervalTime); // ~1% per interval

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

  // Phrase changing effect (change every 1.5s = 1500ms)
  useEffect(() => {
    const phraseInterval = 1500; 
    const phraseTimer = setInterval(() => {
      setPhraseIndex((prev) => Math.min(prev + 1, anxietyPhrases.length - 1));
    }, phraseInterval);
    return () => clearInterval(phraseTimer);
  }, [anxietyPhrases.length]);

  // Background Scanning logic
  useEffect(() => {
    const startScan = async () => {
      try {
        // Convert files to base64
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
            zodiacSign: targetZodiac
          })
        });

        if (!response.ok) throw new Error('Failed to scan');
        
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
  }, [imageFiles, targetName, targetZodiac]);

  // Completion trigger when progress reaches 100
  useEffect(() => {
    if (progress >= 100) {
      // Small pause at 100% before transitioning
      const timeout = setTimeout(() => {
        // We wait for the scanResult to be ready before calling onComplete
        if (scanResult && onComplete) {
          onComplete(scanResult);
        } else if (error && onComplete) {
          // If error, we still complete but maybe we should show error instead
          onComplete({ error });
        }
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [progress, scanResult, error, onComplete]);

  return (
    <div className="scanner-container">
      {/* Dynamic Background Image(s) */}
      {imageUrls.length > 0 && (
        <div 
          className="bg-image"
          style={{ backgroundImage: `url(${imageUrls[activeImageIndex]})` }}
          key={activeImageIndex} // Key to trigger animation on swap
        />
      )}
      <div className="bg-overlay" />

      {/* Laser Scanner Effect */}
      <div className="laser-scanner" />

      {/* Main Content */}
      <div className="content-wrapper">
        
        {/* Progress Section */}
        <div className="progress-section">
          <div className="progress-bar-container">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="progress-text">{Math.floor(progress)}%</div>
        </div>

        {/* Anxiety Text Section */}
        <div className="anxiety-text-container">
          <p key={phraseIndex} className="anxiety-phrase">
            {anxietyPhrases[phraseIndex]}
          </p>
        </div>

      </div>

      <style jsx>{`
        .scanner-container {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background-color: #000;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          font-family: 'Inter', -apple-system, sans-serif;
        }

        .bg-image {
          position: absolute;
          inset: 0;
          background-size: cover;
          background-position: center;
          filter: grayscale(100%) brightness(0.6) contrast(1.2);
          z-index: 1;
          animation: fadeZoom 2.5s ease-out forwards;
        }

        @keyframes fadeZoom {
          from { opacity: 0; transform: scale(1.1); }
          to { opacity: 1; transform: scale(1); }
        }

        .bg-overlay {
          position: absolute;
          inset: 0;
          /* Dark gradient overlay to ensure text is readable */
          background: linear-gradient(to bottom, rgba(5,5,5,0.7) 0%, rgba(5,5,5,0.95) 100%);
          z-index: 2;
        }

        .laser-scanner {
          position: absolute;
          left: 0;
          width: 100%;
          height: 3px;
          background: #ff2d55;
          box-shadow: 0 0 15px #ff2d55, 0 0 30px #ff2d55;
          z-index: 3;
          animation: scanLine 2s linear infinite alternate;
        }

        @keyframes scanLine {
          0% { top: 0%; }
          100% { top: 100%; }
        }

        .content-wrapper {
          position: relative;
          z-index: 10;
          width: 90%;
          max-width: 480px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 40px;
        }

        /* Progress Bar */
        .progress-section {
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        .progress-bar-container {
          width: 100%;
          height: 32px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          border: 2px solid rgba(255, 255, 255, 0.1);
          padding: 3px;
          overflow: hidden;
          box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 16px;
          background: linear-gradient(90deg, #ff2d55 0%, #ff9500 50%, #39ff14 100%);
          background-size: 200% 100%;
          transition: width 0.1s linear;
          animation: pulseBar 2s ease-in-out infinite alternate;
        }

        @keyframes pulseBar {
          0% { box-shadow: 0 0 15px rgba(255, 45, 85, 0.6); }
          50% { box-shadow: 0 0 25px rgba(255, 149, 0, 0.6); }
          100% { box-shadow: 0 0 15px rgba(57, 255, 20, 0.6); }
        }

        .progress-text {
          font-family: 'Inter Black', sans-serif;
          font-size: 4rem;
          font-weight: 900;
          color: #ffffff;
          line-height: 1;
          letter-spacing: -0.05em;
          text-shadow: 0 0 20px rgba(255,255,255,0.4);
        }

        /* Anxiety Text */
        .anxiety-text-container {
          height: 60px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .anxiety-phrase {
          font-family: 'Inter', sans-serif;
          font-weight: 700;
          font-size: 1.15rem;
          color: #39ff14;
          text-align: center;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0;
          text-shadow: 0 0 12px rgba(57, 255, 20, 0.5);
          /* Text glitch / pop effect when it changes */
          animation: textPop 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
        }

        @keyframes textPop {
          0% {
            opacity: 0;
            transform: translateY(15px) scale(0.9);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
            filter: blur(0);
          }
        }
      `}</style>
    </div>
  );
}
