'use client';

import { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import ShareableTicket from './ShareableTicket';

export default function ResultPaywall({ onCheckout, aiResult, forcedUnlocked = false, createdAt = null }) {
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(forcedUnlocked);
  const [showProgressBars, setShowProgressBars] = useState(false);
  const [showSocialProof, setShowSocialProof] = useState(false);
  const [countdown, setCountdown] = useState(600); // 10 min = 600s

  // Sync forcedUnlocked if it changes (e.g. from an API fetch)
  useEffect(() => {
    if (forcedUnlocked) setIsUnlocked(true);
  }, [forcedUnlocked]);

  // TESTING MODE: Set to true to auto-unlock without payment
  const TEST_MODE = false; 

  const [targetName, setTargetName] = useState('Sujeto Anónimo');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('targetName');
      if (saved) setTargetName(saved);
    }
    const timer = setTimeout(() => setShowProgressBars(true), 500);
    return () => clearTimeout(timer);
  }, []);

  // Urgency countdown (10 min)
  useEffect(() => {
    // Sync countdown with real createdAt time if available
    const effectiveCreatedAt = createdAt || aiResult?.createdAt;
    if (effectiveCreatedAt) {
      const createdTime = new Date(effectiveCreatedAt).getTime();
      const now = Date.now();
      const diffInSeconds = Math.floor((now - createdTime) / 1000);
      const remaining = Math.max(0, 600 - diffInSeconds);
      setCountdown(remaining);
    }
  }, [createdAt, aiResult?.createdAt]);

  useEffect(() => {
    if (isUnlocked) return;
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 0) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isUnlocked]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const handleShare = async () => {
    const score = aiResult?.metricas_binarias?.[0]?.valor || '??';
    const verdict = aiResult?.veredicto_shock || 'Sin veredicto';
    const icon = aiResult?.verdict_icon || '🚩';
    const shareText = `${icon} Mi RedFlag Score: ${score}% — "${verdict}"\n\nAnaliza tu crush gratis → redflagscanner.xyz 🔍`;
    
    if (navigator.share) {
      try {
        await navigator.share({ text: shareText });
      } catch (e) { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('¡Copiado al portapapeles!');
    }
  };

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
                {aiResult?.verdict_icon || '🚩'}
              </div>
              <h2 className="veredicto-shock-v36 terminal-title">
                {aiResult?.shock_verdict || 'ANÁLISIS COMPLETADO'}
              </h2>
              <p className="roast-text terminal-text">{aiResult?.roast_personalizado}</p>
            </div>

            <div className="meme-metrics-grid">
              {/* Toxic Meter */}
              <div className="gauge-card toxic">
                <div className="gauge-header">TOXIC_METER</div>
                <div className="gauge-visual">
                  <div className="speedometer">
                    <div className="needle" style={{ transform: `rotate(${(aiResult?.meme_metrics?.toxic_meter || 0) * 1.8 - 90}deg)` }} />
                    <div className="gauge-value terminal-title">{aiResult?.meme_metrics?.toxic_meter || 0}%</div>
                  </div>
                </div>
              </div>

              {/* Ghosting Risk */}
              <div className="gauge-card ghosting">
                <div className="gauge-header">GHOSTING_RISK</div>
                <div className="gauge-visual">
                  <div className="speedometer">
                    <div className="needle" style={{ transform: `rotate(${(aiResult?.meme_metrics?.ghosting_risk || 0) * 1.8 - 90}deg)`, background: 'var(--accent-amber)' }} />
                    <div className="gauge-value terminal-title">{aiResult?.meme_metrics?.ghosting_risk || 0}%</div>
                  </div>
                </div>
              </div>

              {/* Simp Meter - Comparison */}
              <div className="gauge-card simp full-width">
                <div className="gauge-header">SIMP_O_METER</div>
                <div className="simp-bars">
                  <div className="simp-bar-row">
                    <span className="simp-label">TÚ</span>
                    <div className="simp-track"><div className="simp-fill user" style={{ width: `${aiResult?.meme_metrics?.simp_meter || 0}%` }} /></div>
                  </div>
                  <div className="simp-bar-row">
                    <span className="simp-label uppercase">{targetName.slice(0, 8)}</span>
                    <div className="simp-track"><div className="simp-fill target" style={{ width: `${100 - (aiResult?.meme_metrics?.simp_meter || 0)}%` }} /></div>
                  </div>
                </div>
                <div className="simp-status terminal-text">
                  {aiResult?.meme_metrics?.simp_meter > 50 ? 'NIVEL: SIMP LEGENDARIO' : 'NIVEL: BAJO CONTROL'}
                </div>
              </div>
            </div>

            <div className={`dinamica-center-v36 ${aiResult?.analisis_detallado?.quien_manda ? 'has-power-info' : ''}`}>
              <div className="power-balance-badge terminal-text">
                DOMINANCIA: {aiResult?.analisis_detallado?.quien_manda || 'SIMETRÍA'}
              </div>
              <div className="dinamica-row">
                <span className="dinamica-label terminal-text">VÍNCULO:</span>
                <span className="dinamica-badge terminal-text">{aiResult?.analisis_detallado?.dinamica || 'SOSPECHOSO'}</span>
              </div>
            </div>

            {!isUnlocked && aiResult?.lite_verdict && (
              <div className="lite-ticket-v36">
                <div className="lite-header terminal-text">--- {aiResult.lite_verdict.titulo} ---</div>
                <p className="lite-resumen terminal-text">{aiResult.lite_verdict.resumen}</p>
                <div className="lite-footer terminal-text">PAGO REQUERIDO PARA REVELAR PRUEBAS</div>
              </div>
            )}

            <div className="viral-punchline-v41">
              <p className="punchline-text">"{aiResult?.mensaje_viral || 'El que más escribe siempre es el que menos poder tiene.'}"</p>
              <div className="tiktok-tag">DARK ARCHIVE | OFFICIAL DOSSIER</div>
            </div>

          </div>
        </div>

        {/* SECCIÓN 2: PAYWALL & STRATEGY */}
        <div className="strategy-sequence-v36">
          <div className="divider-strategy">
            <span>✨ LECTURA PROFUNDA</span>
          </div>

          <div className="insights-grid-v36">
             {/* Bloque 1: The Receipts (PRUEBAS) */}
             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">💀</span>
                 <h3 className="terminal-title">The Receipts</h3>
               </div>
               <div className="i-content-v36">
                  {isUnlocked ? (
                    <div className="intelligence-node">
                      {aiResult?.analisis_detallado?.the_receipts?.map((receipt, i) => (
                        <div key={i} className="receipt-item">
                          <div className="quote-item">“{receipt.mensaje}”</div>
                          <p className="ev-text terminal-text">↳ {receipt.explicacion}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="terminal-text">Identificando patrones de manipulación y desinterés...</p>
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
              {countdown > 0 && (
                <div className="urgency-timer">
                  <span className="timer-icon">⏳</span>
                  <span>Tu análisis se eliminará en <strong>{formatTime(countdown)}</strong></span>
                </div>
              )}
              {countdown <= 0 && (
                <div className="urgency-timer expired">
                  <span className="timer-icon">⚠️</span>
                  <span>Tu análisis está a punto de expirar</span>
                </div>
              )}
              <button 
                className={`unlock-btn-v36 ${loading ? 'loading' : ''}`}
                onClick={handleCheckoutClick}
                disabled={loading}
              >
                {loading ? "Procesando pago..." : "Revelar Análisis Completo — $2.99 USD"}
              </button>
              <p className="paywall-sub">Pago único · Acceso inmediato · Dossier generado por IA</p>
            </div>
          )}

          {/* Viral Share Button */}
          <div className="share-section">
            <button className="share-btn" onClick={handleShare}>
              🚩 Compartir mi RedFlag Score
            </button>
          </div>
        </div>



        <ShareableTicket 
          name={targetName}
          reportId={aiResult?.case_id}
          verdictIcon={aiResult?.verdict_icon}
          shock_verdict={aiResult?.shock_verdict}
          meme_metrics={aiResult?.meme_metrics}
          dinamica={aiResult?.analisis_detallado?.dinamica}
          quien_manda={aiResult?.analisis_detallado?.quien_manda}
          mensaje_viral={aiResult?.mensaje_viral}
        />
      </div>



      <style jsx>{`
        .result-container {
          min-height: 100vh; width: 100vw; background: #050505; color: white;
          padding: 20px 15px; font-family: var(--font-body);
          position: relative; overflow-x: hidden;
        }
        .content-max { position: relative; z-index: 10; width: 100%; max-width: 480px; margin: 0 auto; display: flex; flex-direction: column; gap: 40px; }
        
        .report-container-v36 {
          background: rgba(0, 0, 0, 0.9);
          border-radius: 4px;
          padding-bottom: 20px;
          width: 100%;
          border: 1px solid rgba(255, 45, 85, 0.2);
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 50px rgba(0,0,0,1);
        }

        .report-container-v36::before {
          content: ""; position: absolute; top: 0; left: 0; width: 100%; height: 2px;
          background: linear-gradient(90deg, transparent, var(--accent-red), transparent);
          animation: scanline 4s linear infinite;
        }

        @keyframes scanline {
          0% { top: 0; }
          100% { top: 100%; }
        }

        .hud-overlay {
          position: absolute; top: 0; left: 0; width: 100%; height: 100%;
          pointer-events: none; z-index: 2; padding: 20px; opacity: 0.5;
        }
        .hud-id { position: absolute; top: 18px; left: 22px; font-size: 0.6rem; font-family: var(--font-terminal); color: var(--accent-red); }
        .hud-status { position: absolute; top: 18px; right: 22px; font-size: 0.6rem; font-family: var(--font-terminal); color: var(--accent-amber); }

        .shareable-zone-v36 { padding: 50px 20px 30px; position: relative; z-index: 5; }

        .veredicto-shock-wrapper { margin-bottom: 40px; text-align: center; }
        .verdict-icon-massive { font-size: 4rem; margin-bottom: 10px; filter: drop-shadow(0 0 20px var(--accent-red-glow)); }
        .veredicto-shock-v36 { font-size: 3rem; color: var(--accent-red); margin-bottom: 10px; }
        .roast-text { font-size: 0.95rem; color: rgba(255,255,255,0.7); max-width: 300px; margin: 0 auto; line-height: 1.4; }

        .meme-metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
        .gauge-card { 
          background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); 
          border-radius: 8px; padding: 15px; text-align: center;
        }
        .gauge-header { font-family: var(--font-terminal); font-size: 0.6rem; color: rgba(255,255,255,0.4); margin-bottom: 15px; letter-spacing: 0.1em; }
        
        .speedometer { position: relative; width: 80px; height: 40px; margin: 0 auto; overflow: hidden; }
        .speedometer::before {
          content: ""; position: absolute; top: 0; left: 0; width: 80px; height: 80px;
          border-radius: 50%; border: 8px solid rgba(255, 45, 85, 0.1);
          border-bottom-color: transparent; border-left-color: transparent;
          transform: rotate(-135deg);
        }
        .needle {
          position: absolute; bottom: 0; left: 50%; width: 2px; height: 35px;
          background: var(--accent-red); transform-origin: bottom center;
          transition: transform 1.5s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 10px var(--accent-red);
        }
        .gauge-value { font-size: 1.2rem; color: white; margin-top: 10px; }

        .simp-bars { display: flex; flex-direction: column; gap: 10px; }
        .simp-bar-row { display: flex; align-items: center; gap: 10px; }
        .simp-label { font-size: 0.6rem; color: rgba(255,255,255,0.5); width: 30px; text-align: left; }
        .simp-track { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
        .simp-fill { height: 100%; transition: width 2s ease; }
        .simp-fill.user { background: var(--accent-red); box-shadow: 0 0 10px var(--accent-red-glow); }
        .simp-fill.target { background: var(--accent-amber); box-shadow: 0 0 10px rgba(255, 179, 71, 0.3); }

        .simp-status { font-size: 0.6rem; color: var(--accent-red); margin-top: 10px; opacity: 0.8; letter-spacing: 0.1em; }
        .gauge-card.full-width { grid-column: span 2; }

        .lite-ticket-v36 {
          background: rgba(255, 45, 85, 0.05); border: 1px dashed var(--accent-red);
          padding: 20px; text-align: center; margin-bottom: 30px; border-radius: 4px;
        }
        .lite-header { font-size: 0.7rem; color: var(--accent-red); margin-bottom: 10px; font-weight: 700; }
        .lite-resumen { font-size: 0.9rem; color: white; margin-bottom: 15px; font-style: italic; }
        .lite-footer { font-size: 0.6rem; color: rgba(255,255,255,0.4); }

        .dinamica-center-v36 { margin-bottom: 30px; text-align: center; }
        .power-balance-badge { font-size: 0.7rem; color: var(--accent-amber); background: rgba(255, 179, 71, 0.1); padding: 5px 15px; border-radius: 2px; border: 1px solid rgba(255, 179, 71, 0.2); display: inline-block; margin-bottom: 15px; }
        .dinamica-row { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .dinamica-label { font-size: 0.75rem; color: rgba(255,255,255,0.4); }
        .dinamica-badge { font-size: 0.85rem; color: white; }

        .insight-card-v36 { background: rgba(0, 0, 0, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 4px; padding: 20px; margin-bottom: 15px; }
        .i-header-v36 { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; }
        .i-icon-v36 { font-size: 1.2rem; }
        .i-header-v36 h3 { font-size: 0.9rem; color: var(--accent-red); }
        
        .receipt-item { margin-bottom: 20px; border-left: 2px solid rgba(255, 45, 85, 0.3); padding-left: 15px; }
        .quote-item { font-family: var(--font-terminal); font-size: 0.95rem; color: white; font-style: italic; margin-bottom: 8px; }
        .ev-text { font-size: 0.8rem; color: rgba(255,255,255,0.5); line-height: 1.4; }

        .tactical-node { display: flex; flex-direction: column; gap: 15px; }
        .t-label { font-size: 0.65rem; color: var(--accent-amber); margin-bottom: 8px; display: block; }
        .main-conc { font-size: 1rem; color: white; margin-bottom: 10px; line-height: 1.5; }
        .template-box { background: rgba(255, 45, 85, 0.05); border: 1px dashed rgba(255, 45, 85, 0.3); padding: 15px; border-radius: 4px; color: var(--accent-red); font-size: 0.95rem; line-height: 1.5; }

        .blur-overlay { position: absolute; inset: 0; background: linear-gradient(transparent 20%, #050505 90%); pointer-events: none; }
        .locked .i-content-v36 p { filter: blur(8px); opacity: 0.5; }

        .paywall-cta-v36 { margin-top: 30px; text-align: center; }
        .unlock-btn-v36 { 
          width: 100%; padding: 20px; background: var(--accent-red); border: none; color: black; 
          font-family: var(--font-terminal); font-size: 1.1rem; font-weight: 700; cursor: pointer;
          transition: all 0.2s; box-shadow: 0 0 30px var(--accent-red-glow);
        }
        .unlock-btn-v36:hover { transform: scale(1.02); box-shadow: 0 0 50px var(--accent-red-glow); }

        .urgency-timer { font-family: var(--font-terminal); font-size: 0.75rem; color: var(--accent-red); margin-bottom: 20px; animation: blink 1s infinite; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .share-btn { 
          width: 100%; background: transparent; border: 1px solid rgba(255,255,255,0.1); 
          color: rgba(255,255,255,0.6); padding: 15px; font-family: var(--font-terminal);
          font-size: 0.8rem; cursor: pointer; transition: all 0.2s;
        }
        .share-btn:hover { border-color: white; color: white; }
      `}</style>
    </div>
  );
}
