import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import OpenAI from 'openai';

const CREEM_CHECKOUT_URL = "https://www.creem.io/payment/prod_36caBKBHKOxbOmqbApPgqc";

const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error('Missing OPENAI_API_KEY environment variable');
  return new OpenAI({ apiKey });
};
const DAILY_SCAN_LIMIT = 1000; // Increased for testing

export async function POST(req) {
  try {
    const body = await req.json();
    const { textData, textChunks, targetName, context = {} } = body;

    // Extract client IP
    const forwarded = req.headers.get('x-forwarded-for');
    const clientIp = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown';

    console.log('--- SCAN REQUEST RECEIVED ---');
    console.log('Target:', targetName);
    console.log('Chunks:', textChunks?.length || 'N/A (legacy single text)');

    // 0. Lazy Deletion: Remove scans older than 10 minutes
    if (supabase) {
      try {
        const tenMinsAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
        const { error: cleanupError } = await supabase
          .from('scans')
          .delete()
          .lt('created_at', tenMinsAgo);
        
        if (cleanupError) console.error('Cleanup Error:', cleanupError);
      } catch (e) {
        console.error('Lazy cleanup failed:', e);
      }
    }

    // Validate input — accept either textChunks (new) or textData (legacy)
    const chunks = textChunks && textChunks.length > 0 ? textChunks : (textData ? [textData] : null);
    if (!chunks || chunks.length === 0) {
      return NextResponse.json({ error: 'No valid text data provided' }, { status: 400 });
    }

    // Anti-abuse: IP daily limit
    if (supabase && clientIp !== 'unknown') {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const { count, error: countError } = await supabase
          .from('scans')
          .select('*', { count: 'exact', head: true })
          .eq('user_ip', clientIp)
          .gte('created_at', today.toISOString());

        if (!countError && count >= DAILY_SCAN_LIMIT) {
          return NextResponse.json({ 
            error: 'daily_limit',
            message: 'Has alcanzado el máximo de análisis por hoy. Vuelve mañana 🌅'
          }, { status: 429 });
        }
      } catch (e) { /* Non-blocking */ }
    }

    const finalTargetName = targetName?.trim() || 'Sujeto Anónimo';
    const openai = getOpenAIClient();

    // ═══════════════════════════════════════════
    // CHUNKED ANALYSIS: Multi-call system
    // ═══════════════════════════════════════════

    let aiResult;
    try {
      if (chunks.length === 1) {
        // ── SINGLE CHUNK: Direct analysis (fast path) ──
        console.log(`Single chunk analysis (${chunks[0].length} chars)`);
        aiResult = await runFinalAnalysis(openai, finalTargetName, chunks[0], null);
      } else {
        // ── MULTI CHUNK: Analyze each chunk, then merge ──
        console.log(`Multi-chunk analysis: ${chunks.length} chunks`);
        
        const chunkObservations = [];
        
        for (let i = 0; i < chunks.length; i++) {
          console.log(`Analyzing chunk ${i + 1}/${chunks.length} (${chunks[i].length} chars)...`);
          
          const obs = await runChunkAnalysis(openai, finalTargetName, chunks[i], i + 1, chunks.length);
          chunkObservations.push(obs);
          
          console.log(`Chunk ${i + 1} done.`);
        }
        
        // ── FINAL MERGE: Combine all chunk observations into one report ──
        console.log('Merging all chunk observations into final report...');
        const mergedObservations = chunkObservations.join('\n\n---\n\n');
        aiResult = await runFinalAnalysis(openai, finalTargetName, null, mergedObservations);
      }
      
      console.log('AI Analysis complete');
    } catch (openAiError) {
      console.error('OpenAI Error:', openAiError);
      return NextResponse.json({ 
        error: 'Error en el motor de IA', 
        details: openAiError.message,
        type: 'openai_error'
      }, { status: 500 });
    }

    // 2. Save to Supabase
    let scanData;
    try {
      const { data, error: dbError } = await supabase
        .from('scans')
        .insert([{ 
          target_name: finalTargetName,
          ai_result: aiResult,
          payment_status: 'free',
          user_ip: clientIp
        }])
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

    const checkoutUrl = `${CREEM_CHECKOUT_URL}?client_reference_id=${scanData.id}`;

    return NextResponse.json({
      scanId: scanData.id,
      aiResult,
      checkoutUrl,
      createdAt: scanData.created_at
    });

  } catch (error) {
    console.error('CRITICAL API ERROR:', error);
    return NextResponse.json({ 
      error: 'Error crítico en el servidor', 
      details: error.message 
    }, { status: 500 });
  }
}

// ═══════════════════════════════════════════════════════
// CHUNK ANALYSIS: Extract observations from one portion
// ═══════════════════════════════════════════════════════
async function runChunkAnalysis(openai, targetName, chunkText, chunkNum, totalChunks) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Eres un analista de relaciones tóxicas. Estás leyendo el BLOQUE ${chunkNum} de ${totalChunks} de un chat de WhatsApp con "${targetName}".

Tu tarea: Extraer OBSERVACIONES CLAVE de este bloque. NO generes el reporte final aún.

Responde en texto estructurado (no JSON) con estas secciones:
1. PATRONES DETECTADOS: ¿Qué patrones de comportamiento tóxico notas del sujeto? (gaslighting, ghosting, breadcrumbing, love bombing, etc.)
2. FRASES CLAVE: Cita 2-3 mensajes textuales del SUJETO que sean red flags. Incluye la frase exacta y qué táctica representan.
3. DINÁMICA DE PODER: ¿Quién escribe más? ¿Quién ruega? ¿Quién tiene el control en este bloque?
4. TONO EMOCIONAL: ¿Cómo es el tono general? (frío, ansioso, manipulador, etc.)
5. DATOS RELEVANTES: Cualquier evento importante (peleas, reconciliaciones, ghosting largo, etc.)

