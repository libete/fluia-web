/**
 * ============================================
 * ARQUIVO: packages/fluia-engines/src/ritual-engine.ts
 * ============================================
 * 
 * FLUIA — Ritual Engine
 * 
 * Avalia disponibilidade e gera rituais personalizados.
 * 
 * ❌ Não faz: persistência, decisão de UX, acesso a banco
 * ✅ Faz: avalia disponibilidade, gera conteúdo, personaliza
 * 
 * CONCEITO:
 * - Rituais são momentos especiais de conexão
 * - Baseados em horário do dia ou eventos específicos
 * - PREMIUM ONLY
 * 
 * @version 1.0.0
 */

import type {
  RitualType,
  RitualStatus,
  RitualEvent,
  RitualStep,
  RitualDefinition,
  RitualSuggestion,
  RitualEvaluationContext,
} from "@fluia/contracts";

// ============================================
// REGRAS CONGELADAS
// ============================================

export const RITUAL_RULES = {
  /** Janelas de horário para rituais */
  TIME_WINDOWS: {
    morning: { start: 5, end: 10 },
    evening: { start: 19, end: 23 },
    sunday: { start: 8, end: 20 },
    trimester: { start: 0, end: 23 }, // Qualquer hora no dia da mudança
  },
  
  /** Duração estimada em minutos */
  DURATIONS: {
    morning: 3,
    evening: 3,
    sunday: 5,
    trimester: 10,
  },
} as const;

// ============================================
// TEMAS VISUAIS
// ============================================

const THEMES: Record<RitualType, RitualDefinition["theme"]> = {
  morning: {
    primary: "#FFD93D",
    background: "#FFF9E6",
    accent: "#FF9B50",
  },
  evening: {
    primary: "#9B8DD3",
    background: "#F0EDF8",
    accent: "#6B5CA5",
  },
  sunday: {
    primary: "#7BC47F",
    background: "#F0F8F0",
    accent: "#4A9B5D",
  },
  trimester: {
    primary: "#E8A589",
    background: "#FDF5F0",
    accent: "#D4846A",
  },
};

// ============================================
// CONTEÚDO DOS RITUAIS
// ============================================

/**
 * Gera etapas do ritual matinal
 */
function generateMorningSteps(babyName: string): RitualStep[] {
  return [
    {
      stepId: "morning-1",
      order: 1,
      type: "breathing",
      title: "Respire com Calma",
      instruction: `Feche os olhos. Inspire pelo nariz contando até 4. Segure por 2. Expire pela boca contando até 6. ${babyName} sente sua respiração.`,
      durationSeconds: 30,
    },
    {
      stepId: "morning-2",
      order: 2,
      type: "intention",
      title: "Intenção do Dia",
      instruction: "Qual é sua intenção para hoje? Pode ser algo simples: ter paciência, sorrir mais, descansar quando precisar.",
      durationSeconds: 20,
    },
    {
      stepId: "morning-3",
      order: 3,
      type: "connection",
      title: "Bom Dia ao Bebê",
      instruction: `Coloque as mãos na barriga e diga bom dia para ${babyName}. Sinta a conexão. Você não está sozinha neste dia.`,
      durationSeconds: 30,
    },
    {
      stepId: "morning-4",
      order: 4,
      type: "affirmation",
      title: "Afirmação",
      instruction: "Repita em silêncio ou em voz alta: 'Eu sou capaz. Meu corpo sabe cuidar do meu bebê. Hoje será um bom dia.'",
      durationSeconds: 20,
    },
  ];
}

/**
 * Gera etapas do ritual noturno
 */
