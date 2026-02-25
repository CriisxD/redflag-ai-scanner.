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
  metrics = {}, 
  veredicto, 
  dinamica, 
  subContextual, 
  fraseViral, 
  reportId, 
  verdictIcon, 
  balancePoder 
}) {
  return (
    <div id="shareable-ticket-capture" className="ticket-container">
      <div className="ambient-glow-tk" />
      
      {/* HUD Elements -> Now Astrological Watermarks */}
      <div className="ticket-hud">
        <div className="hud-id-tk">{reportId || 'ID-RESERVADO'}</div>
        <div className="hud-balance-tk">{balancePoder || 'LECTURA ENERGÉTICA'}</div>
        <div className="hud-sec-tk">P A T T E R N S</div>
      </div>

      <div className="ticket-border">
        {/* Header */}
        <div className="ticket-header">
          <div className="badge-tag">LECTURA DE VÍNCULO</div>
          <h1 className="logo-text">SOUL KINETICS</h1>
          <div className="dating-intel-logo">V4.3 | HEURISTIC MODEL</div>
        </div>

        <div className="ticket-content">
          <p className="sub-header-ticket">{subContextual || 'Análisis de Interacción'}</p>
          
          <div className="veredicto-section">
            <div className="v-icon-tk">{verdictIcon || '🧿'}</div>
            <h2 className="veredicto-text">“{veredicto || 'Hay química... pero falta intención.'}”</h2>
          </div>

          <div className="dinamica-highlight">
             <span className="d-label">Dinámica Central:</span>
             <span className="d-value">{dinamica || 'Analizando...'}</span>
          </div>
          
          <div className="metrics-v36-ticket">
            {Object.entries(metrics).map(([key, m], idx) => (
              <div key={idx} className="m-row-ticket">
                <div className="m-info-ticket">
                  <span className="m-label-ticket">{m.label}</span>
                  <span className="m-val-ticket" style={{ color: m.color }}>{m.valor}%</span>
                </div>
                <div className="m-bar-ticket">
                  <div 
                    className="m-fill-ticket" 
                    style={{ 
                      width: `${m.valor}%`, 
                      background: `linear-gradient(90deg, ${m.color}66, ${m.color})`,
                      boxShadow: `0 0 10px ${m.color}33`
                    }} 
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="target-pill-v36">
            VÍNCULO CON: {name?.toUpperCase() || 'ANÓNIMO'}
          </div>

          <div className="viral-block-ticket">
            <p className="v-phrase">“{fraseViral || 'El que más escribe siempre tiene menos poder.'}”</p>
            <span className="v-pattern">SOUL KINETICS | DEEP DIVE</span>
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
          width: 500px;
          height: 888px;
          background: #050505;
          padding: 25px;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          color: white;
          position: absolute;
          left: -9999px;
          top: 0;
          overflow: hidden;
        }

        .ambient-glow-tk {
          position: absolute; top: -10%; right: -10%; width: 100%; height: 60%;
          background: radial-gradient(circle, rgba(224, 176, 255, 0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .ticket-hud {
          position: absolute; inset: 0; pointer-events: none; z-index: 1;
          padding: 25px; font-family: 'Inter', sans-serif; opacity: 0.4;
        }

        .hud-id-tk { font-size: 0.6rem; font-weight: 800; color: rgba(255,255,255,0.3); letter-spacing: 0.1em; }
        .hud-balance-tk { position: absolute; top: 25px; right: 25px; font-size: 0.55rem; color: #E0B0FF; font-weight: 800; letter-spacing: 0.15em; }
        .hud-sec-tk { 
          position: absolute; bottom: 12%; right: -40px; 
          font-family: 'Playfair Display', serif;
          font-size: 6rem; font-weight: 700; color: rgba(224, 176, 255, 0.03);
          transform: rotate(-30deg); white-space: nowrap;
        }

        .ticket-border {
          position: relative; z-index: 5; width: 100%; height: 100%;
          display: flex; flex-direction: column; padding: 50px 30px;
          border: 1px solid rgba(224, 176, 255, 0.15);
          border-radius: 40px;
          background: rgba(10, 6, 18, 0.6);
          backdrop-filter: blur(10px);
        }

        .ticket-header {
          display: flex; flex-direction: column; align-items: center; gap: 8px; margin-bottom: 35px;
        }

        .badge-tag {
          font-size: 0.65rem; font-weight: 800; color: #1A0B2E;
          background: linear-gradient(135deg, #E0B0FF, #F2D8FF); 
          padding: 6px 16px; border-radius: 50px; letter-spacing: 0.15em;
        }

        .logo-text {
          font-family: 'Playfair Display', serif; font-size: 2.2rem; font-weight: 700;
          letter-spacing: -0.02em; margin: 0; color: #FFF3E0;
        }

        .dating-intel-logo {
          font-size: 0.65rem; font-weight: 800; color: #E0B0FF;
          letter-spacing: 0.3em; text-transform: uppercase;
        }

        .ticket-content { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; }

        .sub-header-ticket {
          font-family: 'Playfair Display', serif; font-size: 0.95rem; font-weight: 500; font-style: italic;
          color: rgba(255,255,255,0.4); margin-bottom: 25px;
        }

        .veredicto-section { margin-bottom: 35px; }

        .v-icon-tk {
          font-size: 4.5rem; margin-bottom: 12px; line-height: 1;
          filter: drop-shadow(0 0 20px rgba(224, 176, 255, 0.2));
        }

        .veredicto-text {
          font-family: 'Playfair Display', serif; font-size: 2.5rem; font-weight: 700;
          line-height: 1.1; color: #FFF3E0; letter-spacing: -0.02em;
        }

        .dinamica-highlight { margin-bottom: 40px; display: flex; flex-direction: column; gap: 4px; }
        .d-label { font-size: 0.8rem; font-weight: 500; color: rgba(255,255,255,0.4); }
        .d-value { font-size: 1.1rem; font-weight: 800; color: #E0B0FF; }

        .metrics-v36-ticket {
          width: 100%; display: flex; flex-direction: column; gap: 20px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(224, 176, 255, 0.1);
          border-radius: 20px; padding: 25px; margin-bottom: 35px;
        }

        .m-row-ticket { display: flex; flex-direction: column; gap: 8px; }
        .m-info-ticket { display: flex; justify-content: space-between; align-items: flex-end; }
        .m-label-ticket { font-size: 0.8rem; font-weight: 700; color: rgba(255,255,255,0.6); }
        .m-val-ticket { font-family: 'Playfair Display', serif; font-size: 1.4rem; font-weight: 700; }

        .m-bar-ticket {
          width: 100%; height: 10px; background: rgba(255,255,255,0.05);
          border-radius: 10px; overflow: hidden;
        }

        .m-fill-ticket { height: 100%; border-radius: 10px; }

        .target-pill-v36 {
          background: rgba(224, 176, 255, 0.05); border: 1px solid rgba(224, 176, 255, 0.2);
          padding: 10px 22px; border-radius: 50px; font-size: 0.85rem; font-weight: 800;
          color: #E0B0FF; margin-bottom: 40px; letter-spacing: 0.05em;
        }

        .viral-block-ticket {
          width: 100%; border-top: 1px solid rgba(224, 176, 255, 0.15);
          padding-top: 30px; margin-bottom: 40px;
        }

        .v-phrase {
          font-family: 'Playfair Display', serif; font-size: 1.6rem; font-weight: 600;
          line-height: 1.3; color: #FFF3E0; font-style: italic; margin-bottom: 20px;
        }

        .v-pattern {
          font-size: 0.65rem; font-weight: 800; color: #E0B0FF;
          text-transform: uppercase; letter-spacing: 0.2em;
        }

        .branding-seal { margin-top: auto; }
        .seal-text { font-size: 0.7rem; font-weight: 800; color: #E0B0FF; opacity: 0.4; letter-spacing: 0.2em; }

        .ticket-footer-new {
          margin-top: 40px; text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.05);
          padding-top: 25px;
        }

        .scan-url {
          font-family: 'Playfair Display', serif; font-size: 1.3rem; 
          color: rgba(255, 255, 255, 0.15); letter-spacing: -0.01em; font-weight: 700;
        }
      `}</style>
    </div>
  );
}
