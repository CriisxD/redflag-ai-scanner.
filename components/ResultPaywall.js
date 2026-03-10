'use client';

import { useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';

export default function ResultPaywall({ onCheckout, aiResult, forcedUnlocked = false, createdAt = null }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(forcedUnlocked);
  const [loading, setLoading] = useState(false);
  const [localStats, setLocalStats] = useState(null);
  const [targetName, setTargetName] = useState('Sujeto Anónimo');
  const [animateIn, setAnimateIn] = useState(true);

  const TEST_MODE = false;

  useEffect(() => {
    if (forcedUnlocked) setIsUnlocked(true);
  }, [forcedUnlocked]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('targetName');
      if (saved) setTargetName(saved);
      const stats = localStorage.getItem('rf_local_stats');
      if (stats) {
        try { setLocalStats(JSON.parse(stats)); } catch(e) {}
      }
    }
  }, []);

  // Determine total slides
  const FREE_SLIDES = 5;
  const PAYWALL_SLIDE = 5;
  const PREMIUM_SLIDES_START = 6;
  const totalSlides = isUnlocked ? 10 : 6; // 5 free + paywall, or 5 free + 4 premium

  const goNext = useCallback(() => {
    if (currentSlide === PAYWALL_SLIDE && !isUnlocked) return;
    if (currentSlide < totalSlides - 1) {
      setAnimateIn(false);
      setTimeout(() => {
        setCurrentSlide(prev => prev + 1);
        setAnimateIn(true);
      }, 200);
    }
  }, [currentSlide, totalSlides, isUnlocked]);

  const goPrev = useCallback(() => {
    if (currentSlide > 0) {
      setAnimateIn(false);
      setTimeout(() => {
        setCurrentSlide(prev => prev - 1);
        setAnimateIn(true);
      }, 200);
    }
  }, [currentSlide]);

  const handleCheckoutClick = () => {
    if (TEST_MODE) {
      setIsUnlocked(true);
      return;
    }
    setLoading(true);
    if (onCheckout) onCheckout();
  };

  // --- SLIDE RENDERERS ---

  const renderSlideIntro = () => {
    const total = localStats?.totalMessages || '???';
    return (
      <div className="slide-content slide-intro">
        <div className="intro-icon">🔍</div>
        <h1 className="intro-title">Tu historial con</h1>
        <div className="intro-name">{targetName}</div>
        <h1 className="intro-title">está listo.</h1>
        <div className="intro-stat">
          <span className="stat-number">{total.toLocaleString?.() || total}</span>
          <span className="stat-label">mensajes analizados</span>
        </div>
        <p className="intro-warning">Prepárate. Esto puede doler.</p>
      </div>
    );
  };

  const renderSlideSimpOMeter = () => {
    const u1 = localStats?.users?.[0];
    const u2 = localStats?.users?.[1];
    const u1Pct = localStats?.simpScoreBase?.[u1?.name] || 50;
    const u2Pct = localStats?.simpScoreBase?.[u2?.name] || 50;
    const winner = u1Pct > u2Pct ? u1?.name : u2?.name;

    return (
      <div className="slide-content slide-simp">
        <div className="slide-badge">SIMP-O-METER</div>
        <h2 className="slide-title">¿Quién escribe más?</h2>
        
        <div className="simp-chart">
          <div className="simp-row">
            <span className="simp-name">{u1?.name?.slice(0, 12)}</span>
            <div className="simp-track">
              <div className="simp-fill fill-red" style={{ width: `${u1Pct}%` }}>
                <span className="fill-label">{u1Pct}%</span>
              </div>
            </div>
            <span className="simp-msgs">{u1?.count} msgs</span>
          </div>
          <div className="simp-row">
            <span className="simp-name">{u2?.name?.slice(0, 12)}</span>
            <div className="simp-track">
              <div className="simp-fill fill-amber" style={{ width: `${u2Pct}%` }}>
                <span className="fill-label">{u2Pct}%</span>
              </div>
            </div>
            <span className="simp-msgs">{u2?.count} msgs</span>
          </div>
        </div>

        <div className="simp-verdict">
          <p>Alguien está remando demasiado fuerte en este barco...</p>
          <div className="simp-winner">🚣 {winner} está REMANDO solo/a</div>
        </div>
      </div>
    );
  };

  const renderSlideGhosting = () => {
    const u1 = localStats?.users?.[0];
    const u2 = localStats?.users?.[1];
    const g1 = localStats?.ghostingFactor?.[u1?.name] || '?';
    const g2 = localStats?.ghostingFactor?.[u2?.name] || '?';
    const ghoster = localStats?.ghostingFactor?.worstGhoster;

    return (
      <div className="slide-content slide-ghost">
        <div className="slide-badge ghost-badge">👻 GHOSTING FACTOR</div>
        <h2 className="slide-title">Récord de espera</h2>

        <div className="ghost-comparison">
          <div className="ghost-card">
            <div className="ghost-name">{u1?.name?.slice(0, 12)}</div>
            <div className="ghost-time">{g1}</div>
            <div className="ghost-label">máx. sin responder</div>
          </div>
          <div className="ghost-vs">VS</div>
          <div className="ghost-card">
            <div className="ghost-name">{u2?.name?.slice(0, 12)}</div>
            <div className="ghost-time">{g2}</div>
            <div className="ghost-label">máx. sin responder</div>
          </div>
        </div>

        <div className="ghost-verdict">
          {ghoster === u1?.name
            ? `${u1?.name} tiene el récord de dejar en visto. ¿Prioridad Máxima? Nah.`
            : `${u2?.name} tiene el récord de dejar en visto. Eres su "Opción de Emergencia".`
          }
        </div>
      </div>
    );
  };

  const renderSlideActivity = () => {
    const peak = localStats?.activityData?.peakHour ?? 22;
    const tod = localStats?.activityData?.timeOfDay || 'Noche';
    const dist = localStats?.activityData?.hourlyDistribution || new Array(24).fill(0);
    const maxVal = Math.max(...dist, 1);

    return (
      <div className="slide-content slide-activity">
        <div className="slide-badge activity-badge">🌙 HORARIO DE ACTIVIDAD</div>
        <h2 className="slide-title">¿Es amor o es insomnio?</h2>

        <div className="heatmap-grid">
          {dist.map((val, i) => (
            <div key={i} className="heat-col">
              <div
                className="heat-bar"
                style={{
                  height: `${Math.max(4, (val / maxVal) * 100)}%`,
                  opacity: val === 0 ? 0.1 : 0.3 + (val / maxVal) * 0.7
                }}
              />
              {i % 4 === 0 && <span className="heat-label">{i}h</span>}
            </div>
          ))}
        </div>

        <div className="activity-verdict">
          <div className="peak-badge">Pico: {peak}:00 ({tod})</div>
          <p>{peak >= 0 && peak < 6 
            ? '¿Quién habla a estas horas? O es amor tóxico o nadie más les contesta.' 
            : peak >= 22 
            ? 'Conversaciones nocturnas... el horario favorito de los "¿sigues despierto?" 🌚'
            : 'Al menos no se escriben a las 3AM. Eso es... algo.'
          }</p>
        </div>
      </div>
    );
  };

  const renderSlideEmojis = () => {
    const emojis = localStats?.topEmojis || [];

    return (
      <div className="slide-content slide-emojis">
        <div className="slide-badge emoji-badge">🎭 TOP EMOJIS</div>
        <h2 className="slide-title">Su lenguaje secreto</h2>

        <div className="emoji-showcase">
          {emojis.length > 0 ? emojis.map((e, i) => (
            <div key={i} className="emoji-item">
              <div className="emoji-big">{e.emoji}</div>
              <div className="emoji-count">{e.count}x</div>
              <div className="emoji-rank">#{i + 1}</div>
            </div>
          )) : (
            <div className="emoji-empty">
              <div className="emoji-big">😶</div>
              <p>Ni un emoji. Esta conversación es más seca que el Sahara.</p>
            </div>
          )}
        </div>

        <div className="emoji-verdict">
          {emojis.some(e => ['❤️','😍','🥰','💕','😘'].includes(e.emoji))
            ? 'Hay corazoncitos... pero ¿de quién? Eso lo revela el análisis premium. 👀'
            : emojis.some(e => ['💀','🤡','😭'].includes(e.emoji))
            ? 'Mucho "💀" y poco "❤️". Esto huele a zona de amistad o caos total.'
            : 'Emojis neutrales. La pasión en este chat está en coma inducido.'
          }
        </div>
      </div>
    );
  };

  const renderPaywallSlide = () => (
    <div className="slide-content slide-paywall">
      <div className="paywall-lock">🔒</div>
      <h2 className="paywall-title">ACCESO RESTRINGIDO</h2>
      <p className="paywall-sub">Las estadísticas dicen lo que pasó.</p>
      <p className="paywall-hook">La IA sabe <strong>POR QUÉ</strong> pasó.</p>
      
      <div className="paywall-features">
        <div className="pw-feature">💀 Perfil Psicológico</div>
        <div className="pw-feature">🚩 Red Flags Ocultas</div>
        <div className="pw-feature">🔥 "The Receipts" (Traductor de Subtexto)</div>
        <div className="pw-feature">🕹️ La Jugada Maestra</div>
      </div>

      <button 
        className={`paywall-btn ${loading ? 'loading' : ''}`}
        onClick={handleCheckoutClick}
        disabled={loading}
      >
        {loading ? 'Procesando...' : 'Desbloquear Análisis — $3.99 USD'}
      </button>
      <p className="paywall-disclaimer">Pago único · Acceso inmediato · Generado por IA</p>
    </div>
  );

  // --- PREMIUM SLIDES ---
  const renderSlideArchetype = () => (
    <div className="slide-content slide-archetype">
      <div className="slide-badge premium-badge">👤 PERFIL PSICOLÓGICO</div>
      <div className="archetype-icon">{aiResult?.verdict_icon || '🎭'}</div>
      <h2 className="archetype-title">{aiResult?.analisis_detallado?.persona?.arquetipo || 'Arquetipo Desconocido'}</h2>
      <p className="archetype-desc">{aiResult?.analisis_detallado?.persona?.descripcion}</p>
      <div className="archetype-dynamic">
        <span className="dyn-label">VÍNCULO:</span>
        <span className="dyn-value">{aiResult?.analisis_detallado?.dinamica || '???'}</span>
      </div>
      <div className="archetype-power">
        DOMINANCIA: {aiResult?.analisis_detallado?.quien_manda || 'Indefinida'}
      </div>
    </div>
  );

  const renderSlideToxicity = () => {
    const toxic = aiResult?.meme_metrics?.toxic_meter || 0;
    const ghost = aiResult?.meme_metrics?.ghosting_risk || 0;
    const pbi = aiResult?.meme_metrics?.pbi || 1.0;

    return (
      <div className="slide-content slide-toxicity">
        <div className="slide-badge premium-badge">☣️ NIVEL DE TOXICIDAD</div>
        <h2 className="slide-title">{aiResult?.shock_verdict || 'ANÁLISIS'}</h2>
        <p className="roast-text">{aiResult?.roast_personalizado}</p>

        <div className="toxicity-meters">
          <div className="meter-row">
            <span className="meter-label">Toxicidad</span>
            <div className="meter-track"><div className="meter-fill toxic" style={{ width: `${toxic}%` }} /></div>
            <span className="meter-val">{toxic}%</span>
          </div>
          <div className="meter-row">
            <span className="meter-label">Ghosting</span>
            <div className="meter-track"><div className="meter-fill ghost" style={{ width: `${ghost}%` }} /></div>
            <span className="meter-val">{ghost}%</span>
          </div>
        </div>

        <div className="pbi-box">
          <div className="pbi-label">Power Balance Index</div>
          <div className="pbi-value">{pbi}</div>
          <div className="pbi-status">
            {pbi > 1.5 ? 'SUBORDINACIÓN EMOCIONAL' : pbi < 0.8 ? 'CONTROL ESTRATÉGICO' : 'BALANCE INESTABLE'}
          </div>
        </div>
      </div>
    );
  };

  const renderSlideReceipts = () => {
    const receipts = aiResult?.analisis_detallado?.the_receipts || [];
    return (
      <div className="slide-content slide-receipts">
        <div className="slide-badge premium-badge">📝 THE RECEIPTS</div>
        <h2 className="slide-title">Traductor de Subtexto</h2>

        <div className="receipts-list">
          {receipts.slice(0, 3).map((r, i) => (
            <div key={i} className="receipt-card">
              <div className="receipt-tactic">{r.tactica}</div>
              <div className="receipt-quote">"{r.mensaje}"</div>
              <div className="receipt-translation">
                <span className="trans-label">TRADUCCIÓN REAL:</span>
                <p>{r.traduccion_real}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderSlideMasterstroke = () => (
    <div className="slide-content slide-masterstroke">
      <div className="slide-badge premium-badge">🕹️ LA JUGADA MAESTRA</div>
      <h2 className="slide-title">{aiResult?.estrategia_venganza?.jugada_maestra || 'Contacto Cero'}</h2>

      <div className="move-card">
        <div className="move-label">RESPUESTA DE CONTROL:</div>
        <div className="move-template">{aiResult?.estrategia_venganza?.respuesta_control}</div>
      </div>

      <div className="move-card nuclear">
        <div className="move-label">OPCIÓN NUCLEAR (BLOQUEO):</div>
        <p className="move-text">{aiResult?.estrategia_venganza?.opcion_nuclear}</p>
      </div>

      <div className="viral-quote">
        "{aiResult?.mensaje_viral || 'El que más escribe siempre es el que menos poder tiene.'}"
      </div>

      <div className="final-watermark">REDFLAGSCANNER.XYZ</div>
    </div>
  );

  const slides = [
    renderSlideIntro,
    renderSlideSimpOMeter,
    renderSlideGhosting,
    renderSlideActivity,
    renderSlideEmojis,
    isUnlocked ? renderSlideArchetype : renderPaywallSlide,
    ...(isUnlocked ? [renderSlideToxicity, renderSlideReceipts, renderSlideMasterstroke] : [])
  ];

  const actualTotalSlides = slides.length;

  return (
    <div className="story-container">
      {/* Progress Bars */}
      <div className="story-progress">
        {slides.map((_, i) => (
          <div key={i} className={`progress-segment ${i < currentSlide ? 'done' : i === currentSlide ? 'active' : ''}`}>
            <div className="progress-fill" />
          </div>
        ))}
      </div>

      {/* Tap Zones */}
      <div className="tap-zone tap-left" onClick={goPrev} />
      <div className="tap-zone tap-right" onClick={goNext} />

      {/* Current Slide */}
      <div className={`slide-wrapper ${animateIn ? 'animate-in' : 'animate-out'}`}>
        {slides[currentSlide]?.()}
      </div>

      {/* Slide Counter */}
      <div className="slide-counter">{currentSlide + 1} / {actualTotalSlides}</div>

      <style jsx>{`
        .story-container {
          position: fixed; inset: 0;
          background: #050505;
          display: flex; flex-direction: column;
          font-family: 'Inter', 'Segoe UI', sans-serif;
          color: white;
          overflow: hidden;
          -webkit-user-select: none;
          user-select: none;
        }

        /* Progress Bar */
        .story-progress {
          display: flex; gap: 3px;
          padding: 12px 10px 0;
          z-index: 100;
          position: absolute; top: 0; left: 0; right: 0;
        }
        .progress-segment {
          flex: 1; height: 3px;
          background: rgba(255,255,255,0.15);
          border-radius: 2px; overflow: hidden;
        }
        .progress-segment.done .progress-fill,
        .progress-segment.active .progress-fill {
          width: 100%; height: 100%;
          border-radius: 2px;
        }
        .progress-segment.done .progress-fill {
          background: rgba(255,255,255,0.7);
        }
        .progress-segment.active .progress-fill {
          background: #FF2D55;
          animation: progressGrow 0.4s ease forwards;
        }
        @keyframes progressGrow {
          from { width: 0; } to { width: 100%; }
        }

        /* Tap Zones */
        .tap-zone {
          position: absolute; top: 0; bottom: 0; z-index: 50; cursor: pointer;
        }
        .tap-left { left: 0; width: 30%; }
        .tap-right { right: 0; width: 70%; }

        /* Slide Wrapper */
        .slide-wrapper {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 60px 24px 80px;
          transition: opacity 0.2s ease, transform 0.3s ease;
        }
        .animate-in { opacity: 1; transform: translateX(0); }
        .animate-out { opacity: 0; transform: translateX(30px); }

        /* Slide Counter */
        .slide-counter {
          position: absolute; bottom: 16px; left: 50%; transform: translateX(-50%);
          font-size: 0.7rem; color: rgba(255,255,255,0.25);
          font-family: 'Courier New', monospace; letter-spacing: 0.1em;
        }

        /* --- SHARED SLIDE STYLES --- */
        .slide-content {
          width: 100%; max-width: 420px;
          display: flex; flex-direction: column;
          align-items: center; text-align: center;
          gap: 20px;
        }
        .slide-badge {
          font-size: 0.65rem; font-weight: 800;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: #FF2D55; background: rgba(255,45,85,0.1);
          padding: 6px 16px; border-radius: 20px;
          border: 1px solid rgba(255,45,85,0.3);
        }
        .premium-badge {
          color: #E0B0FF; background: rgba(224,176,255,0.1);
          border-color: rgba(224,176,255,0.3);
        }
        .ghost-badge { color: #8B8BFF; background: rgba(139,139,255,0.1); border-color: rgba(139,139,255,0.3); }
        .activity-badge { color: #FFB347; background: rgba(255,179,71,0.1); border-color: rgba(255,179,71,0.3); }
        .emoji-badge { color: #FF6F61; background: rgba(255,111,97,0.1); border-color: rgba(255,111,97,0.3); }

        .slide-title {
          font-size: 1.6rem; font-weight: 800; line-height: 1.2;
          background: linear-gradient(135deg, #fff 30%, rgba(255,255,255,0.7));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* --- SLIDE: INTRO --- */
        .intro-icon { font-size: 4rem; margin-bottom: 10px; }
        .intro-title { font-size: 1.4rem; color: rgba(255,255,255,0.8); font-weight: 600; margin: 0; }
        .intro-name {
          font-size: 2.4rem; font-weight: 900; color: #FF2D55;
          text-shadow: 0 0 30px rgba(255,45,85,0.5);
        }
        .intro-stat {
          display: flex; flex-direction: column; gap: 4px;
          margin-top: 20px;
        }
        .stat-number {
          font-size: 3.5rem; font-weight: 900; color: white;
          font-family: 'Courier New', monospace;
        }
        .stat-label { font-size: 0.85rem; color: rgba(255,255,255,0.5); text-transform: uppercase; letter-spacing: 0.1em; }
        .intro-warning {
          font-size: 0.9rem; color: rgba(255,255,255,0.4);
          font-style: italic; margin-top: 20px;
        }

        /* --- SLIDE: SIMP --- */
        .simp-chart { width: 100%; display: flex; flex-direction: column; gap: 16px; }
        .simp-row { display: flex; align-items: center; gap: 10px; }
        .simp-name { font-size: 0.7rem; color: rgba(255,255,255,0.6); width: 80px; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .simp-track { flex: 1; height: 28px; background: rgba(255,255,255,0.05); border-radius: 6px; overflow: hidden; position: relative; }
        .simp-fill { height: 100%; border-radius: 6px; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px; transition: width 1.5s ease; }
        .fill-red { background: linear-gradient(90deg, #FF2D55, #FF6F61); }
        .fill-amber { background: linear-gradient(90deg, #FFB347, #FFCC80); }
        .fill-label { font-size: 0.75rem; font-weight: 800; color: white; text-shadow: 0 1px 3px rgba(0,0,0,0.5); }
        .simp-msgs { font-size: 0.6rem; color: rgba(255,255,255,0.3); width: 50px; text-align: right; font-family: 'Courier New', monospace; }
        .simp-verdict { margin-top: 10px; }
        .simp-verdict p { font-size: 0.9rem; color: rgba(255,255,255,0.5); font-style: italic; }
        .simp-winner { font-size: 1rem; font-weight: 800; color: #FF2D55; margin-top: 8px; }

        /* --- SLIDE: GHOSTING --- */
        .ghost-comparison { display: flex; align-items: center; gap: 15px; width: 100%; }
        .ghost-card {
          flex: 1; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 20px 10px; text-align: center;
        }
        .ghost-name { font-size: 0.7rem; color: rgba(255,255,255,0.5); margin-bottom: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .ghost-time { font-size: 2rem; font-weight: 900; color: #8B8BFF; font-family: 'Courier New', monospace; }
        .ghost-label { font-size: 0.6rem; color: rgba(255,255,255,0.3); margin-top: 6px; }
        .ghost-vs { font-size: 1.2rem; font-weight: 900; color: rgba(255,255,255,0.2); }
        .ghost-verdict {
          font-size: 0.85rem; color: rgba(255,255,255,0.6);
          background: rgba(139,139,255,0.08); padding: 15px;
          border-radius: 8px; border-left: 3px solid #8B8BFF;
          text-align: left; line-height: 1.5;
        }

        /* --- SLIDE: ACTIVITY --- */
        .heatmap-grid {
          display: flex; align-items: flex-end; gap: 2px;
          width: 100%; height: 120px;
          background: rgba(255,255,255,0.02);
          border-radius: 8px; padding: 10px 5px 20px;
          position: relative;
        }
        .heat-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; position: relative; }
        .heat-bar {
          width: 100%; min-height: 4px;
          background: linear-gradient(to top, #FFB347, #FF6F61);
          border-radius: 2px 2px 0 0;
          transition: height 1s ease;
        }
        .heat-label { position: absolute; bottom: -16px; font-size: 0.5rem; color: rgba(255,255,255,0.3); }
        .activity-verdict { margin-top: 15px; }
        .peak-badge {
          font-size: 0.75rem; font-weight: 800; color: #FFB347;
          background: rgba(255,179,71,0.1); padding: 6px 14px;
          border-radius: 20px; display: inline-block; margin-bottom: 10px;
        }
        .activity-verdict p { font-size: 0.85rem; color: rgba(255,255,255,0.5); font-style: italic; line-height: 1.5; }

        /* --- SLIDE: EMOJIS --- */
        .emoji-showcase { display: flex; gap: 20px; justify-content: center; margin: 10px 0; }
        .emoji-item { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .emoji-big { font-size: 3.5rem; }
        .emoji-count { font-size: 0.8rem; font-weight: 800; color: rgba(255,255,255,0.6); font-family: 'Courier New', monospace; }
        .emoji-rank { font-size: 0.6rem; color: rgba(255,255,255,0.3); }
        .emoji-empty { display: flex; flex-direction: column; align-items: center; gap: 10px; }
        .emoji-empty p { font-size: 0.85rem; color: rgba(255,255,255,0.5); }
        .emoji-verdict {
          font-size: 0.85rem; color: rgba(255,255,255,0.5);
          background: rgba(255,111,97,0.08); padding: 15px;
          border-radius: 8px; border-left: 3px solid #FF6F61;
          text-align: left; line-height: 1.5;
        }

        /* --- SLIDE: PAYWALL --- */
        .slide-paywall { gap: 16px; }
        .paywall-lock { font-size: 4rem; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .paywall-title { font-size: 1.8rem; font-weight: 900; color: #FF2D55; letter-spacing: 0.1em; }
        .paywall-sub { font-size: 1rem; color: rgba(255,255,255,0.5); }
        .paywall-hook { font-size: 1.15rem; color: rgba(255,255,255,0.8); }
        .paywall-hook strong { color: #FF2D55; }
        .paywall-features {
          display: flex; flex-direction: column; gap: 10px;
          width: 100%; text-align: left; margin: 10px 0;
        }
        .pw-feature {
          font-size: 0.85rem; color: rgba(255,255,255,0.7);
          background: rgba(255,255,255,0.03);
          padding: 12px 16px; border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.06);
        }
        .paywall-btn {
          width: 100%; padding: 18px; border: none;
          background: #FF2D55; color: white;
          font-size: 1.05rem; font-weight: 800;
          border-radius: 12px; cursor: pointer;
          box-shadow: 0 0 30px rgba(255,45,85,0.4);
          transition: all 0.2s; text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .paywall-btn:hover { transform: scale(1.02); box-shadow: 0 0 50px rgba(255,45,85,0.6); }
        .paywall-btn.loading { opacity: 0.6; cursor: wait; }
        .paywall-disclaimer { font-size: 0.7rem; color: rgba(255,255,255,0.3); }

        /* --- PREMIUM SLIDES --- */
        .archetype-icon { font-size: 4rem; }
        .archetype-title { font-size: 1.8rem; font-weight: 900; color: #E0B0FF; }
        .archetype-desc { font-size: 0.95rem; color: rgba(255,255,255,0.6); line-height: 1.6; }
        .archetype-dynamic {
          display: flex; gap: 10px; align-items: center;
          background: rgba(255,255,255,0.03); padding: 10px 18px;
          border-radius: 8px;
        }
        .dyn-label { font-size: 0.65rem; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; }
        .dyn-value { font-size: 0.9rem; color: white; font-weight: 700; }
        .archetype-power {
          font-size: 0.7rem; color: #FFB347; letter-spacing: 0.1em;
          background: rgba(255,179,71,0.1); padding: 6px 16px;
          border-radius: 4px; border: 1px solid rgba(255,179,71,0.2);
        }

        /* Toxicity */
        .roast-text { font-size: 0.9rem; color: rgba(255,255,255,0.6); line-height: 1.5; font-style: italic; }
        .toxicity-meters { width: 100%; display: flex; flex-direction: column; gap: 12px; }
        .meter-row { display: flex; align-items: center; gap: 10px; }
        .meter-label { font-size: 0.7rem; color: rgba(255,255,255,0.5); width: 70px; text-align: left; }
        .meter-track { flex: 1; height: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; overflow: hidden; }
        .meter-fill { height: 100%; border-radius: 4px; transition: width 1.5s ease; }
        .meter-fill.toxic { background: linear-gradient(90deg, #FF2D55, #FF6F61); }
        .meter-fill.ghost { background: linear-gradient(90deg, #8B8BFF, #B8B8FF); }
        .meter-val { font-size: 0.8rem; font-weight: 800; color: white; width: 40px; text-align: right; font-family: 'Courier New', monospace; }
        .pbi-box {
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 20px; text-align: center; width: 100%;
        }
        .pbi-label { font-size: 0.6rem; color: rgba(255,255,255,0.4); letter-spacing: 0.1em; margin-bottom: 8px; }
        .pbi-value { font-size: 3rem; font-weight: 900; color: #FF2D55; font-family: 'Courier New', monospace; }
        .pbi-status { font-size: 0.7rem; color: #FFB347; letter-spacing: 0.1em; margin-top: 6px; }

        /* Receipts */
        .receipts-list { width: 100%; display: flex; flex-direction: column; gap: 16px; text-align: left; }
        .receipt-card {
          background: rgba(255,255,255,0.03); border-left: 3px solid #FF2D55;
          padding: 16px; border-radius: 0 8px 8px 0;
        }
        .receipt-tactic { font-size: 0.65rem; color: #FFB347; font-weight: 800; letter-spacing: 0.1em; margin-bottom: 8px; text-transform: uppercase; }
        .receipt-quote { font-size: 0.95rem; color: white; font-style: italic; margin-bottom: 12px; line-height: 1.4; }
        .receipt-translation {
          background: rgba(255,179,71,0.08); padding: 12px;
          border-radius: 6px; border-left: 2px solid #FFB347;
        }
        .trans-label { font-size: 0.6rem; color: #FFB347; font-weight: 800; letter-spacing: 0.1em; display: block; margin-bottom: 6px; }
        .receipt-translation p { font-size: 0.85rem; color: rgba(255,255,255,0.7); line-height: 1.5; margin: 0; }

        /* Masterstroke */
        .move-card {
          width: 100%; text-align: left;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px; padding: 16px;
        }
        .move-card.nuclear {
          border-color: rgba(255,45,85,0.3);
          background: rgba(255,45,85,0.05);
        }
        .move-label { font-size: 0.6rem; color: #FFB347; font-weight: 800; letter-spacing: 0.1em; margin-bottom: 10px; }
        .move-template {
          font-size: 1rem; color: white; line-height: 1.5;
          font-family: 'Courier New', monospace;
          background: rgba(255,45,85,0.1); padding: 14px;
          border-radius: 6px; border: 1px solid rgba(255,45,85,0.2);
        }
        .move-text { font-size: 0.9rem; color: rgba(255,255,255,0.7); line-height: 1.5; margin: 0; }
        .viral-quote {
          font-size: 1.1rem; color: #FFB347; font-style: italic;
          line-height: 1.4; margin-top: 10px;
        }
        .final-watermark {
          font-size: 0.6rem; color: rgba(255,255,255,0.15);
          letter-spacing: 0.2em; margin-top: 20px;
        }

        /* Scrollable overrides for receipts */
        .slide-receipts { overflow-y: auto; max-height: calc(100vh - 120px); }
        .slide-receipts::-webkit-scrollbar { width: 2px; }
        .slide-receipts::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `}</style>
    </div>
  );
}
