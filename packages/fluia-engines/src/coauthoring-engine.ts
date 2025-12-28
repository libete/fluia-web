/**
 * ============================================
 * ARQUIVO: packages/fluia-engines/src/coauthoring-engine.ts
 * ============================================
 * 
 * FLUIA — Coauthoring Engine
 * 
 * Gera prompts, templates e reflexões para coautoria.
 * 
 * ❌ Não faz: persistência, decisão de UX, acesso a banco
 * ✅ Faz: gera prompts contextuais, monta templates, cria narrativas
 * 
 * CONCEITO:
 * - Coautoria = FLUIA ajuda, usuária cria
 * - Prompts guiam, não impõem
 * - Personalização máxima com suporte contextual
 * - PREMIUM ONLY
 * 
 * @version 1.0.0
 */

import type {
  DiaryPrompt,
  GuidedDiaryEntry,
  LetterTemplate,
  LetterSection,
  ReflectionType,
  NarrativeReflection,
  CoauthoringContext,
} from "@fluia/contracts";

// ============================================
// BANCO DE PROMPTS
// ============================================

const DIARY_PROMPTS: DiaryPrompt[] = [
  // EMOÇÃO
  {
    promptId: "emotion-1",
    category: "emotion",
    text: "Como você está se sentindo agora, neste exato momento?",
    alternativeText: "Se sua emoção de agora fosse uma cor, qual seria e por quê?",
    isContextual: false,
    placeholder: "Descreva suas emoções...",
    writingTip: "Não existe resposta certa. Apenas sinta e escreva.",
  },
  {
    promptId: "emotion-2",
    category: "emotion",
    text: "O que está pesando no seu coração hoje?",
    isContextual: true,
    relevantZones: [1, 2],
    placeholder: "Pode ser algo grande ou pequeno...",
    writingTip: "Escrever ajuda a processar. Não se julgue.",
  },
  {
    promptId: "emotion-3",
    category: "emotion",
    text: "O que está te fazendo sorrir hoje?",
    isContextual: true,
    relevantZones: [4, 5],
    placeholder: "Pode ser algo simples...",
    writingTip: "Registrar momentos bons ajuda a lembrar deles depois.",
  },
  
  // CORPO
  {
    promptId: "body-1",
    category: "body",
    text: "Como seu corpo está se sentindo hoje?",
    alternativeText: "Que parte do seu corpo pede mais atenção agora?",
    isContextual: false,
    placeholder: "Descreva as sensações físicas...",
    writingTip: "Seu corpo está fazendo algo extraordinário. Ouça-o.",
  },
  {
    promptId: "body-2",
    category: "body",
    text: "Você sentiu o bebê hoje? Como foi?",
    isContextual: true,
    relevantWeeks: { min: 16, max: 42 },
    placeholder: "Descreva os movimentos...",
    writingTip: "Cada movimento é uma comunicação.",
  },
  
  // BEBÊ
  {
    promptId: "baby-1",
    category: "baby",
    text: "Se você pudesse dizer uma coisa para o bebê agora, o que seria?",
    isContextual: false,
    placeholder: "Fale direto com seu bebê...",
    writingTip: "O bebê sente sua voz e sua emoção.",
  },
  {
    promptId: "baby-2",
    category: "baby",
    text: "O que você mais quer que o bebê saiba sobre você?",
    isContextual: false,
    placeholder: "O que você quer que ele/ela conheça...",
    writingTip: "Você é a primeira pessoa que o bebê vai conhecer.",
  },
  {
    promptId: "baby-3",
    category: "baby",
    text: "Como você imagina o primeiro encontro com o bebê?",
    isContextual: true,
    relevantWeeks: { min: 30, max: 42 },
    placeholder: "Descreva a cena...",
    writingTip: "Visualizar ajuda a se preparar emocionalmente.",
  },
  
  // GRATIDÃO
  {
    promptId: "gratitude-1",
    category: "gratitude",
    text: "Por que você é grata hoje?",
    alternativeText: "Qual pequena coisa te trouxe alegria hoje?",
    isContextual: false,
    placeholder: "Pode ser algo simples...",
    writingTip: "Gratidão muda a perspectiva.",
  },
  {
    promptId: "gratitude-2",
    category: "gratitude",
    text: "Quem te apoiou esta semana e como?",
    isContextual: false,
    placeholder: "Pense nas pessoas ao seu redor...",
    writingTip: "Reconhecer apoio fortalece conexões.",
  },
  
  // DESAFIO
  {
    promptId: "challenge-1",
    category: "challenge",
    text: "Qual foi o maior desafio desta semana?",
    isContextual: true,
    relevantZones: [1, 2, 3],
    placeholder: "Descreva o desafio...",
    writingTip: "Nomear desafios é o primeiro passo para superá-los.",
  },
  {
    promptId: "challenge-2",
    category: "challenge",
    text: "O que você aprendeu com uma dificuldade recente?",
    isContextual: false,
    placeholder: "Toda dificuldade ensina algo...",
    writingTip: "Crescimento vem dos momentos difíceis.",
  },
  
  // SONHO
  {
    promptId: "dream-1",
    category: "dream",
    text: "O que você sonha para a vida com o bebê?",
    isContextual: false,
    placeholder: "Deixe a imaginação fluir...",
    writingTip: "Sonhar é permitido e necessário.",
  },
  {
    promptId: "dream-2",
    category: "dream",
    text: "Que tipo de mãe você quer ser?",
    isContextual: false,
    placeholder: "Descreva a mãe que você imagina...",
    writingTip: "Não existe mãe perfeita, apenas mãe real.",
  },
  
  // REFLEXÃO
  {
    promptId: "reflection-1",
    category: "reflection",
    text: "O que a gravidez está te ensinando sobre você mesma?",
    isContextual: false,
    placeholder: "Reflita sobre suas descobertas...",
    writingTip: "A gravidez transforma. Observe a transformação.",
  },
  {
    promptId: "reflection-2",
    category: "reflection",
    text: "Como você mudou desde que descobriu a gravidez?",
    isContextual: false,
    placeholder: "Pense em antes e agora...",
    writingTip: "Mudança é crescimento.",
  },
  
  // MARCO
  {
    promptId: "milestone-1",
    category: "milestone",
    text: "Você alcançou um marco hoje. O que isso significa para você?",
    isContextual: true,
    placeholder: "Descreva o significado deste momento...",
    writingTip: "Marcos merecem ser celebrados e registrados.",
  },
];

