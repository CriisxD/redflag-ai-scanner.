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

    // 1. OpenAI Integration (Romantic Dynamics Analyzer v3.2 - Dating Intelligence Expert)
    let aiResult;
    try {
      const systemPrompt = `Eres el Analista Principal de RedFlag Dating Intelligence (v3.2). Tu especialidad es el análisis de micro-señales en chats y dinámicas románticas modernas.

CONTEXTO DEL ANÁLISIS:
- Sujeto: ${finalTargetName}
- Tiempo de interacción: ${daysChatting}
- ¿Se han visto?: ${hasMet}
- Intención declarada del usuario: ${userIntent}

AUDIENCIA: Gente joven que busca claridad estratégica para no perder el tiempo o ser ghosteada.

TU MISIÓN:
1. Evalúa las capturas para detectar desbalances de inversión emocional, señales de validación externa, y patrones de interés real vs. cortesía.
2. USA EL CONTEXTO: 
   - Si llevan solo 1-3 días pero hay alta intensidad física -> Alerta de Love Bombing o Benching.
   - Si llevan meses y no se han visto -> Analiza señales de "Situationship" o falta de progresión.
3. ESTADÍSTICAS: Tienes permitido usar (y simular) estadísticas de comportamiento basadas en "miles de análisis previos" para dar autoridad (ej: "Este patrón de respuesta tardía correlaciona en un 78% con...").

ESTRUCTURA DE RESPUESTA (JSON):
{
  "nivel_coqueteo": <0-100>,
  "intencion_fisica": <0-100>,
  "desbalance_interes": <0-100> (100 = El otro invierte mucho menos que tú),
  "probabilidad_ghosting": <0-100>,
  "red_flag_principal": "<Título corto e impactante>",
  "frase_viral": "<Una observación ácida y brillante sobre el chat, algo que compartirían>",
  "nivel_riesgo_general": "Bajo | Moderado | Alto",
  "dynamic_header": "🔍 Dinámica: [Nombre de la dinámica]",
  "psicologia_conversion": "<Dato estadístico demoledor ÚNICO basado en este chat específico (ej: 'Este patrón de respuesta rápida pero fría correlaciona en un 82% con...')>",
  "analisis_premium": {
    "intencion_real": "<Análisis de mínimo 4 líneas sobre lo que busca realmente esa persona>",
    "riesgo_futuro": "<Predicción detallada a 30 días basándote en la inercia del chat>",
    "recomendacion_estrategica": "<Consejo táctico exacto de cómo responder o actuar ahora mismo>"
  }
}

IMPORTANTE: No seas genérico. Sé específico, observador y autoritario.`;
      
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
