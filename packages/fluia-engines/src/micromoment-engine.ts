/**
 * FLUIA — Micromoment Engine
 * 
 * Avalia elegibilidade para micromomentos baseado em:
 * - Eventos factuais passados
 * - Contexto atual
 * - Regras congeladas
 * 
 * ❌ Não faz: persistência, decisão de UX, conhece billing
 * ✅ Faz: avalia, decide, sugere
 * 
 * REGRAS CANÔNICAS (v1.1):
 * - Check-in mede intenção (presenceDays)
 * - Jornada completa mede transformação (completedJourneys)
 * - Monetização exige transformação
 * 
 * @version 1.1.0
 */

import type {
  MicromomentType,
  MicromomentEvent,
  MicromomentSuggestion,
  MicromomentEvaluationContext,
} from "@fluia/contracts";

// ============================================
// REGRAS CONGELADAS (v1.1)
// ============================================

const RULES = {
  /** 
   * Dias de presença (check-ins) antes de mostrar qualquer MM
   * Responde: "Essa usuária voltou porque algo fez sentido?"
   */
  GRACE_PERIOD_PRESENCE: 7,
  
  /**
   * Jornadas completas para MM4 (Relatório Semanal)
   * Responde: "Temos dados suficientes para relatório real?"
   */
  MM4_MIN_COMPLETED_JOURNEYS: 7,
  
  /** Máximo de MM por dia */
  MAX_PER_DAY: 1,
  
  /** Máximo de MM por semana */
  MAX_PER_WEEK: 2,
  
  /** Dias de cooldown após dismiss */
  COOLDOWN_AFTER_DISMISS_DAYS: 3,
  
  /** Dias de cooldown após conversão (accept) */
  COOLDOWN_AFTER_ACCEPT_DAYS: 7,
  
  /** Bloquear se riskLevel >= este valor */
  BLOCK_RISK_LEVEL: 4,
} as const;

// ============================================
// TRIGGERS POR TIPO
// ============================================

const TRIGGERS: Record<MicromomentType, {
  zones: number[];
  pillars?: string[];
  requiresPractice: boolean;
  requiresCompletedJourneys?: number;
  minPresenceDays: number;
}> = {
  /**
   * MM2: Rituais de Conexão
   * - Zona 4-5 (momento emocional intenso)
   * - Após valor percebido (7 dias presença)
   */
  MM2: {
    zones: [4, 5],
    requiresPractice: false,
    minPresenceDays: 7,
  },
  
  /**
   * MM3: Interpretação da Conexão
   * - Prática satisfatória realizada
   * - Pilares específicos (BS, RE, RS)
   */
  MM3: {
    zones: [1, 2, 3, 4, 5],
    pillars: ["BS", "RE", "RS"],
    requiresPractice: true,
    minPresenceDays: 7,
  },
  
  /**
   * MM4: Relatório Semanal
   * - 7+ jornadas completas (dados reais)
   * - Qualquer zona
   */
  MM4: {
    zones: [1, 2, 3, 4, 5],
    requiresPractice: true,
    requiresCompletedJourneys: 7,
    minPresenceDays: 7,
  },
};

// ============================================
// CONTEÚDO POR TIPO
// ============================================

const CONTENT: Record<MicromomentType, {
  title: string;
  message: string;
  tone: "gentle" | "reflective";
  reason: string;
}> = {
  MM2: {
    title: "Rituais de Conexão",
    message: "Momentos especiais para fortalecer o vínculo com seu bebê, mesmo nos dias mais intensos.",
    tone: "gentle",
    reason: "Você está passando por um momento intenso",
  },
  MM3: {
    title: "Interpretação da Sua Prática",
    message: "Entenda o que sua prática de hoje revela sobre sua jornada emocional.",
    tone: "reflective",
    reason: "Sua prática de hoje merece uma reflexão mais profunda",
  },
  MM4: {
    title: "Seu Relatório Semanal",
    message: "Uma semana de cuidado! Veja o que sua jornada revela sobre você e seu bebê.",
    tone: "reflective",
    reason: "7 dias de jornada completa",
  },
};

// ============================================
// HELPERS
// ============================================

/**
 * Verifica se está no mesmo dia (timezone-aware)
 */
function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

/**
 * Verifica se está na mesma semana
 */
function isSameWeek(date1: Date, date2: Date): boolean {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.floor(Math.abs(date1.getTime() - date2.getTime()) / oneDay);
  return diffDays < 7;
}

/**
 * Conta eventos de um tipo específico hoje
 */
function countEventsToday(events: MicromomentEvent[], action: string): number {
  const today = new Date();
  return events.filter((e) => {
    const eventDate = new Date(e.timestamp);
    return e.action === action && isSameDay(eventDate, today);
  }).length;
}

/**
 * Conta eventos de um tipo específico esta semana
 */
function countEventsThisWeek(events: MicromomentEvent[], action: string): number {
  const today = new Date();
  return events.filter((e) => {
    const eventDate = new Date(e.timestamp);
    return e.action === action && isSameWeek(eventDate, today);
  }).length;
}

/**
 * Verifica cooldown baseado em eventos
 */
