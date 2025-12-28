/**
 * @fluia/contracts - Prescription Types
 * 
 * Tipos relacionados à prescrição diária de treinos.
 * 
 * REGRA ÉTICA:
 * - Sempre ≥90% de chance de sucesso
 * - Nunca prescrever algo punitivo ou excessivo
 * - Em dias difíceis, priorizar presença sobre desempenho
 */

import type { DateKey, MetricKey } from "./shared";

// ============================================
// TREINO PRESCRITO
// ============================================

/**
 * Categoria do treino (alinhada com métricas).
 */
export type TrainingCategory = MetricKey;

/**
 * Tipo de treino disponível.
 */
export type TrainingType = 
  | "breathing"      // Respiração guiada
  | "grounding"      // Aterramento corporal
  | "mindfulness"    // Atenção plena curta
  | "bond"           // Vínculo simbólico
  | "reflection"     // Micro-reflexão
  | "pause";         // Pausa consciente

/**
 * Intensidade do treino.
 * Adaptada ao estado emocional do dia.
 */
export type TrainingIntensity = "gentle" | "moderate" | "active";

/**
 * Um treino prescrito para o dia.
 */
export interface TrainingPrescription {
  /** ID único do treino */
  id: string;
  
  /** Categoria (RE/BS/RS/CA) */
  category: TrainingCategory;
  
  /** Tipo do treino */
  type: TrainingType;
  
  /** Título amigável */
  title: string;
  
  /** Descrição curta */
  description: string;
  
  /** Explicação educativa: "Por que isso ajuda" */
  why: string;
  
  /** Duração em minutos (sempre 1-3) */
  durationMinutes: 1 | 2 | 3;
  
  /** Intensidade */
  intensity: TrainingIntensity;
  
  /** Ordem na prescrição */
  order: number;
}

// ============================================
// PRESCRIÇÃO DIÁRIA
// ============================================

/**
 * Prescrição diária completa.
 * Gerada pela Prescription Engine.
 */
export interface DailyPrescription {
  /** Chave do dia */
  dateKey: DateKey;
  
  /** Lista de treinos (1-3) */
  trainings: TrainingPrescription[];
  
  /** Métrica foco do dia */
  focusMetric: MetricKey;
  
  /** Mensagem de contexto para a usuária */
  contextMessage?: string;
  
  /** Indica se é prescrição simplificada (estado vulnerável) */
  isSimplified: boolean;
  
  /** Timestamp de geração */
  generatedAt: string;
}

// ============================================
// TREINO RESPONSE
// ============================================

/** Response ao buscar prescrição do dia */
export interface GetPrescriptionResponse {
  /** Prescrição do dia */
  prescription: DailyPrescription;
  
  /** Indica se já existe check-in (requisito) */
  hasCheckin: boolean;
}

// ============================================
// CATÁLOGO DE TREINOS
// ============================================

/**
 * Definição de um treino no catálogo.
 * Usado para popular o banco de treinos disponíveis.
 */
export interface TrainingDefinition {
  /** ID único */
  id: string;
  
  /** Categoria primária */
  category: TrainingCategory;
  
  /** Tipo */
  type: TrainingType;
  
  /** Título */
  title: string;
  
  /** Descrição */
  description: string;
  
  /** Por que ajuda */
  why: string;
  
  /** Duração */
  durationMinutes: 1 | 2 | 3;
  
  /** Intensidade */
  intensity: TrainingIntensity;
  
  /** Em quais contextos pode ser prescrito */
  suitableFor: {
    /** Zonas emocionais adequadas */
    zones: ("baixa" | "intermediaria" | "fortalecida")[];
    /** Níveis de energia adequados */
    energyLevels: ("low" | "medium" | "high")[];
    /** Pode ser usado em estado vulnerável? */
    allowInVulnerable: boolean;
  };
  
  /** Conteúdo do treino (passos, áudio, etc) */
  content: TrainingContent;
}

/**
 * Conteúdo de um treino.
 */
export interface TrainingContent {
  /** Tipo de conteúdo */
  contentType: "guided" | "audio" | "text";
  
  /** Passos (para treinos guiados) */
  steps?: TrainingStep[];
  
  /** URL do áudio (se aplicável) */
  audioUrl?: string;
  
  /** Texto da reflexão (se aplicável) */
  reflectionText?: string;
}

/**
 * Passo de um treino guiado.
 */
export interface TrainingStep {
  /** Ordem do passo */
  order: number;
  
  /** Instrução */
  instruction: string;
  
  /** Duração em segundos */
  durationSeconds: number;
  
  /** Tipo de ação */
  action: "breathe_in" | "breathe_out" | "hold" | "observe" | "feel" | "release";
}

// ============================================
// REGRAS DE PRESCRIÇÃO
// ============================================

/**
 * Configuração das regras de prescrição.
 * Define limites e comportamentos da engine.
 */
export interface PrescriptionRules {
  /** Número mínimo de treinos por dia */
  minTrainings: 1;
  
  /** Número máximo de treinos por dia */
  maxTrainings: 3;
  
  /** Duração máxima por treino (minutos) */
  maxDurationPerTraining: 3;
  
  /** Duração total máxima (minutos) */
  maxTotalDuration: 9;
  
  /** Taxa mínima de sucesso esperada */
  minSuccessRate: 0.9;
  
  /** Simplificar em estado vulnerável */
  simplifyWhenVulnerable: true;
}

/** Regras padrão (congeladas) */
export const DEFAULT_PRESCRIPTION_RULES: PrescriptionRules = {
  minTrainings: 1,
  maxTrainings: 3,
  maxDurationPerTraining: 3,
  maxTotalDuration: 9,
  minSuccessRate: 0.9,
  simplifyWhenVulnerable: true,
};