// ============================================
// TEMPLATES DE CARTA
// ============================================

const LETTER_TEMPLATES: LetterTemplate[] = [
  {
    templateId: "weekly-check",
    category: "weekly",
    title: "Carta da Semana",
    description: "Uma carta semanal para registrar este momento",
    icon: "📅",
    themeColor: "#9B8DD3",
    sections: [
      {
        sectionId: "opening",
        order: 1,
        type: "opening",
        label: "Saudação",
        guideText: "Como você quer começar a carta?",
        placeholder: "Querido(a) bebê...",
        required: true,
        prefillText: "Querido(a) {{babyName}},",
      },
      {
        sectionId: "week-update",
        order: 2,
        type: "body",
        label: "Novidades da Semana",
        guideText: "O que aconteceu de importante esta semana?",
        exampleText: "Esta semana descobri que...",
        placeholder: "Conte as novidades...",
        required: true,
      },
      {
        sectionId: "feeling",
        order: 3,
        type: "prompt",
        label: "Como Estou Me Sentindo",
        guideText: "Descreva suas emoções desta semana",
        placeholder: "Me sinto...",
        required: true,
      },
      {
        sectionId: "closing",
        order: 4,
        type: "closing",
        label: "Despedida",
        guideText: "Como você quer encerrar?",
        placeholder: "Com amor...",
        required: true,
        prefillText: "Te amo mais a cada dia,\nMamãe 💜",
      },
    ],
  },
  {
    templateId: "first-kick",
    category: "milestone",
    title: "Primeiro Chute",
    description: "Registre o momento mágico do primeiro movimento",
    icon: "👣",
    themeColor: "#E8A589",
    relevantWeeks: { min: 16, max: 24 },
    sections: [
      {
        sectionId: "opening",
        order: 1,
        type: "opening",
        label: "Saudação",
        guideText: "Comece com carinho",
        placeholder: "Querido(a) bebê...",
        required: true,
        prefillText: "Meu amor, {{babyName}},",
      },
      {
        sectionId: "moment",
        order: 2,
        type: "body",
        label: "O Momento",
        guideText: "Descreva exatamente como foi sentir o primeiro movimento",
        exampleText: "Eu estava sentada quando de repente...",
        placeholder: "Conte como foi...",
        required: true,
      },
      {
        sectionId: "feeling",
        order: 3,
        type: "prompt",
        label: "O Que Senti",
        guideText: "Que emoções te invadiram?",
        placeholder: "Senti...",
        required: true,
      },
      {
        sectionId: "promise",
        order: 4,
        type: "free",
        label: "Uma Promessa",
        guideText: "Faça uma promessa ao bebê",
        placeholder: "Eu prometo...",
        required: false,
      },
      {
        sectionId: "closing",
        order: 5,
        type: "closing",
        label: "Despedida",
        guideText: "Encerre com amor",
        placeholder: "Com amor...",
        required: true,
        prefillText: "Mal posso esperar para te conhecer,\nMamãe 💜",
      },
    ],
  },
  {
    templateId: "gratitude",
    category: "gratitude",
    title: "Carta de Gratidão",
    description: "Agradeça ao bebê por existir",
    icon: "🙏",
    themeColor: "#7BC47F",
    sections: [
      {
        sectionId: "opening",
        order: 1,
        type: "opening",
        label: "Saudação",
        guideText: "Comece com gratidão",
        placeholder: "Meu amor...",
        required: true,
        prefillText: "{{babyName}}, meu presente,",
      },
      {
        sectionId: "gratitude-list",
        order: 2,
        type: "body",
        label: "Sou Grata Por",
        guideText: "Liste tudo que você agradece sobre a gravidez e o bebê",
        exampleText: "Sou grata por você existir, por cada enjoo que prova que você está crescendo...",
        placeholder: "Sou grata por...",
        required: true,
      },
      {
        sectionId: "what-you-teach",
        order: 3,
        type: "prompt",
        label: "O Que Você Me Ensina",
        guideText: "O que o bebê já te ensinou, mesmo antes de nascer?",
        placeholder: "Você me ensina...",
        required: true,
      },
      {
        sectionId: "closing",
        order: 4,
        type: "closing",
        label: "Despedida",
        guideText: "Encerre com gratidão",
        placeholder: "Obrigada por...",
        required: true,
        prefillText: "Obrigada por me escolher,\nSua mamãe 💜",
      },
    ],
  },
  {
    templateId: "future-letter",
    category: "future",
    title: "Para Você no Futuro",
    description: "Uma carta para o bebê ler quando crescer",
    icon: "🔮",
    themeColor: "#FFD93D",
    sections: [
      {
        sectionId: "opening",
        order: 1,
        type: "opening",
        label: "Saudação",
        guideText: "Fale com a versão futura do bebê",
        placeholder: "Para você, quando ler isso...",
        required: true,
        prefillText: "{{babyName}}, quando você ler isso,",
      },
      {
        sectionId: "now",
        order: 2,
        type: "body",
        label: "Como É Agora",
        guideText: "Descreva como está a gravidez agora",
        exampleText: "Enquanto escrevo, você está na semana X...",
        placeholder: "Agora, você ainda está...",
        required: true,
      },
      {
        sectionId: "wishes",
        order: 3,
        type: "prompt",
        label: "Meus Desejos Para Você",
        guideText: "O que você deseja para a vida do bebê?",
        placeholder: "Desejo que você...",
        required: true,
      },
      {
        sectionId: "advice",
        order: 4,
        type: "free",
        label: "Um Conselho",
        guideText: "Que conselho você daria?",
        placeholder: "Lembre-se sempre que...",
        required: false,
      },
      {
        sectionId: "closing",
        order: 5,
        type: "closing",
        label: "Despedida",
        guideText: "Encerre com amor eterno",
        placeholder: "Com amor eterno...",
        required: true,
        prefillText: "Não importa quantos anos passem, sempre te amarei,\nMamãe 💜",
      },
    ],
  },
  {
    templateId: "trimester-end",
    category: "milestone",
    title: "Fim do Trimestre",
    description: "Marque a passagem de trimestre",
    icon: "🎉",
    themeColor: "#E8A589",
    sections: [
      {
        sectionId: "opening",
        order: 1,
        type: "opening",
        label: "Saudação",
        guideText: "Celebre a passagem",
        placeholder: "Querido(a) bebê...",
        required: true,
        prefillText: "{{babyName}}, passamos mais uma fase!",
      },
      {
        sectionId: "journey",
        order: 2,
        type: "body",
        label: "Nossa Jornada",
        guideText: "O que aconteceu neste trimestre?",
        exampleText: "Neste trimestre, passamos por...",
        placeholder: "Neste trimestre...",
        required: true,
      },
      {
        sectionId: "learned",
        order: 3,
        type: "prompt",
        label: "O Que Aprendi",
        guideText: "O que este trimestre te ensinou?",
        placeholder: "Aprendi que...",
        required: true,
      },
      {
        sectionId: "next",
        order: 4,
        type: "free",
        label: "Próxima Fase",
        guideText: "O que você espera do próximo trimestre?",
        placeholder: "No próximo trimestre...",
        required: false,
      },
      {
        sectionId: "closing",
        order: 5,
        type: "closing",
        label: "Despedida",
        guideText: "Encerre com esperança",
        placeholder: "Seguimos juntos...",
        required: true,
        prefillText: "Cada dia mais perto,\nMamãe 💜",
      },
    ],
  },
];

