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
      if (val < 30) return '#E0B0FF'; // Lilac (Safe)
      if (val < 60) return '#FFB347'; // Amber (Warn)
      return '#FF6F61'; // Coral (Risk)
    }
    if (val < 30) return '#FF6F61';
    if (val < 60) return '#FFB347';
    return '#E0B0FF';
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
          {/* HUD Elements -> Now Astrological / Editorial Watermarks */}
          <div className="hud-overlay">
            <div className="hud-id">{aiResult?.case_id || 'ID-RESERVADO'}</div>
            <div className="hud-status" style={{ color: '#E0B0FF' }}>LECTURA ENERGÉTICA</div>
            <div className="hud-watermark">P A T T E R N S</div>
          </div>

          <div className="shareable-zone-v36">
            <div className="header-v36">
              <div className="badge-v36">ANÁLISIS DE VÍNCULO</div>
              <p className="subtitle-v36">{aiResult?.subtitulo_contextual || 'Lectura de campo: Dinámica detectada'}</p>
            </div>

            <div className="veredicto-shock-wrapper">
              <div className="verdict-icon-massive">
                {aiResult?.verdict_icon || '🧿'}
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
                <span className="dinamica-label">Dinámica Central:</span>
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
                          background: `linear-gradient(90deg, ${color}33, ${color})`,
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
              <div className="tiktok-tag">SOUL KINETICS | DEEP DIVE</div>
            </div>

          </div>
        </div>

        {/* SECCIÓN 2: PAYWALL & STRATEGY */}
        <div className="strategy-sequence-v36">
          <div className="divider-strategy">
            <span>✨ LECTURA PROFUNDA</span>
          </div>

          <div className="insights-grid-v36">
             {/* Bloque 1: Intención Real */}
             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">🎯</span>
                 <h3>Móvil Inconsciente</h3>
               </div>
               <div className="i-content-v36">
                  {isUnlocked ? (
                    <div className="intelligence-node">
                      <p className="main-conc">{aiResult?.analisis_premium?.intencion_real?.conclusion}</p>
                      
                      {aiResult?.analisis_premium?.intencion_real?.citas_textuales?.length > 0 && (
                        <div className="quotes-container">
                          <span className="ev-label">Eco del Chat (Evidencia):</span>
                          {aiResult.analisis_premium.intencion_real.citas_textuales.map((cita, i) => (
                            <div key={i} className="quote-item">“{cita}”</div>
                          ))}
                        </div>
                      )}

                      <div className="evidence-box">
                        <span className="ev-label">Lectura de Señales:</span>
                        <p className="ev-text">{aiResult?.analisis_premium?.intencion_real?.justificacion_evidencia}</p>
                      </div>
                    </div>
                  ) : (
                    <p>Mapeando patrones ocultos en el lenguaje utilizado...</p>
                  )}
                  {!isUnlocked && <div className="blur-overlay" />}
               </div>
             </div>

             {/* Bloque 2: Patrón Psicológico */}
             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">🧠</span>
                 <h3>Arquetipo de Apego</h3>
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
                    <p>Identificando bloqueos emocionales y sesgos de apego...</p>
                  )}
                  {!isUnlocked && <div className="blur-overlay" />}
               </div>
             </div>

             {/* Bloque 3: Balance de Poder y Energía (NUEVO V4.3) */}
             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">⚖️</span>
                 <h3>Asimetría de Energía</h3>
               </div>
               <div className="i-content-v36">
                  {isUnlocked ? (
                    <div className="power-node">
                      <div className="power-ruler">
                        <span className="t-label">Mayor Inversión Emocional:</span>
                        <p className="power-winner">{aiResult?.analisis_premium?.poder_y_energia?.mas_invertido}</p>
                      </div>
                      <div className="evidence-box">
                        <span className="ev-label">Flujo de Interacción:</span>
                        <p className="ev-text">{aiResult?.analisis_premium?.poder_y_energia?.analisis_energia}</p>
                      </div>
                      <div className="risk-alert">
                        <span>⚠️ {aiResult?.analisis_premium?.poder_y_energia?.riesgo_emocional}</span>
                      </div>
                    </div>
                  ) : (
                    <p>Midiendo desbalances en la iniciación y volumen de texto de {targetName}...</p>
                  )}
                  {!isUnlocked && <div className="blur-overlay" />}
               </div>
             </div>

             {/* Bloque 4: Simulación Heurística */}
             <div className={`insight-card-v36 scenario-card ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">🔮</span>
                 <h3>Proyección de Vínculo</h3>
               </div>
               <div className="i-content-v36 scenarios">
                 {isUnlocked ? (
                   <>
                     <div className="scenario-item path-a">
                       <span className="s-label">Línea de Inercia Actual:</span>
                       <p>{aiResult?.analisis_premium?.simulacion_escenarios?.inercia?.descripcion}</p>
                       <div className="heuristic-prob">
                         <span className="prob-text">Probabilidad Estimada: {aiResult?.analisis_premium?.simulacion_escenarios?.inercia?.probabilidad_estimada}</span>
                       </div>
                     </div>
                     <div className="scenario-item path-b">
                       <span className="s-label">Aplicando Nuevo Enfoque:</span>
                       <p>{aiResult?.analisis_premium?.simulacion_escenarios?.cambio_tactico?.descripcion}</p>
                       <div className="heuristic-prob highlight">
                         <span className="prob-text">Probabilidad Estimada: {aiResult?.analisis_premium?.simulacion_escenarios?.cambio_tactico?.probabilidad_estimada}</span>
                       </div>
                     </div>
                   </>
                 ) : (
                   <p>Modelando futuros probables basados en comportamientos previos...</p>
                 )}
                 {!isUnlocked && <div className="blur-overlay" />}
               </div>
             </div>

             {/* Bloque 5: Estrategia Final */}
             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">💡</span>
                 <h3>Plan de Arquitectura Relacional</h3>
               </div>
               <div className="i-content-v36">
                  {isUnlocked ? (
                    <div className="tactical-node">
                      <div className="msg-template">
                        <span className="t-label">Transmisión Sugerida:</span>
                        <div className="template-box">
                          {aiResult?.analisis_premium?.estrategia_final?.mensaje_sugerido}
                        </div>
                      </div>
                      <div className="frame-box">
                        <span className="t-label">Estado Mental (Frame):</span>
                        <p>{aiResult?.analisis_premium?.estrategia_final?.marco_conversational}</p>
                      </div>
                      <div className="signals-grid">
                        <div className="sig-item pos">
                          <span className="sig-label">Ecos de Avance:</span>
                          <p>{aiResult?.analisis_premium?.estrategia_final?.que_observar?.positivo}</p>
                        </div>
                        <div className="sig-item neg">
                          <span className="sig-label">Ecos de Retirada:</span>
                          <p>{aiResult?.analisis_premium?.estrategia_final?.que_observar?.negativo}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p>Diseñando tácticas de respuesta asimétrica...</p>
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
                {loading ? "Sincronizando..." : "Desbloquear Lectura Completa"}
              </button>
              <p className="paywall-sub">Dossier psicológico generado por IA. Acceso único.</p>
            </div>
          )}
        </div>

        <div className="final-actions-v36">
           <button onClick={handleDownload} className="download-btn-v36 tiktok-style" disabled={downloading}>
             {downloading ? 'Capturando...' : 'Guardar Dossier de Vínculo 📸'}
           </button>
        </div>

        <ShareableTicket 
          name={targetName}
          reportId={aiResult?.case_id}
          verdictIcon={aiResult?.verdict_icon}
          balancePoder={aiResult?.balance_poder}
          metrics={{
            ghosting: { label: 'RIESGO DISTANCIA', valor: aiResult?.pronostico?.ghosting, color: getStatusColor(aiResult?.pronostico?.ghosting || 0, true) },
            compromiso: { label: 'PROB. COMPROMISO', valor: aiResult?.pronostico?.compromiso, color: getStatusColor(aiResult?.pronostico?.compromiso || 0) },
            limbo: { label: 'RIESGO LIMBO', valor: aiResult?.pronostico?.limbo, color: getStatusColor(aiResult?.pronostico?.limbo || 0, true) }
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
          ✨ +4,200 dinámicas reveladas esta semana
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
          background: radial-gradient(circle, rgba(224, 176, 255, 0.08) 0%, transparent 70%);
          pointer-events: none; z-index: 0;
        }
        .content-max { position: relative; z-index: 10; width: 100%; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }
        
        .report-container-v36 {
          background: rgba(10, 6, 18, 0.6);
          border-radius: 40px;
          padding-bottom: 20px;
          width: 100%;
          border: 1px solid rgba(224, 176, 255, 0.15);
          position: relative;
          overflow: hidden;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .state-toxic {
          box-shadow: 0 0 80px rgba(255, 111, 97, 0.15);
          border-color: rgba(255, 111, 97, 0.3);
        }
        .state-toxic::after {
          content: ""; position: absolute; inset: 0;
          background: radial-gradient(circle at top right, rgba(255, 111, 97, 0.1), transparent 50%);
          animation: alarmPulse 4s infinite; pointer-events: none;
        }

        .state-safe {
          box-shadow: 0 0 60px rgba(224, 176, 255, 0.15);
          border-color: rgba(224, 176, 255, 0.3);
        }

        @keyframes alarmPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
        }

        .hud-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 2;
          font-family: 'Inter', sans-serif; padding: 20px; opacity: 0.5;
        }
        .hud-id { position: absolute; top: 18px; left: 22px; font-size: 0.65rem; font-weight: 800; letter-spacing: 0.15em; color: rgba(255,255,255,0.3); }
        .hud-status { position: absolute; top: 18px; right: 22px; font-size: 0.6rem; color: #E0B0FF; font-weight: 800; letter-spacing: 0.1em; }
        .hud-watermark { 
          position: absolute; bottom: 15%; right: -30px; 
          font-family: 'Playfair Display', serif;
          font-size: 6rem; font-weight: 700; color: rgba(224, 176, 255, 0.03);
          transform: rotate(-30deg); pointer-events: none; white-space: nowrap;
        }

        .shareable-zone-v36 { padding: 60px 25px 40px; position: relative; z-index: 5; }

        .header-v36 { text-align: center; margin-bottom: 25px; }
        .badge-v36 { 
          display: inline-block; font-size: 0.75rem; font-weight: 800; color: #1A0B2E;
          background: linear-gradient(135deg, #E0B0FF, #F2D8FF); 
          padding: 8px 18px; border-radius: 50px; margin-bottom: 12px; letter-spacing: 0.15em;
          box-shadow: 0 4px 15px rgba(224, 176, 255, 0.2);
        }
        .subtitle-v36 { font-size: 0.9rem; color: rgba(255,255,255,0.5); font-weight: 500; font-style: italic; font-family: 'Playfair Display', serif; }

        .veredicto-shock-wrapper { margin-bottom: 35px; text-align: center; }
        .verdict-icon-massive { 
          font-size: 4.5rem; margin-bottom: 15px; line-height: 1;
          filter: drop-shadow(0 0 25px rgba(224, 176, 255, 0.3));
          animation: floatIcon 6s ease-in-out infinite;
        }
        @keyframes floatIcon { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        .veredicto-shock-v36 { 
          font-family: 'Playfair Display', serif; font-size: 2.8rem; font-weight: 700;
          color: #FFF3E0; line-height: 1.1; letter-spacing: -0.02em;
        }

        .dinamica-center-v36 { margin-bottom: 40px; display: flex; flex-direction: column; gap: 12px; align-items: center; }
        .power-balance-badge {
          font-size: 0.75rem; font-weight: 800; color: #FFB347;
          background: rgba(255, 179, 71, 0.1); border: 1px solid rgba(255, 179, 71, 0.3);
          padding: 6px 16px; border-radius: 50px; text-transform: uppercase;
          letter-spacing: 0.1em; animation: fadeIn 1.5s both; backdrop-filter: blur(5px);
        }
        .dinamica-row { display: flex; align-items: center; }
        .dinamica-label { font-size: 0.85rem; font-weight: 500; color: rgba(255,255,255,0.5); margin-right: 8px; }
        .dinamica-badge { font-size: 0.95rem; font-weight: 800; color: #E0B0FF; }

        .metrics-v36 { display: flex; flex-direction: column; gap: 24px; margin-bottom: 40px; }
        .metric-row-v36 { display: flex; flex-direction: column; gap: 8px; text-align: left; }
        .m-info-v36 { display: flex; justify-content: space-between; align-items: flex-end; }
        .m-label-v36 { font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.7); letter-spacing: 0.05em; }
        .m-val-v36 { font-family: 'Playfair Display', serif; font-size: 1.3rem; font-weight: 700; }
        .m-bar-v36 { width: 100%; height: 12px; background: rgba(255,255,255,0.05); border-radius: 10px; overflow: hidden; }
        .m-fill-v36 { height: 100%; border-radius: 10px; transition: width 2s cubic-bezier(0.19, 1, 0.22, 1); }
        
        .viral-punchline-v41 { 
          margin-top: 40px; border-top: 1px solid rgba(224, 176, 255, 0.15); padding-top: 30px; text-align: center;
        }
        .punchline-text { 
          font-family: 'Playfair Display', serif; font-size: 1.5rem; font-weight: 600; font-style: italic; 
          line-height: 1.3; color: #FFF3E0; margin-bottom: 15px;
        }
        .tiktok-tag { 
          font-size: 0.65rem; font-weight: 800; color: #E0B0FF; letter-spacing: 0.2em; text-transform: uppercase;
        }

        /* Editorial Insights Redesign */
        .strategy-sequence-v36 { margin-top: 10px; }
        .divider-strategy { display: flex; justify-content: center; margin-bottom: 30px; }
        .divider-strategy span { font-size: 0.75rem; font-weight: 800; color: #E0B0FF; border: 1px solid rgba(224, 176, 255, 0.3); padding: 8px 18px; border-radius: 100px; letter-spacing: 0.1em; background: rgba(224, 176, 255, 0.05); }

        .insights-grid-v36 { display: flex; flex-direction: column; gap: 18px; margin-bottom: 40px; }
        .insight-card-v36 { 
          background: rgba(26, 15, 46, 0.4); 
          border: 1px solid rgba(224, 176, 255, 0.15); 
          border-radius: 20px; padding: 25px; transition: all 0.3s;
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
        }
        .scenario-card { border-left: 3px solid #E0B0FF; }
        .i-header-v36 { display: flex; align-items: center; gap: 12px; margin-bottom: 18px; }
        .i-icon-v36 { font-size: 1.4rem; }
        .i-header-v36 h3 { font-family: 'Playfair Display', serif; font-size: 1.1rem; font-weight: 700; color: #E0B0FF; letter-spacing: 0.05em; }
        .i-content-v36 { position: relative; }
        .i-content-v36 p { font-size: 1rem; line-height: 1.6; color: rgba(255,255,255,0.8); font-weight: 400; }
        .scenarios { display: flex; flex-direction: column; gap: 15px; }
        .scenario-item { background: rgba(0,0,0,0.2); padding: 15px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.03); }
        .s-label { font-size: 0.8rem; font-weight: 700; color: #E0B0FF; display: block; margin-bottom: 6px; }
        .blur-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 30%, #0A0612 100%); pointer-events: none; border-radius: 0 0 20px 20px; }
        .locked .i-content-v36 p { filter: blur(6px); }

        /* v5.0 Editorial Personalization Styles */
        .intelligence-node, .tactical-node { display: flex; flex-direction: column; gap: 15px; }
        .main-conc { font-weight: 700; color: #FFF3E0; margin-bottom: 5px; font-size: 1.05rem; }
        .evidence-box { background: rgba(0,0,0,0.2); padding: 14px; border-radius: 12px; border-left: 2px solid #FFB347; }
        .ev-label, .t-label { font-size: 0.75rem; font-weight: 800; color: rgba(255,255,255,0.5); display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
        .ev-text { font-size: 0.95rem !important; color: rgba(255,255,255,0.7) !important; }
        
        .quotes-container { display: flex; flex-direction: column; gap: 10px; margin-bottom: 10px; }
        .quote-item { 
          background: rgba(224, 176, 255, 0.08); border-left: 3px solid #E0B0FF; 
          padding: 12px 16px; border-radius: 0 12px 12px 0; 
          font-family: 'Playfair Display', serif; font-size: 1.05rem; 
          color: #FFF3E0; font-style: italic; font-weight: 600;
        }

        .indicators-list { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .ind-tag { font-size: 0.75rem; font-weight: 700; color: #1A0B2E; background: #E0B0FF; padding: 5px 12px; border-radius: 8px; }
        
        .power-node { display: flex; flex-direction: column; gap: 15px; }
        .power-ruler { background: linear-gradient(135deg, rgba(255, 179, 71, 0.1) 0%, rgba(224, 176, 255, 0.05) 100%); padding: 16px; border-radius: 14px; border: 1px solid rgba(255, 179, 71, 0.2); text-align: center; }
        .power-winner { font-family: 'Playfair Display', serif; font-size: 1.5rem; color: #FFB347; margin-top: 5px; font-weight: 700; }
        .risk-alert { background: rgba(255, 111, 97, 0.1); border: 1px solid rgba(255, 111, 97, 0.3); padding: 12px; border-radius: 10px; font-size: 0.85rem; font-weight: 600; color: #FF6F61; text-align: center; }
        
        .heuristic-prob { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.08); }
        .prob-text { font-family: 'Inter', sans-serif; font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.5); }
        .highlight .prob-text { color: #E0B0FF; }

        .template-box { background: rgba(0,0,0,0.3); padding: 18px; border-radius: 14px; border: 1px solid rgba(224, 176, 255, 0.3); font-family: 'Inter', sans-serif; color: #E0B0FF; font-size: 1rem; font-weight: 500; line-height: 1.5; position: relative; }
        
        .signals-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 12px; }
        .sig-item { padding: 14px; border-radius: 12px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); }
        .sig-label { font-size: 0.7rem; font-weight: 800; display: block; margin-bottom: 6px; letter-spacing: 0.05em; text-transform: uppercase; }
        .pos .sig-label { color: #E0B0FF; }
        .neg .sig-label { color: #FF6F61; }
        .sig-item p { font-size: 0.85rem !important; line-height: 1.4 !important; color: rgba(255,255,255,0.7) !important; }

        .paywall-cta-v36 { text-align: center; margin-top: 20px; }
        .unlock-btn-v36 { 
          width: 100%; padding: 22px; border-radius: 60px; 
          background: linear-gradient(135deg, #E0B0FF 0%, #FFB347 100%); 
          border: none; color: #1A0B2E; font-family: 'Inter', sans-serif;
          font-size: 1.2rem; font-weight: 800; letter-spacing: 0.05em;
          cursor: pointer; box-shadow: 0 10px 30px rgba(224, 176, 255, 0.25);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .unlock-btn-v36:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(224, 176, 255, 0.35); }
        .unlock-btn-v36:active { transform: scale(0.98); }
        .paywall-sub { font-size: 0.85rem; color: rgba(255,255,255,0.4); font-weight: 500; margin-top: 15px; }

        .final-actions-v36 { text-align: center; margin-top: 20px; }
        .download-btn-v36 { background: transparent; border: 1px solid rgba(255,255,255,0.1); padding: 18px; border-radius: 60px; color: rgba(255,255,255,0.5); font-weight: 600; cursor: pointer; width: 100%; }
        .download-btn-v36.tiktok-style {
          background: rgba(26, 15, 46, 0.8); color: #E0B0FF; border: 1px solid rgba(224, 176, 255, 0.3); font-family: 'Inter', sans-serif;
          font-size: 1.05rem; backdrop-filter: blur(10px); transition: all 0.3s;
        }
        .download-btn-v36.tiktok-style:hover { background: rgba(224, 176, 255, 0.1); transform: translateY(-3px); }

        .social-toast {
          position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
          background: rgba(26, 15, 46, 0.95); border: 1px solid rgba(224, 176, 255, 0.2);
          padding: 14px 26px; border-radius: 50px; font-size: 0.9rem; font-weight: 600;
          color: #FFF3E0; box-shadow: 0 15px 40px rgba(0,0,0,0.6);
          backdrop-filter: blur(10px);
          animation: slideUp 0.6s cubic-bezier(0.2, 1, 0.3, 1); z-index: 100;
        }
        @keyframes slideUp { from { transform: translate(-50%, 50px); opacity: 0; } to { transform: translate(-50%, 0); opacity: 1; } }
      `}</style>
    </div>
  );
}
