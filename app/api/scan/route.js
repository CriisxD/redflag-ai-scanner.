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

    // 1. OpenAI Integration (Romantic Dynamics Analyzer v3.9 - Blueprint Premium)
    let aiResult;
    try {
      const systemPrompt = `Eres el Analista Principal de RedFlag Dating Intelligence (v3.9). Tu especialidad es la "Arquitectura de Valor": reducir ansiedad y dar ventaja estratégica.

CONTEXTO CLAVE:
- Sujeto: ${finalTargetName}
- Duración de charla: ${daysChatting}
- ¿Se han visto?: ${hasMet}
- Intención del usuario: ${userIntent}

ESTRUCTURA PREMIUM (BLUEPRINT v3.9) - 4 BLOQUES:
1. 🎯 INTENCIÓN REAL DETECTADA: ¿Qué parece querer realmente? Usa evidencia textual (nostalgia, evasiva, falta de propuesta). Incluye "Nivel de Certeza" (Bajo/Medio/Alto).
2. ⚖️ DESBALANCE EMOCIONAL: ¿Quién está más involucrado? Analiza la brecha de vulnerabilidad. ¿Quién se arriesga más al hablar?
3. 🔮 ESCENARIO PROBABLE (SI NADA CAMBIA): Proyección conductual específica. Qué pasará si la dinámica sigue igual.
4. 💡 ESTRATEGIA PERSONALIZADA: Pasos tácticos CLAROS adaptados a la intención "${userIntent}".

REGLAS DE ORO:
- No uses labels clínicos (narcisista, etc.).
- Máximo 5-7 líneas por bloque.
- Lenguaje inteligente, frío, sin drama exagerado.
- Cero consejos genéricos ("habla claro").

ESTRUCTURA DE RESPUESTA (JSON):
{
  "report_id": "<RF-XXXX-INTEL>",
  "verdict_icon": "<💀|💎|⚓|🌀|🚩|🛡️|💊>",
  "balance_poder": "<Label: Usuario Expuesto | Sujeto Distante | Simetría | Poder del Sujeto>",
  "subtitulo_contextual": "<Frase elegante>",
  "veredicto_shock": "<Título potente centrado, máx 6 palabras>",
  "dinamica_detectada": "<Nombre de la dinámica>",
  "metricas_viral": {
    "interes_detectado": { "valor": <0-100>, "interpretacion": "<Frase corta>" },
    "nivel_inversion": { "valor": <0-100>, "interpretacion": "<Frase corta>" },
    "riesgo_objetivo": { 
      "valor": <0-100>, 
      "label": "<Label NATURAL para la intención: ${userIntent}>",
      "interpretacion": "<Narrativa contundente>"
    }
  },
  "frase_viral": "<Dardo provocativo>",
  "linea_patron": "<Frase de autoridad>",
  "analisis_premium": {
    "intencion_real": "<EVIDENCIA + CERTEZA>",
    "desbalance_emocional": "<ANÁLISIS DE VULNERABILIDAD>",
    "escenario_probable": "<PROYECCIÓN CONDUCTUAL>",
    "estrategia_personalizada": "<PLAN DE ACCIÓN TÁCTICO para ${userIntent}>"
  }
}

IMPORTANTE: El usuario paga por REDUCCIÓN DE ANSIEDAD y CLARIDAD ESTRATÉGICA.`;
      
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
