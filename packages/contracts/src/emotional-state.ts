/**
 * @fluia/contracts - Emotional State Types
 * 
 * Estado emocional consolidado do dia.
 * 
 * REGRA: Este estado é DERIVADO do check-in.
 * Nenhuma engine cria estado emocional do nada.
 */

import type { 
  DateKey, 
  MetricSet, 
  EmotionalContext, 
  Zone,
  ScaleValue,
  DayMoment 
} from "./shared";
import type { CheckinDimensions } from "./checkin";

// ============================================
// ESTADO EMOCIONAL DO DIA
// ============================================

/**
 * Estado emocional consolidado do dia.
 * 
 * Produzido pela Emotional State Engine a partir do check-in.
 * Consumido por todas as outras engines.
 */
export interface DailyEmotionalState {
  /** Chave do dia */
  dateKey: DateKey;
  
  /** Zonas emocionais derivadas (RE/BS/RS/CA) */
  zones: MetricSet;
  
  /** Contexto emocional geral */
  context: EmotionalContext;
  
  /** Nível de energia consolidado */
  energyLevel: "low" | "medium" | "high";
  
  /** Carga emocional (quanto está pesando) */
  emotionalLoad: "light" | "moderate" | "heavy";
  
  /** Momento do dia do check-in */
  moment: DayMoment;
  
  /** Indica se há sinais de vulnerabilidade */
  isVulnerable: boolean;
}

// ============================================
// MAPEAMENTO CHECK-IN → MÉTRICAS
// ============================================

/**
 * Mapeamento de dimensões do check-in para métricas.
 * 
 * Este mapeamento é a lógica central de derivação:
 * - mood + energy → RE (Regulação Emocional)
 * - body + mood   → BS (Base de Segurança)
 * - energy + mood → RS (Resiliência ao Estresse)
 * - bond          → CA (Conexão Afetiva)
 */
export interface MetricDerivation {
  /** Métrica alvo */
  metric: keyof MetricSet;
  
  /** Dimensões que influenciam (com pesos) */
  sources: {
    dimension: keyof CheckinDimensions;
    weight: number;
  }[];
}

/** Configuração de derivação padrão */
export const DEFAULT_METRIC_DERIVATION: MetricDerivation[] = [
  {
    metric: "RE",
    sources: [
      { dimension: "mood", weight: 0.6 },
      { dimension: "energy", weight: 0.4 },
    ],
  },
  {
    metric: "BS",
    sources: [
      { dimension: "body", weight: 0.5 },
      { dimension: "mood", weight: 0.5 },
    ],
  },
  {
    metric: "RS",
    sources: [
      { dimension: "energy", weight: 0.6 },
      { dimension: "mood", weight: 0.4 },
    ],
  },
  {
    metric: "CA",
    sources: [
      { dimension: "bond", weight: 1.0 },
    ],
  },
];

// ============================================
// VALORES INTERNOS (Engine Layer)
// ============================================

/**
 * Valores numéricos internos das métricas.
 * 
 * IMPORTANTE: Estes valores NUNCA são expostos à usuária.
 * Existem apenas para cálculos internos das engines.
 * 
 * Range: 0-100 (derivado da escala 1-5)
 */
export interface InternalMetricValues {
  RE: number;
  BS: number;
  RS: number;
  CA: number;
}

/**
 * Converte valor da escala (1-5) para valor interno (0-100).
 */
export function scaleToInternalValue(value: ScaleValue): number {
  // 1 → 0, 2 → 25, 3 → 50, 4 → 75, 5 → 100
  return (value - 1) * 25;
}

/**
 * Converte valor interno (0-100) para zona.
 */
export function internalValueToZone(value: number): Zone {
  if (value < 33) return "baixa";
  if (value < 66) return "intermediaria";
  return "fortalecida";
}

// ============================================
// TENDÊNCIAS
// ============================================

/**
 * Direção da tendência de uma métrica.
 */
export type TrendDirection = "improving" | "stable" | "declining";

/**
 * Tendência de uma métrica ao longo do tempo.
 */
export interface MetricTrend {
  metric: keyof MetricSet;
  direction: TrendDirection;
  /** Zona atual */
  currentZone: Zone;
  /** Zona anterior (para comparação) */
  previousZone?: Zone;
}

/**
 * Tendências semanais consolidadas.
 */
export interface WeeklyTrends {
  dateRange: {
    start: DateKey;
    end: DateKey;
  };
  trends: MetricTrend[];
  /** Mensagem interpretativa (para Voz do Bebê) */
  interpretation?: string;
}

// ============================================
// HISTÓRICO
// ============================================

/**
 * Resumo do histórico emocional.
 * Usado para análises e relatórios.
 */
export interface EmotionalHistory {
  /** Período do histórico */
  period: "week" | "biweekly" | "month";
  
  /** Estados diários do período */
  states: DailyEmotionalState[];
  
  /** Média das zonas no período */
  averageZones: MetricSet;
  
  /** Tendências identificadas */
  trends: MetricTrend[];
  
  /** Dias com check-in */
  daysWithCheckin: number;
  
  /** Total de dias no período */
  totalDays: number;
}
