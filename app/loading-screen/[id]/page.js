'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/lib/LangContext';
import styles from './loading.module.css';

export default function LoadingScreen({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { t } = useLang();
  const [progress, setProgress] = useState(0);
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState('');

  const MESSAGES = t.loadingMessages;

  // Animate progress bar
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) {
          clearInterval(interval);
          return 98;
        }
        // Targeted duration: ~6-8 seconds to reach 95%
        // 100ms * 70-80 steps
        return prev + Math.random() * 1.8 + 0.2;
      });
    }, 100);
    return () => clearInterval(interval);
  }, []);

  // Sync messages to progress bands for "earned" feeling
  useEffect(() => {
    let index = 0;
    if (progress > 90) index = 5;
    else if (progress > 72) index = 4;
    else if (progress > 55) index = 3;
    else if (progress > 38) index = 2;
    else if (progress > 20) index = 1;

    setMessageIndex(index);
  }, [progress]);

  // Animate dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  // Poll for completion
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const isExMode = urlParams.get('mode') === 'ex';

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/status/${id}`);
        const data = await res.json();
        if (data.status === 'complete') {
          // If we are already near the end, complete it
          if (progress >= 90) {
            setProgress(100);
            clearInterval(pollInterval);
            setTimeout(() => {
              if (isExMode) {
                router.push(`/result/${id}?checkout=ex`);
              } else {
                router.push(`/result/${id}`);
              }
            }, 800);
          }
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 1500);

    return () => clearInterval(pollInterval);
  }, [id, router, progress]);

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const isExMode = urlParams?.get('mode') === 'ex';

  return (
    <div className={styles.loadingPage}>
      <div className={styles.content}>
        <div className={styles.scannerRing}>
          <div className={styles.ringOuter}>
            <div className={styles.ringInner}>
              <span className={styles.scanEmoji}>🚩</span>
            </div>
          </div>
        </div>

        <h2 className={styles.title}>{isExMode ? t.loadingTitleEx : t.loadingTitle}</h2>

        {/* Progress Bar */}
        <div className={styles.progressWrapper}>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className={styles.progressText}>{Math.round(Math.min(progress, 100))}%</span>
        </div>

        {/* Dynamic Message */}
        <div className={styles.messageBox}>
          {progress > 92 ? (
            <div className={styles.highTension}>
              <span className={styles.tensionEmoji}>⚠️</span>
              <span className={styles.messageText}>{t.loadingHighTension}</span>
            </div>
          ) : (
            <>
              <span className={styles.messageEmoji}>{MESSAGES[messageIndex].emoji}</span>
              <span className={styles.messageText} key={messageIndex}>
                {MESSAGES[messageIndex].text}{dots}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
