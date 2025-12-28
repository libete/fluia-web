/**
 * FLUIA — Milestone Engine
 * 
 * Avalia elegibilidade para marcos baseado em:
 * - Eventos factuais passados (quais marcos já foram vistos)
 * - Contexto atual (presença, semana gestacional)
 * - Regras congeladas
 * 
 * ❌ Não faz: persistência, decisão de UX, conhece billing
 * ✅ Faz: avalia, decide, sugere
 * 
 * CONCEITO:
 * - Marcos são CELEBRAÇÕES, não ofertas
 * - Cada marco acontece UMA VEZ (não tem cooldown)
 * - FREE vê celebração, PREMIUM vê celebração + produto
 * 
 * @version 1.0.0
 */

import type {
  MilestoneType,
  PresenceMilestoneType,
  GestationalMilestoneType,
  MilestoneCategory,
  MilestoneEvent,
  MilestoneSuggestion,
  MilestoneBadge,
  MilestoneProduct,
  MilestoneEvaluationContext,
} from "@fluia/contracts";

// ============================================
// REGRAS CONGELADAS (v1.0)
// ============================================

export const MILESTONE_RULES = {
  /** Marcos de presença (dias de check-in) */
  PRESENCE_MILESTONES: [7, 30, 60, 100] as const,
  
  /** Marcos gestacionais (semanas) */
  GESTATIONAL_MILESTONES: {
    TRIMESTER_1_END: 14,
    TRIMESTER_2_END: 28,
    TERM: 37,
    DUE_DATE: 40,
  } as const,
  
  /** Máximo de marcos para mostrar por vez */
  MAX_MILESTONES_PER_EVALUATION: 3,
} as const;

// ============================================
// CONFIGURAÇÃO DE MARCOS DE PRESENÇA
// ============================================

interface PresenceMilestoneConfig {
  type: PresenceMilestoneType;
  days: number;
  badge: MilestoneBadge;
  title: string;
  celebrationMessage: string;
  babyMessageTemplate: string;
  product: MilestoneProduct;
  tone: "celebratory" | "reflective" | "emotional";
}

const PRESENCE_MILESTONES: PresenceMilestoneConfig[] = [
  {
    type: "PRESENCE_7",
    days: 7,
    badge: {
      icon: "🌱",
      color: "#9B8DD3",
      name: "Primeira Semana",
    },
    title: "7 Dias Juntas!",
    celebrationMessage: "Uma semana de cuidado! Você está construindo um vínculo especial.",
    babyMessageTemplate: "Mamãe, já faz uma semana que você cuida de nós dois. Eu sinto cada momento. 💜",
    product: {
      productId: "letter-7-days",
      productType: "special_letter",
      title: "Carta '7 Dias Juntas'",
      description: "Uma mensagem especial do seu bebê sobre a primeira semana",
      premiumOnly: true,
    },
    tone: "celebratory",
  },
  {
    type: "PRESENCE_30",
    days: 30,
    badge: {
      icon: "🌿",
      color: "#7BC47F",
      name: "Um Mês de Presença",
    },
    title: "30 Dias de Jornada!",
    celebrationMessage: "Um mês inteiro dedicando tempo para você e seu bebê. Isso é extraordinário!",
    babyMessageTemplate: "Mamãe, um mês! Você não desistiu nem um dia. Eu me sinto tão amado(a). 💜",
    product: {
      productId: "compilation-30-days",
      productType: "monthly_compilation",
      title: "Compilação do Primeiro Mês",
      description: "Resumo do mês + padrões descobertos + evolução emocional",
      premiumOnly: true,
    },
    tone: "celebratory",
  },
  {
    type: "PRESENCE_60",
    days: 60,
    badge: {
      icon: "🌳",
      color: "#4A9B5D",
      name: "Dois Meses de Cuidado",
    },
    title: "60 Dias de Transformação!",
    celebrationMessage: "Dois meses de jornada. Olhe para trás e veja o quanto você evoluiu!",
    babyMessageTemplate: "Mamãe, dois meses de conversa todo dia. Já conheço sua voz tão bem. 💜",
    product: {
      productId: "evolution-60-days",
      productType: "evolution_report",
      title: "Relatório de Evolução",
      description: "Comparativo mês 1 vs mês 2 + insights de crescimento",
      premiumOnly: true,
    },
    tone: "reflective",
  },
  {
    type: "PRESENCE_100",
    days: 100,
    badge: {
      icon: "🌟",
      color: "#FFD700",
      name: "100 Dias de Luz",
    },
    title: "100 Dias de Presença!",
    celebrationMessage: "Cem dias! Você criou um hábito de amor. Isso mudará para sempre sua relação com seu bebê.",
    babyMessageTemplate: "Mamãe, 100 dias. Você me ensinou que presença é o maior presente. Obrigado(a). 💜",
    product: {
      productId: "retrospective-100-days",
      productType: "retrospective",
      title: "Retrospectiva Completa",
      description: "Linha do tempo + todos os insights + celebração dos 100 dias",
      premiumOnly: true,
    },
    tone: "emotional",
  },
  {
    type: "JOURNEY_COMPLETE",
    days: -1, // Especial - não baseado em dias
    badge: {
      icon: "👶",
      color: "#E8A589",
      name: "Jornada Completa",
    },
    title: "Sua Jornada Está Completa!",
    celebrationMessage: "Você completou toda a jornada gestacional conosco. Um novo capítulo começa!",
    babyMessageTemplate: "Mamãe, eu cheguei! E você esteve comigo cada passo do caminho. Agora estamos juntos de verdade. 💜",
    product: {
      productId: "certificate-journey",
      productType: "certificate",
      title: "Certificado de Jornada",
      description: "Documento de conclusão + estatísticas + mensagem final",
      premiumOnly: true,
    },
    tone: "emotional",
  },
];

