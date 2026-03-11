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

  const slides = [
    renderSlideSiOmeter,
    renderSlideGhosting,
    renderSlideWordCloud,
    renderSlideActivity,
    isUnlocked ? renderSlideProfile : renderPaywall,
    ...(isUnlocked ? [renderSlideToximeter, renderSlideReceipts, renderSlideGamePlan] : [])
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
  // SLIDE 1: SIMP-O-METER
  // ═══════════════════════════════════════════
  function renderSlideSiOmeter() {
    const u1 = localStats?.users?.[0];
    const u2 = localStats?.users?.[1];
    const u1Pct = localStats?.simpScoreBase?.[u1?.name] || 50;
    const u2Pct = localStats?.simpScoreBase?.[u2?.name] || 50;
    const total = localStats?.totalMessages || 0;
    return (
      <div className="slideBody">
        <div className="cyberGrid" />
        <div className="badgeCyber"><span className="badgeDot dotRed" />SIMP-O-METER</div>
        <p className="slideSub">{total.toLocaleString()} mensajes analizados</p>
        <h2 className="slideHeading neonRed">Nivel de Esfuerzo Detectado</h2>
        <div className="simpDuel">
          <div className="simpCol">
            <span className="simpName">{u1?.name?.slice(0, 12)}</span>
            <div className="simpBarV">
              <motion.div className="simpFillV fillNeonRed" initial={{ height: 0 }} animate={{ height: `${u1Pct}%` }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }} />
            </div>
            <motion.span className="simpPct neonRed" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>{u1Pct}%</motion.span>
            <span className="simpCount">{u1?.count?.toLocaleString()} msgs</span>
          </div>
          <div className="simpVs">VS</div>
          <div className="simpCol">
            <span className="simpName">{u2?.name?.slice(0, 12)}</span>
            <div className="simpBarV">
              <motion.div className="simpFillV fillNeonCyan" initial={{ height: 0 }} animate={{ height: `${u2Pct}%` }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }} />
            </div>
            <motion.span className="simpPct neonCyan" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>{u2Pct}%</motion.span>
            <span className="simpCount">{u2?.count?.toLocaleString()} msgs</span>
          </div>
        </div>
        <div className="cyberVerdict">
          <span className="cvIcon">⚡</span>
          <p>{u1Pct > u2Pct ? `${u1?.name} está rogando atención.` : `${u2?.name} está rogando atención.`}</p>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // SLIDE 2: GHOSTING + HEATMAP
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
      <div className="slideBody">
        <div className="cyberGrid" />
        <div className="badgeCyber"><span className="badgeDot dotPurple" />GHOSTING FACTOR</div>
        <h2 className="slideHeading neonPurple">El Horario del Desespero</h2>
        <div className="ghostDuel">
          <div className="ghostCardCyber">
            <span className="gcLabel">Récord sin responder</span>
            <span className="gcName">{u1?.name?.slice(0, 12)}</span>
            <motion.span className="gcTime neonRed" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.4 }}>{g1}</motion.span>
          </div>
          <span className="ghostDivider">⚔️</span>
          <div className="ghostCardCyber">
            <span className="gcLabel">Récord sin responder</span>
            <span className="gcName">{u2?.name?.slice(0, 12)}</span>
            <motion.span className="gcTime neonCyan" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.6 }}>{g2}</motion.span>
          </div>
        </div>
        <div className="heatmapCyber">
          <p className="hmTitle">MAPA DE VULNERABILIDAD (24H)</p>
          <div className="hmBars">
            {dist.map((val, i) => (
              <motion.div key={i} className="hmCol" initial={{ height: 0 }} animate={{ height: `${Math.max(4, (val / maxVal) * 100)}%` }}
                transition={{ duration: 0.8, delay: 0.05 * i }}
                style={{
                  background: i === peak ? '#FF2D55' : i >= 22 || i <= 4 ? 'rgba(255,45,85,0.5)' : 'rgba(0,255,170,0.25)',
                  boxShadow: i === peak ? '0 0 10px #FF2D55' : 'none'
                }}
              />
            ))}
          </div>
          <div className="hmLabels">
            {[0,6,12,18,23].map(h => <span key={h}>{h}h</span>)}
          </div>
        </div>
        <p className="cyberFootnote">{peak >= 22 || peak <= 4 ? `Pico a las ${peak}:00. Esto no es amor, es insomnio.` : `Pico a las ${peak}:00. Al menos tienen horario de oficina.`}</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // SLIDE 3: WORD CLOUD
  // ═══════════════════════════════════════════
  function renderSlideWordCloud() {
    const words = localStats?.topWords || [];
    const maxCount = words[0]?.count || 1;
    const toxicWords = ['perdón', 'perdon', 'siempre', 'nunca', 'culpa', 'mentira', 'odio', 'bloquear', 'celoso', 'celosa', 'sorry', 'please', 'maldita', 'maldito', 'idiota'];
    return (
      <div className="slideBody">
        <div className="cyberGrid" />
        <div className="badgeCyber"><span className="badgeDot dotRed" />WORD SCAN</div>
        <h2 className="slideHeading neonRed">Nube de Palabras Tóxicas</h2>
        <div className="wordCloud">
          {words.map((w, i) => {
            const isToxic = toxicWords.some(tw => w.word.includes(tw));
            const scale = 0.6 + (w.count / maxCount) * 1.4;
            return (
              <motion.span key={i} className={`cloudWord ${isToxic ? 'cloudWordToxic' : ''}`}
                style={{ fontSize: `${Math.max(0.75, scale)}rem` }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 * i, duration: 0.4 }}>
                {w.word}<span className="wordCount">{w.count}</span>
              </motion.span>
            );
          })}
        </div>
        {localStats?.topEmojis?.length > 0 && (
          <div className="emojiBar">
            {localStats.topEmojis.map((e, i) => (
              <div key={i} className="emojiItemCyber">
                <span className="eiEmoji">{e.emoji}</span>
                <span className="eiCount">{e.count}×</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // SLIDE 4: SUMMARY / TEASER
  // ═══════════════════════════════════════════
  function renderSlideActivity() {
    const emojis = localStats?.topEmojis || [];
    return (
      <div className="slideBody">
        <div className="cyberGrid" />
        <div className="badgeCyber"><span className="badgeDot dotCyan" />RESUMEN GRATIS</div>
        <h2 className="slideHeading neonCyan">Lo que sabemos (hasta aquí)</h2>
        <div className="summaryGrid">
          <div className="summaryCell"><span className="scIcon">📊</span><span className="scVal">{localStats?.totalMessages?.toLocaleString()}</span><span className="scLbl">Mensajes</span></div>
          <div className="summaryCell"><span className="scIcon">🚣</span><span className="scVal">{localStats?.mostTalkative?.slice(0,10)}</span><span className="scLbl">Más intenso</span></div>
          <div className="summaryCell"><span className="scIcon">👻</span><span className="scVal">{localStats?.ghostingFactor?.worstGhoster?.slice(0,10)}</span><span className="scLbl">Peor ghoster</span></div>
          <div className="summaryCell"><span className="scIcon">{emojis[0]?.emoji || '😶'}</span><span className="scVal">{emojis[0]?.count || 0}×</span><span className="scLbl">Emoji #1</span></div>
        </div>
        <div className="cyberVerdict teaser">
          <span className="cvIcon">🔒</span>
          <p>Las estadísticas dicen lo que pasó...<br /><strong className="neonRed">La IA sabe POR QUÉ pasó.</strong></p>
        </div>
        <p className="cyberFootnote">Desliza → para revelar el análisis premium</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PAYWALL
  // ═══════════════════════════════════════════
  function renderPaywall() {
    return (
      <div className="slideBody slidePaywall">
        <div className="glitchBg">
          <div className="glitchWord" style={{ top: '15%', left: '10%' }}>NARCISISTA</div>
          <div className="glitchWord" style={{ top: '30%', right: '8%' }}>MENTIRA</div>
          <div className="glitchWord" style={{ top: '55%', left: '15%' }}>GASLIGHTING</div>
          <div className="glitchWord" style={{ top: '70%', right: '12%' }}>INFIDELIDAD</div>
          <div className="glitchWord" style={{ top: '85%', left: '25%' }}>MANIPULACIÓN</div>
        </div>
        <motion.div className="lockIcon" animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2 }}>🔒</motion.div>
        <h2 className="pwTitle">ACCESO RESTRINGIDO</h2>
        <p className="pwSub">Análisis psicológico profundo y Red Flags ocultas detectadas.</p>
        <div className="pwFeaturesCyber">
          {['💀 Ficha del Criminal (Perfil Psicológico)','☣️ Termómetro de Toxicidad','📝 Traductor de Mentiras','🕹️ La Jugada Maestra'].map((f, i) => (
            <motion.div key={i} className="pwFeatCyber" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.15 * i }}>{f}</motion.div>
          ))}
        </div>
        <motion.button className={`ctaBtn ${loading ? 'ctaBtnLoading' : ''}`} onClick={handleCheckoutClick} disabled={loading}
          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
          {loading ? 'Procesando...' : 'REVELAR LA VERDAD — $3.99'}
        </motion.button>
        <p className="pwDisc">Pago único · Acceso inmediato · Generado por IA</p>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PREMIUM: PROFILE (Most Wanted)
  // ═══════════════════════════════════════════
  function renderSlideProfile() {
    const tags = [
      aiResult?.analisis_detallado?.persona?.arquetipo,
      ...(aiResult?.analisis_detallado?.the_receipts?.map(r => r.tactica) || [])
    ].filter(Boolean).slice(0, 4);
    return (
      <div className="slideBody">
        <div className="cyberGrid" />
        <div className="wantedFrame">
          <div className="wantedHeader">
            <div className="wantedTape">EXPEDIENTE CLASIFICADO</div>
            <div className="wantedId">{aiResult?.case_id || 'RF-???-0000'}</div>
          </div>
          <div className="wantedIcon">{aiResult?.verdict_icon || '🎭'}</div>
          <h2 className="wantedName neonRed">{targetName}</h2>
          <p className="wantedAka">a.k.a. &quot;{aiResult?.analisis_detallado?.persona?.arquetipo || 'Sujeto Desconocido'}&quot;</p>
          <div className="tagRow">
            {tags.map((t, i) => <span key={i} className="tagCyber">{t}</span>)}
          </div>
          <p className="wantedDesc">{aiResult?.analisis_detallado?.persona?.descripcion}</p>
          <div className="wantedFooter">
            <div className="wfRow"><span className="wfLbl">VÍNCULO</span><span className="wfVal">{aiResult?.analisis_detallado?.dinamica || '???'}</span></div>
            <div className="wfRow"><span className="wfLbl">DOMINANCIA</span><span className="wfVal neonRed">{aiResult?.analisis_detallado?.quien_manda || 'Indefinida'}</span></div>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PREMIUM: TOXICITY DIAL
  // ═══════════════════════════════════════════
  function renderSlideToximeter() {
    const toxic = aiResult?.meme_metrics?.toxic_meter || 0;
    const ghost = aiResult?.meme_metrics?.ghosting_risk || 0;
    const pbi = aiResult?.meme_metrics?.pbi || 1.0;
    const angle = (toxic / 100) * 180 - 90;
    const zone = toxic < 25 ? 'SANO' : toxic < 50 ? 'DUDOSO' : toxic < 75 ? 'TÓXICO' : 'HUYE DE AQUÍ';
    return (
      <div className="slideBody">
        <div className="cyberGrid" />
        <div className="badgeCyber"><span className="badgeDot dotRed" />TOXICIDAD</div>
        <h2 className="slideHeading neonRed">{aiResult?.shock_verdict || 'ANÁLISIS'}</h2>
        <p className="slideSub italic">{aiResult?.roast_personalizado}</p>
        <div className="dialContainer">
          <div className="dialTrack">
            <div className="dialZone z1">SANO</div>
            <div className="dialZone z2">DUDOSO</div>
            <div className="dialZone z3">TÓXICO</div>
            <div className="dialZone z4">¡HUYE!</div>
          </div>
          <div className="dialGauge">
            <motion.div className="dialNeedle" initial={{ rotate: -90 }} animate={{ rotate: angle }}
              transition={{ type: 'spring', stiffness: 40, damping: 8, delay: 0.5 }} />
            <div className="dialCenter" />
          </div>
          <div className="dialValue neonRed">{toxic}%</div>
          <div className="dialLabel">{zone}</div>
        </div>
        <div className="extraMeters">
          <div className="emRow"><span>Ghosting Risk</span><div className="emTrack"><motion.div className="emFill emFillPurple" initial={{ width: 0 }} animate={{ width: `${ghost}%` }} transition={{ duration: 1.2, delay: 0.8 }} /></div><span>{ghost}%</span></div>
          <div className="emRow"><span>PBI</span><div className="pbiVal">{pbi}</div><span className="pbiStatus">{pbi > 1.5 ? 'Subordinación' : pbi < 0.8 ? 'Control' : 'Inestable'}</span></div>
        </div>
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
        <div className="cyberGrid" />
        <div className="badgeCyber"><span className="badgeDot dotCyan" />THE RECEIPTS</div>
        <h2 className="slideHeading neonCyan">Traductor de Mentiras</h2>
        <div className="receiptsChat">
          {receipts.slice(0, 4).map((r, i) => (
            <motion.div key={i} className="receiptPair" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 * i }}>
              <div className="receiptTacticTag">{r.tactica}</div>
              <div className="chatRow">
                <div className="bubble bubbleLeft">
                  <span className="bubbleLabel">DIJO:</span>
                  <p>&quot;{r.mensaje}&quot;</p>
                </div>
                <div className="neonArrow">→</div>
                <div className="bubble bubbleRight">
                  <span className="bubbleLabel">QUISO DECIR:</span>
                  <p>&quot;{r.traduccion_real}&quot;</p>
                </div>
              </div>
              {r.explicacion && <p className="receiptExplain">↳ {r.explicacion}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // PREMIUM: GAME PLAN
  // ═══════════════════════════════════════════
  function renderSlideGamePlan() {
    return (
      <div className="slideBody slideGameplan">
        <div className="gameplanBg" />
        <div className="badgeCyber"><span className="badgeDot dotRed" />MODO EJECUCIÓN</div>
        <h2 className="slideHeading neonRed">La Jugada Maestra</h2>
        <div className="gpSteps">
          <motion.div className="gpStep" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
            <span className="gpNum">01</span>
            <div className="gpContent">
              <span className="gpLabel">JUGADA MAESTRA</span>
              <p>{aiResult?.estrategia_venganza?.jugada_maestra || 'Contacto Cero'}</p>
            </div>
          </motion.div>
          <motion.div className="gpStep" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
            <span className="gpNum">02</span>
            <div className="gpContent">
              <span className="gpLabel">RESPUESTA DE CONTROL</span>
              <div className="gpTemplate">{aiResult?.estrategia_venganza?.respuesta_control || '...'}</div>
            </div>
          </motion.div>
          <motion.div className="gpStep nuclearStep" initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.6 }}>
            <span className="gpNum">03</span>
            <div className="gpContent">
              <span className="gpLabel">☢️ OPCIÓN NUCLEAR</span>
              <p>{aiResult?.estrategia_venganza?.opcion_nuclear || 'Bloqueo definitivo.'}</p>
            </div>
          </motion.div>
        </div>
        <div className="viralBox">
          <p>&quot;{aiResult?.mensaje_viral || 'El que más escribe siempre es el que menos poder tiene.'}&quot;</p>
        </div>
        <div className="finalWatermark">REDFLAGSCANNER.XYZ</div>
      </div>
    );
  }

  return (
    <div className="storyShell">
      {/* Progress */}
      <div className="progressRow">
        {slides.map((_, i) => (
          <div key={i} className={`seg ${i < currentSlide ? 'segDone' : i === currentSlide ? 'segActive' : ''}`}><div className="segFill" /></div>
        ))}
      </div>

      {/* Tap Zones */}
      <div className="tap tapL" onClick={goPrev} />
      <div className="tap tapR" onClick={goNext} />

      {/* Animated Slide */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentSlide}
          className="slideFrame"
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
        <button className="nextBtn" onClick={goNext}>SIGUIENTE →</button>
      )}

      {/* Counter */}
      <div className="counter">{currentSlide + 1} / {slides.length}</div>
    </div>
  );
}
