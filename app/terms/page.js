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
        p {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1rem;
        }
      `}</style>
    </div>
  );
}
