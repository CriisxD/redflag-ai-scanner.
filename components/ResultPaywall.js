'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ResultPaywall({ onCheckout, aiResult, forcedUnlocked = false }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(forcedUnlocked);
  const [loading, setLoading] = useState(false);
  const [localStats, setLocalStats] = useState(null);
  const [targetName, setTargetName] = useState('Sujeto Anónimo');
  const [direction, setDirection] = useState(1);

  const TEST_MODE = false;

  useEffect(() => { if (forcedUnlocked) setIsUnlocked(true); }, [forcedUnlocked]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('targetName');
      if (saved) setTargetName(saved);
      const stats = localStorage.getItem('rf_local_stats');
      if (stats) { try { setLocalStats(JSON.parse(stats)); } catch(e) {} }
    }
  }, []);

  const slides = buildSlides();
  const maxSlide = isUnlocked ? slides.length - 1 : 4; // 0-3 free, 4 paywall

  const goNext = useCallback(() => {
    if (currentSlide >= maxSlide) return;
    setDirection(1);
    setCurrentSlide(prev => prev + 1);
  }, [currentSlide, maxSlide]);

  const goPrev = useCallback(() => {
    if (currentSlide <= 0) return;
    setDirection(-1);
    setCurrentSlide(prev => prev - 1);
  }, [currentSlide]);

  const handleCheckoutClick = () => {
    if (TEST_MODE) { setIsUnlocked(true); return; }
    setLoading(true);
    if (onCheckout) onCheckout();
  };

  // Slide animation variants
  const variants = {
    enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0, scale: 0.95 }),
  };

  function buildSlides() {
    const s = [
      renderSlideSiOmeter,
      renderSlideGhosting,
      renderSlideWordCloud,
      renderSlideActivity,
      isUnlocked ? renderSlideProfile : renderPaywall,
      ...(isUnlocked ? [renderSlideToximeter, renderSlideReceipts, renderSlideGamePlan] : [])
    ];
    return s;
  }

  // ═══════════════════════════════════════════
  // SLIDE 1: SIMP-O-METER
  // ═══════════════════════════════════════════
  function renderSlideSiOmeter() {
    const u1 = localStats?.users?.[0];
    const u2 = localStats?.users?.[1];
    const u1Pct = localStats?.simpScoreBase?.[u1?.name] || 50;
    const u2Pct = localStats?.simpScoreBase?.[u2?.name] || 50;
    const total = localStats?.totalMessages || 0;
    return (
      <div className="slide-body">
        <div className="cyber-grid-bg" />
        <div className="badge-cyber"><span className="badge-dot red" />SIMP-O-METER</div>
        <p className="slide-sub">{total.toLocaleString()} mensajes analizados</p>
        <h2 className="slide-heading neon-red">Nivel de Esfuerzo Detectado</h2>
        <div className="simp-duel">
          <div className="simp-col">
            <span className="simp-name">{u1?.name?.slice(0, 12)}</span>
            <div className="simp-bar-v">
              <motion.div className="simp-fill-v fill-neon-red" initial={{ height: 0 }} animate={{ height: `${u1Pct}%` }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }} />
            </div>
            <motion.span className="simp-pct neon-red" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>{u1Pct}%</motion.span>
            <span className="simp-count">{u1?.count?.toLocaleString()} msgs</span>
          </div>
          <div className="simp-vs">VS</div>
          <div className="simp-col">
            <span className="simp-name">{u2?.name?.slice(0, 12)}</span>
            <div className="simp-bar-v">
              <motion.div className="simp-fill-v fill-neon-cyan" initial={{ height: 0 }} animate={{ height: `${u2Pct}%` }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }} />
            </div>
            <motion.span className="simp-pct neon-cyan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>{u2Pct}%</motion.span>
            <span className="simp-count">{u2?.count?.toLocaleString()} msgs</span>
          </div>
        </div>
        <div className="cyber-verdict">
          <span className="cv-icon">⚡</span>
          <p>{u1Pct > u2Pct ? `${u1?.name} está rogando atención.` : `${u2?.name} está rogando atención.`}</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // SLIDE 2: GHOSTING FACTOR / HORARIO DEL DESESPERO
  // ═══════════════════════════════════════════
  function renderSlideGhosting() {
    const u1 = localStats?.users?.[0];
    const u2 = localStats?.users?.[1];
    const g1 = localStats?.ghostingFactor?.[u1?.name] || '?';
    const g2 = localStats?.ghostingFactor?.[u2?.name] || '?';
    const peak = localStats?.activityData?.peakHour ?? 22;
    const dist = localStats?.activityData?.hourlyDistribution || new Array(24).fill(0);
    const maxVal = Math.max(...dist, 1);
    return (
      <div className="slide-body">
        <div className="cyber-grid-bg" />
        <div className="badge-cyber"><span className="badge-dot purple" />GHOSTING FACTOR</div>
        <h2 className="slide-heading neon-purple">El Horario del Desespero</h2>
        <div className="ghost-duel">
          <div className="ghost-card-cyber">
            <span className="gc-label">Récord sin responder</span>
            <span className="gc-name">{u1?.name?.slice(0, 12)}</span>
            <motion.span className="gc-time neon-red" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.4 }}>{g1}</motion.span>
          </div>
          <span className="ghost-divider">⚔️</span>
          <div className="ghost-card-cyber">
            <span className="gc-label">Récord sin responder</span>
            <span className="gc-name">{u2?.name?.slice(0, 12)}</span>
            <motion.span className="gc-time neon-cyan" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.6 }}>{g2}</motion.span>
          </div>
        </div>
        <div className="heatmap-cyber">
          <p className="hm-title">MAPA DE VULNERABILIDAD (24H)</p>
          <div className="hm-bars">
            {dist.map((val, i) => (
              <motion.div key={i} className="hm-col" initial={{ height: 0 }} animate={{ height: `${Math.max(4, (val / maxVal) * 100)}%` }}
                transition={{ duration: 0.8, delay: 0.05 * i }}
                style={{
                  background: i === peak ? '#FF2D55' : i >= 22 || i <= 4 ? 'rgba(255,45,85,0.5)' : 'rgba(0,255,170,0.25)',
                  boxShadow: i === peak ? '0 0 10px #FF2D55' : 'none'
                }}
              />
            ))}
          </div>
          <div className="hm-labels">
            {[0,6,12,18,23].map(h => <span key={h}>{h}h</span>)}
          </div>
        </div>
        <p className="cyber-footnote">{peak >= 22 || peak <= 4 ? `Pico a las ${peak}:00. Esto no es amor, es insomnio.` : `Pico a las ${peak}:00. Al menos tienen horario de oficina.`}</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // SLIDE 3: WORD CLOUD
  // ═══════════════════════════════════════════
  function renderSlideWordCloud() {
    const words = localStats?.topWords || [];
    const maxCount = words[0]?.count || 1;
    const toxicWords = ['perdón', 'perdon', 'siempre', 'nunca', 'culpa', 'mentira', 'odio', 'bloquear', 'celoso', 'celosa', 'maldita', 'maldito', 'idiota', 'sorry', 'please'];
    return (
      <div className="slide-body">
        <div className="cyber-grid-bg" />
        <div className="badge-cyber"><span className="badge-dot red" />WORD SCAN</div>
        <h2 className="slide-heading neon-red">Nube de Palabras Tóxicas</h2>
        <div className="word-cloud">
          {words.map((w, i) => {
            const isToxic = toxicWords.some(tw => w.word.includes(tw));
            const scale = 0.6 + (w.count / maxCount) * 1.4;
            return (
              <motion.span
                key={i}
                className={`cloud-word ${isToxic ? 'toxic' : ''}`}
                style={{ fontSize: `${Math.max(0.75, scale)}rem` }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}
              >
                {w.word}
                <span className="word-count">{w.count}</span>
              </motion.span>
            );
          })}
        </div>
        {localStats?.topEmojis?.length > 0 && (
          <div className="emoji-bar">
            {localStats.topEmojis.map((e, i) => (
              <div key={i} className="emoji-item-cyber">
                <span className="ei-emoji">{e.emoji}</span>
                <span className="ei-count">{e.count}×</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // SLIDE 4: ACTIVITY (Reused from Ghosting data)
  // ═══════════════════════════════════════════
  function renderSlideActivity() {
    const emojis = localStats?.topEmojis || [];
    const u1 = localStats?.users?.[0];
    const u2 = localStats?.users?.[1];
    return (
      <div className="slide-body">
        <div className="cyber-grid-bg" />
        <div className="badge-cyber"><span className="badge-dot cyan" />RESUMEN GRATIS</div>
        <h2 className="slide-heading neon-cyan">Lo que sabemos (hasta aquí)</h2>
        <div className="summary-grid">
          <div className="summary-cell"><span className="sc-icon">📊</span><span className="sc-val">{localStats?.totalMessages?.toLocaleString()}</span><span className="sc-lbl">Mensajes</span></div>
          <div className="summary-cell"><span className="sc-icon">🚣</span><span className="sc-val">{localStats?.mostTalkative?.slice(0,10)}</span><span className="sc-lbl">Más intenso</span></div>
          <div className="summary-cell"><span className="sc-icon">👻</span><span className="sc-val">{localStats?.ghostingFactor?.worstGhoster?.slice(0,10)}</span><span className="sc-lbl">Peor ghoster</span></div>
          <div className="summary-cell"><span className="sc-icon">{emojis[0]?.emoji || '😶'}</span><span className="sc-val">{emojis[0]?.count || 0}×</span><span className="sc-lbl">Emoji #1</span></div>
        </div>
        <div className="cyber-verdict teaser">
          <span className="cv-icon">🔒</span>
          <p>Las estadísticas dicen lo que pasó...<br /><strong className="neon-red">La IA sabe POR QUÉ pasó.</strong></p>
        </div>
        <p className="cyber-footnote">Desliza → para revelar el análisis premium</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PAYWALL
  // ═══════════════════════════════════════════
  function renderPaywall() {
    return (
      <div className="slide-body slide-paywall">
        <div className="glitch-bg">
          <div className="glitch-word" style={{ top: '15%', left: '10%' }}>NARCISISTA</div>
          <div className="glitch-word" style={{ top: '30%', right: '8%' }}>MENTIRA</div>
          <div className="glitch-word" style={{ top: '55%', left: '15%' }}>GASLIGHTING</div>
          <div className="glitch-word" style={{ top: '70%', right: '12%' }}>INFIDELIDAD</div>
          <div className="glitch-word" style={{ top: '85%', left: '25%' }}>MANIPULACIÓN</div>
        </div>
        <motion.div className="lock-icon" animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>🔒</motion.div>
        <h2 className="pw-title glitch-text">ACCESO RESTRINGIDO</h2>
        <p className="pw-sub">Análisis psicológico profundo y Red Flags ocultas detectadas.</p>
        <div className="pw-features-cyber">
          {['💀 Ficha del Criminal (Perfil Psicológico)','☣️ Termómetro de Toxicidad','📝 Traductor de Mentiras','🕹️ La Jugada Maestra'].map((f, i) => (
            <motion.div key={i} className="pw-feat-cyber" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 * i }}>{f}</motion.div>
          ))}
        </div>
        <motion.button className={`cta-btn ${loading ? 'loading' : ''}`} onClick={handleCheckoutClick} disabled={loading}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          {loading ? 'Procesando...' : 'REVELAR LA VERDAD — $3.99'}
        </motion.button>
        <p className="pw-disc">Pago único · Acceso inmediato · Generado por IA</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PREMIUM SLIDE 5: FICHA DEL CRIMINAL (Most Wanted)
  // ═══════════════════════════════════════════
  function renderSlideProfile() {
    const tags = [
      aiResult?.analisis_detallado?.persona?.arquetipo,
      ...(aiResult?.analisis_detallado?.the_receipts?.map(r => r.tactica) || [])
    ].filter(Boolean).slice(0, 4);
    return (
      <div className="slide-body slide-profile">
        <div className="cyber-grid-bg" />
        <div className="wanted-frame">
          <div className="wanted-header">
            <div className="wanted-tape">EXPEDIENTE CLASIFICADO</div>
            <div className="wanted-id">{aiResult?.case_id || 'RF-???-0000'}</div>
          </div>
          <div className="wanted-icon">{aiResult?.verdict_icon || '🎭'}</div>
          <h2 className="wanted-name neon-red">{targetName}</h2>
          <p className="wanted-aka">a.k.a. "{aiResult?.analisis_detallado?.persona?.arquetipo || 'Sujeto Desconocido'}"</p>
          <div className="tag-row">
            {tags.map((t, i) => <span key={i} className="tag-cyber">{t}</span>)}
          </div>
          <p className="wanted-desc">{aiResult?.analisis_detallado?.persona?.descripcion}</p>
          <div className="wanted-footer">
            <div className="wf-row"><span className="wf-lbl">VÍNCULO</span><span className="wf-val">{aiResult?.analisis_detallado?.dinamica || '???'}</span></div>
            <div className="wf-row"><span className="wf-lbl">DOMINANCIA</span><span className="wf-val neon-red">{aiResult?.analisis_detallado?.quien_manda || 'Indefinida'}</span></div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PREMIUM SLIDE 6: TOXICITY DIAL
  // ═══════════════════════════════════════════
  function renderSlideToximeter() {
    const toxic = aiResult?.meme_metrics?.toxic_meter || 0;
    const ghost = aiResult?.meme_metrics?.ghosting_risk || 0;
    const pbi = aiResult?.meme_metrics?.pbi || 1.0;
    const angle = (toxic / 100) * 180 - 90;
    const zone = toxic < 25 ? 'SANO' : toxic < 50 ? 'DUDOSO' : toxic < 75 ? 'TÓXICO' : 'HUYE DE AQUÍ';
    return (
      <div className="slide-body">
        <div className="cyber-grid-bg" />
        <div className="badge-cyber"><span className="badge-dot red" />TOXICIDAD</div>
        <h2 className="slide-heading neon-red">{aiResult?.shock_verdict || 'ANÁLISIS'}</h2>
        <p className="slide-sub italic">{aiResult?.roast_personalizado}</p>
        <div className="dial-container">
          <div className="dial-track">
            <div className="dial-zone z1">SANO</div>
            <div className="dial-zone z2">DUDOSO</div>
            <div className="dial-zone z3">TÓXICO</div>
            <div className="dial-zone z4">¡HUYE!</div>
          </div>
          <div className="dial-gauge">
            <motion.div className="dial-needle" initial={{ rotate: -90 }} animate={{ rotate: angle }}
              transition={{ type: 'spring', stiffness: 40, damping: 8, delay: 0.5 }} />
            <div className="dial-center" />
          </div>
          <div className="dial-value neon-red">{toxic}%</div>
          <div className="dial-label">{zone}</div>
        </div>
        <div className="extra-meters">
          <div className="em-row"><span>Ghosting Risk</span><div className="em-track"><motion.div className="em-fill neon-bg-purple" initial={{ width: 0 }} animate={{ width: `${ghost}%` }} transition={{ duration: 1.2, delay: 0.8 }} /></div><span>{ghost}%</span></div>
          <div className="em-row"><span>PBI</span><div className="pbi-val neon-cyan">{pbi}</div><span className="pbi-status">{pbi > 1.5 ? 'Subordinación' : pbi < 0.8 ? 'Control' : 'Inestable'}</span></div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PREMIUM SLIDE 7: THE RECEIPTS (Chat Bubbles)
  // ═══════════════════════════════════════════
  function renderSlideReceipts() {
    const receipts = aiResult?.analisis_detallado?.the_receipts || [];
    return (
      <div className="slide-body slide-scrollable">
        <div className="cyber-grid-bg" />
        <div className="badge-cyber"><span className="badge-dot cyan" />THE RECEIPTS</div>
        <h2 className="slide-heading neon-cyan">Traductor de Mentiras</h2>
        <div className="receipts-chat">
          {receipts.slice(0, 4).map((r, i) => (
            <motion.div key={i} className="receipt-pair" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 * i }}>
              <div className="receipt-tactic-tag">{r.tactica}</div>
              <div className="chat-row">
                <div className="bubble bubble-left">
                  <span className="bubble-label">DIJO:</span>
                  <p>"{r.mensaje}"</p>
                </div>
                <div className="neon-arrow">→</div>
                <div className="bubble bubble-right">
                  <span className="bubble-label">QUISO DECIR:</span>
                  <p>"{r.traduccion_real}"</p>
                </div>
              </div>
              {r.explicacion && <p className="receipt-explain">↳ {r.explicacion}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PREMIUM SLIDE 8: GAME PLAN
  // ═══════════════════════════════════════════
  function renderSlideGamePlan() {
    return (
      <div className="slide-body slide-gameplan">
        <div className="gameplan-bg" />
        <div className="badge-cyber"><span className="badge-dot red" />MODO EJECUCIÓN</div>
        <h2 className="slide-heading neon-red">La Jugada Maestra</h2>
        <div className="gp-steps">
          <motion.div className="gp-step" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <span className="gp-num">01</span>
            <div className="gp-content">
              <span className="gp-label">JUGADA MAESTRA</span>
              <p>{aiResult?.estrategia_venganza?.jugada_maestra || 'Contacto Cero'}</p>
            </div>
          </motion.div>
          <motion.div className="gp-step" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <span className="gp-num">02</span>
            <div className="gp-content">
              <span className="gp-label">RESPUESTA DE CONTROL</span>
              <div className="gp-template">{aiResult?.estrategia_venganza?.respuesta_control || '...'}</div>
            </div>
          </motion.div>
          <motion.div className="gp-step nuclear-step" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <span className="gp-num">03</span>
            <div className="gp-content">
              <span className="gp-label">☢️ OPCIÓN NUCLEAR</span>
              <p>{aiResult?.estrategia_venganza?.opcion_nuclear || 'Bloqueo definitivo.'}</p>
            </div>
          </motion.div>
        </div>
        <div className="viral-box">
          <p>"{aiResult?.mensaje_viral || 'El que más escribe siempre es el que menos poder tiene.'}"</p>
        </div>
        <div className="final-watermark">REDFLAGSCANNER.XYZ</div>
      </div>
    );
  }

  return (
    <div className="story-shell">
      {/* Progress Bar */}
      <div className="progress-row">
        {slides.map((_, i) => (
          <div key={i} className={`seg ${i < currentSlide ? 'done' : i === currentSlide ? 'active' : ''}`}><div className="seg-fill" /></div>
        ))}
      </div>

      {/* Tap Zones */}
      <div className="tap tap-l" onClick={goPrev} />
      <div className="tap tap-r" onClick={goNext} />

      {/* Animated Slide */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          className="slide-frame"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          {slides[currentSlide]?.()}
        </motion.div>
      </AnimatePresence>

      {/* Next Button */}
      {currentSlide < maxSlide && !(currentSlide === 4 && !isUnlocked) && (
        <motion.button className="next-btn" onClick={goNext} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          SIGUIENTE →
        </motion.button>
      )}

      {/* Counter */}
      <div className="counter">{currentSlide + 1} / {slides.length}</div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=JetBrains+Mono:wght@400;700;800&display=swap');
        :root {
          --neon-red: #FF2D55;
          --neon-cyan: #00FFAA;
          --neon-purple: #8B5CF6;
          --bg-dark: #000000;
          --bg-card: rgba(255,255,255,0.03);
          --border-subtle: rgba(255,255,255,0.07);
          --text-dim: rgba(255,255,255,0.45);
          --text-muted: rgba(255,255,255,0.25);
        }
      `}</style>

      <style jsx>{`
        .story-shell {
          position: fixed; inset: 0; background: var(--bg-dark);
          display: flex; flex-direction: column;
          font-family: 'Space Grotesk', sans-serif; color: #fff;
          overflow: hidden; user-select: none; -webkit-user-select: none;
        }

        /* ═══ PROGRESS ═══ */
        .progress-row { display: flex; gap: 3px; padding: 14px 12px 0; position: absolute; top: 0; left: 0; right: 0; z-index: 100; }
        .seg { flex: 1; height: 3px; background: rgba(255,255,255,0.08); border-radius: 3px; overflow: hidden; }
        .seg.done .seg-fill { width: 100%; height: 100%; background: var(--neon-red); opacity: 0.6; border-radius: 3px; }
        .seg.active .seg-fill { width: 100%; height: 100%; background: var(--neon-red); border-radius: 3px; box-shadow: 0 0 8px var(--neon-red); animation: barGrow 0.4s ease; }
        @keyframes barGrow { from { width: 0; } to { width: 100%; } }

        /* ═══ TAP ═══ */
        .tap { position: absolute; top: 0; bottom: 0; z-index: 50; cursor: pointer; }
        .tap-l { left: 0; width: 25%; }
        .tap-r { right: 0; width: 75%; }

        /* ═══ SLIDE FRAME ═══ */
        .slide-frame { flex: 1; display: flex; align-items: center; justify-content: center; padding: 50px 18px 90px; }

        /* ═══ NEXT BTN ═══ */
        .next-btn {
          position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 80;
          background: var(--neon-red); color: #000; border: none;
          font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 800;
          padding: 14px 40px; border-radius: 50px; cursor: pointer;
          box-shadow: 0 0 25px rgba(255,45,85,0.4), 0 0 60px rgba(255,45,85,0.15);
          letter-spacing: 0.1em; text-transform: uppercase;
        }

        .counter { position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%); font-size: 0.55rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.2em; }

        /* ═══ SHARED ═══ */
        .slide-body { width: 100%; max-width: 420px; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 16px; position: relative; }
        .slide-scrollable { overflow-y: auto; max-height: calc(100vh - 120px); padding-bottom: 30px; }
        .slide-scrollable::-webkit-scrollbar { width: 0; }

        .cyber-grid-bg {
          position: absolute; inset: -50px; z-index: 0; pointer-events: none; opacity: 0.03;
          background-image: linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        .badge-cyber {
          font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase; color: var(--text-dim);
          display: flex; align-items: center; gap: 8px; z-index: 1;
        }
        .badge-dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
        .badge-dot.red { background: var(--neon-red); box-shadow: 0 0 8px var(--neon-red); }
        .badge-dot.cyan { background: var(--neon-cyan); box-shadow: 0 0 8px var(--neon-cyan); }
        .badge-dot.purple { background: var(--neon-purple); box-shadow: 0 0 8px var(--neon-purple); }

        .slide-heading { font-family: 'JetBrains Mono', monospace; font-size: 1.4rem; font-weight: 800; z-index: 1; line-height: 1.3; }
        .slide-sub { font-size: 0.8rem; color: var(--text-dim); z-index: 1; margin: 0; }
        .italic { font-style: italic; }
        .neon-red { color: var(--neon-red); text-shadow: 0 0 20px rgba(255,45,85,0.4); }
        .neon-cyan { color: var(--neon-cyan); text-shadow: 0 0 20px rgba(0,255,170,0.4); }
        .neon-purple { color: var(--neon-purple); text-shadow: 0 0 20px rgba(139,92,246,0.4); }
        .neon-bg-purple { background: var(--neon-purple); }

        .cyber-verdict {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 12px; padding: 14px 18px; width: 100%; z-index: 1;
          display: flex; align-items: center; gap: 12px; text-align: left;
        }
        .cyber-verdict.teaser { border-color: rgba(255,45,85,0.2); background: rgba(255,45,85,0.04); flex-direction: column; text-align: center; }
        .cv-icon { font-size: 1.5rem; }
        .cyber-verdict p { font-size: 0.82rem; color: var(--text-dim); line-height: 1.5; margin: 0; }
        .cyber-footnote { font-size: 0.7rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; z-index: 1; }

        /* ═══ SIMP-O-METER ═══ */
        .simp-duel { display: flex; align-items: flex-end; gap: 20px; height: 220px; z-index: 1; }
        .simp-col { display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1; }
        .simp-name { font-size: 0.65rem; color: var(--text-dim); max-width: 100px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .simp-bar-v { width: 50px; height: 160px; background: rgba(255,255,255,0.04); border-radius: 8px; overflow: hidden; display: flex; align-items: flex-end; border: 1px solid var(--border-subtle); }
        .simp-fill-v { width: 100%; border-radius: 6px; }
        .fill-neon-red { background: linear-gradient(to top, var(--neon-red), #FF6F91); box-shadow: 0 0 15px rgba(255,45,85,0.3); }
        .fill-neon-cyan { background: linear-gradient(to top, var(--neon-cyan), #80FFD4); box-shadow: 0 0 15px rgba(0,255,170,0.3); }
        .simp-pct { font-family: 'JetBrains Mono', monospace; font-size: 1.5rem; font-weight: 800; }
        .simp-count { font-size: 0.55rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }
        .simp-vs { font-size: 0.8rem; font-weight: 900; color: rgba(255,255,255,0.1); margin-bottom: 80px; }

        /* ═══ GHOSTING ═══ */
        .ghost-duel { display: flex; align-items: center; gap: 12px; width: 100%; z-index: 1; }
        .ghost-card-cyber {
          flex: 1; background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 14px; padding: 18px 12px; display: flex; flex-direction: column; align-items: center; gap: 6px;
        }
        .gc-label { font-size: 0.5rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.1em; }
        .gc-name { font-size: 0.65rem; color: var(--text-dim); }
        .gc-time { font-family: 'JetBrains Mono', monospace; font-size: 1.6rem; font-weight: 800; }
        .ghost-divider { font-size: 1.2rem; }

        .heatmap-cyber { width: 100%; z-index: 1; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 16px 12px; }
        .hm-title { font-size: 0.5rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; letter-spacing: 0.15em; margin: 0 0 10px; }
        .hm-bars { display: flex; align-items: flex-end; gap: 2px; height: 60px; }
        .hm-col { flex: 1; border-radius: 2px 2px 0 0; min-height: 2px; }
        .hm-labels { display: flex; justify-content: space-between; margin-top: 6px; font-size: 0.45rem; color: var(--text-muted); font-family: 'JetBrains Mono', monospace; }

        /* ═══ WORD CLOUD ═══ */
        .word-cloud {
          display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
          padding: 20px 10px; z-index: 1; min-height: 150px;
        }
        .cloud-word {
          font-family: 'JetBrains Mono', monospace; font-weight: 700;
          color: rgba(255,255,255,0.5); position: relative; padding: 2px 6px;
          transition: all 0.2s;
        }
        .cloud-word.toxic { color: var(--neon-red); text-shadow: 0 0 15px rgba(255,45,85,0.5); }
        .word-count { font-size: 0.45rem; color: var(--text-muted); position: absolute; top: -6px; right: -4px; }

        .emoji-bar {
          display: flex; gap: 16px; z-index: 1;
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 14px; padding: 14px 20px;
        }
        .emoji-item-cyber { display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .ei-emoji { font-size: 2rem; }
        .ei-count { font-size: 0.6rem; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; }

        /* ═══ SUMMARY ═══ */
        .summary-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; width: 100%; z-index: 1; }
        .summary-cell {
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 14px; padding: 16px 12px;
          display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .sc-icon { font-size: 1.3rem; }
        .sc-val { font-family: 'JetBrains Mono', monospace; font-size: 1rem; font-weight: 800; color: #fff; }
        .sc-lbl { font-size: 0.55rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.1em; }

        /* ═══ PAYWALL ═══ */
        .slide-paywall { z-index: 1; }
        .glitch-bg {
          position: absolute; inset: 0; z-index: 0; overflow: hidden;
        }
        .glitch-word {
          position: absolute; font-family: 'JetBrains Mono', monospace;
          font-size: 1.8rem; font-weight: 900; color: rgba(255,45,85,0.06);
          filter: blur(4px); text-transform: uppercase; letter-spacing: 0.1em;
          animation: glitchFloat 6s ease-in-out infinite alternate;
        }
        @keyframes glitchFloat { 0% { transform: translateX(0); } 100% { transform: translateX(15px); } }
        .lock-icon { font-size: 3.5rem; z-index: 1; filter: drop-shadow(0 0 30px rgba(255,45,85,0.5)); }
        .pw-title { font-family: 'JetBrains Mono', monospace; font-size: 1.3rem; font-weight: 800; color: var(--neon-red); letter-spacing: 0.12em; z-index: 1; }
        .pw-sub { font-size: 0.85rem; color: var(--text-dim); z-index: 1; margin: 0; }
        .pw-features-cyber { display: flex; flex-direction: column; gap: 8px; width: 100%; z-index: 1; }
        .pw-feat-cyber {
          text-align: left; font-size: 0.8rem; color: rgba(255,255,255,0.6);
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          padding: 12px 16px; border-radius: 10px;
          font-family: 'Space Grotesk', sans-serif;
        }
        .cta-btn {
          width: 100%; padding: 18px; border: none; z-index: 1;
          background: var(--neon-red); color: #000;
          font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; font-weight: 800;
          border-radius: 14px; cursor: pointer;
          box-shadow: 0 0 30px rgba(255,45,85,0.4);
          letter-spacing: 0.08em; text-transform: uppercase;
        }
        .cta-btn.loading { opacity: 0.5; cursor: wait; }
        .pw-disc { font-size: 0.6rem; color: var(--text-muted); z-index: 1; }

        /* ═══ WANTED / PROFILE ═══ */
        .wanted-frame {
          width: 100%; background: var(--bg-card);
          border: 1px solid var(--neon-red);
          border-radius: 4px; padding: 24px 20px;
          position: relative; z-index: 1;
          box-shadow: 0 0 40px rgba(255,45,85,0.08);
        }
        .wanted-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .wanted-tape {
          font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; font-weight: 800;
          color: var(--neon-red); letter-spacing: 0.15em;
          border: 1px solid var(--neon-red); padding: 4px 12px; border-radius: 2px;
        }
        .wanted-id { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; color: var(--text-muted); }
        .wanted-icon { font-size: 3.5rem; margin-bottom: 10px; }
        .wanted-name { font-family: 'JetBrains Mono', monospace; font-size: 1.4rem; font-weight: 800; margin: 0; }
        .wanted-aka { font-size: 0.8rem; color: var(--text-dim); font-style: italic; margin: 0; }
        .tag-row { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin: 12px 0; }
        .tag-cyber {
          font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; font-weight: 700;
          color: var(--neon-cyan); background: rgba(0,255,170,0.08);
          border: 1px solid rgba(0,255,170,0.2); padding: 4px 10px; border-radius: 3px;
          letter-spacing: 0.1em; text-transform: uppercase;
        }
        .wanted-desc { font-size: 0.82rem; color: var(--text-dim); line-height: 1.6; }
        .wanted-footer { border-top: 1px solid var(--border-subtle); padding-top: 14px; margin-top: 10px; }
        .wf-row { display: flex; justify-content: space-between; padding: 4px 0; }
        .wf-lbl { font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; color: var(--text-muted); letter-spacing: 0.1em; }
        .wf-val { font-size: 0.8rem; font-weight: 700; }

        /* ═══ DIAL ═══ */
        .dial-container { z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .dial-track { display: flex; gap: 4px; margin-bottom: 8px; }
        .dial-zone { font-size: 0.5rem; padding: 4px 10px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-weight: 700; letter-spacing: 0.1em; }
        .z1 { background: rgba(0,255,170,0.15); color: var(--neon-cyan); }
        .z2 { background: rgba(255,179,71,0.15); color: #FFB347; }
        .z3 { background: rgba(255,45,85,0.15); color: var(--neon-red); }
        .z4 { background: rgba(255,45,85,0.3); color: var(--neon-red); }
        .dial-gauge { position: relative; width: 160px; height: 80px; overflow: hidden; }
        .dial-gauge::before {
          content: ''; position: absolute; top: 0; left: 0; width: 160px; height: 160px;
          border-radius: 50%; border: 10px solid rgba(255,255,255,0.04);
          border-bottom-color: transparent; border-left-color: transparent;
          transform: rotate(-135deg);
        }
        .dial-needle {
          position: absolute; bottom: 0; left: 50%; width: 3px; height: 70px;
          background: var(--neon-red); transform-origin: bottom center;
          box-shadow: 0 0 10px var(--neon-red); border-radius: 2px;
        }
        .dial-center { position: absolute; bottom: -6px; left: 50%; transform: translateX(-50%); width: 12px; height: 12px; border-radius: 50%; background: var(--neon-red); box-shadow: 0 0 10px var(--neon-red); }
        .dial-value { font-family: 'JetBrains Mono', monospace; font-size: 2.5rem; font-weight: 800; }
        .dial-label { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; font-weight: 700; color: var(--text-dim); letter-spacing: 0.15em; }

        .extra-meters { width: 100%; z-index: 1; display: flex; flex-direction: column; gap: 10px; background: var(--bg-card); border: 1px solid var(--border-subtle); border-radius: 14px; padding: 16px; }
        .em-row { display: flex; align-items: center; gap: 10px; font-size: 0.7rem; color: var(--text-dim); font-family: 'JetBrains Mono', monospace; }
        .em-track { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
        .em-fill { height: 100%; border-radius: 3px; }
        .pbi-val { font-size: 1.4rem; font-weight: 900; font-family: 'JetBrains Mono', monospace; }
        .pbi-status { font-size: 0.6rem; }

        /* ═══ RECEIPTS ═══ */
        .receipts-chat { width: 100%; display: flex; flex-direction: column; gap: 20px; z-index: 1; }
        .receipt-pair { width: 100%; }
        .receipt-tactic-tag {
          font-family: 'JetBrains Mono', monospace; font-size: 0.55rem; font-weight: 800;
          color: var(--neon-red); letter-spacing: 0.12em; text-transform: uppercase;
          margin-bottom: 8px; text-align: left;
        }
        .chat-row { display: flex; align-items: stretch; gap: 8px; width: 100%; }
        .bubble { flex: 1; padding: 14px; border-radius: 14px; text-align: left; }
        .bubble-left { background: rgba(255,255,255,0.05); border: 1px solid var(--border-subtle); border-bottom-left-radius: 4px; }
        .bubble-right { background: rgba(0,255,170,0.06); border: 1px solid rgba(0,255,170,0.15); border-bottom-right-radius: 4px; }
        .bubble-label { font-family: 'JetBrains Mono', monospace; font-size: 0.5rem; color: var(--text-muted); letter-spacing: 0.1em; display: block; margin-bottom: 6px; font-weight: 700; }
        .bubble p { font-size: 0.8rem; line-height: 1.5; margin: 0; }
        .bubble-left p { color: rgba(255,255,255,0.6); }
        .bubble-right p { color: var(--neon-cyan); font-style: italic; }
        .neon-arrow { color: var(--neon-red); font-size: 1.2rem; font-weight: 900; display: flex; align-items: center; text-shadow: 0 0 10px var(--neon-red); }
        .receipt-explain { font-size: 0.72rem; color: var(--text-muted); text-align: left; margin-top: 6px; line-height: 1.4; }

        /* ═══ GAME PLAN ═══ */
        .slide-gameplan { text-align: left; }
        .gameplan-bg { position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(255,45,85,0.06) 0%, transparent 70%); z-index: 0; pointer-events: none; }
        .gp-steps { width: 100%; display: flex; flex-direction: column; gap: 14px; z-index: 1; }
        .gp-step {
          display: flex; gap: 14px; align-items: flex-start;
          background: var(--bg-card); border: 1px solid var(--border-subtle);
          border-radius: 12px; padding: 16px;
        }
        .nuclear-step { border-color: rgba(255,45,85,0.25); background: rgba(255,45,85,0.04); }
        .gp-num { font-family: 'JetBrains Mono', monospace; font-size: 1.2rem; font-weight: 800; color: var(--neon-red); min-width: 30px; }
        .gp-content { flex: 1; }
        .gp-label { font-family: 'JetBrains Mono', monospace; font-size: 0.5rem; color: var(--text-muted); letter-spacing: 0.12em; display: block; margin-bottom: 8px; font-weight: 700; }
        .gp-content p { font-size: 0.85rem; color: var(--text-dim); line-height: 1.5; margin: 0; }
        .gp-template {
          font-family: 'JetBrains Mono', monospace; font-size: 0.85rem;
          color: #fff; background: rgba(255,45,85,0.08); padding: 12px;
          border-radius: 8px; border: 1px solid rgba(255,45,85,0.15);
          line-height: 1.5;
        }
        .viral-box { z-index: 1; width: 100%; text-align: center; padding: 16px; }
        .viral-box p { font-family: 'JetBrains Mono', monospace; font-size: 0.9rem; color: #FFB347; font-style: italic; line-height: 1.4; }
        .final-watermark { font-size: 0.5rem; color: var(--text-muted); letter-spacing: 0.25em; z-index: 1; text-align: center; width: 100%; }

        /* ═══ MOBILE ═══ */
        @media (max-width: 480px) {
          .slide-frame { padding: 44px 14px 86px; }
          .slide-heading { font-size: 1.2rem; }
          .simp-duel { height: 180px; gap: 14px; }
          .simp-bar-v { width: 42px; height: 130px; }
          .simp-pct { font-size: 1.2rem; }
          .ghost-card-cyber { padding: 14px 8px; }
          .gc-time { font-size: 1.3rem; }
          .hm-bars { height: 45px; }
          .emoji-cell { min-width: 70px; }
          .ei-emoji { font-size: 1.6rem; }
          .chat-row { flex-direction: column; }
          .neon-arrow { transform: rotate(90deg); align-self: center; }
          .dial-gauge { width: 130px; height: 65px; }
          .dial-needle { height: 55px; }
          .dial-value { font-size: 2rem; }
          .next-btn { padding: 12px 32px; font-size: 0.75rem; }
          .wanted-name { font-size: 1.2rem; }
          .pw-title { font-size: 1.1rem; }
        }
      `}</style>
    </div>
  );
}