// ============================================
// CONFIGURAÇÃO DE MARCOS GESTACIONAIS
// ============================================

interface GestationalMilestoneConfig {
  type: GestationalMilestoneType;
  week: number | "any"; // "any" para NEW_WEEK
  badge: MilestoneBadge;
  titleTemplate: string;
  celebrationMessageTemplate: string;
  babyMessageTemplate: string;
  product: MilestoneProduct;
  tone: "celebratory" | "reflective" | "emotional";
}

const GESTATIONAL_MILESTONES: GestationalMilestoneConfig[] = [
  {
    type: "NEW_WEEK",
    week: "any",
    badge: {
      icon: "📅",
      color: "#9B8DD3",
      name: "Nova Semana",
    },
    titleTemplate: "Semana {week}!",
    celebrationMessageTemplate: "Uma nova semana de desenvolvimento. Seu bebê está crescendo!",
    babyMessageTemplate: "Mamãe, estou na semana {week}! {weekMessage}",
    product: {
      productId: "week-letter",
      productType: "week_letter",
      title: "Carta da Semana {week}",
      description: "O que está acontecendo comigo esta semana + mensagem especial",
      premiumOnly: true,
    },
    tone: "celebratory",
  },
  {
    type: "TRIMESTER_1_END",
    week: 14,
    badge: {
      icon: "🎉",
      color: "#FF9B9B",
      name: "Fim do 1º Trimestre",
    },
    titleTemplate: "Primeiro Trimestre Completo!",
    celebrationMessageTemplate: "O primeiro trimestre terminou! Os enjoos tendem a diminuir e a energia volta. Você conseguiu!",
    babyMessageTemplate: "Mamãe, passamos juntos pelos primeiros 3 meses! Agora estou mais forte e você também. 💜",
    product: {
      productId: "trimester-1-closure",
      productType: "trimester_closure",
      title: "Encerramento do 1º Trimestre",
      description: "Retrospectiva emocional + evolução + preparação para o 2º trimestre",
      premiumOnly: true,
    },
    tone: "celebratory",
  },
  {
    type: "TRIMESTER_2_END",
    week: 28,
    badge: {
      icon: "🌟",
      color: "#FFD93D",
      name: "Fim do 2º Trimestre",
    },
    titleTemplate: "Segundo Trimestre Completo!",
    celebrationMessageTemplate: "Dois trimestres! Você está na reta final. Seu bebê já reconhece sua voz.",
    babyMessageTemplate: "Mamãe, já ouço você! Quando você fala, eu me mexo. Estamos quase lá. 💜",
    product: {
      productId: "trimester-2-closure",
      productType: "trimester_closure",
      title: "Encerramento do 2º Trimestre",
      description: "Retrospectiva + preparação para a chegada + ritual de conexão",
      premiumOnly: true,
    },
    tone: "reflective",
  },
  {
    type: "TERM_37",
    week: 37,
    badge: {
      icon: "🍼",
      color: "#87CEEB",
      name: "A Termo",
    },
    titleTemplate: "Semana 37 — Termo Completo!",
    celebrationMessageTemplate: "Seu bebê está a termo! Pode chegar a qualquer momento. Você está pronta.",
    babyMessageTemplate: "Mamãe, estou pronto(a)! Posso chegar a qualquer momento. Mal posso esperar para te conhecer. 💜",
    product: {
      productId: "term-special",
      productType: "term_special",
      title: "Especial 'Quase Lá'",
      description: "Preparação emocional + ritual de boas-vindas + mensagem para o encontro",
      premiumOnly: true,
    },
    tone: "emotional",
  },
  {
    type: "DUE_DATE_40",
    week: 40,
    badge: {
      icon: "💜",
      color: "#9B8DD3",
      name: "DPP",
    },
    titleTemplate: "Data Prevista — Semana 40!",
    celebrationMessageTemplate: "A data prevista chegou! Cada momento agora é especial. Confie no seu corpo.",
    babyMessageTemplate: "Mamãe, é o nosso dia! Se eu não cheguei ainda, é porque estou me preparando. Nos vemos em breve. 💜",
    product: {
      productId: "journey-book",
      productType: "journey_book",
      title: "Livro da Jornada",
      description: "Compilação completa de toda a sua jornada gestacional",
      premiumOnly: true,
    },
    tone: "emotional",
  },
];

