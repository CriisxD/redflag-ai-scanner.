'use client';

import { useState, useEffect, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/LangContext';
import styles from './result.module.css';

function ScoreCircle({ score, riskLevel, label }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let current = 0;
    const step = score / 60;
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        setDisplayScore(score);
        clearInterval(interval);
      } else {
        setDisplayScore(Math.round(current));
      }
    }, 16);
    return () => clearInterval(interval);
  }, [score]);

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (displayScore / 100) * circumference;

  const getColor = () => {
    if (score >= 80) return '#ff2d55';
    if (score >= 60) return '#ff9500';
    if (score >= 40) return '#ffcc00';
    return '#30d158';
  };

  return (
    <div className={styles.scoreCircle}>
      <svg width="160" height="160" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
        <circle
          cx="60" cy="60" r="54" fill="none"
          stroke={getColor()}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dashoffset 0.05s ease', filter: `drop-shadow(0 0 12px ${getColor()})` }}
        />
      </svg>
      <div className={styles.scoreInner}>
        <span className={styles.scoreLabel}>{label}</span>
        <span className={styles.scoreValue} style={{ color: getColor() }}>{displayScore}%</span>
        <span className={styles.riskLabel} style={{ color: getColor() }}>{riskLevel}</span>
      </div>
    </div>
  );
}

function GhostingBar({ probability, label }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    setTimeout(() => setWidth(probability), 200);
  }, [probability]);

  return (
    <div className={styles.statBlock}>
      <div className={styles.statHeader}>
        <span className={styles.statEmoji}>👻</span>
        <span className={styles.statTitle}>{label}</span>
        <span className={styles.statValue}>{probability}%</span>
      </div>
      <div className={styles.progressTrack}>
        <div
          className={styles.progressFill}
          style={{ width: `${width}%`, transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)' }}
        />
      </div>
    </div>
  );
}

function AttachmentBadge({ style, label }) {
  const badgeConfig = {
    Avoidant: { emoji: '🛡️', color: '#ff9500', desc: { es: 'Esquivas la intimidad como si fuera un deporte', en: "You dodge intimacy like it's a sport" } },
    Anxious: { emoji: '💗', color: '#ff2d55', desc: { es: 'Mandas doble texto, triple preocupación', en: 'You double-text, triple-worry' } },
    Secure: { emoji: '✨', color: '#30d158', desc: { es: 'De alguna forma eres emocionalmente sano/a', en: "Somehow you're actually healthy" } },
    Fearful: { emoji: '😰', color: '#bf5af2', desc: { es: 'Quieres amor, pero te aterroriza', en: 'Want love, terrified of love' } },
    Chaotic: { emoji: '🌪️', color: '#ff3b30', desc: { es: 'Tu vida amorosa es una telenovela', en: 'Your love life is a telenovela' } },
  };
  const config = badgeConfig[style] || badgeConfig.Chaotic;

  return (
    <div className={styles.statBlock}>
      <div className={styles.statHeader}>
        <span className={styles.statEmoji}>{config.emoji}</span>
        <span className={styles.statTitle}>{label}</span>
      </div>
      <div className={styles.attachmentBadge} style={{ borderColor: config.color, color: config.color }}>
        <span className={styles.attachmentName}>{style}</span>
      </div>
      <p className={styles.attachmentDesc}>{typeof config.desc === 'object' ? config.desc.es : config.desc}</p>
    </div>
  );
}

function AttachmentBadgeTranslated({ style, label, lang }) {
  const badgeConfig = {
    Avoidant: { emoji: '🛡️', color: '#ff9500', desc: { es: 'Esquivas la intimidad como si fuera un deporte', en: "You dodge intimacy like it's a sport" } },
    Anxious: { emoji: '💗', color: '#ff2d55', desc: { es: 'Mandas doble texto, triple preocupación', en: 'You double-text, triple-worry' } },
    Secure: { emoji: '✨', color: '#30d158', desc: { es: 'De alguna forma eres emocionalmente sano/a', en: "Somehow you're actually healthy" } },
    Fearful: { emoji: '😰', color: '#bf5af2', desc: { es: 'Quieres amor, pero te aterroriza', en: 'Want love, terrified of love' } },
    Chaotic: { emoji: '🌪️', color: '#ff3b30', desc: { es: 'Tu vida amorosa es una telenovela', en: 'Your love life is a telenovela' } },
  };
  const config = badgeConfig[style] || badgeConfig.Chaotic;

  return (
    <div className={styles.statBlock}>
      <div className={styles.statHeader}>
        <span className={styles.statEmoji}>{config.emoji}</span>
        <span className={styles.statTitle}>{label}</span>
      </div>
      <div className={styles.attachmentBadge} style={{ borderColor: config.color, color: config.color }}>
        <span className={styles.attachmentName}>{style}</span>
      </div>
      <p className={styles.attachmentDesc}>{config.desc[lang] || config.desc.en}</p>
    </div>
  );
}

