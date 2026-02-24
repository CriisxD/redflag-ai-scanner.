import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import ShareableTicket from './ShareableTicket';

export default function ResultPaywall({ onCheckout, aiResult }) {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [name, setName] = useState('');
  const [zodiac, setZodiac] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  // TESTING MODE: Set to false for production
  const TEST_MODE = true; 

  useEffect(() => {
    const savedName = sessionStorage.getItem('targetName');
    const savedZodiac = sessionStorage.getItem('targetZodiac');
    if (savedName) setName(savedName);
    if (savedZodiac) setZodiac(savedZodiac);
  }, []);

  const handleCheckoutClick = () => {
    if (TEST_MODE) {
      setIsUnlocked(true);
      return;
    }
    
    setLoading(true);
    if (onCheckout) {
      onCheckout();
    }
  };

  const handleDownload = async () => {
    const element = document.getElementById('shareable-ticket-capture');
    if (!element) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2, // High quality
        logging: false,
        backgroundColor: '#000000',
        useCORS: true,
      });
      
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `mi-reporte-toxico-${name || 'redflag'}.png`;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="paywall-container">
      {/* Background Ambience */}
      <div className="ambient-glow top-glow" />
      <div className="ambient-glow bottom-glow" />

      {/* Main Content */}
      <div className="content-wrapper">
        
        {/* Urgent Header */}
        <div className="header-section">
          <h1 className="critical-title">
            <span className="warning-icon">📈</span>
            {aiResult?.veredicto_viral || 'ANÁLISIS DE DINÁMICA COMPLETADO'}
          </h1>
          <p className="subtitle text-muted">Inteligencia Artificial aplicada a tu conexión{name ? ` con ${name}` : ''}.</p>
        </div>

        {/* Dynamic Scan Result */}
        <div className="report-card">
          <div className="report-header">
            <span className="report-badge">ANÁLISIS DE INTERACCIÓN</span>
            <h2 className="toxicity-score">Nivel de Riesgo: <span className={aiResult?.nivel_riesgo_general === 'Bajo' ? 'score-green' : 'score-red'}>
              {aiResult?.nivel_riesgo_general || 'Evaluando...'}
            </span></h2>
          </div>

          <div className="report-body">
            {/* Metrics Section */}
            <div className="metrics-grid">
              <div className="metric-item">
                <div className="metric-label">🔥 Coqueteo / Tensión</div>
                <div className="metric-bar-bg"><div className="metric-bar-fill" style={{ width: `${aiResult?.nivel_coqueteo || 0}%`, background: '#ff2d55' }} /></div>
              </div>
              <div className="metric-item">
                <div className="metric-label">🌡️ Interés Físico</div>
                <div className="metric-bar-bg"><div className="metric-bar-fill" style={{ width: `${aiResult?.intencion_fisica || 0}%`, background: '#ff9500' }} /></div>
              </div>
              <div className="metric-item">
                <div className="metric-label">⚖️ Desbalance de Interés</div>
                <div className="metric-bar-bg"><div className="metric-bar-fill" style={{ width: `${aiResult?.desbalance_interes || 0}%`, background: '#af52de' }} /></div>
              </div>
              <div className="metric-item">
                <div className="metric-label">👻 Prob. de Ghosting</div>
                <div className="metric-bar-bg"><div className="metric-bar-fill" style={{ width: `${aiResult?.probabilidad_ghosting || 0}%`, background: '#5856d6' }} /></div>
              </div>
            </div>

            <div className="divider-section">
              <span className="divider-text">⚠️ 2 SEÑALES CRÍTICAS DETECTADAS</span>
            </div>
            
            <div className={`blurred-section-wrapper ${isUnlocked ? 'unlocked' : ''}`}>
              <div className="blurred-content">
                {aiResult?.posibles_red_flags && aiResult.posibles_red_flags.length > 0 ? (
                  aiResult.posibles_red_flags.map((flag, idx) => (
                    <p key={idx}><b>⚠️ Señal #{idx + 1}:</b> {flag}</p>
                  ))
                ) : (
                  <>
                    <p>1. 🚩 <b>Disonancia Cognitiva:</b> Patrones de comunicación inconsistentes que sugieren falta de compromiso.</p>
                    <p>2. 🚩 <b>Validación Externa:</b> Búsqueda constante de atención que podría diluir la exclusividad.</p>
                  </>
                )}
              </div>
              
              {/* Lock Overlay */}
              {!isUnlocked && (
                <div className="lock-overlay">
                  <div className="lock-icon-container">
                    <span className="lock-emoji">🔒</span>
                  </div>
                  <p className="lock-text">Análisis Protegido</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* The Trigger (Checkout Button) */}
        <div className="checkout-section">
          <button 
            className={`pay-button ${loading ? 'loading' : ''}`}
            onClick={handleCheckoutClick}
            disabled={loading}
          >
            {loading ? (
              <span className="loading-spinner"></span>
            ) : isUnlocked ? (
              <span className="pay-button-text">✨ REPORTE DESBLOQUEADO ✨</span>
            ) : (
              <span className="pay-button-text">DESBLOQUEAR MI VEREDICTO COMPLETO POR $2.99</span>
            )}
          </button>
          
          {/* Social Reinforcement */}
          <div className="trust-indicators">
            <p className="secure-tx">🔒 Pago seguro vía Stripe. Acceso inmediato.</p>
            <div className="testimonial">
              <span className="testimonial-avatar">🫣</span>
              <p className="testimonial-text">
                <span className="testimonial-user">@sofia_m:</span> "Duele verlo, pero me salvó de un error. Vale cada centavo."
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Hidden Ticket for html2canvas */}
      <ShareableTicket 
        name={name} 
        zodiac={zodiac} 
        score={aiResult?.nivel_coqueteo || 0} 
        redFlag={aiResult?.veredicto_viral || "Análisis de Dinámica Romántica"}
      />

      <style jsx>{`
        .paywall-container {
          position: relative;
          min-height: 100vh;
          width: 100vw;
          background-color: #050505;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
          font-family: 'Inter', -apple-system, sans-serif;
          color: white;
          overflow-x: hidden;
        }

        .ambient-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
          z-index: 0;
        }

        .top-glow {
          top: -10%;
          left: -10%;
          background: rgba(255, 45, 85, 0.2);
        }

        .bottom-glow {
          bottom: -10%;
          right: -10%;
          background: rgba(255, 149, 0, 0.15);
        }

        .content-wrapper {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 500px;
          display: flex;
          flex-direction: column;
          gap: 32px;
          animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .header-section {
          text-align: center;
        }

        .critical-title {
          font-family: 'Inter Black', sans-serif;
          font-size: clamp(1.8rem, 6vw, 2.5rem);
          font-weight: 900;
          color: #ff2d55;
          text-transform: uppercase;
          line-height: 1.1;
          letter-spacing: -0.05em;
          text-shadow: 0 0 20px rgba(255, 45, 85, 0.5);
          margin-bottom: 8px;
        }

        .warning-icon {
          display: inline-block;
          margin-right: 8px;
          animation: pulseIcon 1.5s infinite alternate;
        }

        @keyframes pulseIcon {
          0% { transform: scale(1); filter: drop-shadow(0 0 5px rgba(255,204,0,0.5)); }
          100% { transform: scale(1.1); filter: drop-shadow(0 0 15px rgba(255,204,0,0.8)); }
        }

        .subtitle {
          font-size: 1rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
        }

        /* Report Card */
        .report-card {
          background: rgba(25, 25, 25, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
        }

        .report-header {
          background: rgba(255, 45, 85, 0.05);
          border-bottom: 1px solid rgba(255, 45, 85, 0.15);
          padding: 24px;
          text-align: center;
        }

        .report-badge {
          display: inline-block;
          font-size: 0.7rem;
          font-weight: 800;
          color: #ff2d55;
          letter-spacing: 0.15em;
          padding: 4px 10px;
          border border-radius: 12px;
          border: 1px solid rgba(255, 45, 85, 0.3);
          background: rgba(255, 45, 85, 0.1);
          margin-bottom: 12px;
        }

        .toxicity-score {
          font-family: 'Inter Black', sans-serif;
          font-size: 1.4rem;
          font-weight: 900;
          margin: 0;
        }

        .score-red {
          color: #ff2d55;
          text-shadow: 0 0 15px rgba(255, 45, 85, 0.6);
        }

        .score-green {
          color: #39ff14;
          text-shadow: 0 0 15px rgba(57, 255, 20, 0.6);
        }

        .metrics-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 24px;
        }

        .metric-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .metric-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: rgba(255,255,255,0.7);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .metric-bar-bg {
          width: 100%;
          height: 8px;
          background: rgba(255,255,255,0.05);
          border-radius: 4px;
          overflow: hidden;
        }

        .metric-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .report-body {
          padding: 24px;
        }

        .free-evidence-section {
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 24px;
          border: 1px solid rgba(57, 255, 20, 0.2);
        }

        .red-flags-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #ffffff;
          margin-bottom: 12px;
        }

        .red-flags-title.visible {
          color: #39ff14;
          text-shadow: 0 0 10px rgba(57, 255, 20, 0.3);
        }

        .visible-text {
          font-size: 0.95rem;
          line-height: 1.5;
          color: rgba(255,255,255,0.9);
          margin-bottom: 16px;
        }

        .share-story-btn {
          width: 100%;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 10px;
          padding: 10px;
          color: rgba(255,255,255,0.7);
          font-family: 'Inter', sans-serif;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .share-story-btn:hover {
          background: rgba(255,255,255,0.05);
          color: white;
          border-color: white;
        }

        .share-story-btn.loading {
          opacity: 0.7;
          cursor: wait;
        }

        .divider-section {
          text-align: center;
          margin-bottom: 16px;
          position: relative;
        }

        .divider-text {
          font-size: 0.75rem;
          font-weight: 900;
          color: #ff2d55;
          letter-spacing: 0.1em;
          background: #191919;
          padding: 0 10px;
          position: relative;
          z-index: 1;
        }

        .divider-section::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          width: 100%;
          height: 1px;
          background: rgba(255, 45, 85, 0.2);
          z-index: 0;
        }

        .blurred-section-wrapper {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(0, 0, 0, 0.3);
          border: 1px dashed rgba(255, 255, 255, 0.1);
        }

        .blurred-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          transition: all 0.5s ease;
          user-select: none;
          pointer-events: none;
          filter: blur(6px) opacity(0.5);
        }

        .unlocked .blurred-content {
          filter: blur(0) opacity(1);
          user-select: text;
          pointer-events: all;
        }

        .deep-analysis-revealed {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,0.1);
        }

        .analysis-title {
          font-size: 0.9rem;
          color: #ff9500;
          margin-bottom: 10px;
          font-weight: 800;
          letter-spacing: 0.05em;
        }

        .blurred-content p {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #e2e8f0;
          margin: 0;
        }

        .lock-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.2) 100%);
          z-index: 2;
        }

        .lock-icon-container {
          font-size: 4rem;
          filter: drop-shadow(0 0 20px rgba(0,0,0,0.8));
          animation: floatLock 3s ease-in-out infinite;
        }

        @keyframes floatLock {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .lock-text {
          font-family: 'Inter', sans-serif;
          font-weight: 800;
          color: #ff3b30;
          margin-top: 12px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          text-shadow: 0 2px 10px rgba(0,0,0,0.8);
          background: rgba(0,0,0,0.5);
          padding: 4px 12px;
          border-radius: 20px;
        }

        /* Checkout Section */
        .checkout-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-top: 10px;
        }

        .pay-button {
          width: 100%;
          padding: 20px;
          border-radius: 16px;
          background: linear-gradient(135deg, #ff2d55 0%, #ff9500 100%);
          border: none;
          color: white;
          font-family: 'Inter Black', sans-serif;
          font-size: 1rem;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          cursor: pointer;
          box-shadow: 0 10px 30px rgba(255, 45, 85, 0.4), inset 0 2px 0 rgba(255,255,255,0.2);
          transition: all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          overflow: hidden;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 64px;
        }

        .pay-button::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0) 100%);
          transform: rotate(30deg) translateX(-100%);
          animation: shimmer 3s infinite;
        }

        @keyframes shimmer {
          100% { transform: rotate(30deg) translateX(100%); }
        }

        .pay-button:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 15px 40px rgba(255, 45, 85, 0.6), inset 0 2px 0 rgba(255,255,255,0.3);
        }

        .pay-button:active {
          transform: translateY(2px) scale(0.98);
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 3px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Trust Indicators */
        .trust-indicators {
          text-align: center;
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .secure-tx {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
          font-weight: 500;
        }

        .testimonial {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 12px 16px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .testimonial-avatar {
          font-size: 1.5rem;
          background: rgba(255,255,255,0.1);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .testimonial-text {
          font-size: 0.85rem;
          color: rgba(255,255,255,0.7);
          line-height: 1.4;
          margin: 0;
          font-style: italic;
        }

        .testimonial-user {
          font-weight: 700;
          color: #ffffff;
          margin-right: 4px;
          font-style: normal;
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
