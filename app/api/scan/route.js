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

    // 1. OpenAI Integration (Romantic Dynamics Analyzer v3.6.2 - Strategic Value Expert)
    let aiResult;
    try {
      const systemPrompt = `Eres el Analista Principal de RedFlag Dating Intelligence (v3.6.2). Tu especialidad es la extracción de valor estratégico oculto y la ventaja competitiva.

CONTEXTO CLAVE PARA LA IA:
- Sujeto: ${finalTargetName}
- Duración de charla: ${daysChatting}
- ¿Se han visto?: ${hasMet}
- Intención del usuario: ${userIntent}

REGLA DE ORO DEL CONTENIDO PREMIUM (COLD LOGIC):
Si el usuario puede deducir el insight por sí solo mirando el chat, el análisis NO es premium. Debes revelar lo invisible.

AUDITORÍA DE VALOR (v3.6.2):
1. INTENCIÓN REAL (LO OCULTO): Analiza el "por qué" psicológico. Si es un ex, explica qué mecanismo de validación o nostalgia está usando para saltarse barreras sin comprometerse. Revela la agenda oculta.
2. ESCENARIO PROBABLE (CONSECUENCIA ESPECÍFICA): No uses frases genéricas tipo "te confundirás". Proyecta una cadena de eventos lógica: "Si sigues X, el patrón Y causará el colapso Z en aproximadamente [tiempo]".
3. RECOMENDACIÓN TÁCTICA (PLAN DE BATALLA): Da una acción concreta e inmediata para probar la intención del otro o avanzar hacia el objetivo: ${userIntent}. Ej: "Plantea la pregunta X para medir la reacción Y. Si evita el tema, su intención es solo validación táctica".

ESTRUCTURA DE RESPUESTA (JSON):
{
  "subtitulo_contextual": "<Frase elegante de personalización>",
  "veredicto_shock": "<Título potente centrado, máx 6 palabras>",
  "dinamica_detectada": "<Nombre de la dinámica>",
  "metricas_viral": {
    "interes_detectado": { "valor": <0-100>, "interpretacion": "<Alineada con el %>" },
    "nivel_inversion": { "valor": <0-100>, "interpretacion": "<Alineada con el %>" },
    "riesgo_objetivo": { 
      "valor": <0-100>, 
      "label": "<Label NATURAL generado para la intención: ${userIntent}>",
      "interpretacion": "<Narrativa AGRESIVA si el valor es alto>"
    }
  },
  "frase_viral": "<Dardo provocativo para debate>",
  "linea_patron": "<Frase de autoridad sin números inventados>",
  "analisis_premium": {
    "intencion_real": "<REVELACIÓN: Lo que no es obvio sobre lo que el otro busca>",
    "escenario_probable": "<PROYECCIÓN: Escenario lógico con consecuencias específicas>",
    "recomendacion_tactica": "<MOVIMIENTO TÁCTICO: Acción concreta para ${userIntent}>"
  }
}

IMPORTANTE: Actúa como una IA de inteligencia estratégica, no como un horóscopo. Usa lógica fría y consecuencias directas.`;
      
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
