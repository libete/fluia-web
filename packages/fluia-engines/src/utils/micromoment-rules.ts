/**
 * @fluia/engines - Micromoment Rules
 * 
 * Constantes e regras CONGELADAS para micromomentos.
 * VERSÃO: Catálogo v1.0 (27/12/2024)
 * 
 * ⚠️ NÃO ALTERAR ESTES VALORES SEM APROVAÇÃO DO DOCUMENTO OFICIAL
 */

// ============================================
// REGRAS DE FREQUÊNCIA (CONGELADAS)
// ============================================

export const MICROMOMENT_RULES = {
  /**
   * Grace period: dias sem mostrar MM após primeiro acesso.
   * Permite usuária experimentar o app antes de oferecer upgrade.
   */
  GRACE_PERIOD_DAYS: 7,
  
  /**
   * Máximo de micromomentos por dia.
   * Evita fadiga e irritação.
   */
  MAX_PER_DAY: 1,
  
  /**
   * Máximo de micromomentos por semana.
   * Mantém ofertas espaçadas e não agressivas.
   */
  MAX_PER_WEEK: 2,
  
  /**
   * Cooldown após dismiss (dias).
   * Respeita o "não" da usuária.
   */
  COOLDOWN_AFTER_DISMISS_DAYS: 3,
  
  /**
   * Cooldown após conversão (dias).
   * Evita mostrar MM para quem acabou de converter.
   */
  COOLDOWN_AFTER_CONVERSION_DAYS: 7,
  
  /**
   * Risk level mínimo para BLOQUEIO.
   * Se riskLevel >= este valor, NÃO mostrar MM.
   * Protege usuária em estado vulnerável.
   */
  BLOCK_RISK_LEVEL: 4,
  
  /**
   * Zona emocional mínima para MM2 (Rituais de Conexão).
   * Só mostrar quando usuária está estável/fortalecida.
   */
  MM2_MIN_ZONE: 4,
  
  /**
   * Dias mínimos de uso para MM4 (Relatório Semanal).
   */
  MM4_MIN_DAYS: 7,
} as const;

// ============================================
// TRIGGERS DE MICROMOMENTO
// ============================================

/**
 * Condições de trigger para cada tipo de MM.
 */
export const MICROMOMENT_TRIGGERS = {
  /**
   * MM2: Rituais de Conexão
   * - Após 7 dias de uso
   * - Zona emocional 4-5 (estável/fortalecida)
   * - Foco: pilar CA (Conexão Afetiva)
   */
  MM2: {
    minDaysOfUse: 7,
    minZone: 4,
    requiresCheckin: true,
    requiresPractice: false,
    requiresPremium: false,
    focusPillar: "CA" as const,
  },
  
  /**
   * MM3: Interpretação da Conexão
   * - Após prática satisfatória
   * - Qualquer zona (desde que não vulnerável)
   * - Foco: pilares BS/RE/RS
   */
  MM3: {
    minDaysOfUse: 1,
    minZone: 1,
    requiresCheckin: true,
    requiresPractice: true,
    requiresSatisfaction: true,
    requiresPremium: false,
    focusPillars: ["BS", "RE", "RS"] as const,
  },
  
  /**
   * MM4: Relatório Semanal
   * - 7+ dias de uso
   * - Já é Premium (mostra preview do relatório)
   * - OU não é Premium (oferece upgrade para ver)
   */
  MM4: {
    minDaysOfUse: 7,
    minZone: 1,
    requiresCheckin: true,
    requiresPractice: false,
    requiresPremium: false,
    focusPillars: ["RE", "BS", "RS", "CA"] as const,
  },
} as const;

// ============================================
// PRIORIDADE DE MICROMOMENTOS
// ============================================

/**
 * Ordem de prioridade quando múltiplos MMs são elegíveis.
 * Menor número = maior prioridade.
 */
export const MICROMOMENT_PRIORITY: Record<string, number> = {
  MM3: 1, // Pós-prática tem maior prioridade (momento quente)
  MM2: 2, // Rituais em segundo
  MM4: 3, // Relatório por último
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calcula dias de uso desde o primeiro acesso.
 */
export function calculateDaysOfUse(firstAccessDate: string): number {
  const first = new Date(firstAccessDate);
  const now = new Date();
  const diffMs = now.getTime() - first.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calcula início da semana (domingo) para uma data.
 */
export function getWeekStart(date: Date): string {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  return d.toISOString().split("T")[0];
}

/**
 * Verifica se uma data está dentro do cooldown.
 */
export function isInCooldown(
  lastActionDate: string | null,
  cooldownDays: number
): boolean {
  if (!lastActionDate) return false;
  
  const last = new Date(lastActionDate);
  const now = new Date();
  const diffMs = now.getTime() - last.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  
  return diffDays < cooldownDays;
}

/**
 * Gera DateKey no formato YYYY-MM-DD.
 */
export function getDateKey(date: Date = new Date()): string {
  return date.toISOString().split("T")[0];
}

/**
 * Gera ID único para micromomento.
 */
export function generateMicromomentId(type: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `mm_${type}_${timestamp}_${random}`;
}