function ShareableCard({ data, cardRef, t }) {
  return (
    <div ref={cardRef} className={styles.shareCard}>
      <div className={styles.shareHeader}>
        <span className={styles.shareBadge}>{t.accordingTo}</span>
        <h1 className={styles.shareTitle}>{t.shareTitle}</h1>
      </div>

      <div className={styles.shareScoreSection}>
        <div className={styles.shareToxicCircle}>
          <span className={styles.shareToxicValue}>{data.toxicScore}%</span>
          <span className={styles.shareToxicLabel}>{t.toxicScoreLabel}</span>
        </div>
      </div>

      <div className={styles.shareMainInsight}>
        <div className={styles.shareRevelation}>
          <span className={styles.shareRevHeader}>{t.uncomfortableTruthHead}</span>
          <p className={styles.shareRevBody}>{data.uncomfortableTruth}</p>
        </div>
        <div className={styles.shareRevelation}>
          <span className={styles.shareRevHeader}>{t.futurePredictionHead}</span>
          <p className={styles.shareRevBody}>{data.futurePrediction}</p>
        </div>
      </div>

      <div className={styles.shareStatsGrid}>
        <div className={styles.shareStat}>
          <span className={styles.shareStatLabel}>🧠 {t.shareStyle}</span>
          <span className={styles.shareStatValue}>{data.attachmentStyle || '—'}</span>
        </div>
        <div className={styles.shareStat}>
          <span className={styles.shareStatLabel}>🚩 {t.shareHiddenLabel}</span>
          <span className={styles.shareStatValue}>{data.hiddenRedFlag || '—'}</span>
        </div>
      </div>

      <div className={styles.shareFooter}>
        <div className={styles.shareCtaBox}>
          <span>{t.shareScanYours}</span>
          <span className={styles.shareUrl}>redflagai.app</span>
        </div>
      </div>
    </div>
  );
}

