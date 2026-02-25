'use client';

import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';

export default function ResultPaywall({ onCheckout, aiResult }) {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showProgressBars, setShowProgressBars] = useState(false);
  const [showSocialProof, setShowSocialProof] = useState(false);

  // TESTING MODE: Set to false for production
  const TEST_MODE = true; 

  const targetName = typeof window !== 'undefined' ? sessionStorage.getItem('targetName') || 'Sujeto Anónimo' : 'Sujeto Anónimo';

  useEffect(() => {
    // Trigger bar animations shortly after load
    const timer = setTimeout(() => setShowProgressBars(true), 500);
    
    // Show social proof popup after 4 seconds
    const proofTimer = setTimeout(() => setShowSocialProof(true), 4000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(proofTimer);
    };
  }, []);

  const handleCheckoutClick = () => {
    if (TEST_MODE) {
      setIsUnlocked(true);
      return;
    }
    setLoading(true);
    if (onCheckout) onCheckout();
  };

  const handleDownload = async () => {
    const element = document.getElementById('metrics-capture-zone');
    if (!element) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#050505' });
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = `redflag-report-${targetName}.png`;
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const metrics = [
    { label: '🔥 Nivel de Coqueteo', value: aiResult?.nivel_coqueteo || 0 },
    { label: '🌡️ Intención Física', value: aiResult?.intencion_fisica || 0 },
    { label: '⚖️ Desbalance de Interés', value: aiResult?.desbalance_interes || 0 },
    { label: '👻 Prob. de Ghosting', value: aiResult?.probabilidad_ghosting || 0 },
  ];

  const getBarColor = (val) => {
    if (val < 35) return '#39ff14';
    if (val < 65) return '#ffcc00';
    return '#ff2d55';
  };

  return (
    <div className="result-container">
      <div className="ambient-glow" />
      
      <div className="content-max">
        {/* SECCIÓN 1: Header */}
        <header className="result-header">
          <h1 className="main-title">🔎 Análisis Completado</h1>
          <p className="main-subtitle">Se detectaron patrones claros en esta conversación con {targetName}.</p>
        </header>

        {/* SECCIÓN 2 & 3: Métricas y Frase (Capture Zone) */}
        <div id="metrics-capture-zone" className="capture-wrapper">
          <div className="glass-card metrics-card">
            <h2 className="card-label">Métricas de Interacción</h2>
            <div className="metrics-list">
              {metrics.map((m, idx) => (
                <div key={idx} className="metric-row">
                  <div className="metric-info">
                    <span>{m.label}</span>
                    <span className="metric-value" style={{ color: getBarColor(m.value) }}>{m.value}%</span>
                  </div>
                  <div className="bar-bg">
                    <div 
                      className="bar-fill" 
                      style={{ 
                        width: showProgressBars ? `${m.value}%` : '0%', 
                        backgroundColor: getBarColor(m.value),
                        boxShadow: `0 0 10px ${getBarColor(m.value)}66`
                      }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="phrase-box">
            <span className="phrase-label">FRASE DETECTADA:</span>
            <p className="phrase-text">"{aiResult?.frase_viral || 'Aquí alguien está invirtiendo más que el otro.'}"</p>
          </div>
        </div>

        {/* SECCIÓN 4: Tensión */}
        <div className="tension-block">
          <p className="tension-text">
            ⚠️ Este patrón aparece en el 63% de conversaciones que terminan en ghosting.
          </p>
        </div>

        {/* SECCIÓN 5: Bloque Premium */}
        <div className="premium-sequence">
          <div className="divider">
            <span>🔐 INSIGHTS ESTRATÉGICOS</span>
          </div>

          <div className="insights-grid">
            <div className={`insight-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
              <h3>🎯 Intención Real</h3>
              <div className="insight-content">
                <p>
                  {isUnlocked 
                    ? aiResult?.analisis_premium?.intencion_real 
                    : "Existe un interés claro, pero no necesariamente alineado con tus expectativas actuales basándose en..."}
                </p>
                {!isUnlocked && <div className="text-blur" />}
              </div>
            </div>

            <div className={`insight-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
              <h3>🔮 Riesgo Futuro</h3>
              <div className="insight-content">
                <p>
                  {isUnlocked 
                    ? aiResult?.analisis_premium?.riesgo_futuro 
                    : "La curva de atención sugiere un enfriamiento drástico en los próximos 10-14 días si no se aplica..."}
                </p>
                {!isUnlocked && <div className="text-blur" />}
              </div>
            </div>

            <div className={`insight-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
              <h3>💡 Recomendación</h3>
              <div className="insight-content">
                <p>
                  {isUnlocked 
                    ? aiResult?.analisis_premium?.recomendacion_estrategica 
                    : "Para recuperar el balance de poder, la siguiente respuesta debería enfocarse en generar duda estratégica mediante..."}
                </p>
                {!isUnlocked && <div className="text-blur" />}
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 6: CTA */}
        {!isUnlocked && (
          <div className="cta-container">
            <div className="conversion-psych">
              <span className="psych-icon">🧠</span>
              <p>{aiResult?.psicologia_conversion || "Este análisis táctico te permite tomar el control de la dinámica antes del ghosting."}</p>
            </div>
            <button 
              className={`unlock-btn ${loading ? 'loading' : ''}`}
              onClick={handleCheckoutClick}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Desbloquear análisis completo"}
            </button>
            <p className="pago-unico">Pago único. Sin suscripción.</p>
          </div>
        )}

        <div className="share-actions">
           <button onClick={handleDownload} className="share-btn">
             Compartir Resultados (Métricas) 📸
           </button>
        </div>
      </div>

      {/* Social Proof Popup */}
      {showSocialProof && !isUnlocked && (
        <div className="social-proof-toast">
          🚀 +4,200 análisis realizados esta semana
        </div>
      )}

      <style jsx>{`
        .result-container {
          min-height: 100vh; width: 100vw; background: #050505; color: white;
          padding: 40px 20px; font-family: 'Inter', -apple-system, sans-serif;
          position: relative; overflow-x: hidden;
        }
        .ambient-glow {
          position: absolute; top: -10%; left: -10%; width: 50vw; height: 50vw;
          background: radial-gradient(circle, rgba(255, 45, 85, 0.15) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .content-max { position: relative; z-index: 10; width: 100%; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 30px; }
        
        .result-header { text-align: center; }
        .main-title { font-family: 'Inter Black', sans-serif; font-size: 2.2rem; font-weight: 900; color: #fff; margin-bottom: 10px; }
        .main-subtitle { font-size: 1rem; color: rgba(255,255,255,0.5); font-weight: 600; line-height: 1.4; }

        .capture-wrapper { background: #050505; border-radius: 20px; padding: 5px; }
        .glass-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; padding: 24px; backdrop-filter: blur(10px); }
        .card-label { font-size: 0.75rem; font-weight: 800; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
        
        .metrics-list { display: flex; flex-direction: column; gap: 18px; }
        .metric-info { display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 8px; }
        .bar-bg { width: 100%; height: 10px; background: rgba(255,255,255,0.05); border-radius: 5px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 5px; transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1); }
        
        .phrase-box { text-align: center; background: rgba(57, 255, 20, 0.05); border: 1px solid rgba(57, 255, 20, 0.2); padding: 20px; border-radius: 15px; margin-top: 15px; }
        .phrase-label { font-size: 0.65rem; font-weight: 800; color: #39ff14; letter-spacing: 0.1em; display: block; margin-bottom: 8px; }
        .phrase-text { font-family: 'Inter Black', sans-serif; font-size: 1.1rem; color: #fff; font-style: italic; }

        .tension-block { text-align: center; padding: 0 10px; }
        .tension-text { font-size: 0.85rem; font-weight: 700; color: #ffcc00; opacity: 0.9; }

        .divider { display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
        .divider span { font-size: 0.7rem; font-weight: 900; color: #af52de; background: #050505; padding: 4px 12px; border: 1px solid rgba(175, 82, 222, 0.3); border-radius: 20px; }
        
        .insights-grid { display: flex; flex-direction: column; gap: 15px; }
        .insight-card { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 15px; padding: 18px; position: relative; overflow: hidden; }
        .insight-card h3 { font-size: 0.9rem; font-weight: 800; color: #ff9500; margin-bottom: 8px; text-transform: uppercase; }
        .insight-content { position: relative; }
        .insight-content p { font-size: 0.95rem; line-height: 1.5; color: rgba(255,255,255,0.8); }
        .text-blur { position: absolute; inset: 0; background: linear-gradient(transparent 30%, #0c0c0c 100%); pointer-events: none; }
        .locked .insight-content p { filter: blur(3px); }

        .cta-container { display: flex; flex-direction: column; gap: 15px; margin-top: 10px; }
        .conversion-psych { background: rgba(255, 149, 0, 0.1); border: 1px solid rgba(255, 149, 0, 0.2); padding: 15px; border-radius: 12px; display: flex; gap: 12px; align-items: center; }
        .psych-icon { font-size: 1.4rem; }
        .conversion-psych p { font-size: 0.85rem; font-weight: 600; color: #ff9500; line-height: 1.3; }

        .unlock-btn { 
          width: 100%; padding: 22px; border-radius: 16px; 
          background: linear-gradient(135deg, #ff2d55 0%, #ff9500 100%); 
          border: none; color: white; font-family: 'Inter Black', sans-serif;
          font-size: 1.1rem; font-weight: 900; text-transform: uppercase;
          cursor: pointer; box-shadow: 0 10px 30px rgba(255, 45, 85, 0.3);
          transition: transform 0.2s;
        }
        .unlock-btn:hover { transform: scale(1.02); }
        .pago-unico { font-size: 0.75rem; color: rgba(255,255,255,0.4); text-align: center; font-weight: 600; }

        .share-actions { text-align: center; }
        .share-btn { background: transparent; border: 1px solid rgba(255,255,255,0.1); padding: 12px 20px; border-radius: 10px; color: rgba(255,255,255,0.6); font-weight: 700; font-size: 0.85rem; cursor: pointer; }

        .social-proof-toast {
          position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
          background: rgba(0,0,0,0.9); border: 1px solid rgba(255,255,255,0.1);
          padding: 12px 20px; border-radius: 50px; font-size: 0.85rem; font-weight: 700;
          color: white; box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          animation: slideUpFade 0.5s both; z-index: 100;
        }

        @keyframes slideUpFade {
          from { opacity: 0; transform: translate(-50%, 20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
    </div>
  );
}