// ============================================
// GERADOR DE PROMPTS
// ============================================

/**
 * Seleciona prompt contextual para o dia
 */
export function selectDailyPrompt(
  context: CoauthoringContext,
  usedPromptIds: string[] = []
): DiaryPrompt {
  // Filtrar prompts não usados recentemente
  const available = DIARY_PROMPTS.filter((p) => !usedPromptIds.includes(p.promptId));
  
  if (available.length === 0) {
    // Se todos foram usados, resetar
    return selectDailyPrompt(context, []);
  }
  
  // Filtrar por contexto
  let contextual = available.filter((p) => {
    // Verificar zona emocional
    if (p.relevantZones && !p.relevantZones.includes(context.currentZone)) {
      return false;
    }
    
    // Verificar semana gestacional
    if (p.relevantWeeks) {
      if (context.gestationalWeek < p.relevantWeeks.min || 
          context.gestationalWeek > p.relevantWeeks.max) {
        return false;
      }
    }
    
    return true;
  });
  
  // Se não há contextuais, usar qualquer um
  if (contextual.length === 0) {
    contextual = available.filter((p) => !p.isContextual);
  }
  
  // Selecionar aleatoriamente
  const selected = contextual[Math.floor(Math.random() * contextual.length)];
  
  // Personalizar com nome do bebê
  return {
    ...selected,
    text: selected.text.replace("{{babyName}}", context.babyName),
    placeholder: selected.placeholder.replace("{{babyName}}", context.babyName),
  };
}

