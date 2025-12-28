/**
 * @fluia/engines - Emotional State Engine
 * 
 * ENGINE 1: Interpreta o check-in bruto.
 * 
 * RESPONSABILIDADE:
 * - Transformar dimensões numéricas em estado emocional qualitativo
 * - Identificar padrões e flags de atenção
 * - NÃO calcula métricas (isso é responsabilidade do Metrics Engine)
 * 
 * REGRA FUNDAMENTAL (Documento p.12):
 * "A FLUIA não mede emoções para avaliar a gestante.
 *  Ela traduz emoções para que a gestante aprenda a cuidar de si."
 */

import type { CheckinDimensions } from "@fluia/contracts";

// ============================================
// TYPES
// ============================================

export type Zone = 1 | 2 | 3 | 4 | 5;
export type Intensity = "low" | "medium" | "high";
export type DominantDimension = "mood" | "energy" | "body" | "bond";

export interface EmotionalStateFlags {
  /** Carga emocional muito alta (múltiplas dimensões em zona baixa) */
  overload?: boolean;
  /** Energia consistentemente baixa */
  lowEnergy?: boolean;
  /** Distância emocional com o bebê */
  emotionalDistance?: boolean;
  /** Desconforto corporal significativo */
  physicalDiscomfort?: boolean;
}

export interface EmotionalState {
  /** Zona emocional predominante (1=muito baixa, 5=muito fortalecida) */
  zone: Zone;
  /** Intensidade do estado emocional */
  intensity: Intensity;
  /** Coerência entre as dimensões (0-1, quanto maior mais alinhadas) */
  coherence: number;
  /** Dimensão que mais influencia o estado atual */
  dominantDimension: DominantDimension;
  /** Flags de atenção (opcional) */
  flags?: EmotionalStateFlags;
}

export interface EmotionalStateInput {
  /** Dimensões do check-in */
  dimensions: CheckinDimensions;
  /** Semana gestacional (para contexto) */
  gestationalWeek?: number;
  /** Momento do dia */
  moment?: "morning" | "afternoon" | "evening" | "night";
}

// ============================================
// CONSTANTS
// ============================================

/** Pesos para cálculo da zona predominante */
const DIMENSION_WEIGHTS = {
  mood: 0.35,    // Humor tem maior peso
  energy: 0.25,  // Energia é importante
  body: 0.20,    // Corpo influencia
  bond: 0.20,    // Vínculo tem peso próprio
} as const;

/** Limiares para definir zona */
const ZONE_THRESHOLDS = {
  veryLow: 1.7,       // <= 1.7 → zona 1
  low: 2.4,           // <= 2.4 → zona 2
  intermediate: 3.5,  // <= 3.5 → zona 3
  high: 4.3,          // <= 4.3 → zona 4
  // > 4.3 → zona 5
} as const;

/** Limiares para coerência */
const COHERENCE_THRESHOLDS = {
  low: 0.5,    // Alta variação entre dimensões
  medium: 0.75, // Variação moderada
  // > 0.75 → alta coerência
} as const;

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Calcula a zona emocional predominante.
 * Usa média ponderada das dimensões.
 */
function calculateZone(dimensions: CheckinDimensions): Zone {
  const weighted =
    dimensions.mood * DIMENSION_WEIGHTS.mood +
    dimensions.energy * DIMENSION_WEIGHTS.energy +
    dimensions.body * DIMENSION_WEIGHTS.body +
    dimensions.bond * DIMENSION_WEIGHTS.bond;

  if (weighted <= ZONE_THRESHOLDS.veryLow) return 1;
  if (weighted <= ZONE_THRESHOLDS.low) return 2;
  if (weighted <= ZONE_THRESHOLDS.intermediate) return 3;
  if (weighted <= ZONE_THRESHOLDS.high) return 4;
  return 5;
}

/**
 * Calcula a intensidade do estado emocional.
 * Baseado na dispersão dos valores.
 */
function calculateIntensity(dimensions: CheckinDimensions): Intensity {
  const values = [
    dimensions.mood,
    dimensions.energy,
    dimensions.body,
    dimensions.bond,
  ];

  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  // Alta variação = alta intensidade (estado mais "agudo")
  if (stdDev > 1.2) return "high";
  if (stdDev > 0.7) return "medium";
  return "low";
}

