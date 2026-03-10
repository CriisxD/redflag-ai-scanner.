'use client';

import { useState, useEffect, useCallback } from 'react';

export default function ResultPaywall({ onCheckout, aiResult, forcedUnlocked = false }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isUnlocked, setIsUnlocked] = useState(forcedUnlocked);
  const [loading, setLoading] = useState(false);
  const [localStats, setLocalStats] = useState(null);
  const [targetName, setTargetName] = useState('Sujeto Anónimo');
  const [animateIn, setAnimateIn] = useState(true);
  const [direction, setDirection] = useState('right');

  const TEST_MODE = false;

  useEffect(() => {
    if (forcedUnlocked) setIsUnlocked(true);
  }, [forcedUnlocked]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('targetName');
      if (saved) setTargetName(saved);
      const stats = localStorage.getItem('rf_local_stats');
      if (stats) { try { setLocalStats(JSON.parse(stats)); } catch(e) {} }
    }
  }, []);

  const goNext = useCallback(() => {
    const maxSlide = isUnlocked ? slides.length - 1 : 5;
    if (currentSlide >= maxSlide) return;
    setDirection('right');
    setAnimateIn(false);
    setTimeout(() => {
      setCurrentSlide(prev => prev + 1);
      setAnimateIn(true);
    }, 180);
  }, [currentSlide, isUnlocked]);

  const goPrev = useCallback(() => {
    if (currentSlide <= 0) return;
    setDirection('left');
    setAnimateIn(false);
    setTimeout(() => {
      setCurrentSlide(prev => prev - 1);
      setAnimateIn(true);
    }, 180);
  }, [currentSlide]);

  const handleCheckoutClick = () => {
    if (TEST_MODE) { setIsUnlocked(true); return; }
    setLoading(true);
    if (onCheckout) onCheckout();
  };

  // ============ SLIDE RENDERERS ============

  const renderSlideIntro = () => {
    const total = localStats?.totalMessages || '???';
    return (
      <div className="slide-content slide-intro">
        <div className="slide-bg-glow glow-red" />
        <div className="slide-inner">
          <div className="intro-emoji-ring">
            <div className="ring-circle" />
            <span className="ring-icon">🔍</span>
          </div>
          <p className="intro-pre">Tu historial con</p>
          <h1 className="intro-name">{targetName}</h1>
          <p className="intro-pre">está listo.</p>
          <div className="intro-stat-card">
            <span className="stat-big">{typeof total === 'number' ? total.toLocaleString() : total}</span>
            <span className="stat-sub">mensajes analizados</span>
          </div>
          <p className="intro-warn">⚠️ Prepárate. Esto puede doler.</p>
        </div>
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
        <div className="slide-bg-glow glow-pink" />
        <div className="slide-inner">
          <div className="badge badge-red">📊 SIMP-O-METER</div>
          <h2 className="slide-heading">¿Quién escribe más?</h2>
          <div className="simp-bars">
            <div className="bar-group">
              <div className="bar-info"><span className="bar-name">{u1?.name?.slice(0, 14)}</span><span className="bar-pct">{u1Pct}%</span></div>
              <div className="bar-track"><div className="bar-fill fill-gradient-red" style={{ width: `${u1Pct}%` }} /></div>
              <span className="bar-count">{u1?.count?.toLocaleString()} msgs</span>
            </div>
            <div className="bar-group">
              <div className="bar-info"><span className="bar-name">{u2?.name?.slice(0, 14)}</span><span className="bar-pct">{u2Pct}%</span></div>
              <div className="bar-track"><div className="bar-fill fill-gradient-amber" style={{ width: `${u2Pct}%` }} /></div>
              <span className="bar-count">{u2?.count?.toLocaleString()} msgs</span>
            </div>
          </div>
          <div className="verdict-card">
            <span className="verdict-emoji">🚣</span>
            <p>Alguien está remando solo en este barco...</p>
            <strong>{winner} está REMANDO</strong>
          </div>
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
        <div className="slide-bg-glow glow-purple" />
        <div className="slide-inner">
          <div className="badge badge-purple">👻 GHOSTING FACTOR</div>
          <h2 className="slide-heading">Récord de espera</h2>
          <div className="ghost-cards">
            <div className="ghost-card glass-card">
              <span className="gc-name">{u1?.name?.slice(0, 12)}</span>
              <span className="gc-time">{g1}</span>
              <span className="gc-label">máx. sin responder</span>
            </div>
            <div className="ghost-vs">VS</div>
            <div className="ghost-card glass-card">
              <span className="gc-name">{u2?.name?.slice(0, 12)}</span>
              <span className="gc-time">{g2}</span>
              <span className="gc-label">máx. sin responder</span>
            </div>
          </div>
          <div className="verdict-card verdict-purple">
            <span className="verdict-emoji">👻</span>
            <p>{ghoster === u1?.name
              ? `${u1?.name} tiene el récord de dejar en visto. ¿Prioridad? Nah.`
              : `${u2?.name} tiene el récord. Eres su "Opción de Emergencia".`
            }</p>
          </div>
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
        <div className="slide-bg-glow glow-amber" />
        <div className="slide-inner">
          <div className="badge badge-amber">🌙 HORARIO DE ACTIVIDAD</div>
          <h2 className="slide-heading">¿Es amor o insomnio?</h2>
          <div className="heatmap glass-card">
            {dist.map((val, i) => (
              <div key={i} className="heat-col">
                <div className="heat-bar" style={{
                  height: `${Math.max(6, (val / maxVal) * 100)}%`,
                  opacity: val === 0 ? 0.08 : 0.3 + (val / maxVal) * 0.7,
                  background: i === peak ? 'linear-gradient(to top, #FF6F61, #FFB347)' : 'linear-gradient(to top, rgba(255,179,71,0.4), rgba(255,111,97,0.2))'
                }} />
                {i % 6 === 0 && <span className="heat-lbl">{i}h</span>}
              </div>
            ))}
          </div>
          <div className="verdict-card verdict-amber">
            <div className="peak-pill">Pico: {peak}:00 ({tod})</div>
            <p>{peak >= 0 && peak < 6
              ? '¿Quién habla a estas horas? Amor tóxico o nadie más les contesta.'
              : peak >= 22
              ? 'Conversaciones nocturnas... el horario del "¿sigues despierto?" 🌚'
              : 'Al menos no se escriben a las 3AM. Eso es... algo.'
            }</p>
          </div>
        </div>
      </div>
    );
  };

  const renderSlideEmojis = () => {
    const emojis = localStats?.topEmojis || [];
    return (
      <div className="slide-content slide-emojis">
        <div className="slide-bg-glow glow-coral" />
        <div className="slide-inner">
          <div className="badge badge-coral">🎭 TOP EMOJIS</div>
          <h2 className="slide-heading">Su lenguaje secreto</h2>
          <div className="emoji-grid">
            {emojis.length > 0 ? emojis.map((e, i) => (
              <div key={i} className="emoji-cell glass-card">
                <span className="emoji-rank">#{i + 1}</span>
                <span className="emoji-icon">{e.emoji}</span>
                <span className="emoji-count">{e.count}×</span>
              </div>
            )) : (
              <div className="emoji-cell glass-card" style={{ gridColumn: 'span 3' }}>
                <span className="emoji-icon">😶</span>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Ni un emoji. Conversación más seca que el Sahara.</p>
              </div>
            )}
          </div>
          <div className="verdict-card verdict-coral">
            <p>{emojis.some(e => ['❤️','😍','🥰','💕','😘'].includes(e.emoji))
              ? 'Hay corazoncitos... pero ¿de quién? El análisis premium lo revela. 👀'
              : emojis.some(e => ['💀','🤡','😭'].includes(e.emoji))
              ? 'Mucho "💀" y poco "❤️". Zona de amistad o caos total.'
              : 'Emojis neutrales. La pasión en este chat está en coma.'
            }</p>
          </div>
        </div>
      </div>
    );
  };

  const renderPaywallSlide = () => (
    <div className="slide-content slide-paywall">
      <div className="slide-bg-glow glow-lock" />
      <div className="slide-inner">
        <div className="lock-anim">🔒</div>
        <h2 className="pw-title">ACCESO RESTRINGIDO</h2>
        <p className="pw-sub">Las estadísticas dicen lo que pasó.</p>
        <p className="pw-hook">La IA sabe <strong>POR QUÉ</strong> pasó.</p>
        <div className="pw-features">
          {['💀 Perfil Psicológico','🚩 Red Flags Ocultas','🔥 Traductor de Subtexto','🕹️ La Jugada Maestra'].map((f, i) => (
            <div key={i} className="pw-feat glass-card">{f}</div>
          ))}
        </div>
        <button className={`pw-btn ${loading ? 'loading' : ''}`} onClick={handleCheckoutClick} disabled={loading}>
          {loading ? 'Procesando...' : 'Desbloquear Análisis — $3.99 USD'}
        </button>
        <p className="pw-disc">Pago único · Acceso inmediato · Generado por IA</p>
      </div>
    </div>
  );

  // ============ PREMIUM SLIDES ============

  const renderSlideArchetype = () => (
    <div className="slide-content slide-archetype">
      <div className="slide-bg-glow glow-lilac" />
      <div className="slide-inner">
        <div className="badge badge-premium">👤 PERFIL PSICOLÓGICO</div>
        <div className="arch-icon">{aiResult?.verdict_icon || '🎭'}</div>
        <h2 className="arch-title">{aiResult?.analisis_detallado?.persona?.arquetipo || 'Arquetipo Desconocido'}</h2>
        <p className="arch-desc">{aiResult?.analisis_detallado?.persona?.descripcion}</p>
        <div className="arch-meta glass-card">
          <div className="meta-row"><span className="meta-lbl">VÍNCULO</span><span className="meta-val">{aiResult?.analisis_detallado?.dinamica || '???'}</span></div>
          <div className="meta-divider" />
          <div className="meta-row"><span className="meta-lbl">DOMINANCIA</span><span className="meta-val highlight-amber">{aiResult?.analisis_detallado?.quien_manda || 'Indefinida'}</span></div>
        </div>
      </div>
    </div>
  );

  const renderSlideToxicity = () => {
    const toxic = aiResult?.meme_metrics?.toxic_meter || 0;
    const ghost = aiResult?.meme_metrics?.ghosting_risk || 0;
    const pbi = aiResult?.meme_metrics?.pbi || 1.0;
    return (
      <div className="slide-content slide-toxicity">
        <div className="slide-bg-glow glow-red" />
        <div className="slide-inner">
          <div className="badge badge-premium">☣️ NIVEL DE TOXICIDAD</div>
          <h2 className="tox-verdict">{aiResult?.shock_verdict || 'ANÁLISIS'}</h2>
          <p className="tox-roast">{aiResult?.roast_personalizado}</p>
          <div className="tox-meters glass-card">
            <div className="meter">
              <div className="meter-head"><span>Toxicidad</span><span className="meter-pct">{toxic}%</span></div>
              <div className="meter-track"><div className="meter-fill fill-gradient-red" style={{ width: `${toxic}%` }} /></div>
            </div>
            <div className="meter">
              <div className="meter-head"><span>Ghosting Risk</span><span className="meter-pct">{ghost}%</span></div>
              <div className="meter-track"><div className="meter-fill fill-gradient-purple" style={{ width: `${ghost}%` }} /></div>
            </div>
          </div>
          <div className="pbi-display glass-card">
            <span className="pbi-label">Power Balance Index</span>
            <span className="pbi-number">{pbi}</span>
            <span className="pbi-status">{pbi > 1.5 ? 'SUBORDINACIÓN EMOCIONAL' : pbi < 0.8 ? 'CONTROL ESTRATÉGICO' : 'BALANCE INESTABLE'}</span>
          </div>
        </div>
      </div>
    );
  };

  const renderSlideReceipts = () => {
    const receipts = aiResult?.analisis_detallado?.the_receipts || [];
    return (
      <div className="slide-content slide-receipts">
        <div className="slide-bg-glow glow-amber" />
        <div className="slide-inner scrollable">
          <div className="badge badge-premium">📝 THE RECEIPTS</div>
          <h2 className="slide-heading">Traductor de Subtexto</h2>
          <div className="receipts-stack">
            {receipts.slice(0, 3).map((r, i) => (
              <div key={i} className="receipt glass-card">
                <div className="rcpt-tactic">{r.tactica}</div>
                <div className="rcpt-quote">"{r.mensaje}"</div>
                <div className="rcpt-trans">
                  <span className="trans-lbl">TRADUCCIÓN REAL:</span>
                  <p>{r.traduccion_real}</p>
                </div>
                {r.explicacion && <p className="rcpt-explain">↳ {r.explicacion}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSlideMasterstroke = () => (
    <div className="slide-content slide-master">
      <div className="slide-bg-glow glow-red" />
      <div className="slide-inner">
        <div className="badge badge-premium">🕹️ LA JUGADA MAESTRA</div>
        <h2 className="master-title">{aiResult?.estrategia_venganza?.jugada_maestra || 'Contacto Cero'}</h2>
        <div className="master-card glass-card">
          <span className="mc-label">RESPUESTA DE CONTROL</span>
          <div className="mc-template">{aiResult?.estrategia_venganza?.respuesta_control}</div>
        </div>
        <div className="master-card glass-card nuclear-card">
          <span className="mc-label">OPCIÓN NUCLEAR (BLOQUEO)</span>
          <p className="mc-text">{aiResult?.estrategia_venganza?.opcion_nuclear}</p>
        </div>
        <div className="viral-quote">
          "{aiResult?.mensaje_viral || 'El que más escribe siempre es el que menos poder tiene.'}"
        </div>
        <div className="watermark">REDFLAGSCANNER.XYZ</div>
      </div>
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

  return (
    <div className="story-shell">
      {/* Progress Bars */}
      <div className="progress-bar-row">
        {slides.map((_, i) => (
          <div key={i} className={`seg ${i < currentSlide ? 'done' : i === currentSlide ? 'active' : ''}`}>
            <div className="seg-fill" />
          </div>
        ))}
      </div>

      {/* Tap Zones */}
      <div className="tap tap-l" onClick={goPrev} />
      <div className="tap tap-r" onClick={goNext} />

      {/* Slide */}
      <div className={`slide-frame ${animateIn ? 'in' : 'out'} dir-${direction}`}>
        {slides[currentSlide]?.()}
      </div>

      {/* Counter */}
      <div className="counter">{currentSlide + 1} / {slides.length}</div>

      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Space+Grotesk:wght@500;700&display=swap');

        .story-shell {
          position: fixed; inset: 0;
          background: #0a0a0f;
          display: flex; flex-direction: column;
          font-family: 'Inter', -apple-system, sans-serif;
          color: #fff;
          overflow: hidden;
          -webkit-user-select: none; user-select: none;
        }

        /* ===== PROGRESS BAR ===== */
        .progress-bar-row {
          display: flex; gap: 4px;
          padding: 14px 12px 0;
          position: absolute; top: 0; left: 0; right: 0;
          z-index: 100;
        }
        .seg { flex: 1; height: 3px; background: rgba(255,255,255,0.12); border-radius: 3px; overflow: hidden; }
        .seg.done .seg-fill { width: 100%; height: 100%; background: rgba(255,255,255,0.65); border-radius: 3px; }
        .seg.active .seg-fill { width: 100%; height: 100%; background: #FF2D55; border-radius: 3px; animation: growBar 0.4s ease forwards; }
        @keyframes growBar { from { width: 0; } to { width: 100%; } }

        /* ===== TAP ZONES ===== */
        .tap { position: absolute; top: 0; bottom: 0; z-index: 50; cursor: pointer; }
        .tap-l { left: 0; width: 28%; }
        .tap-r { right: 0; width: 72%; }

        /* ===== SLIDE FRAME ===== */
        .slide-frame {
          flex: 1; display: flex; align-items: center; justify-content: center;
          padding: 50px 20px 60px;
          transition: opacity 0.18s ease, transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .slide-frame.in { opacity: 1; transform: translateX(0) scale(1); }
        .slide-frame.out.dir-right { opacity: 0; transform: translateX(40px) scale(0.97); }
        .slide-frame.out.dir-left { opacity: 0; transform: translateX(-40px) scale(0.97); }

        /* ===== COUNTER ===== */
        .counter {
          position: absolute; bottom: 18px; left: 50%; transform: translateX(-50%);
          font-size: 0.65rem; color: rgba(255,255,255,0.2);
          font-family: 'Space Grotesk', monospace; letter-spacing: 0.15em;
        }

        /* ===== SHARED STYLES ===== */
        .slide-content {
          width: 100%; max-width: 440px;
          display: flex; flex-direction: column; align-items: center;
          position: relative;
        }
        .slide-inner {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 18px; width: 100%;
          position: relative; z-index: 2;
        }
        .scrollable { overflow-y: auto; max-height: calc(100vh - 110px); padding-bottom: 20px; }
        .scrollable::-webkit-scrollbar { width: 0; }

        /* Background Glow */
        .slide-bg-glow {
          position: absolute; width: 300px; height: 300px;
          border-radius: 50%; filter: blur(120px);
          z-index: 0; pointer-events: none;
          top: 50%; left: 50%; transform: translate(-50%, -50%);
        }
        .glow-red { background: rgba(255, 45, 85, 0.15); }
        .glow-pink { background: rgba(255, 100, 130, 0.12); }
        .glow-purple { background: rgba(139, 92, 246, 0.15); }
        .glow-amber { background: rgba(255, 179, 71, 0.12); }
        .glow-coral { background: rgba(255, 111, 97, 0.12); }
        .glow-lilac { background: rgba(192, 132, 252, 0.15); }
        .glow-lock { background: rgba(255, 45, 85, 0.2); width: 400px; height: 400px; }

        /* Badges */
        .badge {
          font-size: 0.6rem; font-weight: 800;
          letter-spacing: 0.14em; text-transform: uppercase;
          padding: 6px 18px; border-radius: 50px;
          backdrop-filter: blur(10px);
        }
        .badge-red { color: #FF6F61; background: rgba(255,111,97,0.12); border: 1px solid rgba(255,111,97,0.25); }
        .badge-purple { color: #A78BFA; background: rgba(167,139,250,0.12); border: 1px solid rgba(167,139,250,0.25); }
        .badge-amber { color: #FFB347; background: rgba(255,179,71,0.12); border: 1px solid rgba(255,179,71,0.25); }
        .badge-coral { color: #FF6F61; background: rgba(255,111,97,0.12); border: 1px solid rgba(255,111,97,0.25); }
        .badge-premium { color: #C084FC; background: rgba(192,132,252,0.12); border: 1px solid rgba(192,132,252,0.25); }

        .slide-heading {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem; font-weight: 700; line-height: 1.2;
          background: linear-gradient(135deg, #fff 40%, rgba(255,255,255,0.6));
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }

        /* Glass Card */
        .glass-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 18px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        /* Verdict card */
        .verdict-card {
          background: rgba(255,45,85,0.06);
          border: 1px solid rgba(255,45,85,0.15);
          border-radius: 14px; padding: 16px 18px;
          width: 100%;
        }
        .verdict-card p { font-size: 0.85rem; color: rgba(255,255,255,0.6); line-height: 1.5; margin: 0 0 6px; }
        .verdict-card strong { color: #FF2D55; font-size: 0.9rem; }
        .verdict-emoji { font-size: 1.5rem; display: block; margin-bottom: 8px; }
        .verdict-purple { background: rgba(139,92,246,0.06); border-color: rgba(139,92,246,0.15); }
        .verdict-amber { background: rgba(255,179,71,0.06); border-color: rgba(255,179,71,0.15); }
        .verdict-coral { background: rgba(255,111,97,0.06); border-color: rgba(255,111,97,0.15); }

        /* Gradient fills */
        .fill-gradient-red { background: linear-gradient(90deg, #FF2D55, #FF6F61); }
        .fill-gradient-amber { background: linear-gradient(90deg, #FFB347, #FFCC80); }
        .fill-gradient-purple { background: linear-gradient(90deg, #8B5CF6, #A78BFA); }

        /* ===== SLIDE: INTRO ===== */
        .intro-emoji-ring { position: relative; width: 80px; height: 80px; margin-bottom: 10px; }
        .ring-circle {
          position: absolute; inset: 0; border-radius: 50%;
          border: 3px solid transparent;
          background: conic-gradient(from 0deg, #FF2D55, #FF6F61, #FFB347, #FF2D55) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor; mask-composite: exclude;
          animation: spinRing 4s linear infinite;
        }
        @keyframes spinRing { to { transform: rotate(360deg); } }
        .ring-icon { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; }
        .intro-pre { font-size: 1rem; color: rgba(255,255,255,0.5); margin: 0; font-weight: 500; }
        .intro-name {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2.2rem; font-weight: 900; color: #FF2D55;
          text-shadow: 0 0 40px rgba(255,45,85,0.4);
          line-height: 1.1;
        }
        .intro-stat-card {
          display: flex; flex-direction: column; gap: 4px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px; padding: 20px 30px;
          backdrop-filter: blur(10px);
        }
        .stat-big {
          font-family: 'Space Grotesk', monospace;
          font-size: 3rem; font-weight: 900; color: #fff;
        }
        .stat-sub { font-size: 0.75rem; color: rgba(255,255,255,0.4); text-transform: uppercase; letter-spacing: 0.12em; }
        .intro-warn { font-size: 0.8rem; color: rgba(255,255,255,0.35); font-style: italic; }

        /* ===== SLIDE: SIMP ===== */
        .simp-bars { width: 100%; display: flex; flex-direction: column; gap: 14px; }
        .bar-group { width: 100%; }
        .bar-info { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .bar-name { font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.7); }
        .bar-pct { font-size: 0.75rem; font-weight: 800; color: #fff; font-family: 'Space Grotesk', monospace; }
        .bar-track { width: 100%; height: 24px; background: rgba(255,255,255,0.06); border-radius: 12px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 12px; transition: width 1.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .bar-count { font-size: 0.6rem; color: rgba(255,255,255,0.3); font-family: 'Space Grotesk', monospace; margin-top: 4px; display: block; }

        /* ===== SLIDE: GHOST ===== */
        .ghost-cards { display: flex; align-items: center; gap: 12px; width: 100%; }
        .ghost-card { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 8px; }
        .gc-name { font-size: 0.65rem; color: rgba(255,255,255,0.5); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
        .gc-time { font-family: 'Space Grotesk', monospace; font-size: 1.8rem; font-weight: 900; color: #A78BFA; }
        .gc-label { font-size: 0.55rem; color: rgba(255,255,255,0.3); }
        .ghost-vs { font-size: 1rem; font-weight: 900; color: rgba(255,255,255,0.15); }

        /* ===== SLIDE: ACTIVITY ===== */
        .heatmap {
          display: flex; align-items: flex-end; gap: 2px;
          width: 100%; height: 130px;
          padding: 12px 8px 22px; position: relative;
        }
        .heat-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; position: relative; }
        .heat-bar { width: 100%; border-radius: 3px 3px 0 0; transition: height 1s ease; min-height: 3px; }
        .heat-lbl { position: absolute; bottom: -16px; font-size: 0.45rem; color: rgba(255,255,255,0.25); font-family: 'Space Grotesk', monospace; }
        .peak-pill {
          font-size: 0.7rem; font-weight: 700; color: #FFB347;
          background: rgba(255,179,71,0.12); padding: 5px 14px;
          border-radius: 20px; display: inline-block; margin-bottom: 8px;
        }

        /* ===== SLIDE: EMOJIS ===== */
        .emoji-grid { display: flex; gap: 12px; justify-content: center; }
        .emoji-cell { display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 90px; }
        .emoji-rank { font-size: 0.55rem; color: rgba(255,255,255,0.3); font-weight: 700; }
        .emoji-icon { font-size: 3rem; }
        .emoji-count { font-size: 0.75rem; font-weight: 800; color: rgba(255,255,255,0.6); font-family: 'Space Grotesk', monospace; }

        /* ===== SLIDE: PAYWALL ===== */
        .lock-anim { font-size: 4rem; animation: lockPulse 2s ease infinite; }
        @keyframes lockPulse { 0%,100% { transform: scale(1); filter: drop-shadow(0 0 10px rgba(255,45,85,0.3)); } 50% { transform: scale(1.12); filter: drop-shadow(0 0 30px rgba(255,45,85,0.6)); } }
        .pw-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.6rem; font-weight: 900;
          background: linear-gradient(135deg, #FF2D55, #FF6F61);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          letter-spacing: 0.08em;
        }
        .pw-sub { font-size: 0.95rem; color: rgba(255,255,255,0.5); margin: 0; }
        .pw-hook { font-size: 1.05rem; color: rgba(255,255,255,0.8); margin: 0; }
        .pw-hook strong { color: #FF2D55; }
        .pw-features { display: flex; flex-direction: column; gap: 8px; width: 100%; }
        .pw-feat { text-align: left; font-size: 0.85rem; color: rgba(255,255,255,0.7); padding: 14px 18px; }
        .pw-btn {
          width: 100%; padding: 18px; border: none;
          background: linear-gradient(135deg, #FF2D55, #FF6F61);
          color: #fff; font-size: 1rem; font-weight: 800;
          border-radius: 14px; cursor: pointer;
          box-shadow: 0 4px 30px rgba(255,45,85,0.35);
          transition: all 0.2s; text-transform: uppercase;
          letter-spacing: 0.05em;
          font-family: 'Space Grotesk', sans-serif;
        }
        .pw-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 40px rgba(255,45,85,0.5); }
        .pw-btn.loading { opacity: 0.5; cursor: wait; }
        .pw-disc { font-size: 0.65rem; color: rgba(255,255,255,0.25); }

        /* ===== PREMIUM: ARCHETYPE ===== */
        .arch-icon { font-size: 3.5rem; filter: drop-shadow(0 0 20px rgba(192,132,252,0.4)); }
        .arch-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.6rem; font-weight: 900;
          background: linear-gradient(135deg, #C084FC, #E0B0FF);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .arch-desc { font-size: 0.88rem; color: rgba(255,255,255,0.55); line-height: 1.6; }
        .arch-meta { width: 100%; }
        .meta-row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; }
        .meta-lbl { font-size: 0.6rem; color: rgba(255,255,255,0.35); letter-spacing: 0.1em; font-weight: 700; }
        .meta-val { font-size: 0.85rem; font-weight: 700; color: #fff; }
        .highlight-amber { color: #FFB347; }
        .meta-divider { width: 100%; height: 1px; background: rgba(255,255,255,0.06); margin: 4px 0; }

        /* ===== PREMIUM: TOXICITY ===== */
        .tox-verdict {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 2rem; font-weight: 900;
          background: linear-gradient(135deg, #FF2D55, #FF6F61);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .tox-roast { font-size: 0.85rem; color: rgba(255,255,255,0.5); line-height: 1.5; font-style: italic; }
        .tox-meters { width: 100%; }
        .meter { margin-bottom: 14px; }
        .meter-head { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 0.7rem; color: rgba(255,255,255,0.5); }
        .meter-pct { font-weight: 800; color: #fff; font-family: 'Space Grotesk', monospace; }
        .meter-track { width: 100%; height: 10px; background: rgba(255,255,255,0.06); border-radius: 5px; overflow: hidden; }
        .meter-fill { height: 100%; border-radius: 5px; transition: width 1.2s ease; }
        .pbi-display {
          display: flex; flex-direction: column; align-items: center; gap: 6px; width: 100%;
        }
        .pbi-label { font-size: 0.6rem; color: rgba(255,255,255,0.35); letter-spacing: 0.1em; }
        .pbi-number {
          font-family: 'Space Grotesk', monospace;
          font-size: 3rem; font-weight: 900;
          background: linear-gradient(135deg, #FF2D55, #C084FC);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .pbi-status { font-size: 0.65rem; font-weight: 800; color: #FFB347; letter-spacing: 0.1em; }

        /* ===== PREMIUM: RECEIPTS ===== */
        .receipts-stack { width: 100%; display: flex; flex-direction: column; gap: 14px; text-align: left; }
        .receipt { border-left: 3px solid #FF2D55; border-radius: 0 16px 16px 0; }
        .rcpt-tactic { font-size: 0.6rem; color: #FFB347; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px; }
        .rcpt-quote { font-size: 0.9rem; color: #fff; font-style: italic; line-height: 1.4; margin-bottom: 12px; }
        .rcpt-trans {
          background: rgba(255,179,71,0.06); padding: 12px;
          border-radius: 10px; border-left: 2px solid rgba(255,179,71,0.3);
        }
        .trans-lbl { font-size: 0.55rem; color: #FFB347; font-weight: 800; letter-spacing: 0.1em; display: block; margin-bottom: 5px; }
        .rcpt-trans p { font-size: 0.82rem; color: rgba(255,255,255,0.65); line-height: 1.5; margin: 0; }
        .rcpt-explain { font-size: 0.78rem; color: rgba(255,255,255,0.4); line-height: 1.4; margin-top: 10px; }

        /* ===== PREMIUM: MASTERSTROKE ===== */
        .master-title {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 1.5rem; font-weight: 900;
          background: linear-gradient(135deg, #C084FC, #FF6F61);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .master-card { width: 100%; text-align: left; }
        .nuclear-card { border-color: rgba(255,45,85,0.2); background: rgba(255,45,85,0.04); }
        .mc-label { font-size: 0.55rem; color: #FFB347; font-weight: 800; letter-spacing: 0.1em; display: block; margin-bottom: 10px; }
        .mc-template {
          font-size: 0.92rem; color: #fff; line-height: 1.5;
          font-family: 'Space Grotesk', monospace;
          background: rgba(255,45,85,0.08); padding: 14px;
          border-radius: 10px; border: 1px solid rgba(255,45,85,0.15);
        }
        .mc-text { font-size: 0.85rem; color: rgba(255,255,255,0.6); line-height: 1.5; margin: 0; }
        .viral-quote {
          font-size: 1rem; color: #FFB347; font-style: italic;
          line-height: 1.4; margin-top: 8px;
          font-family: 'Space Grotesk', sans-serif;
        }
        .watermark { font-size: 0.55rem; color: rgba(255,255,255,0.1); letter-spacing: 0.2em; margin-top: 16px; }

        /* ===== MOBILE RESPONSIVE ===== */
        @media (max-width: 480px) {
          .slide-frame { padding: 46px 16px 54px; }
          .slide-inner { gap: 14px; }
          .slide-heading { font-size: 1.3rem; }
          .intro-name { font-size: 1.8rem; }
          .stat-big { font-size: 2.5rem; }
          .gc-time { font-size: 1.5rem; }
          .ghost-cards { gap: 8px; }
          .ghost-card { padding: 14px 8px; }
          .emoji-cell { min-width: 75px; padding: 14px 10px; }
          .emoji-icon { font-size: 2.5rem; }
          .pw-btn { font-size: 0.9rem; padding: 16px; }
          .arch-title { font-size: 1.3rem; }
          .tox-verdict { font-size: 1.6rem; }
          .pbi-number { font-size: 2.5rem; }
          .master-title { font-size: 1.3rem; }
        }
      `}</style>
    </div>
  );
}