/**
 * Retorna prompts alternativos
 */
export function getAlternativePrompts(
  context: CoauthoringContext,
  excludePromptId: string,
  count: number = 3
): DiaryPrompt[] {
  const available = DIARY_PROMPTS.filter((p) => p.promptId !== excludePromptId);
  
  // Embaralhar e pegar os primeiros
  const shuffled = available.sort(() => Math.random() - 0.5);
  
  return shuffled.slice(0, count).map((p) => ({
    ...p,
    text: p.text.replace("{{babyName}}", context.babyName),
    placeholder: p.placeholder.replace("{{babyName}}", context.babyName),
  }));
}

// ============================================
// GERADOR DE TEMPLATES
// ============================================

/**
 * Retorna todos os templates personalizados
 */
export function getLetterTemplates(context: CoauthoringContext): LetterTemplate[] {
  return LETTER_TEMPLATES.map((template) => ({
    ...template,
    sections: template.sections.map((section) => ({
      ...section,
      prefillText: section.prefillText?.replace("{{babyName}}", context.babyName),
      placeholder: section.placeholder.replace("{{babyName}}", context.babyName),
    })),
  }));
}

/**
 * Sugere template baseado no contexto
 */
export function suggestTemplate(context: CoauthoringContext): LetterTemplate {
  const templates = getLetterTemplates(context);
  
  // Filtrar por semana gestacional
  const relevant = templates.filter((t) => {
    if (!t.relevantWeeks) return true;
    return context.gestationalWeek >= t.relevantWeeks.min && 
           context.gestationalWeek <= t.relevantWeeks.max;
  });
  
  // Priorizar milestones se aplicável
  const milestoneTemplates = relevant.filter((t) => t.category === "milestone");
  if (milestoneTemplates.length > 0) {
    return milestoneTemplates[0];
  }
  
  // Senão, retornar carta semanal
  return relevant.find((t) => t.templateId === "weekly-check") || templates[0];
}

