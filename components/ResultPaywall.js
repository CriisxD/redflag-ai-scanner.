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
            <div className="hud-id">{aiResult?.case_id || 'ID-RESERVADO'}</div>
            <div className="hud-status" style={{ color: '#ff2d55' }}>NIVEL DE RIESGO: CRÍTICO</div>
            <div className="hud-secret-stamp">C O N F I D E N T I A L</div>
          </div>

          <div className="shareable-zone-v36">
            <div className="header-v36">
              <div className="badge-v36">EXPEDIENTE DE INTELIGENCIA</div>
              <p className="subtitle-v36">{aiResult?.subtitulo_contextual || 'Análisis de campo: Dinámica detectada en tiempo real'}</p>
            </div>

            <div className="veredicto-shock-wrapper">
              <div className="verdict-icon-massive">
                {aiResult?.verdict_icon || '🚩'}
              </div>
              <h2 className="veredicto-shock-v36">
                “{aiResult?.veredicto_shock || 'Hay química... pero falta intención.'}”
              </h2>
            </div>

            <div className={`dinamica-center-v36 ${aiResult?.balance_poder ? 'has-power-info' : ''}`}>
              <div className="power-balance-badge">
                ⚖️ {aiResult?.balance_poder || 'Calculando Balance...'}
              </div>
              <div className="dinamica-row">
                <span className="dinamica-label">Dinámica:</span>
                <span className="dinamica-badge">{aiResult?.dinamica_detectada || 'Analizando...'}</span>
              </div>
            </div>

            <div className="metrics-v36 binary-questions">
              {[
                { label: aiResult?.metricas_binarias?.q1?.pregunta || '¿Quiere volver?', valor: aiResult?.metricas_binarias?.q1?.valor },
                { label: aiResult?.metricas_binarias?.q2?.pregunta || '¿Te extraña?', valor: aiResult?.metricas_binarias?.q2?.valor },
                { label: aiResult?.metricas_binarias?.q3?.pregunta || '¿Busca algo serio?', valor: aiResult?.metricas_binarias?.q3?.valor }
              ].map((m, idx) => {
                const color = getStatusColor(m.valor || 0);
                return (
                  <div key={idx} className="metric-row-v36 binary">
                    <div className="m-info-v36">
                      <span className="m-label-v36 binary">{m.label}</span>
                      <span className="m-val-v36 binary" style={{ color }}>{m.valor || 0}%</span>
                    </div>
                    <div className="m-bar-v36 binary">
                      <div 
                        className="m-fill-v36" 
                        style={{ 
                          width: showProgressBars ? `${m.valor || 0}%` : '0%', 
                          backgroundColor: color,
                          boxShadow: `0 0 10px ${color}33`
                        }} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="viral-punchline-v41">
              <p className="punchline-text">"{aiResult?.punchline_viral || 'El que más escribe siempre es el que menos poder tiene.'}"</p>
              <div className="tiktok-tag">TIKTOK EDITION | VERIFIED INTEL</div>
            </div>

          </div>
        </div>

        {/* SECCIÓN 2: PAYWALL & STRATEGY */}
        <div className="strategy-sequence-v36">
          <div className="divider-strategy">
            <span>🛡️ ESTRATEGIA EXCLUSIVA</span>
          </div>

          <div className="insights-grid-v36">
             {/* Bloque 1: Intención Real */}
             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">🎯</span>
                 <h3>Intención Real</h3>
               </div>
               <div className="i-content-v36">
                  {isUnlocked ? (
                    <div className="intelligence-node">
                      <p className="main-conc">{aiResult?.analisis_premium?.intencion_real?.conclusion}</p>
                      
                      {aiResult?.analisis_premium?.intencion_real?.citas_textuales?.length > 0 && (
                        <div className="quotes-container">
                          <span className="ev-label">Evidencia Interceptada:</span>
                          {aiResult.analisis_premium.intencion_real.citas_textuales.map((cita, i) => (
                            <div key={i} className="quote-item">"{cita}"</div>
                          ))}
                        </div>
                      )}

                      <div className="evidence-box">
                        <span className="ev-label">Análisis Clínico:</span>
                        <p className="ev-text">{aiResult?.analisis_premium?.intencion_real?.justificacion_evidencia}</p>
                      </div>
                    </div>
                  ) : (
                    <p>Extrayendo y analizando citas textuales del chat...</p>
                  )}
                  {!isUnlocked && <div className="blur-overlay" />}
               </div>
             </div>

             {/* Bloque 2: Patrón Psicológico */}
             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">🧠</span>
                 <h3>Patrón Conductual</h3>
               </div>
               <div className="i-content-v36">
                  {isUnlocked ? (
                    <div className="intelligence-node">
                      <p className="main-conc">{aiResult?.analisis_premium?.patron_psicologico?.etiqueta}</p>
                      <div className="indicators-list">
                        {aiResult?.analisis_premium?.patron_psicologico?.indicadores_detectados?.map((ind, i) => (
                          <span key={i} className="ind-tag">{ind}</span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p>Mapeando indicadores clínicos y sesgos de apego...</p>
                  )}
                  {!isUnlocked && <div className="blur-overlay" />}
               </div>
             </div>

             {/* Bloque 3: Balance de Poder y Energía (NUEVO V4.3) */}
             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">⚖️</span>
                 <h3>Dinámica de Inversión</h3>
               </div>
               <div className="i-content-v36">
                  {isUnlocked ? (
                    <div className="power-node">
                      <div className="power-ruler">
                        <span className="t-label">Sujeto Más Invertido:</span>
                        <p className="power-winner">{aiResult?.analisis_premium?.poder_y_energia?.mas_invertido}</p>
                      </div>
                      <div className="evidence-box">
                        <span className="ev-label">Análisis de Energía:</span>
                        <p className="ev-text">{aiResult?.analisis_premium?.poder_y_energia?.analisis_energia}</p>
                      </div>
                      <div className="risk-alert">
                        <span>⚠️ {aiResult?.analisis_premium?.poder_y_energia?.riesgo_emocional}</span>
                      </div>
                    </div>
                  ) : (
                    <p>Calculando retención de poder y asimetría de inversión...</p>
                  )}
                  {!isUnlocked && <div className="blur-overlay" />}
               </div>
             </div>

             {/* Bloque 4: Simulación Heurística */}
             <div className={`insight-card-v36 scenario-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">🔮</span>
                 <h3>Simulación Conductual</h3>
               </div>
               <div className="i-content-v36 scenarios">
                 {isUnlocked ? (
                   <>
                     <div className="scenario-item path-a">
                       <span className="s-label">Path A (Inercia Actual):</span>
                       <p>{aiResult?.analisis_premium?.simulacion_escenarios?.inercia?.descripcion}</p>
                       <div className="heuristic-prob">
                         <span className="prob-text">Rango Probable: {aiResult?.analisis_premium?.simulacion_escenarios?.inercia?.probabilidad_estimada}</span>
                       </div>
                     </div>
                     <div className="scenario-item path-b">
                       <span className="s-label">Path B (Táctica Sugerida):</span>
                       <p>{aiResult?.analisis_premium?.simulacion_escenarios?.cambio_tactico?.descripcion}</p>
                       <div className="heuristic-prob highlight">
                         <span className="prob-text">Rango Probable: {aiResult?.analisis_premium?.simulacion_escenarios?.cambio_tactico?.probabilidad_estimada}</span>
                       </div>
                     </div>
                   </>
                 ) : (
                   <p>Corriendo modelos predictivos heurísticos sobre futuros escenarios...</p>
                 )}
                 {!isUnlocked && <div className="blur-overlay" />}
               </div>
             </div>

             {/* Bloque 5: Estrategia Final */}
             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">💡</span>
                 <h3>Plan de Acción Táctico</h3>
               </div>
               <div className="i-content-v36">
                  {isUnlocked ? (
                    <div className="tactical-node">
                      <div className="msg-template">
                        <span className="t-label">Plantilla Sugerida:</span>
                        <div className="template-box">
                          {aiResult?.analisis_premium?.estrategia_final?.mensaje_sugerido}
                        </div>
                      </div>
                      <div className="frame-box">
                        <span className="t-label">Marco Psicológico (Frame):</span>
                        <p>{aiResult?.analisis_premium?.estrategia_final?.marco_conversational}</p>
                      </div>
                      <div className="signals-grid">
                        <div className="sig-item pos">
                          <span className="sig-label">Avance (Positivo):</span>
                          <p>{aiResult?.analisis_premium?.estrategia_final?.que_observar?.positivo}</p>
                        </div>
                        <div className="sig-item neg">
                          <span className="sig-label">Retirada (Negativo):</span>
                          <p>{aiResult?.analisis_premium?.estrategia_final?.que_observar?.negativo}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p>Optimizando tu estrategia con tácticas de nivel agencia...</p>
                  )}
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
           <button onClick={handleDownload} className="download-btn-v36 tiktok-style" disabled={downloading}>
             {downloading ? 'Codificando...' : 'Generar TikTok Edition 📸'}
           </button>
        </div>

        <ShareableTicket 
          name={targetName}
          reportId={aiResult?.case_id}
          verdictIcon={aiResult?.verdict_icon}
          balancePoder={aiResult?.balance_poder}
          metrics={{
            ghosting: { label: 'GHOSTING Prob.', valor: aiResult?.pronostico?.ghosting, color: getStatusColor(aiResult?.pronostico?.ghosting || 0, true) },
            compromiso: { label: 'COMPROMISO Prob.', valor: aiResult?.pronostico?.compromiso, color: getStatusColor(aiResult?.pronostico?.compromiso || 0) },
            limbo: { label: 'LIMBO Prob.', valor: aiResult?.pronostico?.limbo, color: getStatusColor(aiResult?.pronostico?.limbo || 0, true) }
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

        .dinamica-center-v36 { margin-bottom: 40px; display: flex; flex-direction: column; gap: 12px; align-items: center; }
        .power-balance-badge {
          font-size: 0.75rem; font-weight: 900; color: #ffcc00;
          background: rgba(255, 204, 0, 0.1); border: 1px solid rgba(255, 204, 0, 0.3);
          padding: 6px 16px; border-radius: 50px; text-transform: uppercase;
          letter-spacing: 0.1em; animation: fadeIn 1s both;
        }
        .dinamica-row { display: flex; align-items: center; }
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
        .scenario-card { border-left: 3px solid #af52de; }
        .i-header-v36 { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
        .i-icon-v36 { font-size: 1.4rem; }
        .i-header-v36 h3 { font-size: 1rem; font-weight: 900; color: #ff9500; text-transform: uppercase; }
        .i-content-v36 { position: relative; }
        .i-content-v36 p { font-size: 1.05rem; line-height: 1.5; color: rgba(255,255,255,0.7); }
        .scenarios { display: flex; flex-direction: column; gap: 15px; }
        .scenario-item { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 12px; }
        .s-label { font-size: 0.75rem; font-weight: 900; color: #af52de; display: block; margin-bottom: 4px; }
        .blur-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 30%, #050505 100%); pointer-events: none; }
        .locked .i-content-v36 p { filter: blur(6px); }
        .metric-row-v36.v4 { margin-top: 10px; }
        .m-eviden-v36 { font-size: 0.75rem; color: rgba(255,255,255,0.4); font-style: italic; margin-top: 5px; }
        .scorecard-title { font-size: 0.8rem; font-weight: 950; color: rgba(255,255,255,0.6); letter-spacing: 0.1em; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 15px; }

        .binary-questions { margin-top: 20px; gap: 18px; }
        .m-label-v36.binary { font-size: 0.9rem; color: white; font-weight: 800; letter-spacing: 0; text-transform: none; }
        .m-val-v36.binary { font-size: 1.4rem; }
        .m-bar-v36.binary { height: 14px; background: rgba(255,255,255,0.1); }
        
        .viral-punchline-v41 { 
          margin-top: 40px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px; text-align: center;
        }
        .punchline-text { 
          font-family: 'Inter Black', sans-serif; font-size: 1.6rem; font-weight: 950; font-style: italic; 
          line-height: 1.2; color: white; margin-bottom: 15px;
        }
        .tiktok-tag { 
          font-size: 0.65rem; font-weight: 950; color: #ff2d55; letter-spacing: 0.2em;
        }

        /* Advanced Intelligence Styles v4.2 */
        .intelligence-node, .tactical-node { display: flex; flex-direction: column; gap: 15px; }
        .main-conc { font-weight: 800; color: white; margin-bottom: 5px; }
        .evidence-box { background: rgba(0,0,0,0.3); padding: 12px; border-radius: 12px; border-left: 2px solid #39ff14; }
        .ev-label, .t-label { font-size: 0.7rem; font-weight: 900; color: #af52de; display: block; margin-bottom: 4px; text-transform: uppercase; }
        .ev-text { font-size: 0.9rem !important; font-style: italic; color: rgba(255,255,255,0.5) !important; }
        .indicators-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .ind-tag { font-size: 0.75rem; font-weight: 800; color: #39ff14; background: rgba(57, 255, 20, 0.1); padding: 4px 10px; border-radius: 6px; }
        .template-box { background: #1a1a1a; padding: 15px; border-radius: 12px; border: 1px dashed rgba(255,255,255,0.2); font-family: monospace; color: #39ff14; font-size: 0.95rem; line-height: 1.4; position: relative; }
        .signals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px; }
        .sig-item { padding: 10px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); }
        .sig-label { font-size: 0.65rem; font-weight: 900; display: block; margin-bottom: 4px; }
        .pos .sig-label { color: #39ff14; }
        .neg .sig-label { color: #ff2d55; }
        .sig-item p { font-size: 0.8rem !important; line-height: 1.3 !important; }

        /* v4.3 Hyper Personalization Styles */
        .quotes-container { display: flex; flex-direction: column; gap: 8px; margin-bottom: 10px; }
        .quote-item { background: rgba(175, 82, 222, 0.1); border-left: 3px solid #af52de; padding: 10px 14px; border-radius: 0 10px 10px 0; font-family: 'Courier New', monospace; font-size: 0.85rem; color: #fff; font-style: italic; }
        .power-node { display: flex; flex-direction: column; gap: 15px; }
        .power-ruler { background: rgba(0,0,0,0.4); padding: 15px; border-radius: 12px; border: 1px solid rgba(255, 204, 0, 0.3); text-align: center; }
        .power-winner { font-family: 'Inter Black', sans-serif; font-size: 1.4rem; color: #ffcc00; margin-top: 5px; text-transform: uppercase; }
        .risk-alert { background: rgba(255, 45, 85, 0.15); border: 1px solid rgba(255, 45, 85, 0.4); padding: 12px; border-radius: 10px; font-size: 0.8rem; font-weight: 800; color: #ff2d55; text-align: center; }
        .heuristic-prob { margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(255,255,255,0.1); }
        .prob-text { font-family: 'Courier New', monospace; font-size: 0.8rem; font-weight: 950; color: rgba(255,255,255,0.6); }
        .highlight .prob-text { color: #39ff14; }

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
        .download-btn-v36.tiktok-style {
          background: #fff; color: #000; border: none; font-family: 'Inter Black', sans-serif;
          font-size: 1.1rem; box-shadow: 0 10px 30px rgba(255,255,255,0.1); transition: all 0.3s;
        }
        .download-btn-v36.tiktok-style:hover { transform: translateY(-3px); box-shadow: 0 15px 40px rgba(255,255,255,0.2); }

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
