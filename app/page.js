'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/LangContext';
import ScannerProgress from '@/components/ScannerProgress';
import imageCompression from 'browser-image-compression';

export default function LandingPage() {
  const router = useRouter();
  const { lang, switchLang } = useLang();
  const fileInputRef = useRef(null);
  const [scanningFile, setScanningFile] = useState(null);
  const [targetName, setTargetName] = useState('');
  const [targetZodiac, setTargetZodiac] = useState('');
  const [isCompressing, setIsCompressing] = useState(false);
  const [showNameError, setShowNameError] = useState(false);

  const handleStart = () => {
    if (!targetName.trim()) {
      setShowNameError(true);
      setTimeout(() => setShowNameError(false), 500); // Reset after animation
      return;
    }

    sessionStorage.setItem('targetName', targetName.trim());

    if (targetZodiac.trim()) {
      sessionStorage.setItem('targetZodiac', targetZodiac.trim());
    } else {
      sessionStorage.removeItem('targetZodiac');
    }

    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setIsCompressing(true);
      try {
        const options = {
          maxWidthOrHeight: 800,
          useWebWorker: true,
          maxSizeMB: 0.7,
        };
        
        const compressedFiles = await Promise.all(
          files.slice(0, 3).map(file => imageCompression(file, options))
        );
        
        setScanningFile(compressedFiles);
      } catch (error) {
        console.error('Compression error:', error);
        // Fallback to original files if compression fails
        setScanningFile(files.slice(0, 3));
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleScanComplete = (result) => {
    if (result && !result.error) {
      // Result is already in sessionStorage via ScannerProgress
      router.push('/scan');
    } else {
      console.error('Scan failed:', result?.error);
      // Maybe stay on landing or show error
      setScanningFile(null); 
    }
  };

  if (scanningFile) {
    return (
      <ScannerProgress 
        imageFiles={scanningFile} 
        onComplete={handleScanComplete} 
        targetName={targetName}
        targetZodiac={targetZodiac}
      />
    );
  }

  return (
    <div className="landing-container">
      {/* Top Bar for Language */}
      <div className="top-bar">
        <div className="lang-switcher">
          <button className={lang === 'es' ? 'active' : ''} onClick={() => switchLang('es')}>ES</button>
          <button className={lang === 'en' ? 'active' : ''} onClick={() => switchLang('en')}>EN</button>
        </div>
      </div>

      <div className="hero-section">
        <div className="noise-overlay"></div>
        
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-white">REDFLAG</span>
            <span className="title-red">AI SCANNER <span className="title-emoji">🚩</span></span>
          </h1>
          <p className="hero-subtitle">
            "La IA que expone a los mentirosos. Sube capturas de su chat o su foto y descubre sus verdaderas intenciones."
          </p>
        </div>

        <div className="hero-action">
          <div className="glow-ring"></div>
          
          <div className="input-group">
            <input 
              id="target-name-input"
              type="text" 
              className={`target-input ${showNameError ? 'error-shake' : ''}`} 
              placeholder="Nombre de tu ex o casi algo (Req.)"
              value={targetName}
              onChange={(e) => {
                setTargetName(e.target.value);
                if (showNameError) setShowNameError(false);
              }}
            />
            <input 
              id="target-zodiac-input"
              type="text" 
              className="target-input" 
              placeholder="Su signo zodiacal (Opcional)"
              value={targetZodiac}
              onChange={(e) => setTargetZodiac(e.target.value)}
            />
          </div>

          <button 
            className={`scan-btn ${isCompressing ? 'loading' : ''}`} 
            onClick={handleStart}
            disabled={isCompressing}
          >
            {isCompressing ? (
              <span className="spinner"></span>
            ) : (
              <>
                <span className="btn-icon">🔥</span>
                <span className="btn-primary-text">SUBIR EVIDENCIAS</span>
                <span className="btn-secondary-text">(1 A 3 FOTOS O CAPTURAS)</span>
              </>
            )}
          </button>
        </div>

        <div className="hero-footer">
          <p>
            Ya hemos arruinado <span className="footer-highlight">14,023</span> relaciones hoy.
          </p>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <style jsx>{`
        .landing-container {
          position: relative;
          width: 100vw;
          height: 100vh;
          background-color: #050505;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', -apple-system, sans-serif;
          color: white;
          user-select: none;
        }

        .top-bar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          padding: 24px;
          display: flex;
          justify-content: flex-end;
          z-index: 50;
        }

        .lang-switcher {
          display: flex;
          gap: 8px;
          background: rgba(255,255,255,0.05);
          padding: 4px;
          border-radius: 20px;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255,255,255,0.1);
        }

        .lang-switcher button {
          background: transparent;
          border: none;
          color: rgba(255,255,255,0.5);
          font-weight: 700;
          font-size: 0.75rem;
          padding: 6px 12px;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lang-switcher button.active {
          background: white;
          color: black;
        }

        .hero-section {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
        }

        .noise-overlay {
          position: absolute;
          inset: -50%;
          width: 200%;
          height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opactiy='0.05'/%3E%3C/svg%3E");
          opacity: 0.04;
          animation: noise 2s steps(2) infinite;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes noise {
          0% { transform: translate(0,0) }
          10% { transform: translate(-5%,-5%) }
          20% { transform: translate(-10%,5%) }
          30% { transform: translate(5%,-10%) }
          40% { transform: translate(-5%,15%) }
          50% { transform: translate(-10%,5%) }
          60% { transform: translate(15%,0) }
          70% { transform: translate(0,15%) }
          80% { transform: translate(3%,35%) }
          90% { transform: translate(-10%,10%) }
          100% { transform: translate(0,0) }
        }

        .hero-content {
          text-align: center;
          z-index: 10;
          margin-bottom: 50px;
          padding: 0 20px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-title {
          font-weight: 900;
          font-size: clamp(3.5rem, 12vw, 5rem);
          line-height: 0.9;
          letter-spacing: -0.05em;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          text-transform: uppercase;
        }

        .title-white {
          color: #ffffff;
        }

        .title-red {
          color: #ff2d55;
          text-shadow: 0 0 30px rgba(255, 45, 85, 0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-top: -5px;
        }

        .title-emoji {
          font-size: clamp(2.5rem, 8vw, 3.5rem);
        }

        .hero-subtitle {
          font-size: clamp(1rem, 4vw, 1.1rem);
          color: rgba(255,255,255,0.7);
          max-width: 340px;
          margin: 0 auto;
          line-height: 1.4;
          font-weight: 500;
          font-style: italic;
        }

        .hero-action {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          margin-top: -10px;
          gap: 20px;
        }

        .input-group {
          width: 100%;
          max-width: 320px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          position: relative;
          z-index: 5;
        }

        .target-input {
          flex: 1;
          min-width: 0;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 14px 12px;
          border-radius: 12px;
          color: white;
          font-family: 'Inter', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          text-align: center;
          transition: all 0.3s ease;
          outline: none;
        }

        .target-input:focus {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 45, 85, 0.5);
          box-shadow: 0 0 20px rgba(255, 45, 85, 0.1);
        }

        .target-input.error-shake {
          border-color: #ff2d55 !important;
          box-shadow: 0 0 20px rgba(255, 45, 85, 0.3) !important;
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
        }

        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }

        .target-input::placeholder {
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.75rem;
        }

        .glow-ring {
          position: absolute;
          width: 280px;
          height: 280px;
          background: radial-gradient(circle, rgba(57, 255, 20, 0.15) 0%, transparent 65%);
          border-radius: 50%;
          animation: pulse-glow 2s infinite;
          pointer-events: none;
        }

        @keyframes pulse-glow {
          0% { transform: scale(0.9); opacity: 0.4; }
          50% { transform: scale(1.1); opacity: 0.8; }
          100% { transform: scale(0.9); opacity: 0.4; }
        }

        .scan-btn {
          position: relative;
          width: 220px;
          height: 220px;
          border-radius: 50%;
          background: #080808;
          border: 4px solid #39ff14;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 0 40px rgba(57, 255, 20, 0.25), inset 0 0 20px rgba(57, 255, 20, 0.1);
          z-index: 2;
        }

        .scan-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 0 60px rgba(57, 255, 20, 0.4), inset 0 0 30px rgba(57, 255, 20, 0.2);
          background: #0f1c0f;
        }

        .scan-btn:active {
          transform: scale(0.95);
        }

        .scan-btn.loading {
          cursor: wait;
          border-color: #ff9500;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid #39ff14;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .btn-icon {
          font-size: 2.2rem;
          margin-bottom: 4px;
        }

        .scan-btn:hover .btn-icon {
          animation: bounce 1s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .btn-primary-text {
          color: #39ff14;
          font-size: 1.4rem;
          font-weight: 900;
          line-height: 1.1;
          text-align: center;
          letter-spacing: -0.02em;
          text-transform: uppercase;
        }

        .btn-secondary-text {
          color: rgba(255,255,255,0.4);
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          margin-top: 10px;
          text-transform: uppercase;
          max-width: 140px;
          text-align: center;
        }

        .hero-footer {
          position: absolute;
          bottom: 30px;
          width: 100%;
          text-align: center;
          z-index: 10;
        }

        .hero-footer p {
          font-size: 0.7rem;
          font-weight: 800;
          color: rgba(255,255,255,0.3);
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .footer-highlight {
          color: #ff2d55;
          font-size: 0.8rem;
        }

      `}</style>
    </div>
  );
}
