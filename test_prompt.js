const OpenAI = require('openai');
require('dotenv').config({ path: '.env.local' });

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function run() {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: `Eres el Analista ...
ESTRUCTURA DE RESPUESTA (JSON):
{
  "analisis_premium": {
    "poder_y_energia": {
      "mas_invertido": "<Usuario | Sujeto | Simétrico>",
      "analisis_energia": "<Análisis de quién inicia más y quién busca validación>",
      "riesgo_emocional": "<Cualitativo ej: Alto riesgo de ciclo nostálgico>"
    },
    ...
  }
}` },
      { role: "user", content: "hola" }
    ],
    response_format: { type: "json_object" },
  });
  console.log(completion.choices[0].message.content);
}
run();
