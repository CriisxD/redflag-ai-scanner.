'use client';

import { LangProvider, useLang } from '@/lib/LangContext';
import styles from './lang-toggle.module.css';

function LangToggle() {
  const { lang, switchLang } = useLang();

  return (
    <div className={styles.langToggle}>
      <button
        className={`${styles.langBtn} ${lang === 'es' ? styles.active : ''}`}
        onClick={() => switchLang('es')}
      >
        ES
      </button>
      <button
        className={`${styles.langBtn} ${lang === 'en' ? styles.active : ''}`}
        onClick={() => switchLang('en')}
      >
        EN
      </button>
    </div>
  );
}

export default function ClientLayout({ children }) {
  return (
    <LangProvider>
      <LangToggle />
      {children}
    </LangProvider>
  );
}
