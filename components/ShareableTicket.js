'use client';

import React from 'react';

/**
 * ShareableTicketComponent
 * A 9:16 high-impact ticket for social media sharing.
 * Designed to be captured by html2canvas.
 * Redesigned for v5.0 Astrological/Editorial Aesthetic.
 */
export default function ShareableTicket({ 
  name, 
  meme_metrics = {}, 
  shock_verdict, 
  dinamica, 
  quien_manda,
  mensaje_viral, 
  reportId, 
  verdictIcon 
}) {
  return (
    <div id="shareable-ticket-capture" className="ticket-container">
      <div className="status-top">
        <span className="terminal-text">REPORT_ID: {reportId || 'PENDING'}</span>
        <span className="terminal-text">ENCRYPTION: AES-256</span>
      </div>

      <div className="ticket-body">
        <div className="header-zone">
          <div className="confidential-seal">CONFIDENTIAL</div>
          <div className="logo-area">
            <span className="logo-emoji-tk">{verdictIcon || '🚩'}</span>
            <h1 className="terminal-title">REDFLAG ARCHIVE</h1>
          </div>
          <p className="dossier-label">UNSPECIFIED DOSSIER: {name?.toUpperCase()}</p>
        </div>

        <div className="verdict-zone">
          <h2 className="shock-title terminal-title">{shock_verdict || 'ANÁLISIS COMPLETADO'}</h2>
          <div className="dominance-badge terminal-text">DOMINANCIA: {quien_manda || 'N/A'}</div>
        </div>

        <div className="metrics-grid-tk">
          <div className="metric-box-tk">
            <div className="m-head-tk">TOXICITY</div>
            <div className="m-value-tk terminal-title">{meme_metrics.toxic_meter || 0}%</div>
            <div className="m-bar-tk"><div className="m-fill-tk" style={{ width: `${meme_metrics.toxic_meter || 0}%`, background: 'var(--accent-red)' }} /></div>
          </div>
          <div className="metric-box-tk">
            <div className="m-head-tk">SIMP_INDEX</div>
            <div className="m-value-tk terminal-title">{meme_metrics.simp_meter || 0}%</div>
            <div className="m-bar-tk"><div className="m-fill-tk" style={{ width: `${meme_metrics.simp_meter || 0}%`, background: 'var(--accent-amber)' }} /></div>
          </div>
        </div>

        <div className="summary-zone">
          <div className="s-row">
            <span className="s-label-tk">VÍNCULO:</span>
            <span className="s-val-tk terminal-text">{dinamica || 'SOSPECHOSO'}</span>
          </div>
        </div>

        <div className="viral-punchline-tk">
          <p className="punch-text">"{mensaje_viral || 'Análisis finalizado por la Agencia RedFlag.'}"</p>
        </div>

        <div className="footer-tk">
          <div className="barcode">|||||| || |||| ||| |||| ||</div>
          <p className="url-tk">REDFLAGSCANNER.XYZ</p>
        </div>
      </div>

      <style jsx>{`
        .ticket-container {
          width: 500px; height: 888px; background: #000; padding: 30px;
          display: flex; flex-direction: column; color: white;
          position: absolute; left: -9999px; top: 0;
          font-family: var(--font-body); border: 2px solid var(--accent-red);
        }

        .status-top { display: flex; justify-content: space-between; margin-bottom: 20px; opacity: 0.5; font-size: 0.65rem; }

        .ticket-body { flex: 1; display: flex; flex-direction: column; border: 1px solid rgba(255,255,255,0.1); padding: 30px; position: relative; }
        
        .confidential-seal {
          position: absolute; top: 40px; right: 20px; font-weight: 900;
          border: 4px solid var(--accent-red); color: var(--accent-red);
          padding: 10px 20px; transform: rotate(15deg); opacity: 0.3; font-size: 1.2rem;
          letter-spacing: 0.2em;
        }

        .header-zone { margin-bottom: 60px; }
        .logo-area { display: flex; align-items: center; gap: 15px; margin-bottom: 15px; }
        .logo-emoji-tk { font-size: 2.5rem; }
        .logo-area h1 { font-size: 1.8rem; letter-spacing: 0.1em; color: white; }
        .dossier-label { font-family: var(--font-terminal); font-size: 0.8rem; color: var(--accent-red); letter-spacing: 0.05em; }

        .verdict-zone { margin-bottom: 60px; text-align: center; border: 1px solid rgba(255,255,255,0.05); padding: 30px 10px; background: rgba(255,45,85,0.02); }
        .shock-title { font-size: 3.5rem; color: var(--accent-red); margin-bottom: 15px; line-height: 1; }
        .dominance-badge { font-size: 0.8rem; color: var(--accent-amber); letter-spacing: 0.1em; }

        .metrics-grid-tk { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 60px; }
        .metric-box-tk { background: rgba(255,255,255,0.03); padding: 20px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05); }
        .m-head-tk { font-family: var(--font-terminal); font-size: 0.6rem; color: rgba(255,255,255,0.4); margin-bottom: 10px; letter-spacing: 0.1em; }
        .m-value-tk { font-size: 1.8rem; margin-bottom: 10px; }
        .m-bar-tk { width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; }
        .m-fill-tk { height: 100%; border-radius: 2px; }

        .summary-zone { margin-bottom: 60px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 30px; }
        .s-row { display: flex; justify-content: space-between; margin-bottom: 15px; }
        .s-label-tk { font-family: var(--font-terminal); font-size: 0.75rem; color: rgba(255,255,255,0.5); }
        .s-val-tk { font-size: 0.95rem; color: white; }

        .viral-punchline-tk { flex: 1; display: flex; align-items: center; justify-content: center; }
        .punch-text { font-family: var(--font-terminal); font-size: 1.4rem; color: var(--accent-amber); text-align: center; font-style: italic; line-height: 1.4; }

        .footer-tk { margin-top: 40px; text-align: center; }
        .barcode { font-size: 1.2rem; margin-bottom: 10px; letter-spacing: 2px; opacity: 0.3; }
        .url-tk { font-family: var(--font-terminal); font-size: 1rem; color: white; opacity: 0.2; letter-spacing: 0.2em; }
      `}</style>
    </div>
  );
}
