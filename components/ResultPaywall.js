'use client';

import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import ShareableTicket from './ShareableTicket';

export default function ResultPaywall({ onCheckout, aiResult }) {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showProgressBars, setShowProgressBars] = useState(false);
  const [showSocialProof, setShowSocialProof] = useState(false);

  // TESTING MODE: Set to false for production
  const TEST_MODE = true; 

  const [targetName, setTargetName] = useState('Sujeto Anónimo');

  useEffect(() => {
    // Fix hydration: Read from storage only after mount
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('targetName');
      if (saved) setTargetName(saved);
    }

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
    { 
      label: '🔥 Coqueteo', 
      value: aiResult?.metricas_con_nivel?.coqueteo?.valor || 0,
      nivel: aiResult?.metricas_con_nivel?.coqueteo?.nivel || '...',
      narrative: aiResult?.interpretacion_metricas?.coqueteo
    },
    { 
      label: '🌡️ Intención Física', 
      value: aiResult?.metricas_con_nivel?.intencion_fisica?.valor || 0,
      nivel: aiResult?.metricas_con_nivel?.intencion_fisica?.nivel || '...',
      narrative: aiResult?.interpretacion_metricas?.intencion_fisica
    },
    { 
      label: '⚖️ Desbalance', 
      value: aiResult?.metricas_con_nivel?.desbalance?.valor || 0,
      nivel: aiResult?.metricas_con_nivel?.desbalance?.nivel || '...',
      narrative: aiResult?.interpretacion_metricas?.desbalance
    }
  ];

  const getStatusColor = (nivel) => {
    if (nivel === 'Bajo') return '#39ff14';
    if (nivel === 'Medio') return '#ffcc00';
    if (nivel === 'Alto') return '#ff2d55';
    return '#666';
  };

  return (
    <div className="result-container">
      <div className="ambient-glow" />
      
      <div className="content-max">
        {/* SECCIÓN 1: Header Viral */}
        <header className="result-header">
           <div className="badge-dating">DATING INTELLIGENCE REPORT v3.5</div>
           <h1 className="veredicto-shock">
             “{aiResult?.veredicto_shock || 'Hay química... pero falta intención.'}”
           </h1>
           <div className="dinamica-badge">
             🎯 Dinámica: <span>{aiResult?.dinamica_detectada || 'Buscando patrón...'}</span>
           </div>
        </header>

        {/* SECCIÓN 2: Capture Zone (The Report Card) */}
        <div id="metrics-capture-zone" className="capture-wrapper">
          <div className="glass-card main-report">
            <div className="report-header">
              <div className="target-info">
                <span className="label">ANÁLISIS DE:</span>
                <span className="value">{targetName}</span>
              </div>
              <div className="risk-indicator">
                <span className="label">RIESGO GHOSTING:</span>
                <span className="status-dot" style={{ backgroundColor: getStatusColor(aiResult?.nivel_riesgo_ghosting) }} />
                <span className="value" style={{ color: getStatusColor(aiResult?.nivel_riesgo_ghosting) }}>
                  {aiResult?.nivel_riesgo_ghosting || 'PENDIENTE'}
                </span>
              </div>
            </div>

            <div className="metrics-grid-new">
              {metrics.map((m, idx) => (
                <div key={idx} className="metric-col">
                  <div className="metric-circle-wrap">
                    <svg viewBox="0 0 36 36" className="circular-chart">
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path 
                        className="circle" 
                        stroke={getStatusColor(m.nivel)}
                        strokeDasharray={showProgressBars ? `${m.value}, 100` : "0, 100"}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                      />
                      <text x="18" y="20.35" className="percentage">{m.value}%</text>
                    </svg>
                  </div>
                  <span className="metric-label-new">{m.label.split(' ')[1]}</span>
                  <span className="metric-status" style={{ color: getStatusColor(m.nivel) }}>{m.nivel}</span>
                </div>
              ))}
            </div>

            <div className="phrase-brutal-box">
               <p className="phrase-brutal-text">“{aiResult?.frase_brutal || aiResult?.frase_viral || 'Te quiere cerca, no comprometido.'}”</p>
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: Tensión Logic */}
        <div className="tension-block">
          <p className="tension-text">
            ⚠️ {aiResult?.psicologia_conversion || `Este patrón de interacción correlaciona en un 78% con cierres de comunicación abruptos.`}
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

        {/* Componente invisible para captura */}
        <ShareableTicket 
          name={targetName}
          metrics={{
            coqueteo: aiResult?.metricas_con_nivel?.coqueteo?.valor,
            ghosting: aiResult?.metricas_con_nivel?.probabilidad_ghosting?.valor,
          }}
          veredicto={aiResult?.veredicto_shock}
          dinamica={aiResult?.dinamica_detectada}
          riskLevel={aiResult?.nivel_riesgo_ghosting}
          fraseBrutal={aiResult?.frase_brutal || aiResult?.frase_viral}
        />
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
        
        .result-header { text-align: center; display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .badge-dating { font-size: 0.65rem; font-weight: 900; color: #af52de; letter-spacing: 0.15em; border: 1px solid rgba(175, 82, 222, 0.3); padding: 5px 12px; border-radius: 50px; }
        .veredicto-shock { font-family: 'Inter Black', sans-serif; font-size: 2.4rem; font-weight: 950; color: #fff; line-height: 1.1; max-width: 90%; margin: 0 auto; letter-spacing: -0.02em; }
        .dinamica-badge { font-size: 1rem; font-weight: 700; color: rgba(255,255,255,0.6); }
        .dinamica-badge span { color: #39ff14; }

        .capture-wrapper { background: #050505; border-radius: 24px; padding: 10px; }
        .glass-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 20px; backdrop-filter: blur(10px); }
        
        .main-report { padding: 24px; display: flex; flex-direction: column; gap: 24px; }
        .report-header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .report-header .label { display: block; font-size: 0.6rem; font-weight: 900; color: rgba(255,255,255,0.3); letter-spacing: 0.1em; margin-bottom: 4px; }
        .report-header .value { font-weight: 800; font-size: 0.9rem; }
        .risk-indicator { text-align: right; }
        .status-dot { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 6px; vertical-align: middle; box-shadow: 0 0 8px currentColor; }

        .metrics-grid-new { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; }
        .metric-col { display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .metric-circle-wrap { width: 100%; max-width: 80px; position: relative; }
        .circular-chart { display: block; margin: 0 auto; max-width: 100%; max-height: 250px; }
        .circle-bg { fill: none; stroke: rgba(255,255,255,0.05); stroke-width: 3; }
        .circle { fill: none; stroke-width: 3; stroke-linecap: round; transition: stroke-dasharray 1.5s ease-in-out; }
        .percentage { fill: #fff; font-family: 'Inter Black', sans-serif; font-size: 0.5rem; text-anchor: middle; font-weight: 900; }
        .metric-label-new { font-size: 0.7rem; font-weight: 800; color: rgba(255,255,255,0.5); text-transform: uppercase; text-align: center; }
        .metric-status { font-size: 0.65rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; }

        .phrase-brutal-box { background: rgba(255, 45, 85, 0.05); border: 1px dashed rgba(255, 45, 85, 0.3); padding: 20px; border-radius: 15px; text-align: center; position: relative; }
        .phrase-brutal-text { font-family: 'Inter Black', sans-serif; font-size: 1.25rem; color: #fff; font-style: italic; line-height: 1.3; }

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
