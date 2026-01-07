/**
 * @fluia/engines
 *
 * Engines de processamento da FLUIA.
 *
 * Contém a lógica de negócio para:
 * - Cálculo de estado emocional
 * - Métricas derivadas
 * - Prescrições de treinos
 * - Termômetros emocionais
 * - Progressão de treinos
 * - Mensagens do Baby Voice
 * - Avaliação de Micromomentos
 */

// ============================================
// BABY VOICE ENGINE (v2.0)
// ============================================
export {
  generateBabyVoiceMessage,
  hasSeenTodayMessage,
  countPossibleCombinations,
  getContentStats,
  generatePreviewMessage,
  isMilestoneAvailable,
  getAvailableMilestones,
} from "./baby-voice-engine";

export type { BabyVoiceOutputV2 } from "./baby-voice-engine";

// ============================================
// EMOTIONAL STATE ENGINE
// ============================================
export * from "./emotional-state-engine";

// ============================================
// METRICS ENGINE
// ============================================
export * from "./metrics-engine";

// ============================================
// PRESCRIPTION ENGINE (v2.0)
// ============================================
export {
  generatePrescription,
  getTotalDuration,
  isMicroPrescription,
  getTrainingTypeLabel,
  getToneLabel,
  getTrainingById,
  getTrainingInstructions,
  getAllTrainings,
  getCatalogStats,
} from "./prescription-engine";

export type {
  TrainingType,
  TrainingIntensity,
  PrescriptionTone,
  MetricKey,
  Zone,
  Metrics,
  TrainingPrescription,
  DailyPrescription,
  PrescriptionInput,
  ProblemType,
  DetectedProblem,
} from "./prescription-engine";

// ============================================
// THERMOMETERS ENGINE
// ============================================
export * from "./thermometers-engine";

// ============================================
// TRAINING ENGINE
// ============================================
export * from "./training-engine";

// ============================================
// MICROMOMENT ENGINE (v1.1)
// ============================================
export {
  evaluateMicromoment,
  MICROMOMENT_RULES,
} from "./micromoment-engine";

export type {
  EvaluationResult,
  IneligibilityReason,
} from "./micromoment-engine";

// ============================================
// MILESTONE ENGINE (v1.0)
// ============================================
export {
  evaluateMilestones,
  getMilestoneConfig,
  MILESTONE_RULES,
  WEEK_MESSAGES,
} from "./milestone-engine";

export type {
  MilestoneEvaluationResult,
  SingleMilestoneResult,
  MilestoneIneligibilityReason,
} from "./milestone-engine";

// ============================================
// INTERPRETATION ENGINE (v1.0)
// ============================================
export {
  generateEmotionalPatterns,
  generateWeeklyTrends,
  generatePillarInsights,
  generateMonthlyReport,
  PILLAR_NAMES,
  DAY_NAMES,
  MONTH_NAMES,
} from "./interpretation-engine";

// ============================================
// RITUAL ENGINE (v1.0)
// ============================================
export {
  evaluateRituals,
  generateRitualDefinition,
  generateCongratsMessage,
  RITUAL_RULES,
  RITUAL_THEMES,
} from "./ritual-engine";

export type {
  RitualEvaluationResult,
} from "./ritual-engine";

// ============================================
// MEMORY ENGINE (v1.0)
// ============================================
export {
  generateEmotionalDiary,
  generateVisualTimeline,
  generateBabyLetter,
  generateLetterSuggestions,
  generateJourneyBook,
  generateCapsuleSuggestions,
  generateCapsuleOpeningMessage,
  ZONE_EMOJIS,
  ZONE_TITLES,
} from "./memory-engine";

// ============================================
// COAUTHORING ENGINE (v1.0)
// ============================================
export {
  selectDailyPrompt,
  getAlternativePrompts,
  getLetterTemplates,
  suggestTemplate,
  compileLetterContent,
  generateNarrativeReflection,
  DIARY_PROMPTS,
  LETTER_TEMPLATES,
} from "./coauthoring-engine";

// ============================================
// POSTPARTUM ENGINE (v1.0)
// ============================================
export {
  // Cálculos
  calculateDaysSinceBirth,
  calculateWeeksSinceBirth,
  determinePhase,
  // Transição
  createInitialTransitionState,
  generateWelcomeMessage,
  // Diário
  selectPostpartumPrompt,
  getAlternativePostpartumPrompts,
  POSTPARTUM_DIARY_PROMPTS,
  // Check-in
  generateCheckinMessage,
  suggestPractice,
  generateCheckinInsights,
  // Screening
  evaluatePPDRisk,
  // Constantes
  PHASE_DAYS,
  PHASE_NAMES,
  ZONE_MESSAGES,
} from "./postpartum-engine";