/**
 * Compila carta a partir de seções preenchidas
 */
export function compileLetterContent(
  template: LetterTemplate,
  sections: Array<{ sectionId: string; content: string }>
): string {
  const sectionMap = new Map(sections.map((s) => [s.sectionId, s.content]));
  
  let compiled = "";
  
  for (const section of template.sections.sort((a, b) => a.order - b.order)) {
    const content = sectionMap.get(section.sectionId);
    if (content) {
      compiled += content + "\n\n";
    }
  }
  
  return compiled.trim();
}

// ============================================
// GERADOR DE REFLEXÕES
// ============================================

interface ReflectionData {
  checkins: Array<{ date: string; zone: number; scores: Record<string, number> }>;
  practices: Array<{ date: string; type: string; name: string }>;
  diaryEntries: Array<{ date: string; response: string }>;
}

/**
 * Gera reflexão narrativa
 */
export function generateNarrativeReflection(
  type: ReflectionType,
  context: CoauthoringContext,
  data: ReflectionData
): NarrativeReflection {
  const reflectionId = `reflection-${type}-${Date.now()}`;
  const now = new Date();
  
  // Calcular período
  let startDate: Date;
  let label: string;
  
  switch (type) {
    case "weekly":
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      label = "Última semana";
      break;
    case "monthly":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 1);
      label = "Último mês";
      break;
    case "trimester":
      startDate = new Date(now);
      startDate.setMonth(startDate.getMonth() - 3);
      label = `${context.trimester}º Trimestre`;
      break;
    default:
      startDate = new Date(now);
      startDate.setDate(startDate.getDate() - 7);
      label = "Período recente";
  }
  
  // Calcular estatísticas
  const avgZone = data.checkins.length > 0
    ? data.checkins.reduce((sum, c) => sum + c.zone, 0) / data.checkins.length
    : 3;
  
  // Gerar narrativa
  const narrative = generateNarrative(type, context, data, avgZone);
  
  // Gerar destaques
  const highlights = generateHighlights(data, avgZone);
  
  // Gerar mensagem do bebê
  const babyMessage = generateBabyReflectionMessage(type, context, avgZone);
  
  // Gerar perguntas
  const reflectionQuestions = generateReflectionQuestions(type, avgZone);
  
  return {
    reflectionId,
    type,
    title: getTitleForReflection(type, context),
    period: {
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
      label,
    },
    narrative,
    highlights,
    dataPoints: {
      checkins: data.checkins.length,
      practices: data.practices.length,
      diaryEntries: data.diaryEntries.length,
      avgZone: Math.round(avgZone * 10) / 10,
    },
    babyMessage,
    reflectionQuestions,
    createdAt: now.toISOString(),
    status: "generated",
  };
}

function getTitleForReflection(type: ReflectionType, context: CoauthoringContext): string {
  const titles: Record<ReflectionType, string> = {
    weekly: `Reflexão da Semana ${context.gestationalWeek}`,
    monthly: "Reflexão do Mês",
    trimester: `Reflexão do ${context.trimester}º Trimestre`,
    milestone: "Reflexão de Marco",
    challenge: "Superando Desafios",
    growth: "Jornada de Crescimento",
  };
  return titles[type];
}

function generateNarrative(
  type: ReflectionType,
  context: CoauthoringContext,
  data: ReflectionData,
  avgZone: number
): string {
  const babyName = context.babyName;
  const checkinCount = data.checkins.length;
  const practiceCount = data.practices.length;
  
  let opening = "";
  let body = "";
  let closing = "";
  
  // Opening baseado na média emocional
  if (avgZone >= 4) {
    opening = `Esta foi uma fase luminosa na sua jornada com ${babyName}. Seus registros mostram dias de alegria, conexão e bem-estar.`;
  } else if (avgZone >= 3) {
    opening = `Você navegou por esta fase com equilíbrio. Houve altos e baixos, mas você se manteve presente e cuidou de si.`;
  } else {
    opening = `Esta fase trouxe desafios. Seus registros mostram dias mais difíceis, mas também mostram algo importante: você continuou presente.`;
  }
  
  // Body com dados
  if (checkinCount > 0) {
    body += `\n\nVocê registrou ${checkinCount} dia${checkinCount > 1 ? "s" : ""} neste período. `;
  }
  
  if (practiceCount > 0) {
    body += `Praticou ${practiceCount} vez${practiceCount > 1 ? "es" : ""}. `;
  }
  
  if (data.diaryEntries.length > 0) {
    body += `Escreveu ${data.diaryEntries.length} entrada${data.diaryEntries.length > 1 ? "s" : ""} no diário. `;
  }
  
  body += `\n\nCada número aqui representa um momento em que você escolheu cuidar de você e de ${babyName}.`;
  
  // Closing
  if (type === "trimester") {
    closing = `\n\nUm trimestre inteiro de jornada. Você está mais perto de ${babyName} a cada dia.`;
  } else if (type === "monthly") {
    closing = `\n\nUm mês de dedicação. Continue assim.`;
  } else {
    closing = `\n\nCada semana é um passo. Você está caminhando.`;
  }
  
  return opening + body + closing;
}