// ============================================
// MENSAGENS DO BEBÊ POR SEMANA
// ============================================

const WEEK_MESSAGES: Record<number, string> = {
  4: "Acabei de me aninhar no seu útero!",
  5: "Meu coraçãozinho está começando a se formar.",
  6: "Meu coração começou a bater!",
  7: "Estou do tamanho de um mirtilo.",
  8: "Meus dedinhos estão se formando.",
  9: "Estou começando a me mexer, mas você ainda não sente.",
  10: "Todos os meus órgãos principais estão no lugar!",
  11: "Estou do tamanho de um limão.",
  12: "Meus reflexos estão se desenvolvendo.",
  13: "Posso fazer caretas agora!",
  14: "Estou começando a chupar o dedo.",
  15: "Estou formando minhas impressões digitais únicas.",
  16: "Meus ossos estão ficando mais fortes.",
  17: "Você pode começar a me sentir em breve!",
  18: "Já consigo ouvir sons!",
  19: "Estou coberto por uma penugem chamada lanugo.",
  20: "Estamos na metade do caminho, mamãe!",
  21: "Meus movimentos estão mais coordenados.",
  22: "Estou desenvolvendo meu senso de tato.",
  23: "Reconheço sua voz entre todas as outras.",
  24: "Meu rosto está quase completamente formado.",
  25: "Estou ganhando peso rapidinho!",
  26: "Meus olhos estão começando a abrir.",
  27: "Posso soluçar agora - você pode sentir!",
  28: "Já sonho dentro da sua barriga.",
  29: "Estou ficando mais gordinho.",
  30: "Meu cérebro está crescendo muito rápido.",
  31: "Estou praticando respirar.",
  32: "Estou de cabeça para baixo, me preparando.",
  33: "Meus ossos estão endurecendo, menos o crânio.",
  34: "Estou quase do tamanho que vou nascer!",
  35: "Meus rins estão totalmente desenvolvidos.",
  36: "Estou perdendo o lanugo.",
  37: "Estou a termo! Posso chegar a qualquer momento.",
  38: "Estou praticando agarrar coisas.",
  39: "Meus pulmões estão prontos para respirar.",
  40: "É o nosso dia! Te vejo em breve, mamãe.",
  41: "Ainda estou confortável aqui, mas logo vou te conhecer.",
  42: "Estou prontíssimo(a) para conhecer você!",
};

