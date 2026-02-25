'use client';

import React from 'react';

/**
 * ShareableTicketComponent
 * A 9:16 high-impact ticket for social media sharing.
 * Designed to be captured by html2canvas.
 */
export default function ShareableTicket({ name, metrics = {}, veredicto, dinamica, riskLevel, fraseBrutal }) {
  return (
    <div id="shareable-ticket-capture" className="ticket-container">
      <div className="ticket-border">
        {/* Header */}
        <div className="ticket-header">
          <div className="badge-tag">REPORT v3.5</div>
          <h1 className="logo-text">RED FLAG SCANNER</h1>
          <div className="dating-intel-logo">DATING INTELLIGENCE</div>
        </div>

        <div className="ticket-content">
          <div className="veredicto-section">
            <h2 className="veredicto-text">“{veredicto || 'Hay química... pero falta intención.'}”</h2>
          </div>

          <div className="dinamica-highlight">
            🎯 Dinámica: <span>{dinamica || 'Analizando...'}</span>
          </div>
          
          <div className="metrics-summary-new">
            <div className="mini-status">
              <span className="s-lbl">RIESGO GHOSTING</span>
              <span className={`s-val ${riskLevel?.toLowerCase()}`}>{riskLevel || '...'}</span>
            </div>
            <div className="mini-metric-circular">
              <span className="mc-val">{metrics.coqueteo || 0}%</span>
              <span className="mc-lbl">COQUETEO</span>
            </div>
          </div>

          <div className="target-pill">
            SUJETO: {name || 'Anónimo'}
          </div>

          <div className="brutal-box">
            <p className="brutal-phrase">“{fraseBrutal || 'Te quiere cerca, no comprometido.'}”</p>
          </div>

          <div className="branding-seal">
            <span className="seal-text">VERIFICADO POR REDFLAG AI</span>
          </div>
        </div>

        {/* Footer */}
        <div className="ticket-footer-new">
          <p className="scan-url">redflag-ai-scanner.vercel.app</p>
        </div>
      </div>

      <style jsx>{`
        .ticket-container {
          width: 540px;
          height: 960px;
          background: #000;
          padding: 30px;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          color: white;
          position: absolute;
          left: -9999px;
          top: 0;
          overflow: hidden;
        }

        .ticket-border {
          flex: 1;
          border: 4px solid #ff2d55;
          border-radius: 24px;
          padding: 40px;
          display: flex;
          flex-direction: column;
          position: relative;
          background: radial-gradient(circle at top right, rgba(255, 45, 85, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at bottom left, rgba(57, 255, 20, 0.1) 0%, transparent 50%);
        }

        .ticket-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 50px;
        }

        .badge-tag {
          font-size: 0.7rem;
          font-weight: 900;
          color: #af52de;
          border: 1px solid rgba(175, 82, 222, 0.4);
          padding: 4px 12px;
          border-radius: 50px;
          letter-spacing: 0.1em;
        }

        .logo-text {
          font-family: 'Inter Black', sans-serif;
          font-size: 2.2rem;
          font-weight: 950;
          letter-spacing: -0.05em;
          margin: 0;
          color: white;
          text-shadow: 0 0 20px rgba(255, 45, 85, 0.3);
        }

        .dating-intel-logo {
          font-size: 0.8rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.4em;
          text-transform: uppercase;
        }

        .ticket-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 20px;
        }

        .veredicto-section {
          margin-bottom: 30px;
        }

        .veredicto-text {
          font-family: 'Inter Black', sans-serif;
          font-size: 2.8rem;
          font-weight: 950;
          line-height: 1.1;
          color: white;
          letter-spacing: -0.02em;
        }

        .dinamica-highlight {
          font-size: 1.2rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 50px;
        }

        .dinamica-highlight span {
          color: #39ff14;
        }

        .metrics-summary-new {
          display: flex;
          width: 100%;
          justify-content: space-around;
          align-items: center;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 30px;
          padding: 30px;
          margin-bottom: 50px;
        }

        .mini-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .s-lbl {
          font-size: 0.8rem;
          font-weight: 900;
          color: rgba(255,255,255,0.3);
          letter-spacing: 0.1em;
        }

        .s-val {
          font-family: 'Inter Black', sans-serif;
          font-size: 2.22rem;
          font-weight: 900;
          text-transform: uppercase;
        }

        .s-val.bajo { color: #39ff14; text-shadow: 0 0 15px rgba(57, 255, 20, 0.4); }
        .s-val.moderado { color: #ffcc00; text-shadow: 0 0 15px rgba(255, 204, 0, 0.4); }
        .s-val.alto { color: #ff2d55; text-shadow: 0 0 15px rgba(255, 45, 85, 0.4); }

        .mini-metric-circular {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .mc-val {
          font-family: 'Inter Black', sans-serif;
          font-size: 3.5rem;
          font-weight: 950;
          color: white;
          line-height: 1;
        }

        .mc-lbl {
          font-size: 0.8rem;
          font-weight: 900;
          color: rgba(255, 255, 255, 0.4);
          letter-spacing: 0.1em;
        }

        .target-pill {
          background: rgba(255, 255, 255, 0.05);
          padding: 10px 24px;
          border-radius: 50px;
          font-size: 1.1rem;
          font-weight: 800;
          color: rgba(255,255,255,0.7);
          margin-bottom: 50px;
        }

        .brutal-box {
          width: 100%;
          background: rgba(255, 45, 85, 0.04);
          border: 2px dashed rgba(255, 45, 85, 0.2);
          padding: 40px;
          border-radius: 24px;
          margin-bottom: 50px;
          position: relative;
        }

        .brutal-phrase {
          font-family: 'Inter Black', sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          line-height: 1.25;
          color: white;
          font-style: italic;
        }

        .branding-seal {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-top: auto;
        }

        .seal-text {
          font-size: 0.8rem;
          font-weight: 900;
          color: #39ff14;
          letter-spacing: 0.2em;
          opacity: 0.6;
        }

        .ticket-footer-new {
          margin-top: 60px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 30px;
        }

        .scan-url {
          font-family: 'Inter Black', sans-serif;
          font-size: 1.5rem;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}
