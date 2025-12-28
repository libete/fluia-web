/**
 * @fluia/engines - Metrics Engine
 * 
 * ENGINE 2: Calcula as 4 métricas pedagógicas.
 * 
 * RESPONSABILIDADE:
 * - Transformar EmotionalState em métricas RE/BS/RS/CA
 * - Considerar baseline do onboarding
 * - Considerar histórico curto (tendências)
 * 
 * MÉTRICAS (Documento p.14-15):
 * - RE: Regulação Emocional
 * - BS: Base de Segurança
 * - RS: Resiliência ao Estresse
 * - CA: Conexão Afetiva
 * 
 * REGRA FUNDAMENTAL:
 * "As métricas NÃO são notas. São instrumentos de tradução,
 *  nunca rótulos ou diagnósticos apresentados à usuária."
 */

import type { CheckinDimensions } from "@fluia/contracts";
import type { EmotionalState, Zone } from "./emotional-state-engine";

// ============================================
// TYPES
// ============================================

export interface Metrics {
  /** Regulação Emocional (0-100) */
  RE: number;
  /** Base de Segurança (0-100) */
  BS: number;
  /** Resiliência ao Estresse (0-100) */
  RS: number;
  /** Conexão Afetiva (0-100) */
  CA: number;
}

export interface MetricsInput {
  /** Estado emocional atual */
  emotionalState: EmotionalState;
  /** Dimensões brutas do check-in */
  dimensions: CheckinDimensions;
  /** Baseline do onboarding (opcional) */
  baseline?: {
    mood: number;
  };
  /** Histórico recente (opcional, últimos 7 dias) */
  recentHistory?: CheckinDimensions[];
}

export type MetricKey = keyof Metrics;

export interface MetricTrend {
  metric: MetricKey;
  direction: "improving" | "stable" | "declining";
  strength: number; // 0-1
}

// ============================================
// CONSTANTS
// ============================================

/**
 * Fórmulas de derivação das métricas.
 * Cada métrica combina diferentes dimensões com pesos específicos.
 */
const METRIC_FORMULAS = {
  // RE: Regulação Emocional
  // Deriva de: mood (40%), energy (30%), coherence (30%)
  RE: {
    mood: 0.40,
    energy: 0.30,
    coherence: 0.30,
  },
  // BS: Base de Segurança
  // Deriva de: body (40%), mood (30%), bond (30%)
  BS: {
    body: 0.40,
    mood: 0.30,
    bond: 0.30,
  },
  // RS: Resiliência ao Estresse
  // Deriva de: energy (40%), mood (30%), body (30%)
  RS: {
    energy: 0.40,
    mood: 0.30,
    body: 0.30,
  },
  // CA: Conexão Afetiva
  // Deriva de: bond (70%), mood (30%)
  CA: {
    bond: 0.70,
    mood: 0.30,
  },
} as const;

/**
 * Ajuste baseado em flags do estado emocional.
 */
const FLAG_ADJUSTMENTS = {
  overload: -15,           // Sobrecarga reduz todas as métricas
  lowEnergy: { RS: -10 },  // Baixa energia afeta resiliência
  emotionalDistance: { CA: -15 }, // Distância afeta conexão
  physicalDiscomfort: { BS: -10 }, // Desconforto afeta base de segurança
} as const;

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Normaliza valor de escala (1-5) para 0-100.
 */
function scaleToPercentage(value: 1 | 2 | 3 | 4 | 5): number {
  // Mapeamento não-linear para melhor distribuição
  const mapping = {
    1: 10,  // Muito baixo
    2: 30,  // Baixo
    3: 50,  // Médio
    4: 75,  // Alto
    5: 95,  // Muito alto
  };
  return mapping[value];
}

/**
 * Calcula métrica RE (Regulação Emocional).
 */
function calculateRE(
  dimensions: CheckinDimensions,
  emotionalState: EmotionalState
): number {
  const formula = METRIC_FORMULAS.RE;
  
  const moodScore = scaleToPercentage(dimensions.mood);
  const energyScore = scaleToPercentage(dimensions.energy);
  const coherenceScore = emotionalState.coherence * 100;

  const base =
    moodScore * formula.mood +
    energyScore * formula.energy +
    coherenceScore * formula.coherence;

  return Math.round(base);
}

/**
 * Calcula métrica BS (Base de Segurança).
 */
function calculateBS(
  dimensions: CheckinDimensions,
  emotionalState: EmotionalState
): number {
  const formula = METRIC_FORMULAS.BS;
  
  const bodyScore = scaleToPercentage(dimensions.body);
  const moodScore = scaleToPercentage(dimensions.mood);
  const bondScore = scaleToPercentage(dimensions.bond);

  const base =
    bodyScore * formula.body +
    moodScore * formula.mood +
    bondScore * formula.bond;

  return Math.round(base);
}

/**
 * Calcula métrica RS (Resiliência ao Estresse).
 */
function calculateRS(
  dimensions: CheckinDimensions,
  emotionalState: EmotionalState
): number {
  const formula = METRIC_FORMULAS.RS;
  
  const energyScore = scaleToPercentage(dimensions.energy);
  const moodScore = scaleToPercentage(dimensions.mood);
  const bodyScore = scaleToPercentage(dimensions.body);

  const base =
    energyScore * formula.energy +
    moodScore * formula.mood +
    bodyScore * formula.body;

  return Math.round(base);
}

/**
 * Calcula métrica CA (Conexão Afetiva).
 */
