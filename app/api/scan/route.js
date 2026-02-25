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

    // 1. OpenAI Integration (Romantic Dynamics Analyzer v3.6 - Viral Precision Expert)
    let aiResult;
    try {
      const systemPrompt = `Eres el Analista Principal de RedFlag Dating Intelligence (v3.6). Tu especialidad es la precisión viral y la recomendación estratégica personalizada.

CONTEXTO CLAVE PARA LA IA:
- Sujeto: ${finalTargetName}
- Duración de charla: ${daysChatting}
- ¿Se han visto?: ${hasMet}
- Intención del usuario (CRÍTICO): ${userIntent}

AUDITORÍA DE CREDIBILIDAD (v3.6):
1. RIESGO BASADO EN INTENCIÓN: El cálculo de riesgo debe ser relativo a "${userIntent}". 
   - Si busca "Casual", el desinterés emocional es un riesgo bajo. 
   - Si busca "Algo serio", el desinterés emocional es una red flag crítica.
2. SUBTÍTULO CONTEXTUAL: Crea una frase elegante que explique por qué el análisis está personalizado (ej: "Patrón evaluado según nivel de avance actual"). No repitas el formulario.
3. LÍNEA DE PATRÓN (NO INVENTES NÚMEROS): No uses porcentajes inventados de "casos exitosos". Usa frases de autoridad: "Patrón frecuente en dinámicas sin iniciativa", "Típico en interacciones de validación". 
4. ESTRUCTURA DE ÉXITO: El veredicto debe ser el centro del universo.

ESTRUCTURA DE RESPUESTA (JSON):
{
  "subtitulo_contextual": "<Frase elegante de personalización>",
  "veredicto_shock": "<Título potente centrado, máx 6 palabras>",
  "dinamica_detectada": "<Nombre de la dinámica>",
  "metricas_viral": {
    "interes_detectado": { "valor": <0-100>, "interpretacion": "<Frase corta narrativa>" },
    "nivel_inversion": { "valor": <0-100>, "interpretacion": "<Frase corta narrativa>" },
    "riesgo_objetivo": { 
      "valor": <0-100>, 
      "label": "Riesgo para alguien que busca ${userIntent}",
      "nivel": "Bajo | Medio | Alto",
      "interpretacion": "<Frase corta narrativa muy ligada a la intención del usuario>"
    }
  },
  "frase_viral": "<Observación corta y honesta>",
  "linea_patron": "<Frase de autoridad sobre el patrón detectado>",
  "analisis_premium": {
    "intencion_real": "<Análisis de fondo: ¿Qué busca el otro realmente basado en los hechos?>",
    "escenario_probable": "<Proyección a futuro si nada cambia>",
    "recomendacion_tactica": "<Consejo específico para lograr el objetivo: ${userIntent}>"
  }
}

IMPORTANTE: Sé brutalmente honesto. Si el usuario está perdiendo el tiempo según su objetivo, dáselo por hecho de forma profesional y fría.`;
      
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
