'use client';

import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="legal-container">
      <div className="legal-card">
        <Link href="/" className="back-link">← Volver al inicio</Link>
        <h1>Política de Privacidad</h1>
        <p className="last-updated">Última actualización: 27 de febrero de 2026</p>

        <section>
          <h2>1. Información que Recopilamos</h2>
          <p>
            Cuando utilizas RedFlag AI Scanner, podemos recopilar la siguiente información:
          </p>
          <ul className="legal-list">
            <li>Capturas de pantalla de chats que subes voluntariamente.</li>
            <li>Respuestas a preguntas de contexto (ej. tiempo hablando, tipo de relación).</li>
            <li>Información técnica básica (dirección IP de forma anónima para control de límites).</li>
          </ul>
        </section>

        <section>
          <h2>2. Uso de la Información</h2>
          <p>
            Utilizamos la información recopilada exclusivamente para:
          </p>
          <ul className="legal-list">
            <li>Generar el análisis detallado mediante modelos de inteligencia artificial (OpenAI).</li>
            <li>Mejorar la precisión de nuestros análisis.</li>
            <li>Prevenir el abuso del servicio (límites por IP).</li>
          </ul>
          <p>
            **No vendemos ni compartimos tus datos personales con terceros para fines publicitarios.**
          </p>
        </section>

        <section>
          <h2>3. Procesamiento por IA y Retención</h2>
          <p>
            Las imágenes y el texto que subes son enviados a los servidores de OpenAI 
            para ser procesados. **Garantizamos una retención mínima**: todo el contenido 
            (imágenes y análisis) se elimina permanentemente de nuestra base de datos 
            exactamente 10 minutos después de ser generado. No mantenemos registros históricos 
            de tus chats.
          </p>
        </section>

        <section>
          <h2>4. Almacenamiento y Seguridad</h2>
          <p>
            Tus análisis y referencias de chat se almacenan en nuestra base de datos (Supabase) 
            asociados a un ID único. Utilizamos medidas de seguridad estándar para 
            proteger la integridad de estos datos. El análisis se mantiene accesible a 
            través de tu enlace único.
          </p>
        </section>

        <section>
          <h2>5. Tus Derechos</h2>
          <p>
            Puedes solicitar la eliminación constante de tus datos enviándonos una 
            solicitud a través de nuestros canales de contacto. El análisis también 
            incluye una opción para ser eliminado.
          </p>
        </section>
      </div>

      <style jsx>{`
        .legal-container {
          min-height: 100vh;
          background: #050505;
          display: flex;
          justify-content: center;
          padding: 40px 20px;
          color: white;
          font-family: 'Inter', sans-serif;
        }
        .legal-card {
          max-width: 800px;
          width: 100%;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 28px;
          padding: 40px;
          line-height: 1.6;
        }
        .back-link {
          display: inline-block;
          color: #ffb347;
          text-decoration: none;
          margin-bottom: 30px;
          font-weight: 600;
          font-size: 0.9rem;
        }
        h1 {
          font-size: 2.5rem;
          margin-bottom: 10px;
          background: linear-gradient(135deg, #E0B0FF, #FFB347);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .last-updated {
          color: rgba(255, 255, 255, 0.4);
          font-size: 0.85rem;
          margin-bottom: 40px;
        }
        section {
          margin-bottom: 30px;
        }
        h2 {
          font-size: 1.25rem;
          color: #E0B0FF;
          margin-bottom: 15px;
        }
        .legal-list {
          list-style: disc;
          margin-left: 20px;
          margin-top: 10px;
          margin-bottom: 15px;
          color: rgba(255, 255, 255, 0.8);
        }
        .legal-list li {
          margin-bottom: 8px;
        }
        p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}