function generateEveningSteps(babyName: string): RitualStep[] {
  return [
    {
      stepId: "evening-1",
      order: 1,
      type: "reflection",
      title: "Revisão do Dia",
      instruction: "Pense em um momento bom de hoje. Pode ser pequeno: um chá quente, uma mensagem carinhosa, um descanso.",
      durationSeconds: 20,
    },
    {
      stepId: "evening-2",
      order: 2,
      type: "gratitude",
      title: "Gratidão",
      instruction: `Agradeça por algo de hoje. Pode ser simples. ${babyName} cresce enquanto você descansa. Isso já é motivo de gratidão.`,
      durationSeconds: 20,
    },
    {
      stepId: "evening-3",
      order: 3,
      type: "connection",
      title: "Boa Noite ao Bebê",
      instruction: `Coloque as mãos na barriga. Diga boa noite para ${babyName}. Imagine o bebê se aconchegando para dormir junto com você.`,
      durationSeconds: 30,
    },
    {
      stepId: "evening-4",
      order: 4,
      type: "breathing",
      title: "Respiração do Sono",
      instruction: "Respire lentamente: inspire em 4, segure em 4, expire em 8. Seu corpo relaxa. Sua mente acalma.",
      durationSeconds: 30,
    },
  ];
}

/**
 * Gera etapas do ritual de domingo
 */
function generateSundaySteps(babyName: string, week: number): RitualStep[] {
  return [
    {
      stepId: "sunday-1",
      order: 1,
      type: "breathing",
      title: "Pausa Dominical",
      instruction: "Domingo é dia de descanso. Respire fundo 3 vezes. Não há pressa hoje.",
      durationSeconds: 30,
    },
    {
      stepId: "sunday-2",
      order: 2,
      type: "reflection",
      title: "Revisão da Semana",
      instruction: "Pense na semana que passou. O que você aprendeu sobre você mesma? Sobre a gravidez?",
      durationSeconds: 40,
    },
    {
      stepId: "sunday-3",
      order: 3,
      type: "connection",
      title: "Carta ao Bebê",
      instruction: `${babyName} está na semana ${week}. Se pudesse escrever uma carta para o bebê sobre esta semana, o que diria?`,
      durationSeconds: 60,
    },
    {
      stepId: "sunday-4",
      order: 4,
      type: "visualization",
      title: "Visualização",
      instruction: `Feche os olhos. Imagine ${babyName} daqui a alguns meses, nos seus braços. Sinta o peso, o cheiro, o calor.`,
      durationSeconds: 45,
    },
    {
      stepId: "sunday-5",
      order: 5,
      type: "intention",
      title: "Intenção da Semana",
      instruction: "Qual é uma intenção para a próxima semana? Algo gentil consigo mesma.",
      durationSeconds: 25,
    },
  ];
}

/**
 * Gera etapas do ritual de trimestre
 */
function generateTrimesterSteps(
  babyName: string,
  trimester: 1 | 2 | 3
): RitualStep[] {
  const trimesterNames = {
    1: "primeiro",
    2: "segundo",
    3: "terceiro",
  };

  const trimesterMessages = {
    1: "Os enjoos vão diminuir. A energia vai voltar. Você conseguiu passar pela fase mais delicada.",
    2: "Este é o trimestre dourado. Mais energia, menos desconfortos. Aproveite para se conectar.",
    3: "A reta final. Seu corpo está se preparando. Confie nele. Você está pronta.",
  };

  return [
    {
      stepId: "tri-1",
      order: 1,
      type: "breathing",
      title: "Transição",
      instruction: `Você está entrando no ${trimesterNames[trimester]} trimestre. Respire fundo. Esta é uma passagem importante.`,
      durationSeconds: 30,
    },
    {
      stepId: "tri-2",
      order: 2,
      type: "reflection",
      title: "Olhando para Trás",
      instruction: "Pense no trimestre que passou. Quais foram os momentos mais difíceis? E os mais bonitos?",
      durationSeconds: 60,
    },
    {
      stepId: "tri-3",
      order: 3,
      type: "gratitude",
      title: "Gratidão ao Corpo",
      instruction: "Agradeça ao seu corpo por tudo que ele fez até aqui. Ele está fazendo algo extraordinário.",
      durationSeconds: 40,
    },
    {
      stepId: "tri-4",
      order: 4,
      type: "connection",
      title: "Mensagem ao Bebê",
      instruction: `Diga a ${babyName}: 'Passamos juntos mais uma etapa. Estou aqui com você. Vamos continuar juntos.'`,
      durationSeconds: 40,
    },
    {
      stepId: "tri-5",
      order: 5,
      type: "affirmation",
      title: "Afirmação do Trimestre",
      instruction: trimesterMessages[trimester],
      durationSeconds: 30,
    },
    {
      stepId: "tri-6",
      order: 6,
      type: "visualization",
      title: "Visualização",
      instruction: trimester === 3
        ? `Imagine o momento do encontro. ${babyName} nos seus braços. O choro, o calor, o amor.`
        : `Imagine ${babyName} crescendo dentro de você. Cada dia mais forte, mais formado, mais pronto.`,
      durationSeconds: 60,
    },
    {
      stepId: "tri-7",
      order: 7,
      type: "intention",
      title: "Intenção do Trimestre",
      instruction: `Qual é sua maior intenção para o ${trimesterNames[trimester]} trimestre?`,
      durationSeconds: 40,
    },
    {
      stepId: "tri-8",
      order: 8,
      type: "closure",
      title: "Encerramento",
      instruction: "Coloque as mãos no coração. Depois na barriga. Sinta a conexão entre vocês. O ritual está completo.",
      durationSeconds: 30,
    },
  ];
}

