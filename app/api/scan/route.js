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
    const { images, targetName, zodiacSign } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    if (!targetName) {
      return NextResponse.json({ error: 'Target name is required' }, { status: 400 });
    }

    // 1. OpenAI Integration (Romantic Dynamics Analyzer v3)
    const systemPrompt = `Actúa como un analizador inteligente de dinámicas románticas y conversaciones de citas. Tu objetivo es proporcionar un análisis profundo, creíble y con valor estratégico.

Tu función es evaluar imágenes o chats y detectar con precisión: nivel de coqueteo, intención física, desbalance de interés y probabilidad de ghosting.

Estructura de Análisis:
- Gratis (60%): Datos numéricos, qué está pasando ahora y una frase viral impactante.
- Premium (40%): Intención real, predicción futura y estrategia de respuesta.

Reglas Estratégicas:
- No insultes. Usa lenguaje probabilístico ("sugiere", "podría indicar").
- Sé directo y ligeramente divertido, pero mantén un tono de "experto en citas".
- Genera un dato de psicología de conversión contextual basado en el análisis (ej: "Las dinámicas con +70% de coqueteo unilateral tienden a enfriarse en 10 días").

Responde exclusivamente con un JSON válido usando esta estructura exacta:
{
  "nivel_coqueteo": <0-100>,
  "intencion_fisica": <0-100>,
  "desbalance_interes": <0-100>,
  "probabilidad_ghosting": <0-100>,
  "red_flag_principal": "<Título breve (max 5 palabras) sobre el hallazgo principal>",
  "frase_viral": "<Frase corta y picante para compartir, max 10 palabras>",
  "nivel_riesgo_general": "Bajo | Moderado | Alto",
  "dynamic_header": "🔍 Dinámica: [Nombre de la dinámica detectada en 2-3 palabras]",
  "psicologia_conversion": "<Dato estadístico o psicológico contextual para incitar al pago>",
  "analisis_premium": {
    "intencion_real": "<Análisis de lo que busca realmente la persona>",
    "riesgo_futuro": "<Predicción detallada de la dinámica a 2-4 semanas>",
    "recomendacion_estrategica": "<Consejo práctico sobre cómo actuar sin perder poder>"
  }
}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      {
        role: 'user',
        content: images.map(base64 => ({
          type: 'image_url',
          image_url: { url: `data:image/jpeg;base64,${base64}`, detail: 'low' }
        }))
      }
    ];

    const openai = getOpenAIClient();
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
      max_tokens: 1000,
      temperature: 0.6, // Lower temperature for more stability
    });

    const aiResult = JSON.parse(aiResponse.choices[0].message.content);

    let scanId = 'test_' + Date.now();

    // 2. Save to Supabase (Optional for testing)
    try {
      if (supabase) {
        const { data: scanData, error: dbError } = await supabase
          .from('scans')
          .insert([
            { 
              target_name: targetName, 
              ai_result: aiResult,
              status: 'pending_payment'
            }
          ])
          .select()
          .single();

        if (dbError) {
          console.error('Supabase Error:', dbError);
        } else if (scanData) {
          scanId = scanData.id;
        }
      }
    } catch (dbErr) {
      console.error('Database connection failed:', dbErr);
    }

    // 3. Generate Lemon Squeezy Payment (Optional for testing)
    let checkoutUrl = '#';
    try {
      if (LEMON_SQUEEZY_API_KEY && STORE_ID && VARIANT_ID) {
        const checkoutResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.api+json',
            'Content-Type': 'application/vnd.api+json',
            'Authorization': `Bearer ${LEMON_SQUEEZY_API_KEY}`
          },
          body: JSON.stringify({
            data: {
              type: 'checkouts',
              attributes: {
                checkout_data: {
                  custom: {
                    scan_id: scanId
                  }
                },
                product_options: {
                  redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/scan?status=success&scan_id=${scanId}`
                }
              },
              relationships: {
                store: {
                  data: { type: 'stores', id: String(STORE_ID) }
                },
                variant: {
                  data: { type: 'variants', id: String(VARIANT_ID) }
                }
              }
            }
          })
        });

        if (checkoutResponse.ok) {
          const checkoutData = await checkoutResponse.json();
          checkoutUrl = checkoutData.data.attributes.url;
        } else {
          const errorData = await checkoutResponse.json();
          console.error('Lemon Squeezy Error:', errorData);
        }
      }
    } catch (payErr) {
      console.error('Payment generation failed:', payErr);
    }

    // 4. Respond to frontend
    return NextResponse.json({
      ...aiResult,
      scan_id: scanId,
      checkout_url: checkoutUrl
    });

  } catch (err) {
    console.error('[Scan Endpoint] Fatal Error:', {
      message: err.message,
      stack: err.stack,
      cause: err.cause
    });
    return NextResponse.json({ 
      error: 'Error en el servidor de IA', 
      details: err.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
