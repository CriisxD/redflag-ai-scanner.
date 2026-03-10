'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useLang } from '@/lib/LangContext';
import ScannerProgress from '@/components/ScannerProgress';
import { parseWhatsAppChat, extractLocalStats, condenseForAI } from '@/lib/whatsappParser';

const STEPS = {
  LANDING: 'LANDING',
  UPLOAD: 'UPLOAD',
  MICRO_LOADING: 'MICRO_LOADING',
  SURVEY: 'SURVEY',
  SCANNING: 'SCANNING'
};

export default function LandingPage() {
  const router = useRouter();
  const { lang, switchLang } = useLang();
  const fileInputRef = useRef(null);
  
  const [step, setStep] = useState(STEPS.LANDING);
  const [chatData, setChatData] = useState(null); // { stats, condensedText }
  const [isParsing, setIsParsing] = useState(false);
  

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.txt') && file.type !== 'text/plain') {
      alert('⚠️ Por favor sube un archivo de chat exportado de WhatsApp (.txt)');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setIsParsing(true);
    setStep(STEPS.MICRO_LOADING);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const rawText = event.target.result;
          const messages = parseWhatsAppChat(rawText);
          
          if (messages.length < 10) {
            throw new Error('El chat es demasiado corto o el formato no es compatible.');
          }

          const stats = extractLocalStats(messages);
          const condensedText = condenseForAI(messages);

          setChatData({ stats, condensedText });
          setTimeout(() => setStep(STEPS.SCANNING), 1500);
        } catch (err) {
          console.error('Parsing error:', err);
          alert('❌ ' + (err.message || 'Error al analizar el chat. Asegúrate de exportarlo sin multimedia.'));
          setStep(STEPS.UPLOAD);
        } finally {
          setIsParsing(false);
        }
      };
      
      reader.onerror = () => {
        alert('❌ Error leyendo el archivo.');
        setStep(STEPS.UPLOAD);
        setIsParsing(false);
      };

      reader.readAsText(file);
      
    } catch (error) {
      console.error('File read error:', error);
      setIsParsing(false);
      setStep(STEPS.UPLOAD);
    }
  };

  const handleScanComplete = (result) => {
    if (result && !result.error) {
      if (chatData?.stats) {
        localStorage.setItem('rf_local_stats', JSON.stringify(chatData.stats));
      }
      router.push(`/result/${result.scanId}`);
    } else {
      console.error('Scan Error Detailed:', result);
      alert('⚠️ Error en el análisis: ' + (result.error?.message || result.error || 'Server error, intenta de nuevo.'));
      setStep(STEPS.LANDING);
      setChatData(null);
    }
  };

  // STEP: SCANNING
  if (step === STEPS.SCANNING) {
    return (
      <ScannerProgress 
        chatData={chatData} 
        onComplete={handleScanComplete} 
        targetName={chatData?.stats?.users?.[1]?.name || 'Sujeto'}
      />
    );
  }

  // STEP: MICRO_LOADING
  if (step === STEPS.MICRO_LOADING) {
    return (
      <div className="step-container micro-loading">
        <div className="loading-content">
          <span className="analysis-icon">🔍</span>
          <h2 className="loading-title">Procesando conversación...</h2>
          <div className="mini-progress-bar"><div className="fill" /></div>
        </div>
        <style jsx>{`
          .micro-loading { background: #050505; height: 100vh; display: flex; align-items: center; justify-content: center; }
          .loading-content { text-align: center; }
          .analysis-icon { font-size: 3rem; display: block; margin-bottom: 20px; animation: pulse 1s infinite; }
          .loading-title { font-family: 'Inter Black', sans-serif; color: white; font-size: 1.5rem; }
          .mini-progress-bar { width: 200px; height: 4px; background: rgba(255,255,255,0.1); margin: 20px auto; border-radius: 2px; overflow: hidden; }
          .fill { height: 100%; background: #ff2d55; width: 0; animation: fill 1.5s linear forwards; }
          @keyframes fill { to { width: 100%; } }
          @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
        `}</style>
      </div>
    );
  }

  // STEP: UPLOAD
  if (step === STEPS.UPLOAD) {
    return (
      <div className="step-container upload-step">
        <div className="upload-box" onClick={() => fileInputRef.current?.click()}>
          <span className="upload-icon">📄</span>
          <h2 className="upload-title">Sube tu Chat Exportado (.txt)</h2>
          <p className="upload-subtitle">No te preocupes, el análisis se hace 100% en tu dispositivo y nada se guarda.</p>
          <div className="upload-btn-secondary">Seleccionar Archivo .TXT</div>
          
          <div className="howto-box">
            <h4>¿Cómo exporto mi chat desde WhatsApp?</h4>
            <ol>
              <li>Abre el chat que quieres analizar.</li>
              <li>Toca el nombre del contacto arriba.</li>
              <li>Baja del todo y presiona <b>"Exportar Chat"</b>.</li>
              <li>Elige <b>"Sin archivos multimedia"</b>.</li>
              <li>Guarda o comparte el archivo <code>.txt</code> y súbelo aquí.</li>
            </ol>
          </div>
        </div>
        
        <button className="back-btn" onClick={() => setStep(STEPS.LANDING)}>← Volver</button>

        <input ref={fileInputRef} type="file" accept=".txt,text/plain" onChange={handleFileChange} style={{ display: 'none' }} />

        <style jsx>{`
          .upload-step { background: #050505; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; }
          .upload-box { width: 100%; max-width: 500px; border: 2px dashed rgba(175, 82, 222, 0.4); border-radius: 24px; padding: 50px 30px; text-align: center; cursor: pointer; transition: all 0.3s; background: rgba(175, 82, 222, 0.02); }
          .upload-box:hover { border-color: #af52de; background: rgba(175, 82, 222, 0.05); }
          .upload-icon { font-size: 4rem; display: block; margin-bottom: 24px; animation: float 3s ease-in-out infinite; }
          .upload-title { font-family: 'Inter Black', sans-serif; color: white; font-size: 1.6rem; margin-bottom: 12px; line-height: 1.2; }
          .upload-subtitle { color: rgba(255,255,255,0.6); margin-bottom: 30px; font-size: 0.9rem; }
          .upload-btn-secondary { display: inline-block; background: #af52de; color: white; font-weight: 900; padding: 14px 28px; border-radius: 12px; text-transform: uppercase; font-size: 0.9rem; margin-bottom: 30px; transition: transform 0.2s; }
          .upload-box:hover .upload-btn-secondary { transform: scale(1.05); }
          
          .howto-box { background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 20px; text-align: left; }
          .howto-box h4 { margin: 0 0 10px 0; color: #af52de; font-size: 0.95rem; }
          .howto-box ol { margin: 0; padding-left: 20px; color: rgba(255,255,255,0.7); font-size: 0.85rem; line-height: 1.6; }
          .howto-box b { color: white; }
          .howto-box code { background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 4px; font-family: monospace; }
          .back-btn { position: absolute; top: 40px; left: 40px; background: transparent; border: none; color: rgba(255,255,255,0.5); font-weight: 700; cursor: pointer; }
        `}</style>
      </div>
    );
  }


  // STEP: LANDING
  return (
    <div className="landing-container">
      <div className="hero-section">
        <div className="noise-overlay"></div>
        
        <div className="top-nav">
          <div className="brand-logo">
            <span className="logo-emoji">🚩</span>
            <span className="logo-text">RedFlag AI Scanner</span>
          </div>
        </div>

        <div className="hero-content crt-effect">
          <div className="status-badge terminal-text">ENGINE: THE_DARK_ARCHIVE_v6.1</div>
          <h1 className="hero-title terminal-title">
            REDFLAG <span className="highlight">AI</span>
          </h1>
          <p className="hero-subtitle terminal-text">
            Analiza tus chats de WhatsApp con IA y descubre la verdad. Toxicidad, red flags y dinámicas de poder al descubierto.
          </p>
        </div>

        <div className="hero-action">
          <div className="visual-teaser-tk">
             <div className="teaser-card blurred-ticket">
               <div className="teaser-label">REPORT_PREVIEW</div>
               <div className="teaser-metrics">
                 <div className="t-bar" />
                 <div className="t-bar" />
                 <div className="t-bar" />
               </div>
             </div>
          </div>
          <div className="glow-ring"></div>
           <button 
            className={`scan-btn glitch-btn ${isParsing ? 'loading' : ''}`} 
            onClick={() => setStep(STEPS.UPLOAD)}
          >
            <div className="glitch-overlay"></div>
            <span className="btn-icon">⚡</span>
            <span className="btn-primary-text">REVELAR LA VERDAD</span>
          </button>
        </div>

        <div className="features-grid">
          <div className="feature-card">
            <span className="feature-icon">💬</span>
            <h3 className="feature-title">Análisis de Chats</h3>
            <p className="feature-desc">Sube tu export de WhatsApp (.txt) y descubre la dinámica real.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🚩</span>
            <h3 className="feature-title">Detección de Red Flags</h3>
            <p className="feature-desc">Identificamos pasivo-agresividad, manipulación y ghosting.</p>
          </div>
          <div className="feature-card">
            <span className="feature-icon">🧠</span>
            <h3 className="feature-title">Métricas Despiadadas</h3>
            <p className="feature-desc">Obtén métricas como el 'Simp Score' y tu nivel de 'Delulu'.</p>
          </div>
        </div>

        <div className="hero-footer">
          <div className="disclaimer-text">
            Descargo de responsabilidad: RedFlag AI Scanner es un producto independiente y no está afiliado, respaldado ni patrocinado por OpenAI ni Google. Esta plataforma es una interfaz personalizada construida sobre modelos de inteligencia artificial para fines de entretenimiento y análisis de datos.
          </div>
          <div className="footer-links">
            <a href="/terms">Términos</a>
            <a href="/privacy">Privacidad</a>
            <span className="footer-contact">soporte@redflagscanner.xyz</span>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,text/plain"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

      <style jsx>{`
        .landing-container {
          position: relative;
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          background-color: #050505;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', -apple-system, sans-serif;
          color: white;
          user-select: none;
          overflow: hidden;
        }


        .top-nav {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          padding: 50px 40px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 100;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          opacity: 0.7;
        }

        .logo-text {
          font-weight: 800;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.6);
        }

        .lang-opt {
          display: none;
        }

        .hero-section {
          width: 100%;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 10;
          padding: 80px 0 30px;
        }

        .noise-overlay {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opactiy='0.05'/%3E%3C/svg%3E");
          opacity: 0.04;
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
          margin-bottom: 60px;
          padding: 0 20px;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-title {
          font-family: var(--font-terminal);
          font-weight: 900;
          font-size: clamp(3rem, 10vw, 4.5rem);
          line-height: 0.85;
          letter-spacing: -0.02em;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          text-transform: uppercase;
        }

        .highlight {
          color: var(--accent-red);
          text-shadow: 0 0 40px var(--accent-red-glow);
        }

        .status-badge {
          background: rgba(255, 45, 85, 0.1);
          color: var(--accent-red);
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          margin-bottom: 20px;
          border: 1px solid rgba(255, 45, 85, 0.2);
          letter-spacing: 0.1em;
        }

        .hero-subtitle {
          font-family: var(--font-body);
          font-size: clamp(0.9rem, 4vw, 1.1rem);
          color: rgba(255,255,255,0.6);
          max-width: 480px;
          margin: 0 auto;
          line-height: 1.6;
          font-weight: 400;
        }

        .hero-action {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          margin-top: 20px;
          gap: 20px;
        }

        .visual-teaser-tk {
          position: absolute;
          right: -160px;
          top: 50%;
          transform: translateY(-50%) rotate(10deg);
          opacity: 0.4;
          filter: blur(8px);
          pointer-events: none;
          transition: all 0.5s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .hero-action:hover .visual-teaser-tk {
          opacity: 0.7;
          filter: blur(4px);
          transform: translateY(-55%) rotate(5deg) scale(1.1);
        }

        .teaser-card {
          width: 140px;
          height: 200px;
          background: #111;
          border: 1px solid var(--accent-red);
          padding: 15px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          box-shadow: 0 0 30px rgba(0,0,0,1);
          position: relative;
        }

        .teaser-card::after {
          content: "CONFIDENTIAL";
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          color: var(--accent-red);
          font-size: 0.8rem;
          font-weight: 900;
          opacity: 0.2;
          border: 2px solid var(--accent-red);
          padding: 4px;
        }

        .teaser-label { font-size: 0.5rem; color: var(--accent-red); font-family: var(--font-terminal); letter-spacing: 0.1em; }
        .t-bar { height: 4px; background: rgba(255,255,255,0.05); width: 100%; border-radius: 2px; }
        .teaser-metrics { display: flex; flex-direction: column; gap: 8px; margin-top: 20px; }

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
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 45, 85, 0.2);
          padding: 14px 12px;
          border-radius: 4px;
          color: var(--accent-red);
          font-family: var(--font-terminal);
          font-size: 0.85rem;
          font-weight: 400;
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
          width: 250px;
          height: 250px;
          border-radius: 50%;
          background: #080808;
          border: 4px solid #ff2d55;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: 0 0 50px var(--accent-red-glow), inset 0 0 20px rgba(255, 45, 85, 0.2);
          z-index: 2;
          overflow: hidden;
          animation: pulse-border 2s infinite;
        }

        @keyframes pulse-border {
          0% { border-color: #ff2d55; box-shadow: 0 0 40px var(--accent-red-glow); }
          50% { border-color: #ff5e7e; box-shadow: 0 0 70px var(--accent-red-glow); }
          100% { border-color: #ff2d55; box-shadow: 0 0 40px var(--accent-red-glow); }
        }

        .glitch-btn:hover .glitch-overlay {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(180deg, transparent 0%, rgba(255, 45, 85, 0.4) 50%, transparent 100%);
          animation: radar-scan 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
          z-index: 1;
        }

        @keyframes radar-scan {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }


        .scan-btn:hover {
          transform: scale(1.02);
          background: rgba(255, 45, 85, 0.05);
          box-shadow: 0 0 60px var(--accent-red-glow), inset 0 0 30px rgba(255, 45, 85, 0.4);
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
          border-top: 4px solid #ff2d55;
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
          color: var(--accent-red);
          font-size: 1.4rem;
          font-weight: 900;
          line-height: 1.1;
          text-align: center;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          text-shadow: 0 0 15px var(--accent-red-glow);
        }

        .btn-secondary-text {
          color: var(--accent-red);
          font-size: 0.85rem;
          font-weight: 800;
          letter-spacing: 0.15em;
          margin-top: 10px;
          text-transform: uppercase;
          max-width: 180px;
          text-align: center;
          font-family: var(--font-terminal);
        }

        .hero-footer {
          margin-top: 60px;
          margin-bottom: 60px;
          text-align: center;
          z-index: 10;
          padding: 0 20px;
          max-width: 600px;
        }

        .disclaimer-text {
          font-size: 0.65rem;
          color: rgba(255,255,255,0.25);
          line-height: 1.5;
          margin-bottom: 20px;
          font-style: italic;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 25px;
          margin-top: 15px;
        }

        .footer-links a, .footer-contact {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.4) !important;
          text-decoration: none;
          letter-spacing: 0.05em;
          font-weight: 500;
          transition: all 0.2s;
        }

        .footer-links a:hover {
          color: var(--accent-red) !important;
        }

        .footer-contact {
          font-family: var(--font-terminal);
          opacity: 0.5;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          max-width: 900px;
          width: 100%;
          margin: 60px auto;
          z-index: 10;
          padding: 0 20px;
        }

        .feature-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          padding: 24px;
          text-align: center;
          transition: transform 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-5px);
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(175, 82, 222, 0.3);
        }

        .feature-icon {
          font-size: 2rem;
          display: block;
          margin-bottom: 12px;
        }

        .feature-title {
          font-size: 1rem;
          font-weight: 800;
          color: white;
          margin-bottom: 8px;
        }

        .feature-desc {
          font-size: 0.8rem;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.4;
        }

        @media (max-width: 768px) {
          .landing-container {
            height: auto;
            min-height: 100vh;
            min-height: 100dvh;
            overflow: hidden;
            padding-bottom: 30px;
          }
          .top-nav {
            padding: 16px 16px;
          }
          .logo-text {
            font-size: 0.7rem;
          }
          .hero-section {
            padding: 70px 0 10px;
            min-height: auto;
            justify-content: flex-start;
          }
          .hero-content {
            margin-bottom: 30px;
            padding: 0 16px;
          }
          .hero-title {
            font-size: clamp(2.2rem, 11vw, 3.5rem);
            margin-bottom: 16px;
          }
          .title-red {
            gap: 6px;
          }
          .hero-subtitle {
            font-size: 0.9rem;
            max-width: 320px;
            line-height: 1.4;
          }
          .hero-action {
            margin-top: 0;
          }
          .glow-ring {
            width: 200px;
            height: 200px;
          }
          .scan-btn {
            width: 160px;
            height: 160px;
            border-width: 3px;
          }
          .btn-icon {
            font-size: 1.6rem;
          }
          .btn-primary-text {
            font-size: 1rem;
          }
          .btn-secondary-text {
            font-size: 0.55rem;
            margin-top: 6px;
            max-width: 110px;
          }
          .features-grid {
            grid-template-columns: 1fr;
            gap: 10px;
            margin: 20px auto;
            padding: 0 16px;
            max-width: 100%;
          }
          .feature-card {
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 14px;
            text-align: left;
          }
          .feature-icon {
            font-size: 1.5rem;
            margin-bottom: 0;
            flex-shrink: 0;
          }
          .feature-title {
            font-size: 0.85rem;
            margin-bottom: 2px;
          }
          .feature-desc {
            font-size: 0.72rem;
          }
          .hero-footer {
            margin-top: 20px;
            margin-bottom: 30px;
          }
          /* Upload step mobile */
          .upload-step {
            padding: 16px !important;
          }
          .upload-box {
            padding: 40px 20px !important;
          }
          .upload-title {
            font-size: 1.3rem !important;
          }
          .back-btn {
            top: 20px !important;
            left: 20px !important;
          }
          /* Survey step mobile */
          .survey-step {
            padding: 20px 16px !important;
          }
          .survey-card {
            padding: 24px 20px !important;
          }
          .survey-title {
            font-size: 1.2rem !important;
            margin-bottom: 24px !important;
          }
          .question-item label {
            font-size: 0.85rem !important;
          }
          .opt-btn {
            padding: 10px !important;
            font-size: 0.8rem !important;
          }
          .generate-btn {
            padding: 16px !important;
            font-size: 0.95rem !important;
          }
        }

        .hero-footer p {
          font-size: 0.75rem;
          font-weight: 800;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .footer-highlight {
          color: #ff2d55;
          font-size: 0.8rem;
        }

      `}</style>
    </div>
  );
}