// ============================================
// MENSAGENS DO BEBÊ
// ============================================

const BABY_MESSAGES: Record<RitualType, (name: string) => string> = {
  morning: (name) =>
    `Bom dia, mamãe! Hoje vamos juntos. Sinto quando você respira fundo. 💜`,
  evening: (name) =>
    `Boa noite, mamãe. Obrigado por mais um dia cuidando de nós. Durma bem. 💜`,
  sunday: (name) =>
    `Mamãe, domingo é nosso dia especial. Gosto quando você para e pensa em mim. 💜`,
  trimester: (name) =>
    `Mamãe, passamos mais uma fase juntos! Sinto cada vez mais seu amor. 💜`,
};

const BABY_TEASERS: Record<RitualType, string> = {
  morning: "Começar o dia com conexão",
  evening: "Encerrar o dia com gratidão",
  sunday: "Momento especial de reflexão",
  trimester: "Celebração de passagem",
};

// ============================================
// HELPERS
// ============================================

/**
 * Verifica se ritual foi feito hoje
 */
function wasCompletedToday(events: RitualEvent[], type: RitualType, today: string): boolean {
  return events.some(
    (e) => e.type === type && e.action === "completed" && e.date === today
  );
}

/**
 * Verifica se está na janela de horário
 */
function isInTimeWindow(hour: number, type: RitualType): boolean {
  const window = RITUAL_RULES.TIME_WINDOWS[type];
  return hour >= window.start && hour < window.end;
}

/**
 * Calcula quando expira
 */
function calculateExpiration(type: RitualType, currentDate: string): string {
  const window = RITUAL_RULES.TIME_WINDOWS[type];
  const date = new Date(currentDate);
  date.setHours(window.end, 0, 0, 0);
  return date.toISOString();
}

// ============================================
// ENGINE PRINCIPAL
// ============================================

/**
 * Resultado da avaliação
 */
export interface RitualEvaluationResult {
  available: RitualSuggestion[];
  next?: {
    type: RitualType;
    availableAt: string;
    title: string;
  };
}

/**
 * Avalia rituais disponíveis
 */
