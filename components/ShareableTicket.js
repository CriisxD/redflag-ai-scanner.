'use client';

import React from 'react';

/**
 * ShareableTicketComponent
 * A 9:16 high-impact ticket for social media sharing.
 * Designed to be captured by html2canvas.
 */
export default function ShareableTicket({ name, metrics = {}, veredicto, dinamica, subContextual, fraseViral, lineaPatron }) {
  return (
    <div id="shareable-ticket-capture" className="ticket-container">
      <div className="ticket-border">
        {/* Header */}
        <div className="ticket-header">
          <div className="badge-tag">SCAN v3.6 PRECISION</div>
          <h1 className="logo-text">RED FLAG SCANNER</h1>
          <div className="dating-intel-logo">DATING INTELLIGENCE</div>
        </div>

        <div className="ticket-content">
          <p className="sub-header-ticket">{subContextual || 'Análisis personalizado'}</p>
          
          <div className="veredicto-section">
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
                  <span className="m-val-ticket">{m.valor}%</span>
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
          padding: 0 10px;
        }

        .sub-header-ticket {
          font-size: 0.85rem;
          font-weight: 700;
          color: rgba(255,255,255,0.4);
          margin-bottom: 20px;
        }

        .veredicto-section {
          margin-bottom: 25px;
        }

        .veredicto-text {
          font-family: 'Inter Black', sans-serif;
          font-size: 3rem;
          font-weight: 950;
          line-height: 1.05;
          color: white;
          letter-spacing: -0.03em;
        }

        .dinamica-highlight {
          font-size: 1.1rem;
          font-weight: 800;
          color: rgba(255, 255, 255, 0.6);
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
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 24px;
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
          font-size: 0.75rem;
          font-weight: 900;
          color: rgba(255,255,255,0.5);
          text-transform: uppercase;
        }

        .m-val-ticket {
          font-family: 'Inter Black', sans-serif;
          font-size: 1.2rem;
          font-weight: 950;
          color: white;
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
          padding: 8px 20px;
          border-radius: 50px;
          font-size: 1rem;
          font-weight: 800;
          color: rgba(255,255,255,0.7);
          margin-bottom: 40px;
        }

        .viral-block-ticket {
          width: 100%;
          background: rgba(255, 45, 85, 0.04);
          border: 2px dashed rgba(255, 45, 85, 0.2);
          padding: 30px;
          border-radius: 20px;
          margin-bottom: 40px;
        }

        .v-phrase {
          font-family: 'Inter Black', sans-serif;
          font-size: 1.6rem;
          font-weight: 900;
          line-height: 1.2;
          color: white;
          font-style: italic;
          margin-bottom: 12px;
        }

        .v-pattern {
          font-size: 0.75rem;
          font-weight: 900;
          color: #ff9500;
          text-transform: uppercase;
          letter-spacing: 0.1em;
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
          margin-top: 50px;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 25px;
        }

        .scan-url {
          font-family: 'Inter Black', sans-serif;
          font-size: 1.4rem;
          color: rgba(255, 255, 255, 0.2);
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}