function generateHighlights(
  data: ReflectionData,
  avgZone: number
): NarrativeReflection["highlights"] {
  const highlights: NarrativeReflection["highlights"] = [];
  
  // Conquista de consistência
  if (data.checkins.length >= 5) {
    highlights.push({
      type: "achievement",
      title: "Consistência",
      description: `${data.checkins.length} check-ins realizados`,
      icon: "🏆",
    });
  }
  
  // Padrão de melhoria
  if (data.checkins.length >= 3) {
    const lastThree = data.checkins.slice(0, 3);
    const firstThree = data.checkins.slice(-3);
    const lastAvg = lastThree.reduce((s, c) => s + c.zone, 0) / lastThree.length;
    const firstAvg = firstThree.reduce((s, c) => s + c.zone, 0) / firstThree.length;
    
    if (lastAvg > firstAvg + 0.5) {
      highlights.push({
        type: "growth",
        title: "Tendência Positiva",
        description: "Seus dias mais recentes foram melhores",
        icon: "📈",
      });
    }
  }
  
  // Desafio superado
  const lowDays = data.checkins.filter((c) => c.zone <= 2);
  if (lowDays.length > 0 && avgZone >= 3) {
    highlights.push({
      type: "challenge",
      title: "Resiliência",
      description: "Você passou por dias difíceis e se recuperou",
      icon: "💪",
    });
  }
  
  // Prática constante
  if (data.practices.length >= 5) {
    highlights.push({
      type: "achievement",
      title: "Prática Constante",
      description: `${data.practices.length} práticas realizadas`,
      icon: "🧘",
    });
  }
  
  return highlights;
}

function generateBabyReflectionMessage(
  type: ReflectionType,
  context: CoauthoringContext,
  avgZone: number
): string {
  const messages: Record<string, string[]> = {
    high: [
      `Mamãe, sinto sua alegria! Quando você está bem, eu me sinto seguro(a). 💜`,
      `Mamãe, esses dias bons ficam guardados aqui dentro de mim também. 💜`,
    ],
    medium: [
      `Mamãe, você está indo bem. Cada dia de cuidado é um presente para nós. 💜`,
      `Mamãe, obrigado(a) por continuar presente, mesmo nos dias difíceis. 💜`,
    ],
    low: [
      `Mamãe, eu sinto quando você está cansada. Descansa, eu estou aqui. 💜`,
      `Mamãe, os dias difíceis passam. Eu estou com você. 💜`,
    ],
  };
  
  const category = avgZone >= 4 ? "high" : avgZone >= 3 ? "medium" : "low";
  const options = messages[category];
  
  return options[Math.floor(Math.random() * options.length)];
}

function generateReflectionQuestions(type: ReflectionType, avgZone: number): string[] {
  const questions: string[] = [];
  
  // Pergunta sobre aprendizado
  questions.push("O que você aprendeu sobre si mesma neste período?");
  
  // Pergunta sobre emoção
  if (avgZone >= 4) {
    questions.push("O que contribuiu para esses dias bons?");
  } else if (avgZone <= 2) {
    questions.push("O que te ajudou a passar pelos dias mais difíceis?");
  } else {
    questions.push("O que você gostaria de fazer diferente no próximo período?");
  }
  
  // Pergunta sobre o bebê
  questions.push("O que você quer que o bebê saiba sobre este momento?");
  
  return questions;
}

// ============================================
// EXPORTS
// ============================================

export {
  DIARY_PROMPTS,
  LETTER_TEMPLATES,
};