function calculateCA(
  dimensions: CheckinDimensions,
  emotionalState: EmotionalState
): number {
  const formula = METRIC_FORMULAS.CA;
  
  const bondScore = scaleToPercentage(dimensions.bond);
  const moodScore = scaleToPercentage(dimensions.mood);

  const base =
    bondScore * formula.bond +
    moodScore * formula.mood;

  return Math.round(base);
}

/**
 * Aplica ajustes baseados nas flags do estado emocional.
 */
function applyFlagAdjustments(
  metrics: Metrics,
  emotionalState: EmotionalState
): Metrics {
  if (!emotionalState.flags) return metrics;

  const adjusted = { ...metrics };

  // Overload: reduz todas as métricas
  if (emotionalState.flags.overload) {
    adjusted.RE += FLAG_ADJUSTMENTS.overload;
    adjusted.BS += FLAG_ADJUSTMENTS.overload;
    adjusted.RS += FLAG_ADJUSTMENTS.overload;
    adjusted.CA += FLAG_ADJUSTMENTS.overload;
  }

  // Low energy: afeta RS
  if (emotionalState.flags.lowEnergy) {
    adjusted.RS += FLAG_ADJUSTMENTS.lowEnergy.RS;
  }

  // Emotional distance: afeta CA
  if (emotionalState.flags.emotionalDistance) {
    adjusted.CA += FLAG_ADJUSTMENTS.emotionalDistance.CA;
  }

  // Physical discomfort: afeta BS
  if (emotionalState.flags.physicalDiscomfort) {
    adjusted.BS += FLAG_ADJUSTMENTS.physicalDiscomfort.BS;
  }

  // Garantir limites 0-100
  adjusted.RE = Math.max(0, Math.min(100, adjusted.RE));
  adjusted.BS = Math.max(0, Math.min(100, adjusted.BS));
  adjusted.RS = Math.max(0, Math.min(100, adjusted.RS));
  adjusted.CA = Math.max(0, Math.min(100, adjusted.CA));

  return adjusted;
}

/**
 * Ajusta métricas baseado no baseline do onboarding.
 * Se baseline foi muito baixo, ajusta expectativas.
 */
function adjustForBaseline(
  metrics: Metrics,
  baseline?: { mood: number }
): Metrics {
  if (!baseline) return metrics;

  // Se baseline foi muito baixo (≤2), aumenta levemente as métricas
  // para reconhecer progresso relativo
  if (baseline.mood <= 2) {
    const boost = 5;
    return {
      RE: Math.min(100, metrics.RE + boost),
      BS: Math.min(100, metrics.BS + boost),
      RS: Math.min(100, metrics.RS + boost),
      CA: Math.min(100, metrics.CA + boost),
    };
  }

  return metrics;
}

// ============================================
// MAIN ENGINE FUNCTION
// ============================================

/**
 * ENGINE 2: Metrics Engine
 * 
 * Calcula as 4 métricas pedagógicas (RE/BS/RS/CA).
 * 
 * @param input - Estado emocional + dimensões + contexto
 * @returns Metrics - As 4 métricas (0-100)
 */
export function calculateMetrics(input: MetricsInput): Metrics {
  const { emotionalState, dimensions, baseline } = input;

  // 1. Calcular cada métrica
  let metrics: Metrics = {
    RE: calculateRE(dimensions, emotionalState),
    BS: calculateBS(dimensions, emotionalState),
    RS: calculateRS(dimensions, emotionalState),
    CA: calculateCA(dimensions, emotionalState),
  };

  // 2. Aplicar ajustes por flags
  metrics = applyFlagAdjustments(metrics, emotionalState);

  // 3. Ajustar por baseline (se existir)
  metrics = adjustForBaseline(metrics, baseline);

  return metrics;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Converte métrica (0-100) em zona (1-5) para UI.
 * NÃO expor o número bruto para a usuária.
 */
export function metricToZone(value: number): Zone {
  if (value <= 20) return 1;
  if (value <= 40) return 2;
  if (value <= 60) return 3;
  if (value <= 80) return 4;
  return 5;
}

/**
 * Identifica qual métrica está mais baixa (precisa de atenção).
 */
export function getLowestMetric(metrics: Metrics): MetricKey {
  let lowest: MetricKey = "RE";
  let lowestValue = metrics.RE;

  for (const [key, value] of Object.entries(metrics)) {
    if (value < lowestValue) {
      lowestValue = value;
      lowest = key as MetricKey;
    }
  }

  return lowest;
}

/**
 * Calcula tendência de uma métrica baseado no histórico.
 */
export function calculateTrend(
  current: number,
  recentHistory?: number[]
): MetricTrend["direction"] {
  if (!recentHistory || recentHistory.length === 0) {
    return "stable";
  }

  const avg = recentHistory.reduce((sum, v) => sum + v, 0) / recentHistory.length;
  const diff = current - avg;

  if (diff > 10) return "improving";
  if (diff < -10) return "declining";
  return "stable";
}

/**
 * Retorna nome legível da métrica (para UI).
 */
export function getMetricLabel(metric: MetricKey): string {
  const labels = {
    RE: "Regulação Emocional",
    BS: "Base de Segurança",
    RS: "Resiliência",
    CA: "Conexão Afetiva",
  };
  return labels[metric];
}

/**
 * Retorna cor da métrica (para termômetros).
 */
export function getMetricColor(metric: MetricKey): string {
  const colors = {
    RE: "#9B7AE3", // Lavanda (primary)
    BS: "#7FBA7A", // Verde (support)
    RS: "#6B5B9E", // Roxo escuro
    CA: "#F4A6A1", // Peach (accent)
  };
  return colors[metric];
}
