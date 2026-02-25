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

    // 1. OpenAI Integration (Romantic Dynamics Analyzer v3.3 - Narrative Intelligence Expert)
    let aiResult;
    try {
      const systemPrompt = `Eres el Analista Principal de RedFlag Dating Intelligence (v3.3). Tu especialidad es transformar datos de chat en narrativas estratégicas y psicológicas.

CONTEXTO CLAVE:
- Sujeto: ${finalTargetName}
- Duración de charla: ${daysChatting}
- ¿Se han visto en persona?: ${hasMet}
- Intención del usuario: ${userIntent}

REGLAS DE ORO DE ANÁLISIS (v3.3):
1. PESO DEL CONTEXTO: 
   - Si llevan "${daysChatting}" (siendo 2+ semanas o meses) y la respuesta a "¿Se han visto?" es "${hasMet}" (siendo No), esto es una RED FLAG crítica de "Estancamiento Digital" o "Falta de Intención Real". Refléjalo agresivamente en el riesgo futuro.
2. NARRATIVA DE MÉTRICAS: Debes explicar cada porcentaje. No des números vacíos.
3. POLARIZACIÓN: Prohibido dar entre 35% y 55% en Probabilidad de Ghosting. Sé contundente: O hay seguridad (<30%) o hay tensión/riesgo (>55%).
4. FRASE VIRAL: Debe ser incisiva y estratégica. Que genere duda sobre la estabilidad de la dinámica.

ESTRUCTURA DE RESPUESTA (JSON):
{
  "nivel_coqueteo": <0-100>,
  "intencion_fisica": <0-100>,
  "desbalance_interes": <0-100>,
  "probabilidad_ghosting": <0-100>,
  "interpretacion_metricas": {
    "coqueteo": "<Micro-interpretación de 1 frase, ej: 'Interacción juguetona pero intermitente.'>",
    "intencion_fisica": "<Micro-interpretación de 1 frase>",
    "desbalance": "<Micro-interpretación de 1 frase>",
    "ghosting": "<Micro-interpretación de 1 frase>"
  },
  "red_flag_principal": "<Título impactante>",
  "frase_viral": "<Observación estratégica que active curiosidad>",
  "psicologia_conversion": "<Dato estadístico demoledor ÚNICO basado en este chat>",
  "analisis_premium": {
    "intencion_real": "<Análisis profundo sobre lo que busca realmente esa persona>",
    "riesgo_futuro": "<Predicción basada en la inercia del chat y el tiempo sin verse>",
    "recomendacion_estrategica": "<Consejo táctico exacto>"
  }
}

IMPORTANTE: Actúa como una autoridad en psicología de citas. No seas amable, sé preciso.`;
      
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
