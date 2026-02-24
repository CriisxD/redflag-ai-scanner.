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

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    // targetName is now optional in the UI
    const finalTargetName = targetName?.trim() || 'Sujeto Anónimo';

    // 1. OpenAI Integration (Romantic Dynamics Analyzer v3.1)
    const systemPrompt = `Actúa como un analizador inteligente de dinámicas románticas y conversaciones de citas (v3.1).
    
Tu objetivo es proporcionar un análisis profundo basado tanto en las imágenes como en el CONTEXTO proporcionado.

DATOS DE CONTEXTO:
- Tiempo hablando: ${daysChatting}
- ¿Se han visto en persona?: ${hasMet}
- Intención del usuario: ${userIntent}
- Nombre del sujeto: ${targetName || 'Desconocido'}

Instrucciones:
1. Analiza las imágenes para detectar nivel de coqueteo, intención física, desbalance de interés y probabilidad de ghosting.
2. Usa el CONTEXTO para refinar el análisis (ej: si no se han visto pero hay mucha intención física, la probabilidad de ghosting suele ser mayor).
3. Estructura de Análisis: Gratis (60%) y Premium (40% de alto valor estratégico).
4. Genera un dato de psicología de conversión contextual.

Responde exclusivamente con un JSON válido:
{
  "nivel_coqueteo": <0-100>,
  "intencion_fisica": <0-100>,
  "desbalance_interes": <0-100>,
  "probabilidad_ghosting": <0-100>,
  "red_flag_principal": "<Título breve>",
  "frase_viral": "<Frase corta y picante>",
  "nivel_riesgo_general": "Bajo | Moderado | Alto",
  "dynamic_header": "🔍 Dinámica: [Nombre de la dinámica]",
  "psicologia_conversion": "<Dato estadístico basado en el hallazgo>",
  "analisis_premium": {
    "intencion_real": "<Lo que busca realmente>",
    "riesgo_futuro": "<Predicción a 2-4 semanas>",
    "recomendacion_estrategica": "<Consejo táctico de respuesta>"
  }
}`;

    const openai = getOpenAIClient();
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Cost-effective for beta
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: `Analiza esta conversación para ${finalTargetName}. Contexto adicional: ${daysChatting} hablando, ${hasMet === 'Sí' ? 'ya se conocen' : 'aún no se han visto'}, busca ${userIntent}.` },
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

    const aiResult = JSON.parse(completion.choices[0].message.content);

    // 2. Save result to Supabase for checkout verification
    const { data: scanData, error: dbError } = await supabase
      .from('scans')
      .insert([
        { 
          target_name: finalTargetName,
          ai_result: aiResult,
          is_unlocked: false
        }
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    // 3. Return result + checkout link
    const checkoutUrl = `https://redflagscanner.lemonsqueezy.com/checkout/buy/${VARIANT_ID}?embed=1&checkout[custom][scan_id]=${scanData.id}`;

    return NextResponse.json({
      scanId: scanData.id,
      aiResult,
      checkoutUrl
    });

  } catch (error) {
    console.error('Scan API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