export default function ResultPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { t, lang } = useLang();
  const cardRef = useRef(null);
  const [data, setData] = useState(null);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showShare, setShowShare] = useState(false);

  useEffect(() => {
    fetchResult();

    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('paid') === 'true') {
      setPaid(true);
    }
    if (urlParams.get('checkout') === 'ex') {
      setTimeout(() => handleCheckout(), 500);
    }
  }, []);

  const fetchResult = async () => {
    try {
      const res = await fetch(`/api/result/${id}`);
      const json = await res.json();
      setData(json);
      setPaid(json.paid);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId: id }),
      });
      const json = await res.json();
      if (json.url) {
        window.location.href = json.url;
      } else {
        setPaid(true);
        setCheckoutLoading(false);
        fetchResult();
      }
    } catch (err) {
      console.error(err);
      setCheckoutLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setShowShare(true);

    await new Promise((r) => setTimeout(r, 300));

    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0a0a0f',
        scale: 2,
        width: 1080 / 2,
        height: 1920 / 2,
      });
      const link = document.createElement('a');
      link.download = `redflag-scan-${id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Download error:', err);
    }
    setShowShare(false);
  };

  if (loading) {
    return (
      <div className={styles.resultPage}>
        <div className={styles.loadingState}>
          <div className={styles.spinner} />
          <p>{t.loadingResults}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className={styles.resultPage}>
        <div className={styles.errorState}>
          <p>{t.resultNotFound}</p>
          <button className="btn-secondary" onClick={() => router.push('/scan')}>{t.tryAgain}</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.resultPage}>
      <div className={styles.content}>
        {/* Score — always visible */}
        <div className={styles.scoreSection}>
          <ScoreCircle score={data.toxicScore} riskLevel={data.riskLevel} label={t.toxicScoreLabel} />
        </div>

        {/* Preview / Full Result */}
        {!paid ? (
          <>
            {/* Identity Hook (Free) */}
            <div className={styles.identityHeader}>
              <div className={styles.toxicCircle}>
                <span className={styles.toxicValue}>{data.redFlagLevel || 78}%</span>
                <span className={styles.toxicLabel}>{t.redFlagLevelLabel}</span>
              </div>
            </div>

            <div className={styles.identityContent}>
              <div className={styles.identityCard}>
                <span className={styles.revelationHeader}>{t.redFlagRealTitle}</span>
                <p className={styles.revelationBody}>{data.dominantRedFlag}</p>
              </div>

              <div className={styles.identityCard}>
                <span className={styles.revelationHeader}>{t.whatYouProjectTitle}</span>
                <p className={styles.revelationBody}>{data.whatYouProject}</p>
              </div>

              <div className={styles.identityCard}>
                <span className={styles.revelationHeader}>{t.futureTeaserTitle}</span>
                <p className={styles.revelationBody}>{data.futureTeaser}</p>
              </div>
            </div>

            {/* Checkout CTA */}
            <div className={styles.checkoutSection}>
              <button
                className="btn-primary"
                onClick={handleCheckout}
                disabled={checkoutLoading}
                style={{ width: '100%' }}
              >
                {checkoutLoading ? (
                  <>
                    <span className={styles.btnSpinner} />
                    {t.redirecting}
                  </>
                ) : (
                  t.revealCta
                )}
              </button>
              <p className={styles.urgencyNote}>
                {t.urgencyNote}
              </p>
            </div>
          </>
        ) : (
          <>
            {/* ===== FULL PREMIUM RESULT (Narrative) ===== */}
            <div className={styles.fullResult}>

              {/* Red Flag Level Header */}
              <div className={styles.premiumHeader}>
                <div className={styles.toxicCircle}>
                  <span className={styles.toxicValue}>{data.redFlagLevel}%</span>
                  <span className={styles.toxicLabel}>{t.redFlagLevelLabel}</span>
                </div>
              </div>

              {/* Deep Analysis Grid */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{t.deepAnalysisTitle}</h3>
                <div className={styles.revelationGrid}>
                  <div className={`${styles.revelationCard} ${styles.truthCard}`}>
                    <span className={styles.revelationHeader}>{t.originTitle}</span>
                    <p className={styles.revelationBody}>{data.deepAnalysis?.howItStarted}</p>
                  </div>
                  <div className={`${styles.revelationCard} ${styles.destinyCard}`}>
                    <span className={styles.revelationHeader}>{t.effectTitle}</span>
                    <p className={styles.revelationBody}>{data.deepAnalysis?.howItAffects}</p>
                  </div>
                  <div className={`${styles.revelationCard} ${styles.secretCard}`}>
                    <span className={styles.revelationHeader}>{t.attractionTitle}</span>
                    <p className={styles.revelationBody}>{data.deepAnalysis?.whatYouAttract}</p>
                  </div>
                  <div className={`${styles.revelationCard} ${styles.soulmateCard}`}>
                    <span className={styles.revelationHeader}>{t.projectionTitle}</span>
                    <p className={styles.revelationBody}>{data.deepAnalysis?.howOthersSee}</p>
                  </div>
                </div>
              </div>

              {/* Ex Secrets - The "Balloons" */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>💀 {t.exSecretHead}</h3>
                <div className={styles.phraseList}>
                  {data.exSecrets?.map((secret, i) => (
                    <div key={i} className={styles.phraseItem} style={{ animationDelay: `${i * 0.1}s` }}>
                      <span className={styles.phraseQuote}>"</span>
                      <p>{secret}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Future Story / Destiny */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>{t.futureStoryTitle}</h3>
                <div className={`${styles.destinyStory} glass-card`}>
                  <div className={styles.destinyMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>{t.futureDateLabel}</span>
                      <span className={styles.metaValue}>{data.futureStory?.dateRange}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>{t.futurePersonLabel}</span>
                      <span className={styles.metaValue}>{data.futureStory?.personType}</span>
                    </div>
                  </div>
                  <p className={styles.destinyOutcome}>
                    <strong>{t.futureOutcomeLabel}</strong> {data.futureStory?.outcome}
                  </p>
                </div>
              </div>

              {/* Final Verdict */}
              <div className={styles.section}>
                <div className={`${styles.conclusionCard} glass-card`}>
                  <p>{data.finalVerdict}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <button className="btn-primary" onClick={handleDownload} style={{ flex: 1 }}>
                {t.downloadStory}
              </button>
              <button className="btn-secondary" onClick={() => router.push('/scan')} style={{ flex: 1 }}>
                {t.scanAnother}
              </button>
            </div>

            {/* Scan Your Ex Upsell */}
            <div className={styles.upsellSection}>
              <div className={styles.upsellDivider}>
                <span>{t.or}</span>
              </div>
              <button
                className={styles.upsellButton}
                onClick={() => router.push('/scan?mode=ex')}
              >
                <span className={styles.upsellEmoji}>💀</span>
                <div className={styles.upsellText}>
                  <span className={styles.upsellTitle}>{t.scanYourEx}</span>
                  <span className={styles.upsellPrice}>{t.scanYourExPrice}</span>
                </div>
                <span className={styles.upsellArrow}>→</span>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Hidden shareable card for download */}
      {showShare && data && (
        <div style={{ position: 'fixed', left: '-9999px', top: 0 }}>
          <ShareableCard data={data} cardRef={cardRef} t={t} />
        </div>
      )}
    </div>
  );
}
