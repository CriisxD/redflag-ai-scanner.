'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './StoryMode.css';

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

  // Slide definitions
  const slides = [
    renderSlideInteres,     // Viral Interest Balance
    renderSlideEmotional,   // Emotional Heatmap
    renderSlideActivity,    // Time activity (Heatmap)
    renderSlideRedFlags,    // Top Patterns
    isUnlocked ? renderSlideProfile : renderPaywall,
    ...(isUnlocked ? [renderSlideLoveIndex, renderSlideRupture, renderSlideReceipts, renderSlideGamePlan] : [])
  ];

  const maxSlide = isUnlocked ? slides.length - 1 : 4;

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

  const variants = {
    enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0, scale: 0.95 }),
  };

  // ═══════════════════════════════════════════
  // SLIDE 1: BALANCE DE INTERÉS
  // ═══════════════════════════════════════════
  function renderSlideInteres() {
    const u1Name = localStats?.users?.[0]?.name || 'Tú';
    const u2Name = localStats?.users?.[1]?.name || targetName;
    const u1Pct = localStats?.simpScoreBase?.[u1Name] || 50;
    const u2Pct = localStats?.simpScoreBase?.[u2Name] || 50;
    const trend = localStats?.interestTrend || { percentChange: 0, status: 'Estable' };
    const initiators = localStats?.initiatorStats || {};
    const u1Init = initiators[u1Name] || 0;
    const u2Init = initiators[u2Name] || 0;

    return (
      <div className="slideBody">
        <div className="ambientGlow" />
        <div className="badge badgePink">BALANCE DE INTERÉS</div>
        <h2 className="slideHeading">¿Quién busca a quién?</h2>
        <div className="glassCard">
          <div className="dualMeter">
            <div className="meterRow">
              <div className="meterLabel"><span>{u1Name}</span><span>{u1Pct}%</span></div>
              <div className="meterTrack"><motion.div className="meterFill" style={{ width: `${u1Pct}%`, background: 'var(--accent-cyan)' }} initial={{ width: 0 }} animate={{ width: `${u1Pct}%` }} transition={{ duration: 1 }} /></div>
            </div>
            <div className="meterRow">
              <div className="meterLabel"><span>{u2Name}</span><span>{u2Pct}%</span></div>
              <div className="meterTrack"><motion.div className="meterFill" style={{ width: `${u2Pct}%`, background: 'var(--accent-pink)' }} initial={{ width: 0 }} animate={{ width: `${u2Pct}%` }} transition={{ duration: 1 }} /></div>
            </div>
          </div>
          <div className="statGrid">
            <div className="statItem">
              <span className="statVal">%{trend.percentChange}</span>
              <span className="statName">Evolución de interés</span>
            </div>
            <div className="statItem">
              <span className="statVal">{u2Init}</span>
              <span className="statName">Iniciadas por {u2Name}</span>
            </div>
          </div>
        </div>
        <p className="slideSub">
          {trend.percentChange < -20 
            ? `El interés de ${u2Name} ha caído un ${Math.abs(trend.percentChange)}% desde que empezaron.` 
            : `La dinámica se mantiene ${trend.status.toLowerCase()}.`}
        </p>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // SLIDE 2: MAPA EMOCIONAL
  // ═══════════════════════════════════════════
  function renderSlideEmotional() {
    const heat = aiResult?.emotional_heatmap || { love: 45, neutral: 30, tension: 15, conflict: 10 };
    return (
      <div className="slideBody">
        <div className="ambientGlow" />
        <div className="badge badgeCyan">MAPA EMOCIONAL</div>
        <h2 className="slideHeading">Vibras del Chat</h2>
        <div className="emotionGrid">
          <div className="emotionCell">
            <span className="emIcon">❤️</span>
            <span className="emVal">{heat.love}%</span>
            <span className="emLbl">Amor</span>
          </div>
          <div className="emotionCell">
            <span className="emIcon">😐</span>
            <span className="emVal">{heat.neutral}%</span>
            <span className="emLbl">Neutral</span>
          </div>
          <div className="emotionCell">
            <span className="emIcon">⚡</span>
            <span className="emVal">{heat.tension}%</span>
            <span className="emLbl">Tensión</span>
          </div>
          <div className="emotionCell">
            <span className="emIcon">😡</span>
            <span className="emVal">{heat.conflict}%</span>
            <span className="emLbl">Conflicto</span>
          </div>
        </div>
        <div className="glassCard" style={{ marginTop: '10px' }}>
          <p className="slideSub" style={{ margin: 0 }}>
            {heat.conflict > 20 ? "Hay un nivel de toxicidad latente preocupante." : "La comunicación es mayormente estable."}
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // SLIDE 3: ACTIVIDAD (HEATMAP)
  // ═══════════════════════════════════════════
  function renderSlideActivity() {
    const dist = localStats?.activityData?.hourlyDistribution || new Array(24).fill(0);
    const maxVal = Math.max(...dist, 1);
    const peakHour = localStats?.activityData?.peakHour || 22;
    return (
      <div className="slideBody">
        <div className="ambientGlow" />
        <div className="badge badgePink">INFRAESTRUCTURA</div>
        <h2 className="slideHeading">Tu Prime Time</h2>
        <div className="glassCard">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2px', height: '100px', marginBottom: '15px' }}>
            {dist.map((val, i) => (
              <motion.div key={i} style={{ flex: 1, background: i === peakHour ? 'var(--accent-pink)' : 'rgba(255,255,255,0.1)', height: `${(val/maxVal) * 100}%`, borderRadius: '2px' }} initial={{ height: 0 }} animate={{ height: `${(val/maxVal) * 100}%` }} transition={{ delay: i * 0.02 }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.6rem', color: 'var(--text-secondary)' }}>
            <span>00h</span><span>06h</span><span>12h</span><span>18h</span><span>23h</span>
          </div>
        </div>
        <p className="slideSub">Tu mayor pico de actividad es a las <strong>{peakHour}:00h</strong>. {peakHour > 23 || peakHour < 5 ? "Típico de situaciones nocturnas." : "Interacción de horario saludable."}</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // SLIDE 4: RED FLAGS (VIRAL CARDS)
  // ═══════════════════════════════════════════
  function renderSlideRedFlags() {
    const flags = aiResult?.red_flags_detectadas || ["Manipulación Emocional", "Gaslighting"];
    return (
      <div className="slideBody">
        <div className="ambientGlow" />
        <div className="badge badgePink">PATRONES DETECTADOS</div>
        <h2 className="slideHeading">Tus Red Flags</h2>
        <div className="slideScrollable">
          {flags.map((flag, i) => (
            <motion.div key={i} className="glassCard" style={{ marginBottom: '12px', borderLeft: '4px solid var(--accent-pink)', textAlign: 'left', padding: '16px 20px' }} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.1 }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem' }}>{flag}</span>
            </motion.div>
          ))}
          <div className="glassCard" style={{ background: 'rgba(255, 45, 133, 0.05)', borderColor: 'rgba(255, 45, 133, 0.2)' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>🔒 5 patrones premium bloqueados</span>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // SLIDE: PAYWALL
  // ═══════════════════════════════════════════
  function renderPaywall() {
    return (
      <div className="slideBody" style={{ gap: '24px' }}>
        <div className="ambientGlow" />
        <motion.div style={{ fontSize: '4rem' }} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>💎</motion.div>
        <h2 className="slideHeading">Revela las verdades incómodas</h2>
        <div className="pwFeatures" style={{ width: '100%', display: 'flex', flexDirection: column, gap: '10px' }}>
          {[
            '💔 Probabilidad Real de Ruptura',
            '🕵️ Detector de Inconsistencias',
            '❤️ Índice: ¿Quién ama más?',
            '🧩 Perfil Psicológico de Apego',
            '🕹️ La Jugada Maestra de Venganza'
          ].map((f, i) => (
            <div key={i} className="glassCard" style={{ padding: '12px 20px', textAlign: 'left', fontSize: '0.9rem' }}>{f}</div>
          ))}
        </div>
        <motion.button className="nextBtn" style={{ position: 'relative', bottom: 'auto', left: 'auto', transform: 'none', width: '100%', maxWidth: 'none', background: 'var(--accent-pink)', color: 'white' }} onClick={handleCheckoutClick} disabled={loading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          {loading ? 'Procesando...' : 'DESBLOQUEAR TODO — $3.99'}
        </motion.button>
        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Acceso de por vida a este análisis • Pago seguro</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PREMIUM: PROFILE (Wanted style)
  // ═══════════════════════════════════════════
  function renderSlideProfile() {
    return (
      <div className="slideBody">
        <div className="ambientGlow" />
        <div className="badge badgeCyan">PERFIL PSICOLÓGICO</div>
        <div className="glassCard" style={{ border: '2px solid var(--accent-cyan)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>{aiResult?.verdict_icon || '🧩'}</div>
          <h2 className="slideHeading" style={{ fontSize: '1.8rem' }}>{targetName}</h2>
          <div className="badge badgeCyan" style={{ marginTop: '8px' }}>Apego {aiResult?.analisis_detallado?.attachment_style || 'Desconocido'}</div>
          <p className="slideSub" style={{ marginTop: '16px' }}>{aiResult?.analisis_detallado?.attachment_desc}</p>
        </div>
        <div className="glassCard">
          <span className="badge badgePink">Veredicto Final</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{aiResult?.shock_verdict}</h3>
          <p className="slideSub">{aiResult?.roast_personalizado}</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PREMIUM: LOVE INDEX
  // ═══════════════════════════════════════════
  function renderSlideLoveIndex() {
    const userLove = aiResult?.viral_stats?.love_index_user || 70;
    const targetLove = aiResult?.viral_stats?.love_index_target || 40;
    return (
      <div className="slideBody">
        <div className="ambientGlow" />
        <div className="badge badgePink">ÍNDICE DE INTERÉS</div>
        <h2 className="slideHeading">¿Quién ama más?</h2>
        <div className="glassCard">
          <div className="scoreDisplay">
            <span className="scoreValue">{userLove} vs {targetLove}</span>
            <span className="scoreLabel">Tú vs {targetName}</span>
          </div>
          <p className="slideSub" style={{ marginTop: '20px' }}>
            {aiResult?.analisis_detallado?.quien_ama_mas 
              ? `Veredicto: ${aiResult.analisis_detallado.quien_ama_mas}` 
              : "Hay un desbalance claro en la inversión emocional."}
          </p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PREMIUM: RUPTURE PROBABILITY
  // ═══════════════════════════════════════════
  function renderSlideRupture() {
    const prob = aiResult?.viral_stats?.rupture_prob || 50;
    const lies = aiResult?.viral_stats?.lie_count || 0;
    return (
      <div className="slideBody">
        <div className="ambientGlow" />
        <div className="badge badgePink">PRONÓSTICO</div>
        <h2 className="slideHeading">Probabilidad de Ruptura</h2>
        <div className="dialWrapper">
            <div className="dialTrack" />
            <motion.div className="dialFill" initial={{ rotate: -135 }} animate={{ rotate: -135 + (prob * 1.8) }} transition={{ duration: 1.5, ease: 'easeOut' }} />
            <div className="dialValue">{prob}%</div>
        </div>
        <div className="statGrid">
            <div className="statItem">
                <span className="statVal">{lies}</span>
                <span className="statName">Inconsistencias</span>
            </div>
            <div className="statItem">
                <span className="statVal">Próx. 6m</span>
                <span className="statName">Horizonte</span>
            </div>
        </div>
        <p className="slideSub">Basado en el enfriamiento del chat y las tácticas de manipulación detectadas.</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PREMIUM: THE RECEIPTS
  // ═══════════════════════════════════════════
  function renderSlideReceipts() {
    const receipts = aiResult?.analisis_detallado?.the_receipts || [];
    return (
      <div className="slideBody slideScrollable">
        <div className="ambientGlow" />
        <div className="badge badgeCyan">THE RECEIPTS</div>
        <h2 className="slideHeading">Traductor de Verdad</h2>
        {receipts.map((r, i) => (
          <motion.div key={i} className="glassCard" style={{ marginBottom: '16px', padding: '16px', fontSize: '0.85rem' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
             <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>&quot;{r.mensaje}&quot;</p>
             <div style={{ margin: '8px 0', fontWeight: 800, color: 'var(--accent-pink)' }}>→ TRADUCCIÓN REAL:</div>
             <p style={{ fontWeight: 700 }}>&quot;{r.traduccion_real}&quot;</p>
             <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Táctica: {r.tactica}</div>
          </motion.div>
        ))}
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PREMIUM: GAME PLAN
  // ═══════════════════════════════════════════
  function renderSlideGamePlan() {
    return (
      <div className="slideBody slideScrollable">
        <div className="ambientGlow" />
        <div className="badge badgePink">LA JUGADA MAESTRA</div>
        <h2 className="slideHeading">Tu Plan de Poder</h2>
        <div className="glassCard" style={{ borderLeftColor: 'var(--accent-cyan)' }}>
           <span className="badge badgeCyan">Paso 1</span>
           <p style={{ fontWeight: 800, marginBottom: '4px' }}>{aiResult?.estrategia_venganza?.jugada_maestra}</p>
        </div>
        <div className="glassCard">
           <span className="badge badgePink">Paso 2: Responde esto</span>
           <div style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', fontStyle: 'italic' }}>{aiResult?.estrategia_venganza?.respuesta_control}</div>
        </div>
        <div className="glassCard" style={{ borderLeftColor: '#ff0000' }}>
           <span className="badge" style={{ background: '#ff0000', color: 'white' }}>Paso 3: Opción Nuclear</span>
           <p>{aiResult?.estrategia_venganza?.opcion_nuclear}</p>
        </div>
        <p className="slideSub" style={{ marginTop: '20px', fontStyle: 'italic' }}>&quot;{aiResult?.mensaje_viral}&quot;</p>
      </div>
    );
  }

  return (
    <div className="storyShell">
      <div className="progressRow">
        {slides.map((_, i) => (
          <div key={i} className={`seg ${i < currentSlide ? 'segDone' : i === currentSlide ? 'segActive' : ''}`}><div className="segFill" /></div>
        ))}
      </div>

      <div className="tap tapL" onClick={goPrev} />
      <div className="tap tapR" onClick={goNext} />

      <AnimatePresence mode="wait" custom={direction}>
        <motion.div key={currentSlide} className="slideFrame" custom={direction} variants={variants} initial="enter" animate="center" exit="exit" transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
          {slides[currentSlide]?.()}
        </motion.div>
      </AnimatePresence>

      {currentSlide < maxSlide && !(currentSlide === 4 && !isUnlocked) && (
        <button className="nextBtn" onClick={goNext}>CONTINUAR →</button>
      )}
    </div>
  );
}
