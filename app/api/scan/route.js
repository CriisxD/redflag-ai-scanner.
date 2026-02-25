import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
const STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID;
const VARIANT_ID = process.env.LEMON_SQUEEZY_VARIANT_ID; // The $2.99 product variant

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY environment variable');
  return new OpenAI({ apiKey });
};

export async function POST(req) {
  try {
    const body = await req.json();
    const { images, targetName, context = {} } = body;
    const { daysChatting = 'N/A', hasMet = 'N/A', userIntent = 'N/A' } = context;

    console.log('--- SCAN REQUEST RECEIVED ---');
    console.log('Target:', targetName);
    console.log('Images count:', images?.length);
    console.log('Payload size approx:', JSON.stringify(body).length / 1024, 'KB');

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    const finalTargetName = targetName?.trim() || 'Sujeto Anónimo';

    // 1. OpenAI Integration (Romantic Dynamics Analyzer v4.2 - Advanced Intelligence)
    let aiResult;
    try {
      const systemPrompt = `Eres el Analista Senior de la Agencia de Inteligencia Emocional (v4.2). Tu misión es producir un "Dossier de Inteligencia de Alta Resolución".

NORMAS DE ANÁLISIS (v4.2):
1. JUSTIFICACIÓN BASADA EN EVIDENCIA: No diagnostiques sin citar. Para la "Intención Real", explica los indicadores textuales detectados (ej: falta de propuestas, lenguaje evasivo).
2. INDICADORES CLÍNICOS: En el bloque de "Patrón de Apego", detalla los indicadores específicos (ej: ambivalencia, necesidad de validación, evitación).
3. MARCO TÁCTICO: El plan de acción debe ser extremadamente concreto e incluir una plantilla de mensaje sugerido, el marco psicológico (frame) desde el cual hablar y señales positivas/negativas a observar.

ESTRUCTURA DE RESPUESTA (JSON):
{
  "case_id": "CNT-XXXX-${finalTargetName.toUpperCase().slice(0,3)}",
  "verdict_icon": "<💀|💎|⚓|🌀|🚩|🛡️|💊>",
  "balance_poder": "<Label: Usuario Expuesto | Sujeto Distante | Simetría | Poder del Sujeto>",
  "subtitulo_contextual": "<Frase elegante de expediente>",
  "veredicto_shock": "<DARDO DIRECTO, máx 6 palabras>",
  "dinamica_detectada": "<Nombre de la dinámica>",
  "metricas_binarias": {
    "q1": { "pregunta": "¿Quiere volver?", "valor": <0-100> },
    "q2": { "pregunta": "¿Te extraña?", "valor": <0-100> },
    "q3": { "pregunta": "¿Busca algo serio?", "valor": <0-100> }
  },
  "punchline_viral": "<Frase twist emocional para compartir>",
  "reciprocidad": {
    "iniciativa": { "score": <0-100>, "evidencia": "<Ejemplo concreto>" },
    "expansion": { "score": <0-100>, "evidencia": "<Ejemplo concreto>" },
    "validacion": { "score": <0-100>, "evidencia": "<Ejemplo concreto>" }
  },
  "pronostico": {
    "ghosting": <0-100>,
    "compromiso": <0-100>,
    "limbo": <0-100>
  },
  "analisis_premium": {
    "intencion_real": {
      "conclusion": "<RESUMEN DE INTENCIÓN>",
      "justificacion_evidencia": "<POR QUÉ LLEGAMOS A ESTO BASADO EN EL CHAT>"
    },
    "patron_psicologico": {
      "etiqueta": "<TIPO DE APEGO/DINÁMICA>",
      "indicadores_detectados": ["<IND1>", "<IND2>", "<IND3>"]
    },
    "simulacion_escenarios": {
      "inercia": "<PROYECCIÓN SI NADA CAMBIA>",
      "cambio_tactico": "<PROYECCIÓN SI SE APLICA EL MOVIMIENTO X>"
    },
    "estrategia_final": {
      "mensaje_sugerido": "<PLANTILLA TEXTUAL PARA EL USUARIO>",
      "marco_conversational": "<CÓMO POSICIONARSE MENTALMENTE>",
      "que_observar": {
        "positivo": "<SEÑAL DE AVANCE>",
        "negativo": "<SEÑAL DE RETIRADA>"
      }
    }
  }
}

IMPORTANTE: Evita lenguaje genérico. El reporte debe sentirse científico, cínico y absolutamente preciso.`;
      
      const openai = getOpenAIClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: [
              { type: "text", text: `Analiza este chat de ${finalTargetName}.` },
              ...images.map(img => ({
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${img}` }
              }))
            ],
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
            payment_status: 'free'
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
    const checkoutUrl = `https://redflagscanner.lemonsqueezy.com/checkout/buy/${VARIANT_ID}?embed=1&checkout[custom][scan_id]=${scanData.id}`;

    // Attach user intent for the frontend
    aiResult.user_intent = userIntent;

    return NextResponse.json({
      scanId: scanData.id,
      aiResult,
      checkoutUrl
    });

  } catch (error) {
    console.error('CRITICAL API ERROR:', error);
    return NextResponse.json({ 
      error: 'Error crítico en el servidor', 
      details: error.message 
    }, { status: 500 });
  }
}