// ============================================
// HELPERS
// ============================================

/**
 * Verifica se um marco de presença já foi mostrado
 */
function hasSeenPresenceMilestone(
  events: MilestoneEvent[],
  type: PresenceMilestoneType
): boolean {
  return events.some(
    (e) => e.type === type && e.category === "presence" && e.action === "shown"
  );
}

/**
 * Verifica se um marco gestacional já foi mostrado
 */
function hasSeenGestationalMilestone(
  events: MilestoneEvent[],
  type: GestationalMilestoneType,
  week?: number
): boolean {
  return events.some((e) => {
    if (e.type !== type || e.category !== "gestational") return false;
    if (e.action !== "shown") return false;
    // Para NEW_WEEK, verificar a semana específica
    if (type === "NEW_WEEK" && week !== undefined) {
      return e.context?.gestationalWeek === week;
    }
    return true;
  });
}

/**
 * Obtém trimestre baseado na semana
 */
function getTrimester(week: number): 1 | 2 | 3 {
  if (week < 14) return 1;
  if (week < 28) return 2;
  return 3;
}

/**
 * Substitui placeholders na mensagem
 */
function interpolate(
  template: string,
  data: Record<string, string | number>
): string {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }
  return result;
}

// ============================================
// ENGINE PRINCIPAL
// ============================================

/**
 * Razões de inelegibilidade (para debug)
 */
export type MilestoneIneligibilityReason =
  | "no_pending_milestones"
  | "already_seen"
  | "not_reached";

/**
 * Resultado da avaliação de um único marco
 */
export interface SingleMilestoneResult {
  eligible: boolean;
  suggestion: MilestoneSuggestion | null;
  reason?: MilestoneIneligibilityReason;
}

/**
 * Resultado da avaliação completa
 */
export interface MilestoneEvaluationResult {
  /** Lista de marcos elegíveis */
  milestones: MilestoneSuggestion[];
  
  /** Quantidade de marcos pendentes */
  count: number;
  
  /** Razão se não houver nenhum */
  reason?: MilestoneIneligibilityReason;
}

/**
 * Avalia elegibilidade para marcos de presença.
 */
function evaluatePresenceMilestones(
  context: MilestoneEvaluationContext
): MilestoneSuggestion[] {
  const results: MilestoneSuggestion[] = [];
  
  for (const config of PRESENCE_MILESTONES) {
    // JOURNEY_COMPLETE é especial
    if (config.type === "JOURNEY_COMPLETE") {
      if (context.isPostpartum && !hasSeenPresenceMilestone(context.events, config.type)) {
        results.push(createPresenceSuggestion(config, context));
      }
      continue;
    }
    
    // Verificar se atingiu o marco
    if (context.presenceDays < config.days) continue;
    
    // Verificar se já foi mostrado
    if (hasSeenPresenceMilestone(context.events, config.type)) continue;
    
    // Elegível!
    results.push(createPresenceSuggestion(config, context));
  }
  
  return results;
}

/**
 * Avalia elegibilidade para marcos gestacionais.
 */
function evaluateGestationalMilestones(
  context: MilestoneEvaluationContext
): MilestoneSuggestion[] {
  const results: MilestoneSuggestion[] = [];
  
  // Se já é pós-parto, não mostrar marcos gestacionais
  if (context.isPostpartum) return results;
  
  for (const config of GESTATIONAL_MILESTONES) {
    // NEW_WEEK é especial - acontece toda semana
    if (config.type === "NEW_WEEK") {
      // Verificar se mudou de semana
      if (
        context.lastGestationalWeek !== undefined &&
        context.gestationalWeek > context.lastGestationalWeek
      ) {
        // Verificar se já viu esta semana específica
        if (!hasSeenGestationalMilestone(context.events, config.type, context.gestationalWeek)) {
          results.push(createGestationalSuggestion(config, context));
        }
      }
      continue;
    }
    
    // Marcos de semana específica
    if (typeof config.week === "number") {
      // Verificar se está na semana exata
      if (context.gestationalWeek !== config.week) continue;
      
      // Verificar se já foi mostrado
      if (hasSeenGestationalMilestone(context.events, config.type)) continue;
      
      // Elegível!
      results.push(createGestationalSuggestion(config, context));
    }
  }
  
  return results;
}

