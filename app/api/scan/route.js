import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const LEMON_SQUEEZY_API_KEY = process.env.LEMON_SQUEEZY_API_KEY;
const STORE_ID = process.env.LEMON_SQUEEZY_STORE_ID;
const VARIANT_ID = process.env.LEMON_SQUEEZY_VARIANT_ID; // The $2.99 product variant
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req) {
  try {
    const { images, targetName, zodiacSign } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    if (!targetName) {
      return NextResponse.json({ error: 'Target name is required' }, { status: 400 });
    }

    // 1. OpenAI Integration
    const systemPrompt = `Actúa como un analista de comportamiento tóxico, sarcástico y despiadado. Analiza las imágenes proporcionadas para evaluar a: ${targetName} (Signo: ${zodiacSign || 'No especificado'}).
Reglas de análisis:
- Si es un chat: Analiza dinámicas de poder, manipulación, tiempos de respuesta y quién se esfuerza menos.
- Si es una foto/selfie: Analiza lenguaje corporal, mirada de 'arruina-vidas', tensión y entorno.
- Si suben basura (paisajes, memes): Búrlate del usuario por intentar evadir la realidad y ponle 100% de toxicidad por cobarde.

Responde ÚNICAMENTE con un JSON válido usando esta estructura exacta:
{
  "redFlagLevel": <número del 60 al 100>,
  "dominantRedFlag": "<La red flag principal visible (gratis), sarcástica y dolorosa. Max 25 palabras>",
  "whatYouProject": "<Breve análisis de lo que proyecta su foto/chat>",
  "futureTeaser": "<Frase misteriosa de advertencia para generar intriga>",
  "exSecrets": ["<Secreto tóxico oculto 1>", "<Secreto tóxico oculto 2>"],
  "deepAnalysis": "<Un párrafo completo destrozando su personalidad basado en los detalles visuales>"
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

    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages,
      response_format: { type: 'json_object' },
      max_tokens: 1000,
    });

    const aiResult = JSON.parse(aiResponse.choices[0].message.content);

    // 2. Save to Supabase
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
      throw new Error('Database insertion failed');
    }

    const scanId = scanData.id;

    // 3. Generate Lemon Squeezy Payment
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
                scan_id: scanId // CRITICAL for webhook reconciliation
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

    if (!checkoutResponse.ok) {
      const errorData = await checkoutResponse.json();
      console.error('Lemon Squeezy Error:', errorData);
      throw new Error('Lemon Squeezy checkout generation failed');
    }

    const checkoutData = await checkoutResponse.json();
    const checkoutUrl = checkoutData.data.attributes.url;

    // 4. Respond to frontend
    return NextResponse.json({
      redFlagLevel: aiResult.redFlagLevel,
      dominantRedFlag: aiResult.dominantRedFlag,
      scan_id: scanId,
      checkout_url: checkoutUrl
    });

  } catch (err) {
    console.error('[Scan Endpoint] Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