function isInCooldown(events: MicromomentEvent[]): {
  inCooldown: boolean;
  reason?: string;
} {
  if (events.length === 0) {
    return { inCooldown: false };
  }

  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;

  // Buscar último evento relevante
  const lastAccept = events.find((e) => e.action === "accept");
  const lastDismiss = events.find((e) => e.action === "dismiss");

  // Cooldown após accept (7 dias)
  if (lastAccept) {
    const acceptDate = new Date(lastAccept.timestamp);
    const daysSinceAccept = Math.floor((now.getTime() - acceptDate.getTime()) / oneDay);
    
    if (daysSinceAccept < RULES.COOLDOWN_AFTER_ACCEPT_DAYS) {
      return { inCooldown: true, reason: "cooldown_after_accept" };
    }
  }

  // Cooldown após dismiss (3 dias)
  if (lastDismiss) {
    const dismissDate = new Date(lastDismiss.timestamp);
    const daysSinceDismiss = Math.floor((now.getTime() - dismissDate.getTime()) / oneDay);
    
    if (daysSinceDismiss < RULES.COOLDOWN_AFTER_DISMISS_DAYS) {
      return { inCooldown: true, reason: "cooldown_after_dismiss" };
    }
  }
  
  return { inCooldown: false };
}

// ============================================
// ENGINE PRINCIPAL
// ============================================

/**
 * Razões de inelegibilidade (para debug)
 */
export type IneligibilityReason =
  | "premium_user"
  | "grace_period"
  | "risk_level_high"
  | "max_per_day"
  | "max_per_week"
  | "cooldown_after_dismiss"
  | "cooldown_after_accept"
  | "first_access_today"
  | "no_checkin_today"
  | "no_eligible_type"
  | "insufficient_journeys";

/**
 * Resultado da avaliação
 */
export interface EvaluationResult {
  eligible: boolean;
  suggestion: MicromomentSuggestion | null;
  reason?: IneligibilityReason;
}

/**
 * Avalia elegibilidade para micromomento.
 * 
 * @param context - Contexto atual da usuária
 * @returns Resultado com sugestão ou razão de inelegibilidade
 */
export function evaluateMicromoment(
  context: MicromomentEvaluationContext
): EvaluationResult {
  const { events } = context;
  
  // ----------------------------------------
  // HARD BLOCKS (ordem importa)
  // ----------------------------------------
  
  // 1. Premium não recebe MM
  if (context.isPremium) {
    return { eligible: false, suggestion: null, reason: "premium_user" };
  }
  
  // 2. Período de graça (presença mínima - check-ins)
  if (context.presenceDays < RULES.GRACE_PERIOD_PRESENCE) {
    return { eligible: false, suggestion: null, reason: "grace_period" };
  }
  
  // 3. Risco emocional alto
  if (context.riskLevel >= RULES.BLOCK_RISK_LEVEL) {
    return { eligible: false, suggestion: null, reason: "risk_level_high" };
  }
  
  // 4. Máximo por dia
  const shownToday = countEventsToday(events, "shown");
  if (shownToday >= RULES.MAX_PER_DAY) {
    return { eligible: false, suggestion: null, reason: "max_per_day" };
  }
  
  // 5. Máximo por semana
  const shownThisWeek = countEventsThisWeek(events, "shown");
  if (shownThisWeek >= RULES.MAX_PER_WEEK) {
    return { eligible: false, suggestion: null, reason: "max_per_week" };
  }
  
  // 6. Cooldown
  const cooldownCheck = isInCooldown(events);
  if (cooldownCheck.inCooldown) {
    return { 
      eligible: false, 
      suggestion: null, 
      reason: cooldownCheck.reason as IneligibilityReason 
    };
  }
  
  // 7. Primeiro acesso do dia (dar tempo para check-in)
  if (context.isFirstAccessToday) {
    return { eligible: false, suggestion: null, reason: "first_access_today" };
  }
  
  // 8. Precisa ter check-in hoje
  if (!context.hasCheckinToday) {
    return { eligible: false, suggestion: null, reason: "no_checkin_today" };
  }
  
  // ----------------------------------------
  // AVALIAR TIPOS ELEGÍVEIS (prioridade)
  // ----------------------------------------
  
  // Ordem de prioridade: MM4 > MM3 > MM2
  const typePriority: MicromomentType[] = ["MM4", "MM3", "MM2"];
  
  for (const type of typePriority) {
    const trigger = TRIGGERS[type];
    
    // Verificar presença mínima
    if (context.presenceDays < trigger.minPresenceDays) {
      continue;
    }
    
    // Verificar zona
    if (!trigger.zones.includes(context.zone)) {
      continue;
    }
    
    // Verificar pilar (se aplicável)
    if (trigger.pillars && context.pillar && !trigger.pillars.includes(context.pillar)) {
      continue;
    }
    
    // Verificar prática (se aplicável)
    if (trigger.requiresPractice && !context.practiceCompletedToday) {
      continue;
    }
    
    // Verificar jornadas completas (para MM4)
    if (trigger.requiresCompletedJourneys) {
      if (context.completedJourneys < trigger.requiresCompletedJourneys) {
        continue;
      }
    }
    
    // Passou em todas as verificações!
    const suggestion = createSuggestion(type);
    return { eligible: true, suggestion };
  }
  
  // Nenhum tipo elegível
  return { eligible: false, suggestion: null, reason: "no_eligible_type" };
}

/**
 * Cria sugestão de micromomento
 */
function createSuggestion(type: MicromomentType): MicromomentSuggestion {
  const content = CONTENT[type];
  
  return {
    micromomentId: `${type}-${Date.now()}`,
    type,
    title: content.title,
    message: content.message,
    tone: content.tone,
    reason: content.reason,
  };
}

// ============================================
// EXPORTS
// ============================================

export { RULES as MICROMOMENT_RULES };