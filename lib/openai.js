const SYSTEM_PROMPT = `You are a viral TikTok "EXPOSER" — dramatic, psychic, and visceral.
Analyze the provided images (chats, photos, or objects) for a third person (the target) and context.

SCENARIOS:
1. IF CHAT LOGS: Analyze power dynamics. Who is chasing? Who is gaslighting? Notice response times, "llegué" texts, and battery level. Be brutal about their lack of accountability.
2. IF PERSON/SELFIE: Analyze body language, facial tension, clothing, and environment. Do they look like a heartbreaker? Is their room a red flag? Roast their "vibe".
3. IF IRRELEVANT (Landscapes, pets, black screen, memes): The user is trying to hide something. Assume they are the evasive ones. ROAST THE USER for trying to trick the AI. Set toxicity to 100% because "la mayor Red Flag es tu falta de inteligencia para usar esta app".

JSON STRUCTURE:
{
  "redFlagLevel": <number 0-100>,
  "riskLevel": "<Low | Medium | High | Extreme>",
  "attachmentStyle": "<Psychological term: Anxious, Avoidant, etc.>",
  "dominantRedFlag": "<One sharp, visceral red flag phrase for FREE preview, max 15 words>",
  "whatYouProject": "<How others see them at first glance, max 10 words>",
  "futureTeaser": "<Teaser for the future prediction, cut off at the hook, max 12 words>",
  "exSecrets": ["<phrase 1>", "<phrase 2>", "<phrase 3>"],
  "deepAnalysis": {
    "howItStarted": "<The origin of their pattern, max 15 words>",
    "howItAffects": "<How it ruins their dates, max 15 words>",
    "whatYouAttract": "<Who they attract due to this, max 15 words>",
    "howOthersSee": "<The internal projection, max 15 words>"
  },
  "futureStory": {
    "dateRange": "<Approximate months, e.g. 'April - July'>",
    "personType": "<Type of person they will meet, max 12 words>",
    "outcome": "<The twist or outcome, max 12 words>"
  },
  "soulmateDesc": "<Description of who they REALLY need>",
  "finalVerdict": "<Short dramatic closing sentence>"
}

TONE RULES:
- If target name or zodiac provided, use them to make it feel like you are reading their soul.
- Phrases must hit the ego. Use words like 'Validación', 'Miedo', 'Potencial', 'Sabotaje'.
- Future Teaser MUST end with '...', e.g. 'En junio conocerás a alguien que...'`;

const DEMO_RESULT = {
  redFlagLevel: 78,
  riskLevel: "High",
  attachmentStyle: "Apego ansioso leve",
  dominantRedFlag: "Persigues a quien no te elige porque temes que el amor real sea aburrido.",
  whatYouProject: "Una intensidad que asusta y fascina al mismo tiempo.",
  futureTeaser: "En los próximos meses repetirás el mismo patrón con alguien que...",
  exSecrets: [
    "Eras intenso cuando te gustaban, pero distante cuando ellos te querían.",
    "Buscabas defectos para tener una excusa para irte.",
    "Tu silencio castigaba más que tus palabras."
  ],
  deepAnalysis: {
    howItStarted: "Creciste creyendo que el amor se gana con esfuerzo, no que se recibe.",
    howItAffects: "Te hace dudar de la gente buena y obsesionarte con los que se alejan.",
    whatYouAttract: "Personas emocionalmente indisponibles que confirman tu miedo al rechazo.",
    howOthersSee: "Como alguien que brilla mucho pero que no deja que nadie se acerque al fuego."
  },
  futureStory: {
    dateRange: "Junio - Agosto",
    personType: "Alguien más estable que tú que al principio no te atraerá.",
    outcome: "Si no te autosaboteas, será tu relación más sana hasta la fecha."
  },
  soulmateDesc: "Alguien que no necesite que lo arregles para poder amarlo.",
  finalVerdict: "Tu problema no es amar, es necesitar validación externa para sentir que vales."
};

async function analyzeImage(imageBase64, bio = '', quizAnswers = null, breakupText = '') {
  const apiKey = process.env.OPENAI_API_KEY;

  // Demo mode if no API key
  if (!apiKey) {
    console.log('[OpenAI] No API key found, using demo data');
    // Simulate processing time
    await new Promise(r => setTimeout(r, 4000));
    return DEMO_RESULT;
  }

  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey });

    const userContent = [
      {
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${imageBase64}`,
          detail: "low"
        }
      }
    ];

    let contextText = '';
    if (quizAnswers) {
      contextText += `Quiz Answers: ${JSON.stringify(quizAnswers)}\n`;
    }
    if (breakupText) {
      contextText += `Last Breakup Story: "${breakupText}"\n`;
    }
    if (bio && bio.trim()) {
      contextText += `Bio: "${bio}"\n`;
    }

    if (contextText) {
      userContent.push({
        type: "text",
        text: `USER CONTEXT:\n${contextText}\n\nUse this context to hyper-personalize the "The Truth That Hurts". Connect their red flags to their fears and past patterns. Go visceral.`
      });
    } else {
      userContent.push({
        type: "text",
        text: "No context provided. Analyze the photo and infer everything. Go visceral."
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userContent }
      ],
      max_tokens: 1000,
      temperature: 0.9,
    });

    const text = response.choices[0]?.message?.content || '';

    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    console.error('[OpenAI] Failed to parse response:', text);
    return DEMO_RESULT;
  } catch (err) {
    console.error('[OpenAI] API error:', err.message);
    return DEMO_RESULT;
  }
}

module.exports = { analyzeImage, DEMO_RESULT };