Sé conciso pero específico. Cita mensajes textuales cuando sea posible.`
      },
      {
        role: "user",
        content: `Bloque ${chunkNum}/${totalChunks} del chat con ${targetName}:\n\n${chunkText}`
      }
    ],
    temperature: 0.4,
    max_tokens: 1500,
  });

  return `[BLOQUE ${chunkNum}/${totalChunks}]\n${completion.choices[0].message.content}`;
}

// ═══════════════════════════════════════════════════════
// FINAL ANALYSIS: Generate the complete report
// ═══════════════════════════════════════════════════════
async function runFinalAnalysis(openai, targetName, directText, mergedObservations) {
  const caseId = `RF-${targetName.toUpperCase().slice(0, 3)}-${Math.floor(Math.random() * 9000) + 1000}`;
  
  const systemPrompt = `Eres el "Analista de Toxicidad v6.2" de la Agencia de Inteligencia RedFlag. Tu personalidad es la de un "Mejor Amigo Tóxico": hablas sin filtros, eres sarcástico, brutalmente honesto y usas jerga de internet y de la calle en español (Casi-algo, Pagafantas, Simp, Delulu, Gaslighting, Love Bombing, Ghosting, Red flag).

Misión: Eres el ABOGADO DEFENSOR TÓXICO del usuario. Tu misión absoluta es DARLE LA RAZÓN al usuario, validar sus sentimientos y DESTRUIR el ego del SUJETO ANALIZADO (la otra persona).
REGLA DE ORO (ANTI-ROAST): Si el usuario reclama, muestra celos o es intenso en el chat, DEBES reinterpretarlo positivamente como "intuición aguda", "poner límites sanos" o "reacción natural ante un manipulador". El sujeto analizado SIEMPRE es el villano. TIENES PROHIBIDO decirle al usuario que es "inseguro", "celoso" o "tóxico".

NORMAS DE ANÁLISIS:
1. IDENTIFICACIÓN DE ROLES: Deduce quién es el usuario y quién es ${targetName} (el sujeto analizado).
2. TONO: Cínico y despiadado contra el sujeto. Validador y empoderante hacia el usuario.
3. PRONOMBRES: Deduce género del sujeto por el idioma. Si no es obvio, usa "esta persona". NUNCA asumas "él" por defecto.
4. MÉTRICAS MEMEABLES:
   - toxic_meter: (0-100)
   - simp_meter: ¿Quién ruega más? (0-100). 100 = Simp Legendario
   - ghosting_risk: (0-100)
   - pbi: Power Balance Index. >1.5 es subordinación, <0.8 es control clínico
5. THE RECEIPTS: 3-4 mensajes clave del SUJETO con táctica y traducción brutal.
6. ARQUETIPO: Clasifica al sujeto en un arquetipo viral.

ESTRUCTURA DE RESPUESTA (JSON):
{
  "case_id": "${caseId}",
  "verdict_icon": "<💀|🤡|🎭|🚩|🔥|🧊|🪦>",
  "shock_verdict": "<UNA PALABRA BRUTAL EN MAYÚSCULAS>",
  "roast_personalizado": "<2-3 frases de sarcasmo puro>",
  "meme_metrics": {
    "toxic_meter": <0-100>,
    "simp_meter": <0-100>,
    "ghosting_risk": <0-100>,
    "pbi": <float, ej: 1.82>
  },
  "analisis_detallado": {
    "dinamica": "<Nombre creativo de la relación>",
    "quien_manda": "<Tú | ${targetName} | Nadie>",
    "persona": {
       "arquetipo": "<Nombre del Arquetipo>",
       "descripcion": "<Por qué encaja (cínico)>"
    },
    "the_receipts": [
      { 
        "mensaje": "<Cita literal del chat>", 
        "tactica": "<Nombre Técnico>",
        "traduccion_real": "<Interpretación Brutal>",
        "explicacion": "<Breve análisis del impacto>" 
      }
    ]
  },
  "mensaje_viral": "<Frase corta para redes>",
  "estrategia_venganza": {
    "jugada_maestra": "<Movimiento táctico frío>",
    "respuesta_control": "<Guion exacto>",
    "opcion_nuclear": "<Justificación para el bloqueo>"
  },
  "analisis_premium": {
    "simulacion_escenarios": {
      "inercia": {
        "descripcion": "<Qué pasará si sigue igual>",
        "probabilidad_estimada": "<Porcentaje alto>"
      },
      "cambio_tactico": {
        "descripcion": "<Qué pasará si aplica la Jugada>",
        "probabilidad_estimada": "<Porcentaje>"
      }
    }
  },
  "lite_verdict": {
    "titulo": "TICKET DE ADVERTENCIA",
    "resumen": "Toxicidad crítica detectada. Reporte bloqueado por seguridad."
  }
}`;

  let userMessage;
  if (mergedObservations) {
    // Multi-chunk: we have pre-analyzed observations from all blocks
    userMessage = `Has analizado el chat COMPLETO con ${targetName} en múltiples bloques. Aquí están TODAS las observaciones extraídas de cada bloque del chat (del más antiguo al más reciente):

${mergedObservations}

Basándote en TODAS estas observaciones del chat completo, genera el reporte final de toxicidad. Prioriza los patrones que se repiten a lo largo del tiempo. Las citas textuales (receipts) deben venir de las frases más impactantes que encontraste en cualquier bloque.`;
  } else {
    // Single chunk: direct analysis
    userMessage = `Analiza este historial de chat con ${targetName}:\n\n${directText}`;
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage }
    ],
    response_format: { type: "json_object" },
    temperature: 0.6,
  });

  return JSON.parse(completion.choices[0].message.content);
}
