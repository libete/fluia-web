/**
 * @fluia/contracts - Shared Types
 *
 * Tipos fundamentais usados em todo o sistema.
 * Fonte única de verdade tipada.
 */

// ============================================
// TIPOS TEMPORAIS
// ============================================

/** Data no formato ISO YYYY-MM-DD */
export type ISODate = string;

/** Timestamp ISO 8601 completo */
export type ISOTimestamp = string;

/** Chave do dia (considera reset às 04:00) */
export type DateKey = string;

// ============================================
// CONSTANTES TEMPORAIS
// ============================================

/**
 * Hora de corte do dia na FLUIA.
 *
 * O "dia" começa às 4h da manhã para acomodar:
 * - Gestantes com insônia que fazem check-in tarde
 * - Treinos completados de madrugada
 * - Padrão da indústria (Duolingo, Fitbit, etc.)
 */
export const DAY_START_HOUR = 4;

/**
 * Timezone padrão do sistema.
 */
export const DEFAULT_TIMEZONE = "America/Sao_Paulo";

// ============================================
// ZONAS EMOCIONAIS
// ============================================

/**
 * Zona emocional derivada das métricas.
 *
 * REGRA ÉTICA: Usuária NUNCA vê números.
 * Apenas zonas são comunicadas externamente.
 */
export type Zone = "baixa" | "intermediaria" | "fortalecida";

// ============================================
// MÉTRICAS CENTRAIS (RE/BS/RS/CA)
// ============================================

/**
 * Chaves das 4 métricas centrais da FLUIA.
 *
 * - RE: Regulação Emocional
 * - BS: Base de Segurança
 * - RS: Resiliência ao Estresse
 * - CA: Conexão Afetiva
 */
export type MetricKey = "RE" | "BS" | "RS" | "CA";

/** Conjunto de métricas com suas zonas */
export type MetricSet = Record<MetricKey, Zone>;

/** Labels descritivos das métricas (para UI) */
export const METRIC_LABELS: Record<MetricKey, string> = {
  RE: "Regulação Emocional",
  BS: "Base de Segurança",
  RS: "Resiliência ao Estresse",
  CA: "Conexão Afetiva",
} as const;

// ============================================
// ESCALA DE 5 NÍVEIS (Kahneman)
// ============================================

/**
 * Valor da escala de 5 níveis.
 *
 * Baseado em estudos de Daniel Kahneman:
 * Decisão mais assertiva com níveis de risco (baixo/médio/alto)
 * expandido para 5 níveis com intermediários.
 *
 * Mapeamento interno para zonas:
 * - 1-2 → baixa
 * - 3   → intermediaria
 * - 4-5 → fortalecida
 */
export type ScaleValue = 1 | 2 | 3 | 4 | 5;

/** Valor nulo permitido (usuária não selecionou) */
export type NullableScaleValue = ScaleValue | null;

// ============================================
// CONTEXTO EMOCIONAL
// ============================================

/**
 * Contexto emocional consolidado do dia.
 *
 * Determina comportamento das engines:
 * - fragile: Bloqueia L3/L4, apenas cuidado básico
 * - neutral: Comportamento padrão
 * - stable: Permite todas as funcionalidades
 */
export type EmotionalContext = "fragile" | "neutral" | "stable";

// ============================================
// MOMENTO DO DIA
// ============================================

/**
 * Momento do dia para contextualização.
 * Determina saudação e tom das mensagens.
 */
export type DayMoment = "morning" | "afternoon" | "evening" | "night";

// ============================================
// TRIMESTRE GESTACIONAL
// ============================================

/**
 * Trimestre da gestação.
 * Derivado da DPP (Data Prevista do Parto).
 */
export type GestationalTrimester = 1 | 2 | 3;

// ============================================
// HELPERS - ZONAS E CONTEXTO
// ============================================

/**
 * Converte valor da escala (1-5) para zona emocional.
 */
export function scaleValueToZone(value: ScaleValue): Zone {
  if (value <= 2) return "baixa";
  if (value === 3) return "intermediaria";
  return "fortalecida";
}

/**
 * Verifica se o contexto permite outputs de alto nível (L3/L4).
 */
export function canShowHighLevelOutputs(context: EmotionalContext): boolean {
  return context !== "fragile";
}

// ============================================
// HELPERS - DATA E TEMPO
// ============================================

/**
 * Retorna a data-chave no formato YYYY-MM-DD.
 *
 * IMPORTANTE: O dia começa às 4h da manhã.
 * - 03:59 = ainda é "ontem"
 * - 04:00 = já é "hoje"
 *
 * @param timezone - Timezone do usuário (default: America/Sao_Paulo)
 * @param date - Data específica (default: agora)
 * @returns DateKey no formato YYYY-MM-DD
 */
export function getDateKey(
  timezone: string = DEFAULT_TIMEZONE,
  date?: Date
): DateKey {
  const now = date || new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "12");

  // Se for antes das 4h, considera como dia anterior
  if (hour < DAY_START_HOUR) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return yFormatter.format(yesterday);
  }

  return `${year}-${month}-${day}`;
}

/**
 * Verifica se uma dateKey é de hoje.
 *
 * @param dateKey - Data no formato YYYY-MM-DD
 * @param timezone - Timezone do usuário
 * @returns true se for o dia atual
 */
export function isToday(
  dateKey: DateKey,
  timezone: string = DEFAULT_TIMEZONE
): boolean {
  return dateKey === getDateKey(timezone);
}

/**
 * Retorna timestamp ISO atual.
 */
export function nowISO(): ISOTimestamp {
  return new Date().toISOString();
}