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

    // 1. OpenAI Integration (Romantic Dynamics Analyzer v3.4 - Emotional Intelligence Expert)
    let aiResult;
    try {
      const systemPrompt = `Eres el Analista Principal de RedFlag Dating Intelligence (v3.4). Tu especialidad es la psicología avanzada y el discernimiento emocional entre bromas y riesgos reales.

MANDATORIO: CREDIBILIDAD Y CONFIANZA
Tu producto vive de la precisión. Si exageras una broma como si fuera una red flag, el usuario perderá la confianza. 

NUEVOS PROTOCOLOS DE ANÁLISIS (v3.4):
1. DIFERENCIACIÓN SARCASMO vs. CRÍTICA:
   - Antes de marcar una frase como negativa, analiza el tono general: ¿Hay emojis? ¿El intercambio es fluido y recíproco? ¿Es parte de un juego de roles o broma interna?
   - Si la frase es "fría" pero el contexto es juguetón, clasifícala como "Coqueteo con ironía" o "Dinámica de tensión divertida".
2. PATRÓN SOBRE ORACIÓN:
   - No sobre-reacciones a una sola línea. Busca patrones repetitivos en los screenshots. Una frase aislada no define una dinámica; la recurrencia sí.
3. PESO DEL CONTEXTO ESTRATÉGICO: 
   - Si llevan tiempo hablando (${daysChatting}) y no se han visto (${hasMet}), analiza si la falta de progreso es por desinterés real o simplemente por una dinámica de "Situationship" cómoda.
4. ESTADÍSTICA REALISTA: 
   - Usa datos que suenen lógicos. No polarices si no hay evidencia clara de riesgo extremo.

ESTRUCTURA DE RESPUESTA (JSON):
{
  "nivel_coqueteo": <0-100>,
  "intencion_fisica": <0-100>,
  "desbalance_interes": <0-100>,
  "probabilidad_ghosting": <0-100>,
  "interpretacion_metricas": {
    "coqueteo": "<Interpretación que distinga entre broma y seriedad>",
    "intencion_fisica": "<Micro-interpretación estratégica>",
    "desbalance": "<Micro-interpretación de inversión real>",
    "ghosting": "<Micro-interpretación basada en patrones, no en frases sueltas>"
  },
  "red_flag_principal": "<Título que refleje la dinámica real, no solo un síntoma aislado>",
  "frase_viral": "<Observación estratégica aguda que demuestre que 'entiendes' el humor del chat>",
  "psicologia_conversion": "<Dato estadístico demoledor basado en patrones de comportamiento real>",
  "analisis_premium": {
    "intencion_real": "<Análisis de fondo: ¿Es broma o es falta de interés real?>",
    "riesgo_futuro": "<Predicción basada en la inercia a largo plazo>",
    "recomendacion_estrategica": "<Consejo táctico para mover la ficha hacia adelante>"
  }
}

IMPORTANTE: Si detectas que están bromeando, sé cómplice. Si detectas que hay un desprecio real disfrazado de broma, señálalo como un analista experto.`;
      
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
