const translations = {
  es: {
    // Landing
    badge: 'Análisis de Dating con IA',
    titleLine1: 'Descubre Por Qué',
    titleLine2: 'Tus Relaciones',
    titleLine3: 'Siempre Fallan.',
    subtitleLine1: '¿Te ghostean siempre? ¿Atraes lo mismo una y otra vez?',
    subtitleLine2: 'Descubre qué estás proyectando sin saberlo.',
    scanCta: '🔥 Revelar Mi Red Flag Ahora',
    scanExCta: '💀 Analizar a Mi Ex',
    disclaimer: 'Análisis generado por IA con fines de entretenimiento.',
    liveCounter: 'perfiles analizados esta semana',
    recentScans: 'Escaneos recientes',
    exampleCards: [
      { score: '92%', risk: 'Extremo', text: '"Emocionalmente indisponible, pero lo suficientemente carismático como para que lo ignores."' },
      { score: '81%', risk: 'Alto', text: '"Energía de responder DMs cada 3 días hábiles. Tus recibos de lectura están llorando."' },
      { score: '67%', risk: 'Medio', text: '"Dice \'odio el drama\' pero lo crea como si fuera un trabajo de tiempo completo."' },
    ],
    // Discovery section
    discoverTitle: '🔎 Qué vas a descubrir',
    discoverItems: [
      { emoji: '💯', text: 'Tu Toxic Score personal' },
      { emoji: '👻', text: 'Probabilidad de que te ghosteen' },
      { emoji: '🧠', text: 'Tu estilo de apego (aunque no quieras admitirlo)' },
      { emoji: '💘', text: 'El tipo de persona que atraes' },
      { emoji: '🚩', text: 'Tu red flag oculta más grande' },
    ],

    // Scan
    uploadTitle: 'Veamos qué estás proyectando.',
    uploadTitleEx: '💀 Hora de analizar a tu ex.',
    uploadSubtitle: 'La IA detectará lo que otros ven pero no te dicen.',
    uploadSubtitleEx: 'Sube su foto y descubre lo que siempre sospechaste.',
    dragDrop: 'Sube la foto que usas para ligar 😏',
    dragDropEx: 'Arrastra su mejor selfie aquí',
    orBrowse: 'o haz clic para buscar',
    addBio: 'Agrega una bio',
    addBioEx: 'Su bio / texto de perfil de dating',
    optional: '(opcional)',
    bioHelper: 'Agregar tu bio mejora la precisión del análisis.',
    bioHelperEx: 'Agregar su bio mejora la precisión del análisis.',
    bioPlaceholder: "ej. 'Solo un chico sencillo que ama las aventuras y las conversaciones profundas'",
    bioPlaceholderEx: "ej. 'Le encanta el hiking, los perros, y definitivamente no el compromiso'",
    analyze: '🔥 Descubrir La Verdad',
    analyzeEx: '💀 Revelar Lo Que Oculta',
    quickPromise: '⚡ Tu análisis estará listo en menos de 30 segundos.',
    processing: 'Analizando...',
    privacyNote: '🔒 No guardamos tu foto.',
    privacyNoteEx: '🔒 No guardamos ninguna foto.',
    back: '← Volver',

    // Loading
    loadingTitle: 'Descifrando tu patrón romántico...',
    loadingTitleEx: '💀 Analizando su perfil psicológico...',
    loadingMessages: [
      { text: "Escaneando micro-expresiones", emoji: "📸" },
      { text: "Detectando patrones de validación emocional", emoji: "🧠" },
      { text: "Analizando señales de apego ansioso", emoji: "💗" },
      { text: "Evaluando riesgo de ghosteo", emoji: "👻" },
      { text: "Identificando tu red flag dominante", emoji: "🚩" },
      { text: "Generando diagnóstico final", emoji: "⚖️" },
    ],
    loadingHighTension: 'Resultado sensible detectado...',

    // Result - Preview
    teaser: 'Ya detectamos tu peor error en el dating.',
    freeInsightLabel: '🔥 Tu Patrón Dominante:',
    freeInsightValue: '💔 Apego ansioso leve',
    freeInsightText: 'Te enamoras rápido pero siempre dudas al compromiso. Das señales mixtas que confunden a todos.',
    freeInsightTip: '⚠️ Suele enviar mensajes largos a las 3 a.m. y luego desaparecer.',
    blurredRedFlagHint: 'Tu mayor problema no es lo que dices… es lo que to████',
    ghostingProb: 'Probabilidad de Ghosteo',
    attachmentStyle: 'Estilo de Apego',
    whatYouAttract: 'Lo Que Atraes',
    hiddenRedFlag: 'Tu Red Flag Oculta Más Grande',
    revealCta: '💥 DIME MI MAYOR RED FLAG AHORA — $3.99',
    checkoutHint: 'Análisis completo de perfil • Probabilidad de ghosteo • Estilo de apego • Roast savage',
    fomoText: 'La mayoría de personas que desbloquean se sorprenden con su Red Flag Oculta.',
    urgencyNote: '⚠️ Este análisis no se guardará después de salir.',
    redirecting: 'Redirigiendo…',

    // Quiz Questions
    quizQuestions: [
      {
        id: 1,
        question: 'Cuando alguien te gusta, tú:',
        options: [
          'Me vuelvo intensx rápido',
          'Me hago el/la interesante',
          'Actúo indiferente',
          'Espero que el otrx haga todo'
        ]
      },
      {
        id: 2,
        question: 'Lo que más temes en una relación es:',
        options: [
          'Que me abandonen',
          'Que me controlen',
          'Que me engañen',
          'Que se aburran de mí'
        ]
      },
      {
        id: 3,
        question: 'Cuando discutes:',
        options: [
          'Exploto',
          'Me cierro',
          'Manipulo el silencio',
          'Finjo que no pasó nada'
        ]
      },
      {
        id: 4,
        question: 'En el fondo sientes que:',
        options: [
          'No soy suficiente',
          'No puedo confiar en nadie',
          'Siempre me van a fallar',
          'Me quieren por interés'
        ]
      },
      {
        id: 5,
        question: '¿Qué te dicen siempre?',
        options: [
          '“Eres muy intensx”',
          '“Eres fríx”',
          '“Eres complicadx”',
          '“Eres inalcanzable”'
        ]
      }
    ],
    lastBreakupLabel: 'Cómo terminó tu última relación (Opciónal)',
    lastBreakupPlaceholder: 'Ej: Me dijo que era muy intensa...',

    // Result - Premium
    redFlagLevelLabel: 'NIVEL DE RED FLAG',
    redFlagRealTitle: '🚩 TU RED FLAG REAL',
    whatYouProjectTitle: '💀 LO QUE PROYECTAS',
    futureTeaserTitle: '🔮 TU FUTURO...',
    deepAnalysisTitle: '🧠 ANÁLISIS PROFUNDO',
    originTitle: 'Cómo empezó',
    effectTitle: 'Cómo te afecta',
    attractionTitle: 'Lo que atraes',
    projectionTitle: 'Cómo te ven',
    futureStoryTitle: '📅 TU PRÓXIMA HISTORIA',
    futureDateLabel: 'Fecha:',
    futurePersonLabel: 'Tipo de persona:',
    futureOutcomeLabel: 'Desenlace:',
    yourHiddenRedFlag: 'Tu Red Flag Oculta',
    uncomfortableTruthHead: '🔥 TU VERDAD INCÓMODA',
    futurePredictionHead: '🔮 TU PRÓXIMA RELACIÓN SERÁ...',
    exSecretHead: '💀 LO QUE TUS EX NO TE DIJERON',
    soulmateDescHead: '💍 TU ALMA GEMELA REAL',
    exThinkHead: '🧨 ALERTA DE CHISME',
    exThinkBody: 'Tu ex aún piensa en ti.',
    topRedFlags: '🚩 Top Red Flags',
    savageComments: '💀 Comentarios Savage',
    finalVerdict: '⚖️ Veredicto Final',
    percentileText: (n) => `Eres más tóxico/a que el ${n}% de los perfiles analizados.`,
    downloadStory: '📥 Descargar Story',
    scanAnother: '🔄 Escanear Otro',
    scanYourEx: '💀 Escanea A Tu Ex',
    scanYourExPrice: 'Mira sus red flags también — $3.99',
    or: 'o',
    loadingResults: 'Cargando resultados…',
    resultNotFound: 'Resultado no encontrado.',
    tryAgain: 'Intentar de Nuevo',

    // Shareable
    accordingTo: 'Según RedFlag AI…',
    shareTitle: '🚩 ANÁLISIS RED FLAG',
    shareGhosting: '👻 Ghosteo',
    shareStyle: '🧠 Estilo',
    shareHiddenLabel: '🚩 Red Flag Oculta',
    shareScanYours: 'Escanea el tuyo →',
  },

  en: {
    // Landing
    badge: 'AI-Powered Dating Analysis',
    titleLine1: 'Find Out Why',
    titleLine2: 'Your Relationships',
    titleLine3: 'Keep Failing.',
    subtitleLine1: 'Always getting ghosted? Attracting the same type over and over?',
    subtitleLine2: 'Discover what you\'re projecting without knowing it.',
    scanCta: '🔥 Reveal My Red Flag Now',
    scanExCta: '💀 Analyze My Ex',
    disclaimer: 'AI-powered dating analysis. For entertainment purposes.',
    liveCounter: 'profiles analyzed this week',
    recentScans: 'Recent scans',
    exampleCards: [
      { score: '92%', risk: 'Extreme', text: '"Emotionally unavailable but charismatic enough to make you ignore it."' },
      { score: '81%', risk: 'High', text: '"Texts back in 3 business days energy. Your read receipts are crying."' },
      { score: '67%', risk: 'Medium', text: '"Says \'I hate drama\' but creates it like it\'s a full-time job."' },
    ],
    // Discovery section
    discoverTitle: '🔎 What you\'ll discover',
    discoverItems: [
      { emoji: '💯', text: 'Your personal Toxic Score' },
      { emoji: '👻', text: 'Your ghosting probability' },
      { emoji: '🧠', text: 'Your attachment style (even if you hate admitting it)' },
      { emoji: '💘', text: 'The type of person you attract' },
      { emoji: '🚩', text: 'Your biggest hidden red flag' },
    ],

    // Scan
    uploadTitle: 'Let\'s see what you\'re projecting.',
    uploadTitleEx: '💀 Time to analyze your ex.',
    uploadSubtitle: 'AI will detect what others see but don\'t tell you.',
    uploadSubtitleEx: 'Upload their photo and discover what you always suspected.',
    dragDrop: 'Upload the photo you use to flirt 😏',
    dragDropEx: 'Drop their best selfie here',
    orBrowse: 'or click to browse',
    addBio: 'Add a bio',
    addBioEx: 'Their bio / dating profile text',
    optional: '(optional)',
    bioHelper: 'Adding your bio improves the accuracy of the analysis.',
    bioHelperEx: 'Adding their bio improves the accuracy of the analysis.',
    bioPlaceholder: "e.g. 'Just a simple guy who loves adventures and deep convos'",
    bioPlaceholderEx: "e.g. 'Loves hiking, dogs, and definitely not commitment'",
    analyze: '🔥 Discover The Truth',
    analyzeEx: '💀 Reveal What They\'re Hiding',
    quickPromise: '⚡ Your analysis will be ready in less than 30 seconds.',
    processing: 'Analyzing...',
    privacyNote: '🔒 We don\'t store your photo.',
    privacyNoteEx: '🔒 We don\'t store any photos.',
    back: '← Back',

    // Loading
    loadingTitle: 'Decoding your romantic pattern...',
    loadingTitleEx: '💀 Analyzing their psychological profile...',
    loadingMessages: [
      { text: "Scanning micro-expressions", emoji: "📸" },
      { text: "Detecting patterns of emotional validation", emoji: "🧠" },
      { text: "Analyzing anxious attachment signals", emoji: "💗" },
      { text: "Evaluating ghosting risk", emoji: "👻" },
      { text: "Identifying your dominant red flag", emoji: "🚩" },
      { text: "Generating final diagnosis", emoji: "⚖️" },
    ],
    loadingHighTension: 'Sensitive result detected...',

    // Result - Preview
    teaser: 'We already detected your biggest dating mistake.',
    freeInsightLabel: '🔥 Your Dominant Pattern:',
    freeInsightValue: '💔 Mild Anxious Attachment',
    freeInsightText: 'You fall in love fast but always hesitate to commit. You send mixed signals that confuse everyone.',
    freeInsightTip: '⚠️ Likely to send long texts at 3 a.m. and then disappear.',
    blurredRedFlagHint: 'Your biggest problem isn\'t what you say… it\'s what you tole████',
    ghostingProb: 'Ghosting Probability',
    attachmentStyle: 'Attachment Style',
    whatYouAttract: 'What You Attract',
    hiddenRedFlag: 'Your Biggest Hidden Red Flag',
    revealCta: '💥 TELL ME MY BIGGEST RED FLAG NOW — $3.99',
    checkoutHint: 'Full dating profile analysis • Ghosting probability • Attachment style • Savage roast',
    fomoText: 'Most people who unlock are shocked by their Hidden Red Flag.',
    urgencyNote: '⚠️ This analysis won\'t be saved after you leave.',
    redirecting: 'Redirecting…',

    // Quiz Questions
    quizQuestions: [
      {
        id: 1,
        question: 'When you like someone, you:',
        options: [
          'Get intense quickly',
          'Play hard to get',
          'Act indifferent',
          'Wait for them to do everything'
        ]
      },
      {
        id: 2,
        question: 'What you fear most in a relationship is:',
        options: [
          'Being abandoned',
          'Being controlled',
          'Being cheated on',
          'Them getting bored of me'
        ]
      },
      {
        id: 3,
        question: 'When you argue:',
        options: [
          'I explode',
          'I shut down',
          'I use the silent treatment',
          'I pretend nothing happened'
        ]
      },
      {
        id: 4,
        question: 'Deep down you feel that:',
        options: [
          'I am not enough',
          'I cannot trust anyone',
          'They will always fail me',
          'They only want me for interest'
        ]
      },
      {
        id: 5,
        question: 'What do people always say to you?',
        options: [
          '“You are too intense”',
          '“You are cold”',
          '“You are complicated”',
          '“You are unreachable”'
        ]
      }
    ],
    lastBreakupLabel: 'How did your last relationship end? (Optional)',
    lastBreakupPlaceholder: 'e.g. They said I was too intense...',

    // Result - Premium
    redFlagLevelLabel: 'RED FLAG LEVEL',
    redFlagRealTitle: '🚩 YOUR REAL RED FLAG',
    whatYouProjectTitle: '💀 WHAT YOU PROJECT',
    futureTeaserTitle: '🔮 YOUR FUTURE...',
    deepAnalysisTitle: '🧠 DEEP ANALYSIS',
    originTitle: 'How it started',
    effectTitle: 'How it affects you',
    attractionTitle: 'What you attract',
    projectionTitle: 'How others see you',
    futureStoryTitle: '📅 YOUR NEXT STORY',
    futureDateLabel: 'Date:',
    futurePersonLabel: 'Person Type:',
    futureOutcomeLabel: 'Outcome:',
    yourHiddenRedFlag: 'Your Hidden Red Flag',
    uncomfortableTruthHead: '🔥 YOUR UNCOMFORTABLE TRUTH',
    futurePredictionHead: '🔮 YOUR NEXT RELATIONSHIP WILL BE...',
    exSecretHead: '💀 WHAT YOUR EXES NEVER TOLD YOU',
    soulmateDescHead: '💍 YOUR REAL SOULMATE',
    exThinkHead: '🧨 GOSSIP ALERT',
    exThinkBody: 'Your ex still thinks about you.',
    topRedFlags: '🚩 Top Red Flags',
    savageComments: '💀 Savage Comments',
    finalVerdict: '⚖️ Final Verdict',
    percentileText: (n) => `You are more toxic than ${n}% of profiles analyzed.`,
    downloadStory: '📥 Download Story',
    scanAnother: '🔄 Scan Another',
    scanYourEx: '💀 Scan Your Ex',
    scanYourExPrice: 'See their red flags too — $3.99',
    or: 'or',
    loadingResults: 'Loading results…',
    resultNotFound: 'Result not found.',
    tryAgain: 'Try Again',

    // Shareable
    accordingTo: 'According to RedFlag AI…',
    shareTitle: '🚩 RED FLAG ANALYSIS',
    shareGhosting: '👻 Ghosting',
    shareStyle: '🧠 Style',
    shareHiddenLabel: '🚩 Hidden Red Flag',
    shareScanYours: 'Scan yours →',
  },
};

module.exports = { translations };
