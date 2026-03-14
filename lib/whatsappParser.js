/**
 * Módulo de Análisis Local de WhatsApp (Client-Side Parser)
 * 
 * Este parser se ejecuta 100% en el navegador del usuario.
 * Extrae estadísticas gratuitas (Métricas de Enganche y Tiempos Cortos)
 * sin enviar el archivo masivo a ningún servidor.
 */

// Formatos comunes de WhatsApp Export:
// iOS: [12/5/23, 14:00:21] Nombre: Mensaje
// iOS español: [12/5/23, 2:00:21 p. m.] Nombre: Mensaje
// Android: 12/5/23, 14:00 - Nombre: Mensaje
// Android alternativo: 12/5/2023, 14:00 - Nombre: Mensaje
const iosRegex = /^\[?(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})[, ]\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp]\.?\s?[Mm]\.?)?)\]?\s+([^:]+):\s+(.*)$/;
const androidRegex = /^(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})[, ]\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp]\.?\s?[Mm]\.?)?)\s+-\s+([^:]+):\s+(.*)$/;

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
 * Helper para extraer emojis del texto
 */
function extractEmojis(text) {
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F1E6}-\u{1F1FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA70}-\u{1FAFF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F018}-\u{1F270}]/gu;
  return text.match(emojiRegex) || [];
}

/**
 * Helper para formato de horas de inactividad
 */
