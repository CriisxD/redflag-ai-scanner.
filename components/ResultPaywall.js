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
      label: '🔥 Interés Detectado', 
      value: aiResult?.metricas_viral?.interes_detectado?.valor || 0,
      narrative: aiResult?.metricas_viral?.interes_detectado?.interpretacion
    },
    { 
      label: '💬 Nivel de Inversión', 
      value: aiResult?.metricas_viral?.nivel_inversion?.valor || 0,
      narrative: aiResult?.metricas_viral?.nivel_inversion?.interpretacion
    },
    { 
      label: aiResult?.metricas_viral?.riesgo_objetivo?.label || '⚠️ Riesgo para tu objetivo', 
      value: aiResult?.metricas_viral?.riesgo_objetivo?.valor || 0,
      nivel: aiResult?.metricas_viral?.riesgo_objetivo?.nivel || '...',
      narrative: aiResult?.metricas_viral?.riesgo_objetivo?.interpretacion
    }
  ];

  const getStatusColor = (val, isRisk = false) => {
    if (isRisk) {
      if (val < 30) return '#39ff14';
      if (val < 60) return '#ffcc00';
      return '#ff2d55';
    }
    if (val < 30) return '#ff2d55';
    if (val < 60) return '#ffcc00';
    return '#39ff14';
  };

  return (
    <div className="result-container">
      <div className="ambient-glow" />
      
      <div className="content-max">
        {/* SECCIÓN 1: ZONA COMPARTIBLE (Capture Zone) */}
        <div id="metrics-capture-zone" className="capture-wrapper">
          <header className="result-header-viral">
             <div className="label-top">🔎 ANÁLISIS COMPLETADO</div>
             <p className="sub-contextual">{aiResult?.subtitulo_contextual || 'Análisis ajustado a tu intención declarada.'}</p>
             
             <h1 className="veredicto-shock-v36">
               “{aiResult?.veredicto_shock || 'Hay química... pero falta intención.'}”
             </h1>

             <div className="dinamica-highlight">
               <span>Dinámica Detectada:</span> {aiResult?.dinamica_detectada || 'Pendiente'}
             </div>
          </header>

          <div className="glass-card main-report-v36">
            <div className="metrics-v36">
              {metrics.map((m, idx) => {
                const isRisk = m.label.includes('Riesgo');
                const color = getStatusColor(m.value, isRisk);
                return (
                  <div key={idx} className="metric-item-v36">
                    <div className="m-header">
                      <span className="m-label">{m.label}</span>
                      <span className="m-percent" style={{ color }}>{m.value}%</span>
                    </div>
                    <div className="m-bar-bg">
                      <div 
                        className="m-bar-fill" 
                        style={{ 
                          width: showProgressBars ? `${m.value}%` : '0%', 
                          backgroundColor: color,
                          boxShadow: `0 0 10px ${color}44`
                        }} 
                      />
                    </div>
                    <p className="m-interpret">{m.narrative}</p>
                  </div>
                );
              })}
            </div>

            <div className="viral-quote-block">
               <p>“{aiResult?.frase_viral || 'Te quiere cerca, no comprometida.'}”</p>
               <span className="stat-line-pattern">{aiResult?.linea_patron || 'Patrón común en dinámicas sin avance claro.'}</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 4: Tensión Logic */}
        <div className="tension-block">
          <p className="tension-text">
            ⚠️ {aiResult?.psicologia_conversion || `Este patrón de interacción correlaciona en un 78% con cierres de comunicación abruptos.`}
          </p>
        </div>

        {/* ZONA 2: PAYWALL (Bottom 40%) */}
        <div className="premium-sequence-v36">
          <div className="divider-new">
            <span>🛡️ ESTRATEGIA EXCLUSIVA</span>
          </div>

          <div className="insights-v36">
             <div className={`insight-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-meta">
                 <span className="i-icon">🎯</span>
                 <h3>Intención Real</h3>
               </div>
               <div className="i-body">
                 <p>{isUnlocked ? aiResult?.analisis_premium?.intencion_real : "Se observa una dinámica donde el interés..."}</p>
                 {!isUnlocked && <div className="text-blur" />}
               </div>
             </div>

             <div className={`insight-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-meta">
                 <span className="i-icon">🔮</span>
                 <h3>Escenario Probable</h3>
               </div>
               <div className="i-body">
                 <p>{isUnlocked ? aiResult?.analisis_premium?.escenario_probable : "Si la interacción continúa con la misma inercia..."}</p>
                 {!isUnlocked && <div className="text-blur" />}
               </div>
             </div>

             <div className={`insight-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-meta">
                 <span className="i-icon">💡</span>
                 <h3>Recomendación</h3>
               </div>
               <div className="i-body">
                 <p>{isUnlocked ? aiResult?.analisis_premium?.recomendacion_tactica : "Para lograr tu objetivo declarado, la estrategia debe ser..."}</p>
                 {!isUnlocked && <div className="text-blur" />}
               </div>
             </div>
          </div>
        </div>

        {/* SECCIÓN 6: CTA */}
        {!isUnlocked && (
          <div className="cta-container-v36">
            <button 
              className={`unlock-btn-v36 ${loading ? 'loading' : ''}`}
              onClick={handleCheckoutClick}
              disabled={loading}
            >
              {loading ? "Procesando..." : "Desbloquear Plan Estratégico"}
            </button>
            <p className="cta-sub">Pago único. Sin suscripción.</p>
          </div>
        )}

        <div className="share-actions-v36">
           <button onClick={handleDownload} className="share-btn-v36">
             Generar Screenshot Viral 📸
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
          padding: 20px 10px; font-family: 'Inter', sans-serif;
          position: relative; overflow-x: hidden;
        }
        .ambient-glow {
          position: absolute; top: -10%; left: -10%; width: 60vw; height: 60vw;
          background: radial-gradient(circle, rgba(175, 82, 222, 0.1) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .content-max { position: relative; z-index: 10; width: 100%; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }
        
        .capture-wrapper { background: #000; border-radius: 28px; padding: 25px 20px; display: flex; flex-direction: column; gap: 30px; }
        
        .result-header-viral { text-align: center; }
        .label-top { font-size: 0.65rem; font-weight: 950; color: #af52de; letter-spacing: 0.2em; margin-bottom: 8px; }
        .sub-contextual { font-size: 0.85rem; color: rgba(255,255,255,0.4); font-weight: 700; margin-bottom: 25px; }
        .veredicto-shock-v36 { font-family: 'Inter Black', sans-serif; font-size: 2.8rem; font-weight: 950; color: #fff; line-height: 1.05; margin-bottom: 20px; letter-spacing: -0.03em; }
        .dinamica-highlight { font-size: 1rem; font-weight: 800; color: #fff; }
        .dinamica-highlight span { color: #39ff14; }

        .glass-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 30px; backdrop-filter: blur(20px); }
        .metrics-v36 { display: flex; flex-direction: column; gap: 24px; }
        .metric-item-v36 { display: flex; flex-direction: column; gap: 8px; }
        .m-header { display: flex; justify-content: space-between; align-items: flex-end; }
        .m-label { font-size: 0.75rem; font-weight: 900; color: rgba(255,255,255,0.5); text-transform: uppercase; }
        .m-percent { font-family: 'Inter Black', sans-serif; font-size: 1.2rem; font-weight: 950; }
        .m-bar-bg { width: 100%; height: 8px; background: rgba(255,255,255,0.04); border-radius: 10px; overflow: hidden; }
        .m-bar-fill { height: 100%; border-radius: 10px; transition: width 1.8s cubic-bezier(0.19, 1, 0.22, 1); }
        .m-interpret { font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.45); font-style: italic; margin-top: 4px; }

        .viral-quote-block { text-align: center; margin-top: 10px; display: flex; flex-direction: column; gap: 12px; }
        .viral-quote-block p { font-family: 'Inter Black', sans-serif; font-size: 1.3rem; font-style: italic; color: #fff; line-height: 1.3; }
        .stat-line-pattern { font-size: 0.75rem; font-weight: 800; color: #ffcc00; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.05em; }

        .divider-new { display: flex; align-items: center; justify-content: center; margin-bottom: 25px; }
        .divider-new span { font-size: 0.7rem; font-weight: 950; color: #af52de; border: 1px solid rgba(175, 82, 222, 0.3); padding: 5px 15px; border-radius: 100px; }

        .insights-v36 { display: flex; flex-direction: column; gap: 15px; }
        .insight-v36 { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 20px; }
        .i-meta { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .i-icon { font-size: 1.4rem; }
        .i-meta h3 { font-size: 0.95rem; font-weight: 900; color: #ff9500; text-transform: uppercase; }
        .i-body { position: relative; }
        .i-body p { font-size: 1rem; line-height: 1.5; color: rgba(255,255,255,0.7); }
        .text-blur { position: absolute; inset: 0; background: linear-gradient(transparent 30%, #050505 100%); pointer-events: none; }
        .locked .i-body p { filter: blur(5px); }

        .cta-container-v36 { text-align: center; margin-top: 10px; }
        .unlock-btn-v36 { 
          width: 100%; padding: 22px; border-radius: 18px; 
          background: linear-gradient(135deg, #af52de 0%, #ff2d55 100%); 
          border: none; color: white; font-family: 'Inter Black', sans-serif;
          font-size: 1.2rem; font-weight: 950; text-transform: uppercase;
          cursor: pointer; box-shadow: 0 10px 40px rgba(175, 82, 222, 0.3);
          transition: transform 0.2s, background 0.2s;
        }
        .unlock-btn-v36:hover { transform: scale(1.02); }
        .cta-sub { font-size: 0.75rem; color: rgba(255,255,255,0.3); font-weight: 700; margin-top: 15px; }

        .share-btn-v36 { width: 100%; background: transparent; border: 1px solid rgba(255,255,255,0.1); padding: 15px; border-radius: 12px; color: rgba(255,255,255,0.5); font-weight: 800; cursor: pointer; }
        .share-actions-v36 { text-align: center; }

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
