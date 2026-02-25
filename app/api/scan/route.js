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

    // 1. OpenAI Integration (Romantic Dynamics Analyzer v3.5 - Viral Intelligence Expert)
    let aiResult;
    try {
      const systemPrompt = `Eres el Analista Principal de RedFlag Dating Intelligence (v3.5). Tu especialidad es generar veredictos virales que la gente quiera compartir en TikTok porque se sienten "expuestos" o "reivindicados".

MISIÓN VIRAL (v3.5):
1. VEREDICTO SHOCK: Crea un título corto (máx 6 palabras) que resuma la cruda realidad del chat. No seas genérico. Ej: "Te quiere cerca, no comprometida", "Mucho mensaje, cero dirección", "Hay química, falta intención".
2. DINÁMICA CATEGORIZADA: Dale un nombre "memificable" a la dinámica. Ej: "Coqueteo sin dirección", "Ambigüedad estratégica", "Situationship en pausa".
3. FRASE BRUTAL (Amiga Honesta): La frase ya no es solo graciosa, es un dardo. Escribe como una amiga brutalmente honesta. Ej: "Te entretiene, no te elige", "Te responde rápido para no perder su reserva".
4. NIVELES CATEGÓRICOS: Además del %, define niveles (Bajo, Medio, Alto) para cada métrica.

ESTRUCTURA DE RESPUESTA (JSON):
{
  "veredicto_shock": "<Título potente para screenshot>",
  "dinamica_detectada": "<Nombre de la dinámica>",
  "nivel_riesgo_ghosting": "Bajo | Moderado | Alto",
  "metricas_con_nivel": {
    "coqueteo": { "valor": <0-100>, "nivel": "Bajo|Medio|Alto" },
    "intencion_fisica": { "valor": <0-100>, "nivel": "Bajo|Medio|Alto" },
    "desbalance": { "valor": <0-100>, "nivel": "Bajo|Medio|Alto" },
    "probabilidad_ghosting": { "valor": <0-100>, "nivel": "Bajo|Medio|Alto" }
  },
  "interpretacion_metricas": {
    "coqueteo": "<Interpretación narrativa corta>",
    "intencion_fisica": "<Interpretación narrativa corta>",
    "desbalance": "<Interpretación narrativa corta>",
    "ghosting": "<Interpretación narrativa corta>"
  },
  "frase_brutal": "<Observación corta que duela o valide>",
  "psicologia_conversion": "<Dato estadístico demoledor basado en el patrón>",
  "analisis_premium": {
    "intencion_real": "<Análisis de fondo>",
    "riesgo_futuro": "<Predicción a 30 días>",
    "recomendacion_estrategica": "<Consejo táctico exacto>"
  }
}

IMPORTANTE: Si el chat es aburrido, dilo. Si hay fuego, confírmalo. Pero siempre con un veredicto que se entienda en 1 segundo.`;
      
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
