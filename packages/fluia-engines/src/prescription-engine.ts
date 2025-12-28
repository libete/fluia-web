/**
 * @fluia/engines - Prescription Engine
 * 
 * ENGINE 3: Gera prescrição diária de cuidado.
 * 
 * RESPONSABILIDADE:
 * - Decidir quais treinos recomendar (1 a 3)
 * - Escolher duração apropriada (1-3 minutos)
 * - Definir tom da recomendação
 * - NUNCA prescricionar produtos (isso é micromoment, separado)
 * 
 * REGRAS FUNDAMENTAIS (Documento p.16-17):
 * - 1 a 3 treinos por dia
 * - Duração 1-3 minutos
 * - Taxa de sucesso esperada ≥ 90%
 * - Em dias difíceis: foco em presença, não desempenho
 * - Sempre explicar "por que isso ajuda"
 */

import type { Metrics, MetricKey, EmotionalState, Zone } from "./index";

// ============================================
// TYPES
// ============================================

export type TrainingType = 
  | "breathing"      // Respiração
  | "grounding"      // Ancoragem
  | "mindfulness"    // Atenção plena
  | "bond"           // Vínculo
  | "reflection"     // Reflexão
  | "pause";         // Pausa consciente

export type TrainingIntensity = "gentle" | "moderate" | "active";

export type PrescriptionTone = "gentle" | "neutral" | "encouraging";

export interface TrainingPrescription {
  /** ID único do treino */
  id: string;
  /** Tipo do treino */
  type: TrainingType;
  /** Título amigável */
  title: string;
  /** Explicação do "por que" */
  why: string;
  /** Duração em minutos (1-3) */
  durationMinutes: 1 | 2 | 3;
  /** Intensidade */
  intensity: TrainingIntensity;
  /** Métrica que esse treino ajuda */
  focusMetric: MetricKey;
}

export interface DailyPrescription {
  /** Lista de treinos (1 a 3) */
  trainings: TrainingPrescription[];
  /** Objetivo geral do dia */
  goal: string;
  /** Tom da comunicação */
  tone: PrescriptionTone;
  /** Se é o primeiro check-in (ajusta expectativas) */
  isFirstCheckin?: boolean;
}

export interface PrescriptionInput {
  /** Métricas calculadas */
  metrics: Metrics;
  /** Estado emocional */
  emotionalState: EmotionalState;
  /** Contexto temporal */
  context: {
    moment: "morning" | "afternoon" | "evening" | "night";
    isFirstCheckin?: boolean;
  };
}

// ============================================
// TRAINING CATALOG
// ============================================

interface TrainingTemplate {
  id: string;
  type: TrainingType;
  title: string;
  whyTemplate: string; // {metric} será substituído
  durationMinutes: 1 | 2 | 3;
  intensity: TrainingIntensity;
  focusMetric: MetricKey;
  /** Zona mínima para recomendar */
  minZone: Zone;
  /** Zona máxima para recomendar */
  maxZone: Zone;
}