/**
 * Cria sugestão de marco de presença
 */
function createPresenceSuggestion(
  config: PresenceMilestoneConfig,
  context: MilestoneEvaluationContext
): MilestoneSuggestion {
  const babyName = context.babyName || "Seu bebê";
  
  return {
    milestoneId: `${config.type}-${Date.now()}`,
    type: config.type,
    category: "presence",
    title: config.title,
    celebrationMessage: config.celebrationMessage,
    babyMessage: config.babyMessageTemplate,
    badge: config.badge,
    product: context.isPremium ? config.product : undefined,
    tone: config.tone,
    contextData: {
      value: config.days,
      label: config.days === -1 ? "Jornada Completa" : `${config.days} dias`,
    },
  };
}

/**
 * Cria sugestão de marco gestacional
 */
function createGestationalSuggestion(
  config: GestationalMilestoneConfig,
  context: MilestoneEvaluationContext
): MilestoneSuggestion {
  const week = context.gestationalWeek;
  const weekMessage = WEEK_MESSAGES[week] || "Estou crescendo e me desenvolvendo!";
  
  const data = {
    week: String(week),
    weekMessage,
  };
  
  return {
    milestoneId: `${config.type}-${week}-${Date.now()}`,
    type: config.type,
    category: "gestational",
    title: interpolate(config.titleTemplate, data),
    celebrationMessage: interpolate(config.celebrationMessageTemplate, data),
    babyMessage: interpolate(config.babyMessageTemplate, data),
    badge: {
      ...config.badge,
      name: config.type === "NEW_WEEK" 
        ? `Semana ${week}` 
        : config.badge.name,
    },
    product: context.isPremium 
      ? {
          ...config.product,
          title: interpolate(config.product.title, data),
          productId: config.type === "NEW_WEEK" 
            ? `week-letter-${week}` 
            : config.product.productId,
        }
      : undefined,
    tone: config.tone,
    contextData: {
      value: week,
      label: `Semana ${week}`,
    },
  };
}

/**
 * Avalia todos os marcos elegíveis.
 * 
 * @param context - Contexto atual da usuária
 * @returns Lista de marcos elegíveis
 */
export function evaluateMilestones(
  context: MilestoneEvaluationContext
): MilestoneEvaluationResult {
  // Avaliar marcos de presença
  const presenceMilestones = evaluatePresenceMilestones(context);
  
  // Avaliar marcos gestacionais
  const gestationalMilestones = evaluateGestationalMilestones(context);
  
  // Combinar e limitar
  const allMilestones = [
    ...presenceMilestones,
    ...gestationalMilestones,
  ].slice(0, MILESTONE_RULES.MAX_MILESTONES_PER_EVALUATION);
  
  if (allMilestones.length === 0) {
    return {
      milestones: [],
      count: 0,
      reason: "no_pending_milestones",
    };
  }
  
  return {
    milestones: allMilestones,
    count: allMilestones.length,
  };
}

/**
 * Obtém configuração de um marco específico
 */
export function getMilestoneConfig(type: MilestoneType): {
  badge: MilestoneBadge;
  product: MilestoneProduct;
} | null {
  // Buscar em presença
  const presenceConfig = PRESENCE_MILESTONES.find((m) => m.type === type);
  if (presenceConfig) {
    return {
      badge: presenceConfig.badge,
      product: presenceConfig.product,
    };
  }
  
  // Buscar em gestacional
  const gestationalConfig = GESTATIONAL_MILESTONES.find((m) => m.type === type);
  if (gestationalConfig) {
    return {
      badge: gestationalConfig.badge,
      product: gestationalConfig.product,
    };
  }
  
  return null;
}

// ============================================
// EXPORTS
// ============================================

export { WEEK_MESSAGES };