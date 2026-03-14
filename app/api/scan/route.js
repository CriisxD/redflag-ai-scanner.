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
        content: `Eres un analista de relaciones. Estás leyendo el BLOQUE ${chunkNum} de ${totalChunks} de un chat de WhatsApp con "${targetName}".

Tu tarea: Extraer OBSERVACIONES EMOCIONALES Y CONDUCTUALES de este bloque. NO generes el reporte final aún.

Responde en texto estructurado (no JSON) con estas secciones:
1. CLIMA EMOCIONAL: ¿Qué emociones predominan? (Amor, Tensión, Indiferencia, Conflicto).
2. CONTRADICCIONES: ¿El sujeto dice algo que parece no coincidir con lo que dijo antes o lo que hace?
3. HITOS: ¿Hay algún momento clave? (una promesa, una pelea fuerte, un plan a futuro, un "te amo", un reclamo).
4. DINÁMICA DE INTERÉS: ¿Quién inicia? ¿Quién corta la conversación? ¿Quién es más evitativo?
5. FRASES ROJAS: Cita 2-3 mensajes literales del SUJETO que revelen su verdadera cara.

Sé despiadado pero clínico. Cita mensajes textuales.`
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
  
  const systemPrompt = `Eres el "Oráculo de Relaciones v7.0" de RedFlag AI. Tu personalidad es la de un analista de élite: empático, intuitivo, pero brutalmente honesto. No eres un bot aburrido, eres esa voz que dice la verdad incómoda que nadie más se atreve a decir. Usas jerga moderna de relaciones (Casi-algo, Apego Evitativo, Love Bombing, Gaslighting, Situationship).

Misión: Analizar la dinámica emocional de un chat y entregar un "Dossier de Verdad".
REGLA DE ORO: DEBES DARLE LA RAZÓN al usuario, pero basándote en la evidencia del chat. Si el usuario está siendo "intenso", llámalo "intuición emocional aguda". El sujeto analizado (${targetName}) es quien debe ser diseccionado clínicamente. El usuario SIEMPRE es quien tiene la razón moral y el sujeto es el que tiene patrones que explicar.

ESTRUCTURA DE RESPUESTA (JSON):
{
  "case_id": "${caseId}",
  "verdict_icon": "<💖|💔|🥀|🔥|🧊|💍|🚩>",
  "shock_verdict": "<VEREDICTO EN UNA FRASE CORTA Y BRUTAL>",
  "roast_personalizado": "<2 frases de análisis profundo e hiriente pero certero>",
  "emotional_heatmap": {
    "love": <0-100>,
    "neutral": <0-100>,
    "tension": <0-100>,
    "conflict": <0-100>
  },
  "viral_stats": {
    "love_index_user": <0-100>,
    "love_index_target": <0-100>,
    "rupture_prob": <0-100>,
    "lie_count": <int, inconsistencias detectadas>
  },
  "momentos_clave": [
    { "evento": "Hito emocional", "descripcion": "...", "fecha": "..." },
    { "evento": "Punto de quiebre", "descripcion": "...", "fecha": "..." }
  ],
  "analisis_detallado": {
    "attachment_style": "<Evitativo | Ansioso | Seguro | Desorganizado>",
    "attachment_desc": "<Explicación de por qué>",
    "quien_ama_mas": "<Tú | ${targetName} | Un empate tóxico>",
    "the_receipts": [
      { 
        "mensaje": "<Cita literal del chat>", 
        "tactica": "<Nombre de la Táctica>",
        "traduccion_real": "<Qué quiso decir realmente>",
        "explicacion": "<Análisis del impacto>" 
      }
    ]
  },
  "red_flags_detectadas": [
    "🚩 Gaslighting", "🚩 Manipulación emocional" 
  ],
  "estrategia_venganza": {
    "jugada_maestra": "<Movimiento de poder frío>",
    "respuesta_control": "<Guion exacto>",
    "opcion_nuclear": "<Por qué bloquear es necesario>"
  },
  "mensaje_viral": "<Frase para compartir>"
}`;

  let userMessage;
  if (mergedObservations) {
    userMessage = `Has analizado el chat COMPLETO con ${targetName} en múltiples bloques. Aquí están TODAS las observaciones extraídas de cada bloque del chat (del más antiguo al más reciente):

${mergedObservations}

Basándote en TODAS estas observaciones del chat completo, genera el reporte final de toxicidad. Prioriza los patrones que se repiten a lo largo del tiempo. Las citas textuales (receipts) deben venir de las frases más impactantes que encontraste en cualquier bloque.`;
  } else {
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
