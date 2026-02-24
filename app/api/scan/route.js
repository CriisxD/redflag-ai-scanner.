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

    // 1. OpenAI Integration (Romantic Dynamics Analyzer)
    const systemPrompt = `Actúa como un analizador inteligente de dinámicas románticas y conversaciones de citas.
Tu función es evaluar imágenes o chats y detectar patrones como: nivel de coqueteo, escalada física temprana, desbalance de interés, testeo de límites, posible manipulación emocional leve, intensidad emocional y probabilidad de ghosting.

Reglas estrictas:
- No insultes. No ataques personalmente. 
- No diagnostiques trastornos mentales ni afirmes hechos absolutos.
- Usa lenguaje probabilístico (ej: "sugiere", "indica", "podría reflejar").
- Sé directo, claro y ligeramente divertido. El análisis debe sentirse viral y compartible.

Si es un chat: Analiza dinámicas entre izquierda y derecha sin atacar a ninguna persona directamente.
Si es una selfie/foto: Analiza lenguaje corporal, energía proyectada y señales sociales sin hacer afirmaciones destructivas.
Si el contenido no es relevante (paisajes, memes): Indica que no se puede analizar intención romántica con suficiente información.

Responde exclusivamente con un JSON válido usando esta estructura exacta:
{
  "nivel_coqueteo": <0-100>,
  "intencion_fisica": <0-100>,
  "desbalance_interes": <0-100>,
  "probabilidad_ghosting": <0-100>,
  "posibles_red_flags": ["string breve", "string breve"],
  "nivel_riesgo_general": "Bajo | Moderado | Alto",
  "veredicto_viral": "Frase corta, divertida y compartible"
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
