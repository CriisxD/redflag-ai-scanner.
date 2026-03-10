/**
 * Módulo de Análisis Local de WhatsApp (Client-Side Parser)
 * 
 * Este parser se ejecuta 100% en el navegador del usuario.
 * Extrae estadísticas gratuitas (Métricas de Enganche y Tiempos Cortos)
 * sin enviar el archivo masivo a ningún servidor.
 */

// Formatos comunes de WhatsApp Export:
// iOS: [12/5/23, 14:00:21] Nombre: Mensaje
// Android: 12/5/23, 14:00 - Nombre: Mensaje
// Android alternativo: 12/5/2023, 14:00 - Nombre: Mensaje
const iosRegex = /^\[?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})[, ]\s+(\d{1,2}:\d{2}(?::\d{2})?(?:[ ]?[AaPp]\.?[Mm]\.?)?)\]?\s+([^:]+):\s+(.*)$/;
const androidRegex = /^(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})[, ]\s+(\d{1,2}:\d{2}(?::\d{2})?(?:[ ]?[AaPp]\.?[Mm]\.?)?)\s+-\s+([^:]+):\s+(.*)$/;

/**
 * Parsea el texto crudo de la exportación de WhatsApp y genera un array de objetos Message.
 * @param {string} rawText El contenido del archivo .txt
 */
export function parseWhatsAppChat(rawText) {
  const lines = rawText.split('\n');
  const messages = [];
  let currentMessage = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Intentar match con iOS o Android
    let match = line.match(iosRegex) || line.match(androidRegex);

    if (match) {
      // Es una nueva línea de mensaje válida
      if (currentMessage) {
        messages.push(currentMessage);
      }

      // Evitar mensajes de sistema comunes
      const sender = match[3].trim();
      const content = match[4].trim();
      
      // Ignorar mensajes de sistema de cifrado o cambios de nombre
      if (sender.includes('creó el grupo') || 
          sender.includes('cambió el asunto') ||
          content.includes('Los mensajes y las llamadas están cifrados de extremo a extremo') ||
          content.includes('<Multimedia omitido>') ||
          content.includes('omitted>')) {
        currentMessage = null; // Descartar
        continue;
      }

      currentMessage = {
        dateStr: match[1],
        timeStr: match[2],
        sender: sender,
        content: content,
        rawTimestamp: parseDateString(match[1], match[2])
      };
    } else {
      // Es una continuación de mensaje multilínea anterior
      if (currentMessage) {
        currentMessage.content += '\n' + line;
      }
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  return messages;
}

/**
 * Helper rudimentario para crear un timestamp. 
 * Asume formatos locales simples. Puede no ser 100% exacto para zonas horarias,
 * pero es suficiente para medir deltas de tiempo de respuesta (Ghosting).
 */
function parseDateString(dateStr, timeStr) {
  // Simplificación agresiva: Intentamos que Date.parse lo entienda reemplazando formato español
  // 12/05/23 -> 2023-05-12 (Depende de si es DD/MM o MM/DD, asumimos DD/MM genérico)
  const parts = dateStr.split(/[\/\-\.]/);
  let year = parts[2] || "23";
  if (year.length === 2) year = "20" + year;
  let day = parts[0];
  let month = parts[1];
  
  // Si en USA exportó como MM/DD/YYYY, esto fallará en precisión absoluta, pero
  // el orden secuencial natural del archivo txt compensa la matemática de demoras.
  
  // Limpiar tiempo (14:00 o 2:00 PM)
  let cleanTime = timeStr.replace(/\./g, '').trim();
  
  // Fallback a un timestamp simulado secuencial si la fecha no pinea perfecto.
  // Para el MVP, usaremos el timeCrudo o simplemente confiaremos en la secuencialidad
  return new Date(`${year}-${month}-${day} ${cleanTime}`).getTime() || Date.now();
}

/**
 * Extrae las "Métricas Gratis" para el Teaser
 * @param {Array} messages Array de mensajes parseados 
 */
export function extractLocalStats(messages) {
  if (!messages || messages.length === 0) return null;

  const senderCounts = {};
  
  messages.forEach(msg => {
    if (!senderCounts[msg.sender]) {
      senderCounts[msg.sender] = { count: 0, wordCount: 0 };
    }
    senderCounts[msg.sender].count += 1;
    // Contar palabras
    const words = msg.content.split(/\s+/).filter(w => w.length > 0).length;
    senderCounts[msg.sender].wordCount += words;
  });

  // Determinar los dos participantes principales (para excluir gente si era un grupo por error)
  const sortedSenders = Object.entries(senderCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 2);

  if (sortedSenders.length < 2) {
    throw new Error('No se detectaron suficientes participantes. Asegúrate de subir un chat 1 a 1 de WhatsApp.');
  }

  const user1 = { name: sortedSenders[0][0], ...sortedSenders[0][1] };
  const user2 = { name: sortedSenders[1][0], ...sortedSenders[1][1] };

  // Calcular Tiempos Promedios de Respuesta (Matemática Básica)
  // Quién demora más en responder al otro.
  // Para mantener el MVP rápido, simplemente compararemos el volumen de palabras
  // como indicador de "Simp" (quien invierte más saliva).

  return {
    totalMessages: messages.length,
    users: [user1, user2],
    mostTalkative: user1.count > user2.count ? user1.name : user2.name,
    simpScoreBase: calculateVolumeRatio(user1, user2)
  };
}

function calculateVolumeRatio(u1, u2) {
  const total = u1.count + u2.count;
  return {
    [u1.name]: Math.round((u1.count / total) * 100),
    [u2.name]: Math.round((u2.count / total) * 100)
  };
}

/**
 * Condensa el chat para evitar límites de Tokens en OpenAI.
 * Se queda con el "Final" del chat (donde suele estar el drama reciente).
 * @param {Array} messages 
 * @param {number} maxChars Tamaño máximo en caracteres a enviar (~15K)
 */
export function condenseForAI(messages, maxChars = 15000) {
  let condensedText = '';
  // Recorremos desde el final hacia el principio para tener lo más reciente
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    const line = `[${msg.dateStr} ${msg.timeStr}] ${msg.sender}: ${msg.content}\n`;
    
    if (condensedText.length + line.length > maxChars) {
      break; 
    }
    // Añadimos al principio para mantener orden cronológico de ese bloque final
    condensedText = line + condensedText;
  }
  
  return condensedText;
}