const TRAINING_CATALOG: TrainingTemplate[] = [
  // ============================================
  // BREATHING (foco RE/RS)
  // ============================================
  {
    id: "breathing-gentle",
    type: "breathing",
    title: "Respiração Suave",
    whyTemplate: "Quando as emoções estão intensas, respirar devagar acalma o corpo e a mente.",
    durationMinutes: 2,
    intensity: "gentle",
    focusMetric: "RE",
    minZone: 1,
    maxZone: 3,
  },
  {
    id: "breathing-active",
    type: "breathing",
    title: "Respiração Energizante",
    whyTemplate: "Quando você precisa de disposição, respirar com intenção traz energia.",
    durationMinutes: 2,
    intensity: "active",
    focusMetric: "RS",
    minZone: 3,
    maxZone: 5,
  },
  // ============================================
  // GROUNDING (foco BS)
  // ============================================
  {
    id: "grounding-body",
    type: "grounding",
    title: "Ancoragem no Corpo",
    whyTemplate: "Quando o mundo parece confuso, sentir seu corpo te traz de volta.",
    durationMinutes: 2,
    intensity: "gentle",
    focusMetric: "BS",
    minZone: 1,
    maxZone: 3,
  },
  {
    id: "grounding-present",
    type: "grounding",
    title: "Presente Aqui e Agora",
    whyTemplate: "Ancorar no momento presente reduz ansiedade e traz clareza.",
    durationMinutes: 3,
    intensity: "moderate",
    focusMetric: "BS",
    minZone: 2,
    maxZone: 4,
  },
  // ============================================
  // MINDFULNESS (foco RE)
  // ============================================
  {
    id: "mindfulness-observation",
    type: "mindfulness",
    title: "Observação sem Julgamento",
    whyTemplate: "Perceber suas emoções sem julgá-las é o primeiro passo para regulá-las.",
    durationMinutes: 2,
    intensity: "moderate",
    focusMetric: "RE",
    minZone: 2,
    maxZone: 4,
  },
  // ============================================
  // BOND (foco CA)
  // ============================================
  {
    id: "bond-connection",
    type: "bond",
    title: "Conversa com o Bebê",
    whyTemplate: "Fortalecer o vínculo é cuidar de vocês duas ao mesmo tempo.",
    durationMinutes: 2,
    intensity: "gentle",
    focusMetric: "CA",
    minZone: 1,
    maxZone: 5,
  },
  {
    id: "bond-gratitude",
    type: "bond",
    title: "Gratidão Compartilhada",
    whyTemplate: "Agradecer junto com seu bebê fortalece a conexão afetiva.",
    durationMinutes: 2,
    intensity: "moderate",
    focusMetric: "CA",
    minZone: 3,
    maxZone: 5,
  },
  // ============================================
  // REFLECTION (foco RE/BS)
  // ============================================
  {
    id: "reflection-gentle",
    type: "reflection",
    title: "Pausa para Sentir",
    whyTemplate: "Parar para sentir é um ato de cuidado, não de fraqueza.",
    durationMinutes: 1,
    intensity: "gentle",
    focusMetric: "RE",
    minZone: 1,
    maxZone: 3,
  },
  // ============================================
  // PAUSE (sempre disponível)
  // ============================================
  {
    id: "pause-micro",
    type: "pause",
    title: "Micro-Pausa Consciente",
    whyTemplate: "Às vezes, 1 minuto de pausa consciente já faz diferença.",
    durationMinutes: 1,
    intensity: "gentle",
    focusMetric: "RE",
    minZone: 1,
    maxZone: 5,
  },
];

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Converte métrica (0-100) em zona (1-5).
 */
function metricToZone(value: number): Zone {
  if (value <= 20) return 1;
  if (value <= 40) return 2;
  if (value <= 60) return 3;
  if (value <= 80) return 4;
  return 5;
}

/**
 * Identifica qual métrica precisa de mais atenção.
 */
