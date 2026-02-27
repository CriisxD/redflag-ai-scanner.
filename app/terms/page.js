'use client';

import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="legal-container">
      <div className="legal-card">
        <Link href="/" className="back-link">← Volver al inicio</Link>
        <h1>Términos y Condiciones</h1>
        <p className="last-updated">Última actualización: 27 de febrero de 2026</p>

        <section>
          <h2>1. Aceptación de los Términos</h2>
          <p>
            Al acceder y utilizar RedFlag AI Scanner ("nosotros", "nuestro" o "el Servicio"), 
            aceptas cumplir con estos Términos y Condiciones. Si no estás de acuerdo con alguna 
            parte de estos términos, no debes utilizar el Servicio.
          </p>
        </section>

        <section>
          <h2>2. Descripción del Servicio</h2>
          <p>
            RedFlag AI Scanner proporciona un análisis basado en inteligencia artificial de 
            capturas de pantalla de chats de citas. El análisis es generado por modelos de IA 
            y tiene fines puramente de **entretenimiento**. No garantizamos la exactitud de 
            los resultados ni recomendamos tomar decisiones de vida importantes basadas en ellos.
          </p>
        </section>

        <section>
          <h2>3. Pagos y Reembolsos</h2>
          <p>
            El Servicio ofrece análisis detallados mediante un pago único de $2.99 USD. 
            Debido a la naturaleza digital e inmediata del análisis generado por IA, 
            **no se realizan reembolsos** una vez que el análisis ha sido generado y entregado.
          </p>
        </section>

        <section>
          <h2>4. Almacenamiento y Seguridad</h2>
          <p>
            Tus análisis y referencias de chat se almacenan en nuestra base de datos (Supabase) 
            de forma estrictamente temporal. Implementamos una política de **autodestrucción de 10 minutos**: 
            una vez generado el análisis, el registro completo es eliminado permanentemente 
            de nuestro sistema tras 10 minutos. Te recomendamos descargar o capturar tu 
            resultado si deseas conservarlo.
          </p>
        </section>

        <section>
          <h2>5. Uso de Datos e Imágenes</h2>
          <p>
            Al subir capturas de pantalla, garantizas que tienes el derecho de utilizar 
            dichas imágenes. Para proteger tu privacidad, **todas las imágenes y el análisis 
            generado se eliminan automáticamente de nuestros servidores 10 minutos después 
            de su creación**. No conservamos copias permanentes de tus conversaciones.
          </p>
        </section>

        <section>
          <h2>5. Limitación de Responsabilidad</h2>
          <p>
            En ningún caso RedFlag AI Scanner será responsable por daños indirectos, 
            incidentales o consecuentes derivados del uso del Servicio. El uso que hagas 
            del Servicio es bajo tu propio riesgo.
          </p>
        </section>

        <section>
          <h2>6. Modificaciones</h2>
          <p>
            Nos reservamos el derecho de modificar estos términos en cualquier momento. 
            El uso continuado del Servicio después de dichos cambios constituye tu 
            aceptación de los nuevos términos.
          </p>
        </section>

        <section>
          <h2>7. Contacto</h2>
          <p>
            Si tienes alguna pregunta sobre estos términos, puedes contactarnos en: 
            <br />
            <strong>soporte@redflagscanner.xyz</strong>
          </p>
        </section>
      </div>

      <style jsx>{`
        .legal-container {
          min-height: 100vh;
          background: #050505;
          display: flex;
          justify-content: center;
          padding: 80px 20px;
          color: white;
          font-family: var(--font-body);
        }
        .legal-card {
          max-width: 800px;
          width: 100%;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 4px;
          padding: 40px;
          line-height: 1.8;
          position: relative;
        }
        .back-link {
          display: inline-block;
          color: var(--accent-amber);
          text-decoration: none;
          margin-bottom: 30px;
          font-weight: 700;
          font-size: 0.8rem;
          font-family: var(--font-terminal);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        h1 {
          font-size: clamp(2rem, 5vw, 3rem);
          margin-bottom: 10px;
          font-family: var(--font-terminal);
          font-weight: 950;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: white;
        }
        h1::after {
          content: "";
          display: block;
          width: 60px;
          height: 4px;
          background: var(--accent-red);
          margin-top: 10px;
        }
        .last-updated {
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.75rem;
          margin-bottom: 50px;
          font-family: var(--font-terminal);
        }
        section {
          margin-bottom: 40px;
        }
        h2 {
          font-size: 1.1rem;
          color: var(--accent-red);
          margin-bottom: 15px;
          font-family: var(--font-terminal);
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        p {
          color: rgba(255, 255, 255, 0.7);
          font-size: 0.95rem;
        }
        strong {
          color: white;
          font-weight: 700;
        }
      `}</style>
    </div>
  );
}