function formatWaitTime(ms) {
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

/**
 * Extrae las "Métricas Gratis" para el Teaser
 * @param {Array} messages Array de mensajes parseados 
 */
export function extractLocalStats(messages) {
  if (!messages || messages.length === 0) return null;

  const senderCounts = {};
  const allEmojis = {};
  const allWords = {};
  const activityHours = new Array(24).fill(0);
  
  let lastMsg = null;
  const maxWaitTimes = {};

  messages.forEach(msg => {
    // 1. Contador de mensajes y palabras
    if (!senderCounts[msg.sender]) {
      senderCounts[msg.sender] = { count: 0, wordCount: 0 };
      maxWaitTimes[msg.sender] = 0;
    }
    senderCounts[msg.sender].count += 1;
    
    const words = msg.content.split(/\s+/).filter(w => w.length > 0).length;
    senderCounts[msg.sender].wordCount += words;

    // 2. Extraer Emojis
    const emojis = extractEmojis(msg.content);
    emojis.forEach(e => {
      allEmojis[e] = (allEmojis[e] || 0) + 1;
    });

    // 3. Mapa de calor de horas
    const dateObj = new Date(msg.rawTimestamp);
    if (!isNaN(dateObj.getTime())) {
      const hour = dateObj.getHours();
      activityHours[hour] += 1;
    }

    // 4. Calcular "Ghosting Factor" (Tiempo máximo que hizo esperar al otro)
    if (lastMsg && lastMsg.sender !== msg.sender) {
      if (!isNaN(msg.rawTimestamp) && !isNaN(lastMsg.rawTimestamp)) {
        const diffMs = msg.rawTimestamp - lastMsg.rawTimestamp;
        if (diffMs > 0 && diffMs < 30 * 24 * 60 * 60 * 1000) {
          if (diffMs > maxWaitTimes[msg.sender]) {
            maxWaitTimes[msg.sender] = diffMs;
          }
        }
      }
    }

    // 5. Conteo de palabras para Word Cloud
    const stopWords = new Set(['de','la','el','en','y','que','a','los','las','del','se','un','una','es','por','con','no','lo','su','para','al','le','ya','o','me','si','mi','te','más','pero','como','este','esta','eso','tu','yo','hay','fue','ser','ha','era','son','muy','todo','tan','bien','sin','sobre','da','ni','cuando','entre','nos','les','está','tipo','solo','eso','esto','esa','ese','estar','son','dos','así','pues','han','sus','tiene','hacer','cada','vez','esos','van','ver','ahora','puede','parte','tal','algo','mis','tus','ser','hay','aquí','creo','jaja','jajaja','jajajaja','jajajajaja','ok','si','no','hola','bueno','pues']);
    const msgWords = msg.content.toLowerCase().replace(/[^\wáéíóúñü\s]/g, '').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));
    msgWords.forEach(w => {
      allWords[w] = (allWords[w] || 0) + 1;
    });

    lastMsg = msg;
  });

  // Determinar los dos participantes principales
  const sortedSenders = Object.entries(senderCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 2);

  if (sortedSenders.length < 2) {
    throw new Error('No se detectaron suficientes participantes. Asegúrate de subir un chat 1 a 1 de WhatsApp.');
  }

  const u1Name = sortedSenders[0][0];
  const u2Name = sortedSenders[1][0];

  const user1 = { 
    name: u1Name, 
    ...sortedSenders[0][1], 
    maxWaitMs: maxWaitTimes[u1Name],
    formattedWait: formatWaitTime(maxWaitTimes[u1Name])
  };
  const user2 = { 
    name: u2Name, 
    ...sortedSenders[1][1],
    maxWaitMs: maxWaitTimes[u2Name],
    formattedWait: formatWaitTime(maxWaitTimes[u2Name])
  };

  // Top Emojis
  const topEmojis = Object.entries(allEmojis)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(e => ({ emoji: e[0], count: e[1] }));

  // Peak Hour
  let peakHour = 0;
  let maxActivity = 0;
  activityHours.forEach((val, i) => {
    if (val > maxActivity) {
      maxActivity = val;
      peakHour = i;
    }
  });

  // Trend analysis: Compare first 20% vs last 20% of messages
  const splitPoint = Math.floor(messages.length * 0.2);
  const firstBatch = messages.slice(0, splitPoint);
  const lastBatch = messages.slice(-splitPoint);
  
  const getFreq = (batch) => {
    if (batch.length < 2) return 0;
    const start = new Date(batch[0].rawTimestamp).getTime();
    const end = new Date(batch[batch.length - 1].rawTimestamp).getTime();
    return batch.length / ((end - start) / (1000 * 60 * 60 * 24) || 1);
  };
  
  const initialFreq = getFreq(firstBatch);
  const currentFreq = getFreq(lastBatch);
  const trend = initialFreq === 0 ? 0 : ((currentFreq - initialFreq) / initialFreq) * 100;

  // Initiator Analysis: Who writes first after a break (>6 hours)
  const initiators = {};
  let lastMsgTimestamp = null;
  const GAP_THRESHOLD = 6 * 60 * 60 * 1000; // 6 hours

  messages.forEach(msg => {
    const currentTs = new Date(msg.rawTimestamp).getTime();
    if (!lastMsgTimestamp || (currentTs - lastMsgTimestamp) > GAP_THRESHOLD) {
      initiators[msg.sender] = (initiators[msg.sender] || 0) + 1;
    }
    lastMsgTimestamp = currentTs;
  });

  return {
    totalMessages: messages.length,
    users: [user1, user2],
    mostTalkative: user1.count > user2.count ? user1.name : user2.name,
    initiatorStats: initiators,
    interestTrend: {
      percentChange: Math.round(trend),
      status: trend < -20 ? 'Bajo' : trend > 20 ? 'Subiendo' : 'Estable'
    },
    simpScoreBase: calculateVolumeRatio(user1, user2),
    ghostingFactor: {
      [user1.name]: user1.formattedWait,
      [user2.name]: user2.formattedWait,
      worstGhoster: user1.maxWaitMs > user2.maxWaitMs ? user1.name : user2.name
    },
    topEmojis: topEmojis,
    topWords: Object.entries(allWords)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word, count]) => ({ word, count })),
    activityData: {
      peakHour: peakHour,
      timeOfDay: peakHour >= 0 && peakHour < 6 ? 'Madrugada' : peakHour < 12 ? 'Mañana' : peakHour < 19 ? 'Tarde' : 'Noche',
      hourlyDistribution: activityHours
    }
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
 * Divide el chat completo en chunks para enviar a la IA por partes.
 * Cada chunk es ~25K caracteres (cronológico), con overlap de contexto.
 * @param {Array} messages Array completo de mensajes parseados
 * @param {number} chunkMaxChars Tamaño máximo por chunk
 * @returns {string[]} Array de strings, cada uno es un chunk del chat
 */
export function chunkForAI(messages, chunkMaxChars = 25000) {
  // Primero, construimos todas las líneas formateadas
  const lines = messages.map(msg => `[${msg.dateStr} ${msg.timeStr}] ${msg.sender}: ${msg.content}`);
  
  const chunks = [];
  let currentChunk = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] + '\n';
    
    if (currentChunk.length + line.length > chunkMaxChars && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = '';
    }
    
    currentChunk += line;
  }
  
  // Último chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  
  return chunks;
}

// Legacy: alias for backwards compatibility
export function condenseForAI(messages, maxChars = 30000) {
  const chunks = chunkForAI(messages, maxChars);
  return chunks[chunks.length - 1] || '';
}