/**
 * Calcula coerência entre dimensões.
 * Valores próximos = alta coerência.
 * Valores dispersos = baixa coerência.
 */
function calculateCoherence(dimensions: CheckinDimensions): number {
  const values = [
    dimensions.mood,
    dimensions.energy,
    dimensions.body,
    dimensions.bond,
  ];

  const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / values.length;
  
  // Normalizar variance (max possível = 4) para escala 0-1
  // Inverter: baixa variance = alta coerência
  const coherence = 1 - Math.min(variance / 4, 1);
  
  return Math.round(coherence * 100) / 100; // 2 casas decimais
}

/**
 * Identifica a dimensão dominante.
 * A que mais se afasta da média (para baixo ou para cima).
 */
function findDominantDimension(dimensions: CheckinDimensions): DominantDimension {
  const values = {
    mood: dimensions.mood,
    energy: dimensions.energy,
    body: dimensions.body,
    bond: dimensions.bond,
  };

  const avg = (values.mood + values.energy + values.body + values.bond) / 4;
  
  let maxDeviation = 0;
  let dominant: DominantDimension = "mood";

  for (const [key, value] of Object.entries(values)) {
    const deviation = Math.abs(value - avg);
    if (deviation > maxDeviation) {
      maxDeviation = deviation;
      dominant = key as DominantDimension;
    }
  }

  return dominant;
}

/**
 * Identifica flags de atenção.
 * NÃO são diagnósticos - são sinais para ajustar cuidado.
 */
function identifyFlags(
  dimensions: CheckinDimensions,
  zone: Zone,
  coherence: number
): EmotionalStateFlags | undefined {
  const flags: EmotionalStateFlags = {};

  // Overload: múltiplas dimensões baixas + baixa coerência
  const lowCount = [
    dimensions.mood,
    dimensions.energy,
    dimensions.body,
    dimensions.bond,
  ].filter(v => v <= 2).length;

  if (lowCount >= 3) {
    flags.overload = true;
  }

  // Low energy: energia persistentemente baixa
  if (dimensions.energy <= 2) {
    flags.lowEnergy = true;
  }

  // Emotional distance: vínculo baixo
  if (dimensions.bond <= 2) {
    flags.emotionalDistance = true;
  }

  // Physical discomfort: corpo em desconforto
  if (dimensions.body <= 2) {
    flags.physicalDiscomfort = true;
  }

  // Retorna undefined se não houver flags
  return Object.keys(flags).length > 0 ? flags : undefined;
}

// ============================================
// MAIN ENGINE FUNCTION
// ============================================

/**
 * ENGINE 1: Emotional State Engine
 * 
 * Transforma check-in bruto em estado emocional interpretado.
 * 
 * @param input - Check-in dimensions + contexto
 * @returns EmotionalState - Estado emocional qualitativo
 */
export function deriveEmotionalState(input: EmotionalStateInput): EmotionalState {
  const { dimensions } = input;

  // 1. Calcular zona predominante
  const zone = calculateZone(dimensions);

  // 2. Calcular intensidade
  const intensity = calculateIntensity(dimensions);

  // 3. Calcular coerência
  const coherence = calculateCoherence(dimensions);

  // 4. Identificar dimensão dominante
  const dominantDimension = findDominantDimension(dimensions);

  // 5. Identificar flags de atenção
  const flags = identifyFlags(dimensions, zone, coherence);

  return {
    zone,
    intensity,
    coherence,
    dominantDimension,
    flags,
  };
}

// ============================================
// HELPER FUNCTIONS (para uso externo)
// ============================================

/**
 * Verifica se estado é vulnerável (precisa de cuidado extra).
 */
export function isVulnerableState(state: EmotionalState): boolean {
  return state.zone <= 2 || state.flags?.overload === true;
}

/**
 * Verifica se estado é estável (apropriado para reflexão/crescimento).
 */
export function isStableState(state: EmotionalState): boolean {
  return state.zone >= 4 && state.coherence >= COHERENCE_THRESHOLDS.medium;
}

/**
 * Retorna descrição textual da zona (para debugging).
 */
export function getZoneLabel(zone: Zone): string {
  const labels = {
    1: "Muito Baixa",
    2: "Baixa",
    3: "Intermediária",
    4: "Fortalecida",
    5: "Muito Fortalecida",
  };
  return labels[zone];
}
