'use client';

import React from 'react';

/**
 * ShareableTicketComponent
 * A 9:16 high-impact ticket for social media sharing.
 * Designed to be captured by html2canvas.
 */
export default function ShareableTicket({ name, metrics = {}, veredicto, dinamica, subContextual, fraseViral, lineaPatron, reportId, verdictIcon, balancePoder }) {
  return (
    <div id="shareable-ticket-capture" className="ticket-container">
      {/* HUD Elements */}
      <div className="ticket-hud">
        <div className="hud-id-tk">{reportId || 'ID-RESERVADO'}</div>
        <div className="hud-balance-tk">{balancePoder || 'ANÁLISIS DE PODER: DETECTADO'}</div>
        <div className="hud-sec-tk">C O N F I D E N T I A L</div>
      </div>

      <div className="ticket-border">
        {/* Header */}
        <div className="ticket-header">
          <div className="badge-tag">EXPEDIENTE REDFLAG</div>
          <h1 className="logo-text">AGENCIA INTEL</h1>
          <div className="dating-intel-logo">ROMANTIC INTELLIGENCE</div>
        </div>

        <div className="ticket-content">
          <p className="sub-header-ticket">{subContextual || 'Análisis personalizado'}</p>
          
          <div className="veredicto-section">
            <div className="v-icon-tk">{verdictIcon || '🚩'}</div>
            <h2 className="veredicto-text">“{veredicto || 'Hay química... pero falta intención.'}”</h2>
          </div>

          <div className="dinamica-highlight">
            <span>Dinámica Detectada:</span> {dinamica || 'Analizando...'}
          </div>
          
          <div className="metrics-v36-ticket">
            {Object.entries(metrics).map(([key, m], idx) => (
              <div key={idx} className="m-row-ticket">
                <div className="m-info-ticket">
                  <span className="m-label-ticket">{m.label}</span>
                  <span className="m-val-ticket" style={{ color: m.color }}>{m.valor}%</span>
                </div>
                <div className="m-bar-ticket">
                  <div className="m-fill-ticket" style={{ width: `${m.valor}%`, backgroundColor: m.color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="target-pill-v36">
            SUJETO: {name || 'Anónimo'}
          </div>

          <div className="viral-block-ticket">
            <p className="v-phrase">“{fraseViral || 'Te quiere cerca, no comprometido.'}”</p>
            <span className="v-pattern">{lineaPatron || 'Patrón común en dinámicas sin avance.'}</span>
          </div>

          <div className="branding-seal">
            <span className="seal-text">VERIFICADO POR REDFLAG AI</span>
          </div>
        </div>

        {/* Footer */}
        <div className="ticket-footer-new">
          <p className="scan-url">redflagscanner.xyz</p>
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

        .ticket-container {
          position: relative;
          width: 500px;
          height: 888px;
          background: #000;
          overflow: hidden;
        }

        .ticket-hud {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          padding: 20px;
          font-family: 'Courier New', monospace;
          opacity: 0.3;
        }

        .hud-id-tk { font-size: 0.6rem; font-weight: 950; color: rgba(255,255,255,0.4); }
        .hud-balance-tk { position: absolute; top: 18px; right: 22px; font-size: 0.55rem; color: #ffcc00; font-weight: 900; letter-spacing: 0.05em; }
        .hud-sec-tk { 
          position: absolute; bottom: 15%; right: -50px; 
          font-size: 5rem; font-weight: 950; color: rgba(255,255,255,0.02);
          transform: rotate(-45deg); 
        }

        .ticket-border {
          position: relative;
          z-index: 5;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          padding: 60px 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ticket-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-bottom: 40px;
        }

        .badge-tag {
          font-size: 0.7rem;
          font-weight: 950;
          color: #af52de;
          border: 1px solid rgba(175, 82, 222, 0.4);
          padding: 4px 12px;
          border-radius: 50px;
          letter-spacing: 0.2em;
        }

        .logo-text {
          font-family: 'Inter Black', sans-serif;
          font-size: 2rem;
          font-weight: 950;
          letter-spacing: -0.05em;
          margin: 0;
          color: white;
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
        }

        .sub-header-ticket {
          font-size: 0.8rem;
          font-weight: 700;
          color: rgba(255,255,255,0.3);
          margin-bottom: 25px;
        }

        .veredicto-section {
          margin-bottom: 30px;
        }

        .v-icon-tk {
          font-size: 4.5rem;
          margin-bottom: 10px;
        }

        .veredicto-text {
          font-family: 'Inter Black', sans-serif;
          font-size: 2.8rem;
          font-weight: 950;
          line-height: 1.05;
          color: white;
          letter-spacing: -0.04em;
        }

        .dinamica-highlight {
          font-size: 1rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.5);
          margin-bottom: 40px;
        }

        .dinamica-highlight span {
          color: #39ff14;
        }

        .metrics-v36-ticket {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 20px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 40px;
        }

        .m-row-ticket {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .m-info-ticket {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }

        .m-label-ticket {
          font-size: 0.7rem;
          font-weight: 900;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
        }

        .m-val-ticket {
          font-family: 'Inter Black', sans-serif;
          font-size: 1.1rem;
          font-weight: 950;
        }

        .m-bar-ticket {
          width: 100%;
          height: 10px;
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
          overflow: hidden;
        }

        .m-fill-ticket {
          height: 100%;
          border-radius: 10px;
        }

        .target-pill-v36 {
          background: rgba(255, 255, 255, 0.05);
          padding: 8px 18px;
          border-radius: 50px;
          font-size: 0.95rem;
          font-weight: 800;
          color: rgba(255,255,255,0.7);
          margin-bottom: 40px;
        }

        .viral-block-ticket {
          width: 100%;
          border-top: 1px solid rgba(255,255,255,0.08);
          padding-top: 25px;
          margin-bottom: 40px;
        }

        .v-phrase {
          font-family: 'Inter Black', sans-serif;
          font-size: 1.6rem;
          font-weight: 900;
          line-height: 1.25;
          color: white;
          font-style: italic;
          margin-bottom: 15px;
        }

        .v-pattern {
          font-size: 0.75rem;
          font-weight: 900;
          color: #ff9500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .branding-seal {
          margin-top: auto;
        }

        .seal-text {
          font-size: 0.75rem;
          font-weight: 900;
          color: #39ff14;
          letter-spacing: 0.2em;
          opacity: 0.5;
        }

        .ticket-footer-new {
          margin-top: 50px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 25px;
        }

        .scan-url {
          font-family: 'Inter Black', sans-serif;
          font-size: 1.3rem;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}
