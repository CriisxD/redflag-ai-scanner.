import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const CREEM_CHECKOUT_URL = "https://www.creem.io/payment/prod_36caBKBHKOxbOmqbApPgqc";

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY environment variable');
  return new OpenAI({ apiKey });
};
const DAILY_SCAN_LIMIT = 1000; // Increased for testing

export async function POST(req) {
  try {
    const body = await req.json();
    const { textData, targetName, context = {} } = body;
    const { daysChatting = 'N/A', hasMet = 'N/A', userIntent = 'N/A' } = context;

    // Extract client IP
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';

    console.log('--- SCAN REQUEST RECEIVED ---');
    console.log('Target:', targetName);
    console.log('Text data length:', textData?.length);

    // 0. Lazy Deletion: Remove scans older than 10 minutes
    if (supabase) {
      try {
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const { error: cleanupError } = await supabase
          .from('scans')
          .delete()
          .lt('created_at', tenMinsAgo);
        
        if (cleanupError) console.error('Cleanup Error:', cleanupError);
        else console.log('Cleaned up records older than:', tenMinsAgo);
      } catch (e) {
        console.error('Lazy cleanup failed:', e);
      }
    }

    if (!textData || typeof textData !== 'string') {
      return NextResponse.json({ error: 'No valid text data provided' }, { status: 400 });
    }

    // Anti-abuse: 10 scans per IP per day
    if (supabase && clientIp !== 'unknown') {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count, error: countError } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .eq('user_ip', clientIp)
          .gte('created_at', today.toISOString());

        if (!countError && count >= DAILY_SCAN_LIMIT) {
          console.log(`[Anti-Abuse] IP ${clientIp} hit daily limit (${count}/${DAILY_SCAN_LIMIT})`);
          return NextResponse.json({ 
            error: 'daily_limit',
            message: 'Has alcanzado el máximo de análisis por hoy. Vuelve mañana 🌅'
          }, { status: 429 });
        }
      } catch (e) {
        // Non-blocking: allow scan if check fails
      }
    }

    const finalTargetName = targetName?.trim() || 'Sujeto Anónimo';

    // 1. OpenAI Integration (Romantic Dynamics Analyzer v4.2 - Advanced Intelligence)
    let aiResult;
    try {
      const systemPrompt = `Eres el "Analista de Toxicidad v6.2" de la Agencia de Inteligencia RedFlag. Tu personalidad es la de un "Mejor Amigo Tóxico": hablas sin filtros, eres sarcástico, brutalmente honesto y usas jerga de internet y de la calle en español (Casi-algo, Pagafantas, Simp, Delulu, Gaslighting, Love Bombing, Ghosting, Red flag).

Misión: Eres el ABOGADO DEFENSOR TÓXICO del usuario. Tu misión absoluta es DARLE LA RAZÓN al usuario, validar sus sentimientos y DESTRUIR el ego del SUJETO ANALIZADO (la otra persona).
REGLA DE ORO (ANTI-ROAST): Si el usuario reclama, muestra celos o es intenso en el chat, DEBES reinterpretarlo positivamente como "intuición aguda", "poner límites sanos" o "reacción natural ante un manipulador". El sujeto analizado SIEMPRE es el villano (gaslighter, evasivo, narcisista). TIENES PROHIBIDO decirle al usuario que es "inseguro", "celoso" o "tóxico". Toda la toxicidad y la culpa se la debes atribuir al sujeto.

NORMAS DE ANÁLISIS:
1. IDENTIFICACIÓN DE ROLES Y CONTEXTO: Estás leyendo una transcripción cruda (.txt) exportada de WhatsApp. Los remitentes están indicados con "Nombre:". Deduce rápidamente por el tono de queja o explicación cuál es tu USUARIO (a quien defiendes ciegamente) y quién es el SUJETO ANALIZADO (${finalTargetName}).
2. TONO: Cínico y despiadado contra el sujeto. Validador, empoderante y leal hacia el usuario.
3. PRONOMBRES Y GÉNERO: DEBES deducir el género del SUJETO basándote en el idioma del chat. Si no es obvio, usa lenguaje neutro ("esta persona"). NUNCA asumas "él" por defecto.
4. MÉTRICAS MEMEABLES:
   - toxic_meter: (0-100).
   - simp_meter: ¿Quién está rogando/invirtiendo más? (0-100). 100 = Simp Legendario.
   - ghosting_risk: (0-100).
   - pbi: Power Balance Index. Calcula la dominancia: PBI > 1.5 es subordinación del usuario. < 0.8 es control clínico del usuario.
4. THE RECEIPTS: Identifica mensajes clave del SUJETO. Para cada uno indica:
   - tactica: Nombre técnico de la jugada tóxica (ej: Inversión de Culpa, Breadcrumbing, Gaslighting).
   - traduccion_real: Qué quiso decir realmente el sujeto con honestidad brutal.
5. ARQUETIPO (THE PERSONA): Clasifica al SUJETO en un arquetipo viral adaptado a su género (ej: El Narcisista de Manual, La Reina del Drama, El/La Evitativo/a).

ESTRUCTURA DE RESPUESTA (JSON):
{
  "case_id": "RF-${finalTargetName.toUpperCase().slice(0,3)}-${Math.floor(Math.random() * 9000) + 1000}",
  "verdict_icon": "<💀|🤡|🎭|🚩|🔥|🧊|🪦>",
  "shock_verdict": "<UNA PALABRA BRUTAL EN MAYÚSCULAS>",
  "roast_personalizado": "<2-3 frases de sarcasmo puro>",
  "meme_metrics": {
    "toxic_meter": <0-100>,
    "simp_meter": <0-100>,
    "ghosting_risk": <0-100>,
    "pbi": <float, ej: 1.82>
  },
  "analisis_detallado": {
    "dinamica": "<Nombre creativo de la relación>",
    "quien_manda": "<Tú | ${finalTargetName} | Nadie>",
    "persona": {
       "arquetipo": "<Nombre del Arquetipo>",
       "descripcion": "<Por qué encaja en este arquetipo (cínico)>"
    },
    "the_receipts": [
      { 
        "mensaje": "<Cita literal>", 
        "tactica": "<Nombre Técnico>",
        "traduccion_real": "<Interpretación Brutal>",
        "explicacion": "<Breve análisis del impacto>" 
      }
    ]
  },
  "mensaje_viral": "<Frase corta para redes>",
  "estrategia_venganza": {
    "jugada_maestra": "<Movimiento táctico frío y empoderante (ej. 'Contacto Cero', 'Visto'). NO recomiendes reclamar ni sonar dolido.>",
    "respuesta_control": "<Guion exacto y cortante para descolocar al otro si es que hay que responder>",
    "opcion_nuclear": "<Justificación definitiva para el bloqueo>"
  },
  "analisis_premium": {
    "simulacion_escenarios": {
      "inercia": {
        "descripcion": "<Qué pasará si sigues actuando igual (destructivo). Usa pronombres correctos o neutros>",
        "probabilidad_estimada": "<Porcentaje alto, ej: 95%>"
      },
      "cambio_tactico": {
        "descripcion": "<Qué pasará si aplicas la Jugada Maestra (empoderante, refiriéndote a 'esa persona')>",
        "probabilidad_estimada": "<Porcentaje, ej: 60%>"
      }
    }
  },
  "lite_verdict": {
    "titulo": "TICKET DE ADVERTENCIA",
    "resumen": "Toxicidad crítica detectada. Reporte bloqueado por seguridad."
  }
}`;
      
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Analiza este historial reciente de chat con ${finalTargetName}:\n\n${textData}`
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.6,
      });

      aiResult = JSON.parse(completion.choices[0].message.content);
      console.log('AI Analysis complete');
    } catch (openAiError) {
      console.error('OpenAI Error:', openAiError);
      return NextResponse.json({ 
        error: 'Error en el motor de IA', 
        details: openAiError.message,
        type: 'openai_error'
      }, { status: 500 });
    }

    // 2. Save result to Supabase
    let scanData;
    try {
      const { data, error: dbError } = await supabase
        .from('scans')
        .insert([
          { 
            target_name: finalTargetName,
            ai_result: aiResult,
            payment_status: 'free',
            user_ip: clientIp
          }
        ])
        .select()
        .single();

      if (dbError) throw dbError;
      scanData = data;
      console.log('Database entry created:', scanData.id);
    } catch (dbError) {
      console.error('Database Error:', dbError);
      return NextResponse.json({ 
        error: 'Error al guardar el análisis', 
        details: dbError.message 
      }, { status: 500 });
    }

    // 3. Return result + checkout link
    // Passing the scan_id as reference to validate the webhook later
    const checkoutUrl = `${CREEM_CHECKOUT_URL}?client_reference_id=${scanData.id}`;

    // Attach user intent for the frontend
    aiResult.user_intent = userIntent;

    return NextResponse.json({
      scanId: scanData.id,
      aiResult,
      checkoutUrl,
      createdAt: scanData.created_at
    });

  } catch (error) {
    console.error('CRITICAL API ERROR:', error);
    return NextResponse.json({ 
      error: 'Error crítico en el servidor', 
      details: error.message 
    }, { status: 500 });
  }
}