export function evaluateRituals(
  context: RitualEvaluationContext
): RitualEvaluationResult {
  // Não premium = nenhum ritual
  if (!context.isPremium) {
    return { available: [] };
  }

  const available: RitualSuggestion[] = [];
  const babyName = context.babyName || "Seu bebê";

  // 1. Verificar ritual matinal
  if (
    isInTimeWindow(context.currentHour, "morning") &&
    !wasCompletedToday(context.events, "morning", context.currentDate)
  ) {
    available.push({
      ritualId: `morning-${context.currentDate}`,
      type: "morning",
      status: "available",
      title: "Ritual Matinal",
      description: "Comece o dia com intenção e conexão",
      babyTeaser: BABY_TEASERS.morning,
      estimatedMinutes: RITUAL_RULES.DURATIONS.morning,
      icon: "🌅",
      availability: {
        startHour: RITUAL_RULES.TIME_WINDOWS.morning.start,
        endHour: RITUAL_RULES.TIME_WINDOWS.morning.end,
        expiresAt: calculateExpiration("morning", context.currentDate),
      },
      reason: "Disponível agora — comece o dia com calma",
    });
  }

  // 2. Verificar ritual noturno
  if (
    isInTimeWindow(context.currentHour, "evening") &&
    !wasCompletedToday(context.events, "evening", context.currentDate)
  ) {
    available.push({
      ritualId: `evening-${context.currentDate}`,
      type: "evening",
      status: "available",
      title: "Ritual Noturno",
      description: "Encerre o dia com gratidão e paz",
      babyTeaser: BABY_TEASERS.evening,
      estimatedMinutes: RITUAL_RULES.DURATIONS.evening,
      icon: "🌙",
      availability: {
        startHour: RITUAL_RULES.TIME_WINDOWS.evening.start,
        endHour: RITUAL_RULES.TIME_WINDOWS.evening.end,
        expiresAt: calculateExpiration("evening", context.currentDate),
      },
      reason: "Disponível agora — prepare-se para descansar",
    });
  }

  // 3. Verificar ritual de domingo
  if (
    context.dayOfWeek === 0 && // Domingo
    isInTimeWindow(context.currentHour, "sunday") &&
    !wasCompletedToday(context.events, "sunday", context.currentDate)
  ) {
    available.push({
      ritualId: `sunday-${context.currentDate}`,
      type: "sunday",
      status: "available",
      title: "Ritual de Domingo",
      description: "Momento especial de reflexão semanal",
      babyTeaser: BABY_TEASERS.sunday,
      estimatedMinutes: RITUAL_RULES.DURATIONS.sunday,
      icon: "🌿",
      availability: {
        startHour: RITUAL_RULES.TIME_WINDOWS.sunday.start,
        endHour: RITUAL_RULES.TIME_WINDOWS.sunday.end,
        expiresAt: calculateExpiration("sunday", context.currentDate),
      },
      reason: "Domingo é dia de pausa e conexão",
    });
  }

  // 4. Verificar ritual de trimestre
  if (
    context.trimesterJustChanged &&
    !wasCompletedToday(context.events, "trimester", context.currentDate)
  ) {
    const trimesterNames = { 1: "Primeiro", 2: "Segundo", 3: "Terceiro" };
    available.push({
      ritualId: `trimester-${context.trimester}-${context.currentDate}`,
      type: "trimester",
      status: "available",
      title: `Ritual do ${trimesterNames[context.trimester]} Trimestre`,
      description: "Celebre a passagem para uma nova fase",
      babyTeaser: BABY_TEASERS.trimester,
      estimatedMinutes: RITUAL_RULES.DURATIONS.trimester,
      icon: "✨",
      availability: {
        startHour: 0,
        endHour: 23,
        expiresAt: calculateExpiration("trimester", context.currentDate),
      },
      reason: "Você entrou em um novo trimestre!",
    });
  }

  // 5. Calcular próximo ritual se nenhum disponível
  let next: RitualEvaluationResult["next"];
  
  if (available.length === 0) {
    if (context.currentHour < RITUAL_RULES.TIME_WINDOWS.morning.start) {
      const availableAt = new Date(context.currentDate);
      availableAt.setHours(RITUAL_RULES.TIME_WINDOWS.morning.start, 0, 0, 0);
      next = {
        type: "morning",
        availableAt: availableAt.toISOString(),
        title: "Ritual Matinal",
      };
    } else if (context.currentHour < RITUAL_RULES.TIME_WINDOWS.evening.start) {
      const availableAt = new Date(context.currentDate);
      availableAt.setHours(RITUAL_RULES.TIME_WINDOWS.evening.start, 0, 0, 0);
      next = {
        type: "evening",
        availableAt: availableAt.toISOString(),
        title: "Ritual Noturno",
      };
    }
  }

  return { available, next };
}

