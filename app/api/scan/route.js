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

NORMAS DE ANÁLISIS (v4.3 - Heuristic & Personalized):
1. EXTRACCIÓN LITERAL: Es fundamental que extraigas frases exactas del chat proporcionado. En "citas_textuales", coloca las oraciones textuales literales que demuestran la intención. No las inventes.
2. MODELO DE RIESGO: Analiza quién invierte más energía (quién inicia, extensión de mensajes) en la sección "poder_y_energia".
3. RANGOS HEURÍSTICOS: En las proyecciones, NUNCA uses números exactos cerrados (ej. 35%). Utiliza rangos estimados basados en patrones (ej. "30-45%").
4. MARCO TÁCTICO: El plan de acción debe incluir una plantilla literal, el posicionamiento mental (frame) y señales de avance o retirada.
5. PREGUNTAS DINÁMICAS: En 'metricas_binarias', adapta las 3 preguntas a la naturaleza del vínculo (ej. si son ex novios usa "¿Quiere volver?", si apenas se conocen usa "¿Le atraes?").

ESTRUCTURA DE RESPUESTA (JSON):
{
  "case_id": "CNT-XXXX-${finalTargetName.toUpperCase().slice(0,3)}",
  "verdict_icon": "<💀|💎|⚓|🌀|🚩|🛡️|💊>",
  "balance_poder": "<Label: Usuario Expuesto | Sujeto Distante | Simetría | Poder del Sujeto>",
  "subtitulo_contextual": "<Frase elegante de expediente>",
  "veredicto_shock": "<DARDO DIRECTO, máx 6 palabras>",
  "dinamica_detectada": "<Nombre de la dinámica>",
  "metricas_binarias": {
    "q1": { "pregunta": "<Pregunta 1 adaptada al contexto>", "valor": <0-100> },
    "q2": { "pregunta": "<Pregunta 2 adaptada al contexto>", "valor": <0-100> },
    "q3": { "pregunta": "<Pregunta 3 adaptada al contexto>", "valor": <0-100> }
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
      "conclusion": "<RESUMEN CLÍNICO DE INTENCIÓN>",
      "citas_textuales": ["<FRASE LITERAL DEL CHAT 1>", "<FRASE LITERAL DEL CHAT 2>"],
      "justificacion_evidencia": "<ANÁLISIS DE ESAS CITAS>"
    },
    "patron_psicologico": {
      "etiqueta": "<TIPO DE APEGO/DINÁMICA>",
      "indicadores_detectados": ["<IND1: Ej. Reacción desproporcionada>", "<IND2: Evitación>"]
    },
    "poder_y_energia": {
      "mas_invertido": "<Usuario | Sujeto | Simétrico>",
      "analisis_energia": "<Análisis de quién inicia más y quién busca validación>",
      "riesgo_emocional": "<Cualitativo ej: Alto riesgo de ciclo nostálgico>"
    },
    "simulacion_escenarios": {
      "inercia": {
        "descripcion": "<PROYECCIÓN SI NADA CAMBIA>",
        "probabilidad_estimada": "<RANGO ESTIMADO ej: 30-45%>"
      },
      "cambio_tactico": {
        "descripcion": "<PROYECCIÓN SI SE APLICA EL MOVIMIENTO TÁCTICO>",
        "probabilidad_estimada": "<RANGO ESTIMADO ej: 60-75%>"
      }
    },
    "estrategia_final": {
      "mensaje_sugerido": "<PLANTILLA TEXTUAL PARA EL USUARIO>",
      "marco_conversational": "<CÓMO POSICIONARSE MENTALMENTE>",
      "que_observar": {
        "positivo": "<SEÑAL DE AVANCE A ESPERAR>",
        "negativo": "<SEÑAL DE RETIRADA A EVITAR>"
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
