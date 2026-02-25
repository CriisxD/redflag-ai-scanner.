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
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('targetName');
      if (saved) setTargetName(saved);
    }
    const timer = setTimeout(() => setShowProgressBars(true), 500);
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
    const element = document.getElementById('shareable-ticket-capture');
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

  const riskValue = aiResult?.metricas_viral?.riesgo_objetivo?.valor || 0;

  return (
    <div className="result-container">
      <div className="ambient-glow" />
      
      <div className="content-max">
        {/* SECCIÓN 1: ZONA COMPARTIBLE (Capture Zone) */}
        <div className={`report-container-v36 ${
          riskValue > 75 ? 'state-toxic' : 
          riskValue < 30 ? 'state-safe' : 
          'state-normal'
        }`}>
          {/* HUD Elements */}
          <div className="hud-overlay">
            <div className="hud-id">{aiResult?.report_id || 'RF-HUD-LOG'}</div>
            <div className="hud-status">STATUS: DECODED</div>
            <div className="hud-secret-stamp">S E C R E T</div>
          </div>

          <div className="shareable-zone-v36">
            <div className="header-v36">
              <div className="badge-v36">SCAN v3.7 DRAMA</div>
              <p className="subtitle-v36">{aiResult?.subtitulo_contextual || 'Patrón evaluado según nivel de avance actual'}</p>
            </div>

            <div className="veredicto-shock-wrapper">
              <div className="verdict-icon-massive">
                {aiResult?.verdict_icon || '🚩'}
              </div>
              <h2 className="veredicto-shock-v36">
                “{aiResult?.veredicto_shock || 'Hay química... pero falta intención.'}”
              </h2>
            </div>

            <div className="dinamica-center-v36">
              <span className="dinamica-label">Dinámica Detectada:</span>
              <span className="dinamica-badge">{aiResult?.dinamica_detectada || 'Analizando...'}</span>
            </div>

            <div className="metrics-v36">
              {[
                { label: 'INTERÉS DETECTADO', data: aiResult?.metricas_viral?.interes_detectado },
                { label: 'NIVEL DE INVERSIÓN', data: aiResult?.metricas_viral?.nivel_inversion },
                { label: aiResult?.metricas_viral?.riesgo_objetivo?.label || 'RIESGO OBJETIVO', data: aiResult?.metricas_viral?.riesgo_objetivo, isRisk: true }
              ].map((m, idx) => {
                const color = getStatusColor(m.data?.valor || 0, m.isRisk);
                return (
                  <div key={idx} className="metric-row-v36">
                    <div className="m-info-v36">
                      <span className="m-label-v36">{m.label}</span>
                      <span className="m-val-v36" style={{ color }}>{m.data?.valor || 0}%</span>
                    </div>
                    <div className="m-bar-v36">
                      <div 
                        className="m-fill-v36" 
                        style={{ 
                          width: showProgressBars ? `${m.data?.valor || 0}%` : '0%', 
                          backgroundColor: color,
                          boxShadow: `0 0 10px ${color}44`
                        }} 
                      />
                    </div>
                    <p className="m-interpret-v36">{m.data?.interpretacion}</p>
                  </div>
                );
              })}
            </div>

            <div className="viral-quote-v36">
              <p>“{aiResult?.frase_viral || 'Te quiere cerca, no comprometido.'}”</p>
              <span className="stat-line-v36">{aiResult?.linea_patron || 'Típico en interacciones de validación.'}</span>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: PAYWALL & STRATEGY */}
        <div className="strategy-sequence-v36">
          <div className="divider-strategy">
            <span>🛡️ ESTRATEGIA EXCLUSIVA</span>
          </div>

          <div className="insights-grid-v36">
             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">🎯</span>
                 <h3>Intención Real</h3>
               </div>
               <div className="i-content-v36">
                 <p>{isUnlocked ? aiResult?.analisis_premium?.intencion_real : "Se observa una dinámica donde el interés..."}</p>
                 {!isUnlocked && <div className="blur-overlay" />}
               </div>
             </div>

             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">🔮</span>
                 <h3>Escenario Probable</h3>
               </div>
               <div className="i-content-v36">
                 <p>{isUnlocked ? aiResult?.analisis_premium?.escenario_probable : "Si la interacción continúa con la misma inercia..."}</p>
                 {!isUnlocked && <div className="blur-overlay" />}
               </div>
             </div>

             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">💡</span>
                 <h3>Recomendación</h3>
               </div>
               <div className="i-content-v36">
                 <p>{isUnlocked ? aiResult?.analisis_premium?.recomendacion_tactica : "Para lograr tu objetivo, la estrategia debe ser..."}</p>
                 {!isUnlocked && <div className="blur-overlay" />}
               </div>
             </div>
          </div>

          {!isUnlocked && (
            <div className="paywall-cta-v36">
              <button 
                className={`unlock-btn-v36 ${loading ? 'loading' : ''}`}
                onClick={handleCheckoutClick}
                disabled={loading}
              >
                {loading ? "Codificando..." : "Desbloquear Plan Estratégico"}
              </button>
              <p className="paywall-sub">Análisis profundo impulsado por IA. Única compra.</p>
            </div>
          )}
        </div>

        <div className="final-actions-v36">
           <button onClick={handleDownload} className="download-btn-v36" disabled={downloading}>
             {downloading ? 'Capturando...' : 'Generar Screenshot Viral 📸'}
           </button>
        </div>

        <ShareableTicket 
          name={targetName}
          reportId={aiResult?.report_id}
          verdictIcon={aiResult?.verdict_icon}
          metrics={{
            interes: { label: 'INTERÉS', valor: aiResult?.metricas_viral?.interes_detectado?.valor, color: getStatusColor(aiResult?.metricas_viral?.interes_detectado?.valor || 0) },
            inversion: { label: 'INVERSIÓN', valor: aiResult?.metricas_viral?.nivel_inversion?.valor, color: getStatusColor(aiResult?.metricas_viral?.nivel_inversion?.valor || 0) },
            riesgo: { label: aiResult?.metricas_viral?.riesgo_objetivo?.label || 'RIESGO OBJETIVO', valor: aiResult?.metricas_viral?.riesgo_objetivo?.valor, color: getStatusColor(aiResult?.metricas_viral?.riesgo_objetivo?.valor || 0, true) }
          }}
          veredicto={aiResult?.veredicto_shock}
          dinamica={aiResult?.dinamica_detectada}
          subContextual={aiResult?.subtitulo_contextual}
          fraseViral={aiResult?.frase_viral}
          lineaPatron={aiResult?.linea_patron}
        />
      </div>

      {showSocialProof && !isUnlocked && (
        <div className="social-toast">
          🚀 +4,200 análisis críticos realizados esta semana
        </div>
      )}

      <style jsx>{`
        .result-container {
          min-height: 100vh; width: 100vw; background: #050505; color: white;
          padding: 20px 15px; font-family: 'Inter', sans-serif;
          position: relative; overflow-x: hidden;
        }
        .ambient-glow {
          position: absolute; top: -10%; left: -10%; width: 70vw; height: 70vw;
          background: radial-gradient(circle, rgba(175, 82, 222, 0.08) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .content-max { position: relative; z-index: 10; width: 100%; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }
        
        .report-container-v36 {
          background: #000;
          border-radius: 40px;
          padding-bottom: 20px;
          width: 100%;
          border: 1px solid rgba(255,255,255,0.08);
          position: relative;
          overflow: hidden;
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .state-toxic {
          box-shadow: 0 0 60px rgba(255, 45, 85, 0.25);
          border-color: rgba(255, 45, 85, 0.4);
        }
        .state-toxic::after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at top right, rgba(255, 45, 85, 0.1), transparent 50%);
          animation: alarmPulse 2s infinite; pointer-events: none;
        }

        .state-safe {
          box-shadow: 0 0 60px rgba(57, 255, 20, 0.15);
          border-color: rgba(57, 255, 20, 0.3);
        }

        @keyframes alarmPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }

        .hud-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 2;
          font-family: 'Courier New', monospace; padding: 20px; opacity: 0.4;
        }
        .hud-id { position: absolute; top: 18px; left: 22px; font-size: 0.6rem; font-weight: 900; letter-spacing: 0.1em; color: rgba(255,255,255,0.4); }
        .hud-status { position: absolute; top: 18px; right: 22px; font-size: 0.55rem; color: #39ff14; font-weight: 900; }
        .hud-secret-stamp { 
          position: absolute; bottom: 20%; right: -50px; 
          font-size: 6rem; font-weight: 950; color: rgba(255,255,255,0.02);
          transform: rotate(-45deg); pointer-events: none;
        }

        .shareable-zone-v36 { padding: 60px 25px 40px; position: relative; z-index: 5; }

        .header-v36 { text-align: center; margin-bottom: 25px; }
        .badge-v36 { 
          display: inline-block; font-size: 0.7rem; font-weight: 950; color: #af52de;
          background: rgba(175, 82, 222, 0.1); border: 1px solid rgba(175, 82, 222, 0.3);
          padding: 6px 14px; border-radius: 50px; margin-bottom: 12px; letter-spacing: 0.2em;
        }
        .subtitle-v36 { font-size: 0.85rem; color: rgba(255,255,255,0.4); font-weight: 700; }

        .veredicto-shock-wrapper { margin-bottom: 35px; text-align: center; }
        .verdict-icon-massive { 
          font-size: 5rem; margin-bottom: 10px; line-height: 1;
          filter: drop-shadow(0 0 20px rgba(255,255,255,0.2));
          animation: floatIcon 4s ease-in-out infinite;
        }
        @keyframes floatIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }

        .veredicto-shock-v36 { 
          font-family: 'Inter Black', sans-serif; font-size: 3rem; font-weight: 950;
          color: white; line-height: 1.05; letter-spacing: -0.05em;
        }

        .dinamica-center-v36 { margin-bottom: 40px; }
        .dinamica-label { font-size: 0.85rem; font-weight: 800; color: rgba(255,255,255,0.5); margin-right: 8px; }
        .dinamica-badge { font-size: 0.95rem; font-weight: 900; color: #39ff14; }

        .metrics-v36 { display: flex; flex-direction: column; gap: 24px; margin-bottom: 40px; }
        .metric-row-v36 { display: flex; flex-direction: column; gap: 8px; text-align: left; }
        .m-info-v36 { display: flex; justify-content: space-between; align-items: flex-end; }
        .m-label-v36 { font-size: 0.75rem; font-weight: 900; color: rgba(255,255,255,0.4); text-transform: uppercase; }
        .m-val-v36 { font-family: 'Inter Black', sans-serif; font-size: 1.25rem; font-weight: 950; }
        .m-bar-v36 { width: 100%; height: 10px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
        .m-fill-v36 { height: 100%; border-radius: 10px; transition: width 2s cubic-bezier(0.19, 1, 0.22, 1); }
        .m-interpret-v36 { font-size: 0.8rem; font-weight: 600; color: rgba(255,255,255,0.4); font-style: italic; }

        .viral-quote-v36 { padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.06); }
        .viral-quote-v36 p { font-family: 'Inter Black', sans-serif; font-size: 1.5rem; font-style: italic; line-height: 1.25; margin-bottom: 15px; }
        .stat-line-v36 { font-size: 0.75rem; font-weight: 900; color: #ff9500; text-transform: uppercase; letter-spacing: 0.1em; }

        .strategy-sequence-v36 { margin-top: 10px; }
        .divider-strategy { display: flex; justify-content: center; margin-bottom: 30px; }
        .divider-strategy span { font-size: 0.75rem; font-weight: 950; color: #af52de; border: 1px solid rgba(175, 82, 222, 0.3); padding: 8px 18px; border-radius: 100px; }

        .insights-grid-v36 { display: flex; flex-direction: column; gap: 15px; margin-bottom: 40px; }
        .insight-card-v36 { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 20px; padding: 22px; transition: all 0.3s; }
        .i-header-v36 { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .i-icon-v36 { font-size: 1.4rem; }
        .i-header-v36 h3 { font-size: 1rem; font-weight: 900; color: #ff9500; text-transform: uppercase; }
        .i-content-v36 { position: relative; }
        .i-content-v36 p { font-size: 1.05rem; line-height: 1.5; color: rgba(255,255,255,0.7); }
        .blur-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 30%, #050505 100%); pointer-events: none; }
        .locked .i-content-v36 p { filter: blur(6px); }

        .paywall-cta-v36 { text-align: center; }
        .unlock-btn-v36 { 
          width: 100%; padding: 24px; border-radius: 22px; 
          background: linear-gradient(135deg, #af52de 0%, #ff2d55 100%); 
          border: none; color: white; font-family: 'Inter Black', sans-serif;
          font-size: 1.3rem; font-weight: 950; text-transform: uppercase;
          cursor: pointer; box-shadow: 0 15px 45px rgba(255, 45, 85, 0.3);
          transition: transform 0.2s;
        }
        .unlock-btn-v36:active { transform: scale(0.98); }
        .paywall-sub { font-size: 0.8rem; color: rgba(255,255,255,0.3); font-weight: 700; margin-top: 15px; }

        .final-actions-v36 { text-align: center; margin-top: 20px; }
        .download-btn-v36 { background: transparent; border: 1px solid rgba(255,255,255,0.1); padding: 18px; border-radius: 15px; color: rgba(255,255,255,0.5); font-weight: 800; cursor: pointer; width: 100%; }

        .social-toast {
          position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
          background: rgba(0,0,0,0.95); border: 1px solid rgba(255,255,255,0.15);
          padding: 14px 24px; border-radius: 50px; font-size: 0.9rem; font-weight: 800;
          color: white; box-shadow: 0 15px 40px rgba(0,0,0,0.6);
          animation: slideUp 0.6s cubic-bezier(0.2, 1, 0.3, 1); z-index: 100;
        }
        @keyframes slideUp { from { transform: translate(-50%, 50px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>
    </div>
  );
}
