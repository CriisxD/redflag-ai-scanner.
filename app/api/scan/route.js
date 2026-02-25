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

    // 1. OpenAI Integration (Romantic Dynamics Analyzer v3.7 - Viral Drama & Leak Aesthetic)
    let aiResult;
    try {
      const systemPrompt = `Eres el Analista Principal de RedFlag Dating Intelligence (v3.7). Tu especialidad es transformar datos fríos en un "Reporte de Inteligencia Filtrado" con alto impacto visual.

CONTEXTO CLAVE PARA LA IA:
- Sujeto: ${finalTargetName}
- Duración de charla: ${daysChatting}
- ¿Se han visto?: ${hasMet}
- Intención del usuario: ${userIntent}

REGLAS DE DRAMA VISUAL (v3.7):
1. REPORT ID: Genera un ID único con formato HUD (ej: RF-XXXX-INTENT) basado en los datos.
2. VERDICT ICON: Selecciona un símbolo masivo que represente el alma del análisis:
   - 💀 (Tóxico/Peligro)
   - 💎 (Valioso/Estable)
   - ⚓ (Pesado/Estancado)
   - 🌀 (Confuso/Inestable)
   - 🚩 (Red Flag obvia)
   - 🛡️ (Protegido/Seguro)
   - 💊 (Realidad dura/Bluepill)

AUDITORÍA DE VALOR (v3.7):
- Sigue la regla "Cold Logic": revela lo invisible.
- Intención Real: Analiza el "por qué" psicológico.
- Escenario Probable: Cadena de eventos lógica con tiempos.
- Recomendación Táctica: Movimiento concreto e inmediato para ${userIntent}.

ESTRUCTURA DE RESPUESTA (JSON):
{
  "report_id": "<RF-XXXX-INTENT>",
  "verdict_icon": "<Symbol>",
  "subtitulo_contextual": "<Frase elegante de personalización>",
  "veredicto_shock": "<Título potente centrado, máx 6 palabras>",
  "dinamica_detectada": "<Nombre de la dinámica>",
  "metricas_viral": {
    "interes_detectado": { "valor": <0-100>, "interpretacion": "<Frase corta>" },
    "nivel_inversion": { "valor": <0-100>, "interpretacion": "<Frase corta>" },
    "riesgo_objetivo": { 
      "valor": <0-100>, 
      "label": "<Label NATURAL generado para la intención: ${userIntent}>",
      "interpretacion": "<Narrativa contundente>"
    }
  },
  "frase_viral": "<Dardo provocativo para debate>",
  "linea_patron": "<Frase de autoridad sobre el patrón detectado>",
  "analisis_premium": {
    "intencion_real": "<REVELACIÓN>",
    "escenario_probable": "<PROYECCIÓN>",
    "recomendacion_tactica": "<MOVIMIENTO TÁCTICO para ${userIntent}>"
  }
}

IMPORTANTE: El tono debe ser de Inteligencia Estratégica. Frío, lógico y definitivo.`;
      
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