function getLowestMetric(metrics: Metrics): MetricKey {
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
 * Filtra treinos apropriados para o estado atual.
 */
function filterAppropriateTrainings(
  metrics: Metrics,
  emotionalState: EmotionalState
): TrainingTemplate[] {
  const lowestMetric = getLowestMetric(metrics);
  const lowestMetricZone = metricToZone(metrics[lowestMetric]);

  return TRAINING_CATALOG.filter(training => {
    // Prioriza treinos que focam na métrica mais baixa
    const isFocused = training.focusMetric === lowestMetric;
    
    // Verifica se a zona está no range
    const isZoneOk = 
      lowestMetricZone >= training.minZone && 
      lowestMetricZone <= training.maxZone;

    return isFocused && isZoneOk;
  });
}

/**
 * Seleciona 1-3 treinos para o dia.
 */
function selectTrainings(
  appropriateTrainings: TrainingTemplate[],
  emotionalState: EmotionalState
): TrainingPrescription[] {
  if (appropriateTrainings.length === 0) {
    // Fallback: sempre oferecer ao menos uma pausa
    const fallback = TRAINING_CATALOG.find(t => t.id === "pause-micro")!;
    return [{ ...fallback, why: fallback.whyTemplate }];
  }

  // Em estado vulnerável: apenas 1 treino gentle
  if (emotionalState.zone <= 2 || emotionalState.flags?.overload) {
    const gentleTraining = appropriateTrainings.find(t => t.intensity === "gentle") 
      || appropriateTrainings[0];
    
    return [{
      ...gentleTraining,
      why: gentleTraining.whyTemplate,
    }];
  }

  // Em estado intermediário: 1-2 treinos
  if (emotionalState.zone === 3) {
    const count = Math.min(2, appropriateTrainings.length);
    return appropriateTrainings.slice(0, count).map(t => ({
      ...t,
      why: t.whyTemplate,
    }));
  }

  // Em estado fortalecido: até 3 treinos
  const count = Math.min(3, appropriateTrainings.length);
  return appropriateTrainings.slice(0, count).map(t => ({
    ...t,
    why: t.whyTemplate,
  }));
}

/**
 * Define o tom da prescrição.
 */
function determineTone(emotionalState: EmotionalState): PrescriptionTone {
  if (emotionalState.zone <= 2 || emotionalState.flags?.overload) {
    return "gentle";
  }
  if (emotionalState.zone >= 4) {
    return "encouraging";
  }
  return "neutral";
}

/**
 * Gera objetivo geral do dia.
 */
function generateGoal(
  emotionalState: EmotionalState,
  lowestMetric: MetricKey
): string {
  const metricLabels = {
    RE: "regular suas emoções",
    BS: "fortalecer sua base de segurança",
    RS: "construir resiliência",
    CA: "fortalecer o vínculo com seu bebê",
  };

  if (emotionalState.zone <= 2) {
    return "Hoje, o foco é presença e acolhimento. Sem cobrança.";
  }

  if (emotionalState.zone === 3) {
    return `Vamos trabalhar para ${metricLabels[lowestMetric]}, no seu ritmo.`;
  }

  return `Você está bem! Vamos aproveitar para ${metricLabels[lowestMetric]}.`;
}

// ============================================
// MAIN ENGINE FUNCTION
// ============================================

/**
 * ENGINE 3: Prescription Engine
 * 
 * Gera prescrição diária baseada em métricas e estado emocional.
 * 
 * @param input - Métricas + estado + contexto
 * @returns DailyPrescription - 1-3 treinos + objetivo
 */
export function generatePrescription(input: PrescriptionInput): DailyPrescription {
  const { metrics, emotionalState, context } = input;

  // 1. Identificar métrica que precisa de atenção
  const lowestMetric = getLowestMetric(metrics);

  // 2. Filtrar treinos apropriados
  const appropriateTrainings = filterAppropriateTrainings(metrics, emotionalState);

  // 3. Selecionar 1-3 treinos
  const trainings = selectTrainings(appropriateTrainings, emotionalState);

  // 4. Definir tom
  const tone = determineTone(emotionalState);

  // 5. Gerar objetivo
  const goal = generateGoal(emotionalState, lowestMetric);

  return {
    trainings,
    goal,
    tone,
    isFirstCheckin: context.isFirstCheckin,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Retorna duração total da prescrição.
 */
export function getTotalDuration(prescription: DailyPrescription): number {
  return prescription.trainings.reduce((sum, t) => sum + t.durationMinutes, 0);
}

/**
 * Verifica se prescrição é "micro" (≤3 min total).
 */
export function isMicroPrescription(prescription: DailyPrescription): boolean {
  return getTotalDuration(prescription) <= 3;
}

/**
 * Retorna label do tipo de treino.
 */
export function getTrainingTypeLabel(type: TrainingType): string {
  const labels = {
    breathing: "Respiração",
    grounding: "Ancoragem",
    mindfulness: "Atenção Plena",
    bond: "Vínculo",
    reflection: "Reflexão",
    pause: "Pausa",
  };
  return labels[type];
}