/**
 * Gera definição completa de um ritual
 */
export function generateRitualDefinition(
  type: RitualType,
  context: {
    babyName: string;
    gestationalWeek: number;
    trimester: 1 | 2 | 3;
  }
): RitualDefinition {
  const { babyName, gestationalWeek, trimester } = context;

  const definitions: Record<RitualType, () => RitualDefinition> = {
    morning: () => ({
      type: "morning",
      title: "Ritual Matinal",
      description: "Comece o dia com intenção e conexão",
      openingMessage: `Bom dia! Antes de começar o dia, vamos criar um momento de conexão com ${babyName}.`,
      babyMessage: BABY_MESSAGES.morning(babyName),
      estimatedMinutes: RITUAL_RULES.DURATIONS.morning,
      steps: generateMorningSteps(babyName),
      closingMessage: "Seu dia pode começar. Leve essa calma com você. 💜",
      icon: "🌅",
      theme: THEMES.morning,
    }),

    evening: () => ({
      type: "evening",
      title: "Ritual Noturno",
      description: "Encerre o dia com gratidão e paz",
      openingMessage: `O dia está terminando. Vamos encerrar com gratidão e preparar o corpo para o descanso.`,
      babyMessage: BABY_MESSAGES.evening(babyName),
      estimatedMinutes: RITUAL_RULES.DURATIONS.evening,
      steps: generateEveningSteps(babyName),
      closingMessage: "Durma bem. Amanhã será um novo dia. 💜",
      icon: "🌙",
      theme: THEMES.evening,
    }),

    sunday: () => ({
      type: "sunday",
      title: "Ritual de Domingo",
      description: "Momento especial de reflexão semanal",
      openingMessage: `Domingo é dia de pausa. Vamos olhar para a semana que passou e preparar a que vem.`,
      babyMessage: BABY_MESSAGES.sunday(babyName),
      estimatedMinutes: RITUAL_RULES.DURATIONS.sunday,
      steps: generateSundaySteps(babyName, gestationalWeek),
      closingMessage: "Descanse. Você merece. A semana que vem será boa. 💜",
      icon: "🌿",
      theme: THEMES.sunday,
    }),

    trimester: () => {
      const trimesterNames = { 1: "Primeiro", 2: "Segundo", 3: "Terceiro" };
      return {
        type: "trimester",
        title: `Ritual do ${trimesterNames[trimester]} Trimestre`,
        description: "Celebre a passagem para uma nova fase",
        openingMessage: `Você está entrando no ${trimesterNames[trimester].toLowerCase()} trimestre. Este é um momento especial de transição.`,
        babyMessage: BABY_MESSAGES.trimester(babyName),
        estimatedMinutes: RITUAL_RULES.DURATIONS.trimester,
        steps: generateTrimesterSteps(babyName, trimester),
        closingMessage: `Bem-vinda ao ${trimesterNames[trimester].toLowerCase()} trimestre. Vocês estão prontos para esta fase. 💜`,
        icon: "✨",
        theme: THEMES.trimester,
      };
    },
  };

  return definitions[type]();
}

/**
 * Gera mensagem de parabéns após completar ritual
 */
export function generateCongratsMessage(
  type: RitualType,
  streak: number,
  babyName: string
): string {
  const baseMessages: Record<RitualType, string> = {
    morning: `Que lindo começo de dia! ${babyName} sentiu cada respiração sua.`,
    evening: `Boa noite, mamãe. Você encerrou o dia com amor.`,
    sunday: `Domingo especial completado. Que a semana seja leve.`,
    trimester: `Vocês passaram por mais uma fase juntos. Isso é extraordinário.`,
  };

  let message = baseMessages[type];

  if (streak >= 7) {
    message += ` 🔥 Você está em uma sequência de ${streak} rituais!`;
  } else if (streak >= 3) {
    message += ` ✨ ${streak} rituais seguidos. Continue assim!`;
  }

  return message;
}

// ============================================
// EXPORTS
// ============================================

export { THEMES as RITUAL_THEMES };