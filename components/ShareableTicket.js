'use client';

import React from 'react';

/**
 * ShareableTicketComponent
 * A 9:16 high-impact ticket for social media sharing.
 * Designed to be captured by html2canvas.
 */
export default function ShareableTicket({ name, zodiac, score = 88, redFlag }) {
  return (
    <div id="shareable-ticket-capture" className="ticket-container">
      <div className="ticket-border">
        {/* Header */}
        <div className="ticket-header">
          <span className="logo-emoji">📈</span>
          <h1 className="logo-text">ROMANTIC ANALYZER</h1>
        </div>

        <div className="ticket-content">
          <div className="vibe-tag">ANÁLISIS DE DINÁMICA</div>
          
          <div className="score-area">
            <div className="score-value">{score}%</div>
            <div className="score-label"> NIVEL DE CONEXIÓN</div>
          </div>

          <div className="target-info">
            {name && <span className="info-tag">Sujeto: {name}</span>}
            {zodiac && <span className="info-tag">Signo: {zodiac}</span>}
          </div>

          <div className="evidence-box">
            <h3 className="evidence-title">✨ Veredicto Viral:</h3>
            <p className="evidence-text">
              {redFlag || "Analizando patrones de interacción romántica con Inteligencia Artificial."}
            </p>
          </div>

          <div className="fomo-banner">
            <span className="lock-icon">🔒</span>
            <span className="fomo-text">+2 Señales de Interés Ocultas</span>
          </div>
        </div>

        {/* Footer */}
        <div className="ticket-footer">
          <p className="footer-callout">Analiza tu relación en:</p>
          <div className="domain-text">redflagscanner.xyz</div>
        </div>
      </div>

      <style jsx>{`
        .ticket-container {
          width: 540px; /* 9:16 ratio for 1080/2 */
          height: 960px;
          background: #000;
          padding: 30px;
          display: flex;
          flex-direction: column;
          font-family: 'Inter', sans-serif;
          color: white;
          position: absolute;
          left: -9999px; /* Hide from viewport */
          top: 0;
          overflow: hidden;
        }

        .ticket-border {
          flex: 1;
          border: 4px solid #af52de;
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
          align-items: center;
          gap: 12px;
          margin-bottom: 60px;
        }

        .logo-emoji {
          font-size: 2.5rem;
        }

        .logo-text {
          font-family: 'Inter Black', sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          letter-spacing: -0.05em;
          margin: 0;
        }

        .ticket-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .vibe-tag {
          font-size: 0.9rem;
          font-weight: 800;
          letter-spacing: 0.2em;
          color: #af52de;
          border: 1px solid rgba(175, 82, 222, 0.5);
          padding: 6px 16px;
          border-radius: 20px;
          margin-bottom: 40px;
          text-transform: uppercase;
        }

        .score-area {
          margin-bottom: 50px;
        }

        .score-value {
          font-family: 'Inter Black', sans-serif;
          font-size: 8rem;
          font-weight: 950;
          line-height: 1;
          color: #39ff14;
          text-shadow: 0 0 30px rgba(57, 255, 20, 0.6);
          margin-bottom: 10px;
        }

        .score-label {
          font-size: 1.5rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          color: white;
        }

        .target-info {
          display: flex;
          gap: 10px;
          margin-bottom: 60px;
        }

        .info-tag {
          background: rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 700;
        }

        .evidence-box {
          width: 100%;
          background: rgba(57, 255, 20, 0.05);
          border: 1px solid rgba(57, 255, 20, 0.3);
          border-radius: 20px;
          padding: 30px;
          text-align: left;
          margin-bottom: 40px;
        }

        .evidence-title {
          font-size: 1.3rem;
          font-weight: 900;
          color: #af52de;
          margin: 0 10px 16px 0;
        }

        .evidence-text {
          font-size: 1.15rem;
          line-height: 1.6;
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
        }

        .fomo-banner {
          display: flex;
          align-items: center;
          gap: 12px;
          background: #111;
          padding: 15px 30px;
          border-radius: 15px;
          border: 1px dashed rgba(255, 255, 255, 0.2);
        }

        .lock-icon {
          font-size: 1.5rem;
        }

        .fomo-text {
          font-size: 1rem;
          font-weight: 800;
          color: #ff9500;
        }

        .ticket-footer {
          margin-top: auto;
          text-align: center;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 40px;
        }

        .footer-callout {
          font-size: 0.9rem;
          font-weight: 600;
          color: rgba(255, 255, 255, 0.5);
          margin: 0 0 8px 0;
        }

        .domain-text {
          font-family: 'Inter Black', sans-serif;
          font-size: 1.8rem;
          font-weight: 900;
          color: #af52de;
          letter-spacing: -0.02em;
        }
      `}</style>
    </div>
  );
}
