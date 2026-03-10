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
  const [localStats, setLocalStats] = useState(null);

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
      
      const stats = localStorage.getItem('rf_local_stats');
      if (stats) setLocalStats(JSON.parse(stats));
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
    const element = document.getElementById('shareable-ticket-capture');
    if (!element) return;
    setDownloading(true);
    
    try {
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#050505' });
      
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `redflag-${targetName}.png`, { type: 'image/png' });
        
        const shareText = `${aiResult?.verdict_icon || '🚩'} Mi RedFlag Score: ${aiResult?.meme_metrics?.toxic_meter || '??'}% — "${aiResult?.shock_verdict || 'Sin veredicto'}"\n\nAnaliza tu crush gratis → redflagscanner.xyz 🔍`;

        // Check if Web Share API with files is supported
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              text: shareText,
              files: [file]
            });
          } catch (e) {
            // User cancelled or share failed, fallback to direct download just in case
            console.log('Share cancelled or failed, falling back to download');
            fallbackDownload(canvas);
          }
        } else {
          // Fallback to direct download
          fallbackDownload(canvas);
        }
        setDownloading(false);
      }, 'image/png');
    } catch (err) {
      console.error('Image generation error:', err);
      setDownloading(false);
    }
  };

  const fallbackDownload = (canvas) => {
    const image = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = image;
    link.download = `redflag-viral-${targetName}.png`;
    link.click();
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

              {/* Simp Meter - Comparison (Now Real Stats) */}
              <div className="gauge-card simp full-width">
                <div className="gauge-header">SIMP_O_METER (VOLUMEN REAL)</div>
                <div className="simp-bars">
                  {localStats ? (
                    <>
                      <div className="simp-bar-row">
                        <span className="simp-label uppercase">{localStats.users[0].name.slice(0, 10)}</span>
                        <div className="simp-track"><div className="simp-fill user" style={{ width: `${localStats.simpScoreBase[localStats.users[0].name]}%` }} /></div>
                        <span className="simp-count">{localStats.users[0].count} msgs</span>
                      </div>
                      <div className="simp-bar-row">
                        <span className="simp-label uppercase">{localStats.users[1].name.slice(0, 10)}</span>
                        <div className="simp-track"><div className="simp-fill target" style={{ width: `${localStats.simpScoreBase[localStats.users[1].name]}%` }} /></div>
                        <span className="simp-count">{localStats.users[1].count} msgs</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="simp-bar-row">
                        <span className="simp-label">TÚ</span>
                        <div className="simp-track"><div className="simp-fill user" style={{ width: `${aiResult?.meme_metrics?.simp_meter || 0}%` }} /></div>
                      </div>
                      <div className="simp-bar-row">
                        <span className="simp-label uppercase">{targetName.slice(0, 8)}</span>
                        <div className="simp-track"><div className="simp-fill target" style={{ width: `${100 - (aiResult?.meme_metrics?.simp_meter || 0)}%` }} /></div>
                      </div>
                    </>
                  )}
                </div>
                <div className="simp-status terminal-text">
                  {localStats 
                    ? `MÁS INTENSO: ${(localStats.mostTalkative).toUpperCase()}` 
                    : (aiResult?.meme_metrics?.simp_meter > 50 ? 'NIVEL: SIMP LEGENDARIO' : 'NIVEL: BAJO CONTROL')}
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

          <div className="share-section" style={{ marginBottom: '20px', textAlign: 'center' }}>
            <button className="share-btn" onClick={handleShare} disabled={downloading}>
              {downloading ? "Generando Imagen Penal..." : (isUnlocked ? "🚀 Compartir Reporte Táctico" : "🚩 Compartir Warning Ticket (Lite)")}
            </button>
          </div>

        {/* SECCIÓN 2: PAYWALL & STRATEGY */}
        <div className="strategy-sequence-v36">
          <div className="divider-strategy">
            <span className="terminal-title">✨ ANÁLISIS TÁCTICO (ELIMINACIÓN: 10m)</span>
          </div>

          <div className="insights-grid-v36">
             {/* Bloque 1: The Receipts (PRUEBAS) */}
             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">💀</span>
                 <h3 className="terminal-title">LAS PRUEBAS (Evidencia)</h3>
               </div>
               <div className="i-content-v36">
                  {isUnlocked ? (
                    <div className="intelligence-node">
                      {aiResult?.analisis_detallado?.the_receipts?.map((receipt, i) => (
                        <div key={i} className="receipt-item-v62">
                          <div className="receipt-meta">
                             <span className="t-label">TÁCTICA: {receipt.tactica || 'N/A'}</span>
                          </div>
                          <div className="quote-item">“{receipt.mensaje}”</div>
                          <div className="translation-box">
                             <span className="t-label">TRADUCCIÓN REAL:</span>
                             <p className="terminal-text">{receipt.traduccion_real}</p>
                          </div>
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

             {/* Bloque 2: Perfil Psicológico (Arquetipo) */}
             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">👤</span>
                 <h3>EL PERFIL (Arquetipo)</h3>
               </div>
               <div className="i-content-v36">
                  {isUnlocked ? (
                    <div className="intelligence-node arquetipo-v62">
                      <h4 className="terminal-title">{aiResult?.analisis_detallado?.persona?.arquetipo}</h4>
                      <p className="terminal-text">{aiResult?.analisis_detallado?.persona?.descripcion}</p>
                    </div>
                  ) : (
                    <p>Clasificando perfil psicológico en arquetipos virales...</p>
                  )}
                  {!isUnlocked && <div className="blur-overlay" />}
               </div>
             </div>

             {/* Bloque 3: PBI (Power Balance Index) */}
             <div className={`insight-card-v36 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">⚖️</span>
                 <h3>Power Balance Index (PBI)</h3>
               </div>
               <div className="i-content-v36">
                  {isUnlocked ? (
                    <div className="pbi-dashboard-v62">
                      <div className="pbi-formula terminal-text">
                        PBI = (Σ L𝐭 * E𝐭) / (Σ L𝐬 * E𝐬)
                      </div>
                      <div className="pbi-result">
                         <span className="res-label terminal-text">RESULTADO CLÍNICO:</span>
                         <div className="res-value terminal-title">{aiResult?.meme_metrics?.pbi || '1.0'}</div>
                      </div>
                      <p className="pbi-verdict terminal-text">
                        {aiResult?.meme_metrics?.pbi > 1.5 ? 'ESTADO: SUBORDINACIÓN EMOCIONAL' : 
                         aiResult?.meme_metrics?.pbi < 0.8 ? 'ESTADO: CONTROL ESTRATÉGICO' : 'ESTADO: BALANCE INESTABLE'}
                      </p>
                      
                      <div className="pbi-legend terminal-text">
                        <div className="legend-item"><span className="l-color warning"></span> <strong>&gt; 1.5</strong> : Subordinación (Esfuerzo Asimétrico)</div>
                        <div className="legend-item"><span className="l-color neutral"></span> <strong>0.8 - 1.5</strong> : Simetría / Balance Inestable</div>
                        <div className="legend-item"><span className="l-color safe"></span> <strong>&lt; 0.8</strong> : Control Estratégico (Dominancia)</div>
                        <p className="pbi-explainer">
                          El índice mide quién invierte más energía (longitud de mensajes y velocidad de respuesta). 
                          Valores altos indican que tú estás persiguiendo la validación.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="pbi-tease-v63">
                      <p className="terminal-text">Calculando asimetría de mensajes y tiempos...</p>
                      <div className="blurred-chart-v63">
                        <div className="chart-bar-v63" style={{ width: '40%' }}></div>
                        <div className="chart-bar-v63" style={{ width: '85%', background: 'var(--accent-red)' }}></div>
                        <div className="pbi-value-blur">1.XX</div>
                      </div>
                    </div>
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

             {/* Bloque 5: La Jugada Maestra (Tactical) */}
             <div className={`insight-card-v36 tactical-card-v62 ${isUnlocked ? 'unlocked' : 'locked'}`}>
               <div className="i-header-v36">
                 <span className="i-icon-v36">🕹️</span>
                 <h3>La Jugada Maestra</h3>
               </div>
               <div className="i-content-v36">
                  {isUnlocked ? (
                    <div className="tactical-node-v62">
                      <div className="msg-template">
                        <span className="t-label">RESPUESTA DE CONTROL:</span>
                        <div className="template-box-v62">
                          {aiResult?.estrategia_venganza?.respuesta_control}
                        </div>
                      </div>
                      <div className="nuclear-box">
                        <span className="t-label">OPCIÓN NUCLEAR (BLOQUEO):</span>
                        <p className="terminal-text">{aiResult?.estrategia_venganza?.opcion_nuclear}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="tactical-tease-v63">
                      <p className="terminal-text">Diseñando respuesta asimétrica y plan de salida...</p>
                      <div className="blurred-template-v63">
                        "Oye, me parece que [CENSURADO]. No voy a [BORROSO]..."
                      </div>
                    </div>
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
          isUnlocked={isUnlocked}
        />

        {/* Global Footer moved to the bottom */}
        <div className="hero-footer" style={{ margin: '60px auto 40px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '40px' }}>
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

        .strategy-sequence-v36 {
          background: rgba(255, 255, 255, 0.02);
          padding: 30px 15px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.03);
          margin-top: 20px;
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

        .veredicto-shock-wrapper { margin-bottom: 50px; text-align: center; }
        .verdict-icon-massive { font-size: 5rem; margin-bottom: 20px; filter: drop-shadow(0 0 20px var(--accent-red-glow)); }
        .veredicto-shock-v36 { font-size: 3.5rem; color: var(--accent-red); margin-bottom: 15px; letter-spacing: -0.02em; }
        .roast-text { font-size: 1.05rem; color: rgba(255,255,255,0.7); max-width: 380px; margin: 0 auto; line-height: 1.5; }

        .meme-metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 40px; }
        .gauge-card { 
          background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); 
          border-radius: 12px; padding: 25px 15px; text-align: center;
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
        .simp-label { font-size: 0.6rem; color: rgba(255,255,255,0.5); width: 50px; text-align: left; }
        .simp-count { font-size: 0.6rem; color: rgba(255,255,255,0.3); width: 40px; text-align: right; font-family: var(--font-terminal); }
        .simp-track { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
        .simp-fill { height: 100%; transition: width 2s ease; }
        .simp-fill.user { background: var(--accent-red); box-shadow: 0 0 10px var(--accent-red-glow); }
        .simp-fill.target { background: var(--accent-amber); box-shadow: 0 0 10px rgba(255, 179, 71, 0.3); }

        .simp-status { font-size: 0.6rem; color: var(--accent-red); margin-top: 10px; opacity: 0.8; letter-spacing: 0.1em; }
        .gauge-card.full-width { grid-column: span 2; }

        .lite-ticket-v36 {
          background: rgba(255, 45, 85, 0.05); border: 1px dashed rgba(255, 45, 85, 0.4);
          padding: 30px 20px; text-align: center; margin: 40px 0; border-radius: 8px;
        }
        .lite-header { font-size: 0.85rem; color: var(--accent-red); margin-bottom: 20px; font-weight: 800; letter-spacing: 0.1em; }
        .lite-resumen { font-size: 1.1rem; color: white; margin-bottom: 25px; font-style: italic; line-height: 1.6; padding: 0 15px; }
        .lite-footer { font-size: 0.7rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.05em; }

        .hero-footer { width: 100%; max-width: 600px; margin: 0 auto; text-align: center; }
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
        }
        .footer-contact { font-family: var(--font-terminal); opacity: 0.5; }
        
        .paywall-cta-v36 { margin-top: 50px; text-align: center; padding: 0 10px; }
        .paywall-sub { font-size: 0.8rem; color: rgba(255,255,255,0.5); line-height: 1.5; margin-top: 25px; }
        .power-balance-badge { font-size: 0.7rem; color: var(--accent-amber); background: rgba(255, 179, 71, 0.1); padding: 5px 15px; border-radius: 2px; border: 1px solid rgba(255, 179, 71, 0.2); display: inline-block; margin-bottom: 15px; }
        .dinamica-row { display: flex; align-items: center; justify-content: center; gap: 10px; }
        .dinamica-label { font-size: 0.75rem; color: rgba(255,255,255,0.4); }
        .dinamica-badge { font-size: 0.85rem; color: white; }

        .insight-card-v36 { 
          background: rgba(15, 15, 15, 0.9); 
          border: 1px solid rgba(255, 255, 255, 0.1); 
          border-radius: 12px; padding: 30px 25px; margin-bottom: 30px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        }
        .i-header-v36 { display: flex; align-items: center; gap: 15px; margin-bottom: 25px; border-bottom: 1px solid rgba(255, 255, 255, 0.05); padding-bottom: 20px; }
        .i-icon-v36 { font-size: 1.5rem; filter: drop-shadow(0 0 5px var(--accent-red-glow)); }
        .i-header-v36 h3 { font-size: 1.1rem; color: #fff; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 800; }

        .receipt-item-v62 { margin-bottom: 25px; border-left: 2px solid var(--accent-red); padding-left: 15px; }
        .receipt-meta { margin-bottom: 10px; }
        .translation-box { background: rgba(255, 255, 255, 0.05); padding: 12px; border-radius: 4px; margin: 10px 0; border-left: 2px solid var(--accent-amber); }
        .translation-box p { font-style: italic; color: var(--accent-amber); font-size: 0.95rem; line-height: 1.4; }

        .arquetipo-v62 h4 { color: var(--accent-red); font-size: 1.3rem; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.1em; }
        
        .pbi-dashboard-v62 { text-align: center; padding: 10px 0; }
        .pbi-formula { font-size: 0.65rem; color: rgba(255,255,255,0.4); margin-bottom: 15px; font-family: var(--font-terminal); }
        .pbi-result { display: flex; flex-direction: column; align-items: center; gap: 5px; margin-bottom: 15px; }
        .res-label { font-size: 0.6rem; opacity: 0.6; font-family: var(--font-terminal); text-transform: uppercase; }
        .res-value { font-size: 3.5rem; color: var(--accent-red); text-shadow: 0 0 25px var(--accent-red-glow); font-family: var(--font-terminal); font-weight: 900; }
        .pbi-verdict { font-size: 0.75rem; font-weight: 900; color: var(--accent-amber); letter-spacing: 0.1em; font-family: var(--font-terminal); margin-bottom: 25px; }

        .pbi-legend {
          padding-top: 20px;
          border-top: 1px dashed rgba(255,255,255,0.1);
          text-align: left;
          font-size: 0.7rem;
          color: rgba(255,255,255,0.7);
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: rgba(0,0,0,0.2);
          padding: 20px;
          border-radius: 8px;
        }
        .legend-item { display: flex; align-items: center; gap: 10px; }
        .legend-item strong { color: white; width: 65px; display: inline-block; font-size: 0.75rem; }
        .l-color { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .l-color.warning { background: var(--accent-red); box-shadow: 0 0 5px var(--accent-red-glow); }
        .l-color.neutral { background: var(--accent-amber); opacity: 0.8; }
        .l-color.safe { background: #E0B0FF; opacity: 0.8; }
        .pbi-explainer { margin-top: 10px; font-size: 0.65rem; line-height: 1.5; color: rgba(255,255,255,0.4); font-style: italic; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 10px; }

        .tactical-node-v62 { display: flex; flex-direction: column; gap: 20px; }
        .template-box-v62 { 
          background: rgba(255, 45, 85, 0.12); border: 1px solid var(--accent-red); 
          padding: 18px; border-radius: 4px; color: #fff; font-size: 1.15rem; 
          line-height: 1.5; font-family: var(--font-terminal); box-shadow: inset 0 0 15px rgba(255, 45, 85, 0.1);
        }
        .nuclear-box { border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px; }

        .t-label { font-size: 0.65rem; color: var(--accent-amber); margin-bottom: 8px; display: block; font-family: var(--font-terminal); text-transform: uppercase; font-weight: 800; }
        .quote-item { font-family: var(--font-terminal); font-size: 1rem; color: #fff; font-style: italic; margin-bottom: 8px; }
        .ev-text { font-size: 0.9rem; color: rgba(255,255,255,0.6); line-height: 1.5; }

        .blur-overlay { 
          position: absolute; inset: 0; 
          background: linear-gradient(rgba(5,5,5,0) 10%, rgba(5,5,5,0.85) 60%, #050505 100%); 
          pointer-events: none; z-index: 10;
        }
        .locked .i-content-v36 p, .locked .i-content-v36 div { filter: blur(12px); opacity: 0.2; }

        .pbi-tease-v63 { padding: 10px 0; }
        .blurred-chart-v63 { 
          height: 60px; display: flex; align-items: flex-end; gap: 10px; margin-top: 15px;
          filter: blur(5px); opacity: 0.3; justify-content: center; position: relative;
        }
        .chart-bar-v63 { width: 20px; height: 100%; background: rgba(255,255,255,0.2); border-radius: 2px; }
        .pbi-value-blur { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 1.5rem; font-weight: 900; }

        .tactical-tease-v63 { margin-top: 10px; }
        .blurred-template-v63 { 
          background: rgba(255,255,255,0.03); padding: 15px; border-radius: 4px;
          filter: blur(6px); opacity: 0.2; font-family: var(--font-terminal);
          border: 1px dashed rgba(255,255,255,0.1); font-size: 0.9rem;
        }

        .share-btn.download-btn { background: rgba(255, 179, 71, 0.05); border: 1px solid var(--accent-amber); color: var(--accent-amber); margin-top: 15px; }
        .share-btn.download-btn:hover { background: var(--accent-amber); color: #000; transform: translateY(-2px); }
        .unlock-btn-v36 { 
          width: 100%; padding: 22px; background: var(--accent-red); border: none; color: black; 
          font-family: var(--font-terminal); font-size: 1.15rem; font-weight: 800; cursor: pointer;
          transition: all 0.2s; box-shadow: 0 0 30px var(--accent-red-glow);
          border-radius: 8px; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .unlock-btn-v36:hover { transform: scale(1.02); box-shadow: 0 0 50px var(--accent-red-glow); }

        .urgency-timer { font-family: var(--font-terminal); font-size: 0.9rem; color: var(--accent-red); margin-bottom: 30px; animation: blink 1s infinite; font-weight: 700; }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

        .share-btn { 
          width: 100%; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.2); 
          color: white; padding: 18px; font-family: var(--font-terminal);
          font-size: 0.95rem; cursor: pointer; transition: all 0.2s;
          border-radius: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .share-btn:hover { background: rgba(255, 255, 255, 0.1); border-color: var(--accent-amber); color: var(--accent-amber); transform: translateY(-2px); }
      `}</style>
    </div>
  );
}
