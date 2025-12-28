/**
 * @fluia/contracts
 *
 * Fonte única de verdade tipada para FLUIA.
 *
 * Este pacote contém APENAS:
 * - Tipos TypeScript
 * - Constantes imutáveis
 * - Helpers puros (sem side effects)
 *
 * NÃO contém:
 * - Lógica de engine
 * - Acesso a banco de dados
 * - Chamadas de API
 * - Dependências externas
 *
 * REGRAS CONGELADAS:
 * ❌ Nenhum número cru exposto à usuária
 * ❌ Nenhuma inferência clínica
 * ❌ Nenhuma lógica de engine
 * ✅ Tipagem explícita
 * ✅ Ética embutida nos tipos
 * ✅ Evolução segura com backward compatibility
 */

// ============================================
// SHARED (Fundação)
// ============================================
export {
  // Types
  type ISODate,
  type ISOTimestamp,
  type DateKey,
  type Zone,
  type MetricKey,
  type MetricSet,
  type ScaleValue,
  type NullableScaleValue,
  type EmotionalContext,
  type DayMoment,
  type GestationalTrimester,
  // Constants
  METRIC_LABELS,
  // Helpers
  scaleValueToZone,
  canShowHighLevelOutputs,
} from "./shared";

// ============================================
// AUTH
// ============================================
export {
  type CreateSessionRequest,
  type CreateSessionResponse,
  type SessionUser,
  type UserProfile,
  type CreateProfileData,
  type UpdateProfileData,
  type OnboardingStepRequest,
  type OnboardingStepData,
  type OnboardingStepResponse,
} from "./auth";

// ============================================
// CHECK-IN
// ============================================
export {
  // Types
  type CheckinDimensions,
  type PartialCheckinDimensions,
  type DailyCheckinInput,
  type StoredCheckin,
  type DailyCheckinResponse,
  type DimensionLabels,
  type EmotionTag,
  // Constants
  MOOD_LABELS,
  ENERGY_LABELS,
  BODY_LABELS,
  BOND_LABELS,
  DIMENSION_LABELS_MAP,
  EMOTION_TAGS,
} from "./checkin";

// ============================================
// EMOTIONAL STATE
// ============================================
export {
  // Types
  type DailyEmotionalState,
  type MetricDerivation,
  type InternalMetricValues,
  type TrendDirection,
  type MetricTrend,
  type WeeklyTrends,
  type EmotionalHistory,
  // Constants
  DEFAULT_METRIC_DERIVATION,
  // Helpers
  scaleToInternalValue,
  internalValueToZone,
} from "./emotional-state";

// ============================================
// PRESCRIPTION
// ============================================
export {
  // Types
  type TrainingCategory,
  type TrainingType,
  type TrainingIntensity,
  type TrainingPrescription,
  type DailyPrescription,
  type GetPrescriptionResponse,
  type TrainingDefinition,
  type TrainingContent,
  type TrainingStep,
  type PrescriptionRules,
  // Constants
  DEFAULT_PRESCRIPTION_RULES,
} from "./prescription";

// ============================================
// TRAINING
// ============================================
export {
  // Types
  type TrainingStartRequest,
  type TrainingCompleteRequest,
  type TrainingCompleteResponse,
  type StoredTraining,
  type FeedbackTemplate,
  type Badge,
  type BadgeCondition,
  type StreakInfo,
  // Constants
  DEFAULT_FEEDBACKS,
  DEFAULT_BADGES,
} from "./training";

// ============================================
// BABY VOICE v2
// ============================================
export {
  // Base Types
  type Trimester,
  type TimeOfDay,
  type EmotionalZone,
  type MessageComponentType,
  type BabyVoiceContext,

  // Message Components
  type OpeningComponent,
  type CoreComponent,
  type ClosingComponent,
  type MilestoneMessage,
  type MilestoneTrigger,

  // Composed Message
  type ComposedMessage,
  type BabyVoiceMessage,
  type GetBabyVoiceResponse,

  // Input/Output
  type BabyVoiceInput,
  type BabyVoiceOutput,

  // Profile Data
  type BabyProfile,
  type PresenceData,
  type BabyVoiceTracking,

  // Rules
  type BabyVoiceRules,
  BABY_VOICE_RULES,

  // Constants
  DEFAULT_BABY_NAMES,
  WEEK_RANGES,
  PRESENCE_RANGES,

  // Helpers - Names & Time
  getDefaultBabyName,
  getTrimesterFromWeeks,
  getTimeOfDay,
  getCurrentTimeOfDay,
  getBabyName,

  // Helpers - Calculation
  calculateGestationalWeeks,
  getWeekRange,
  getPresenceRange,
  generateMessageId,

  // Helpers - Date
  isNewDay,
  getTodayDate,

  // Helpers - Defaults
  createDefaultBabyProfile,
  createDefaultPresenceData,
  createDefaultBabyVoiceTracking,

  // Helpers - Updates
  updatePresenceAfterCheckIn,
  updateBabyVoiceTracking,
  markMilestoneSeen,

  // Helpers - Initialization (movido de auth.ts)
  initializeBabyVoiceFields,
} from "./baby-voice";

// ============================================
// THERMOMETERS
// ============================================
export {
  // Types
  type DailyThermometers,
  type GetDailyThermometersResponse,
  type WeeklyMetricTrend,
  type WeeklyThermometers,
  type GetWeeklyThermometersResponse,
  type ThermometerVisual,
  // Constants
  TREND_LABELS,
  ZONE_LABELS,
  METRIC_COLORS,
  // Helpers
  zoneToVisualPercent,
} from "./thermometers";

// ============================================
// REPORTS
// ============================================
export {
  // Types
  type BiweeklyReport,
  type MonthlyTimelineItem,
  type MonthlyReport,
  type ReportPattern,
  type PracticeInsight,
  type MetricEvolution,
  type EmotionalMilestone,
  type MonthlyStats,
  type GetBiweeklyReportResponse,
  type GetMonthlyReportResponse,
} from "./reports";

// ============================================
// MICROMOMENTS (v1.1 — CANÔNICO)
// ============================================
export {
  // Tipos base
  type MicromomentType,
  type MicromomentAction,
  type MicromomentNextAction,

  // Contexto de avaliação (v1.1: presenceDays + completedJourneys)
  type MicromomentEvaluationContext,

  // Estruturas centrais
  type MicromomentSuggestion,

  // Eventos factuais
  type MicromomentEvent,

  // Requests / Responses
  type AcceptMicromomentRequest,
  type AcceptMicromomentResponse,
  type DismissMicromomentRequest,
  type DismissMicromomentResponse,
  type MicromomentEvaluationResponse,
} from "./micromoments";

// ============================================
// MILESTONES (v1.0 — CELEBRAÇÕES)
// ============================================
export {
  // Tipos base
  type MilestoneType,
  type PresenceMilestoneType,
  type GestationalMilestoneType,
  type MilestoneCategory,
  type MilestoneAction,

  // Estruturas centrais
  type MilestoneBadge,
  type MilestoneProduct,
  type MilestoneSuggestion,

  // Eventos factuais
  type MilestoneEvent,

  // Contexto de avaliação
  type MilestoneEvaluationContext,

  // Requests / Responses
  type MarkMilestoneSeenRequest,
  type ExploreMilestoneProductRequest,
  type MilestoneEvaluationResponse,
  type MarkMilestoneSeenResponse,
  type ExploreMilestoneProductResponse,
} from "./milestones";

// ============================================
// INTERPRETATION (v1.0 — LONGITUDINAL)
// 
// NOTA: Tipos com nomes únicos para evitar conflito
// com emotional-state (TrendDirection) e reports (MonthlyStats)
// ============================================
export {
  // Tipos base
  type InterpretationType,
  type EmotionalPillar,
  type TrendDirection as InterpretationTrendDirection,
  type TrendStrength,

  // Padrões Emocionais
  type EmotionalPattern,
  type EmotionalPatternsResponse,

  // Tendências Semanais
  type PillarTrend,
  type PracticeTrend,
  type WeeklyTrendsResponse,

  // Insights de Pilar
  type PillarInsight,
  type PillarInsightsResponse,

  // Relatório Mensal (nomes únicos)
  type MonthlyStats as InterpretationMonthlyStats,
  type MonthlyPillarEvolution,
  type MonthlyDiscovery,
  type MonthlyReportResponse as InterpretationMonthlyReportResponse,

  // Contexto e histórico
  type HistoricalCheckin,
  type HistoricalPractice,
  type InterpretationContext,

  // Requests
  type GetEmotionalPatternsRequest,
  type GetWeeklyTrendsRequest,
  type GetPillarInsightsRequest,
  type GetMonthlyReportRequest,
} from "./interpretation";

// ============================================
// RITUALS (v1.0 — CONEXÃO)
// ============================================
export {
  // Tipos base
  type RitualType,
  type TimeOfDay as RitualTimeOfDay,
  type RitualStatus,
  type RitualAction,

  // Estruturas
  type RitualStep,
  type RitualStepType,
  type RitualDefinition,
  type RitualSuggestion,

  // Eventos factuais
  type RitualEvent,

  // Contexto
  type RitualEvaluationContext,

  // Requests
  type StartRitualRequest,
  type CompleteRitualRequest,
  type SkipRitualRequest,

  // Responses
  type RitualEvaluationResponse,
  type GetRitualResponse,
  type StartRitualResponse,
  type CompleteRitualResponse,
  type SkipRitualResponse,
} from "./rituals";

// ============================================
// MEMORY & LEGACY (v1.0)
// ============================================
export {
  // Tipos base
  type MemoryProductType,
  type MemoryGenerationStatus,

  // Diário Emocional
  type DiaryEntry,
  type EmotionalDiaryResponse,

  // Timeline Visual
  type TimelinePoint,
  type TimelineSegment,
  type VisualTimelineResponse,

  // Cartas ao Bebê
  type LetterType,
  type BabyLetter,
  type BabyLettersResponse,
  type GenerateLetterRequest,
  type SaveLetterRequest,

  // Livro da Jornada
  type BookChapter,
  type JourneyBook,
  type JourneyBookResponse,

  // Cápsula Emocional
  type CapsuleItem,
  type EmotionalCapsule,
  type EmotionalCapsuleResponse,
  type SaveCapsuleRequest,

  // Contexto
  type MemoryGenerationContext,

  // Responses
  type MemorySuccessResponse,
  type GenerationStatusResponse,
} from "./memory";

// ============================================
// COAUTHORING (v1.0)
// ============================================
export {
  // Tipos base
  type CoauthoringProductType,
  type EntryStatus,

  // Diário Guiado
  type DiaryPrompt,
  type GuidedDiaryEntry,
  type GuidedDiaryResponse,
  type SaveGuidedDiaryRequest,

  // Cartas ao Bebê (Templates)
  type LetterTemplate,
  type LetterSection,
  type TemplatedLetter,
  type LetterTemplatesResponse,
  type SaveTemplatedLetterRequest,

  // Reflexões
  type ReflectionType,
  type NarrativeReflection,
  type ReflectionsResponse,
  type GenerateReflectionRequest,
  type AddUserReflectionRequest,

  // Contexto
  type CoauthoringContext,

  // Responses
  type CoauthoringSuccessResponse,
} from "./coauthoring";

// ============================================
// POSTPARTUM EXTENSION (v1.0)
// ============================================
export {
  // Tipos base
  type PostpartumProductType,
  type PostpartumPhase,
  type TransitionStatus,

  // Pilares
  type PostpartumPillar,
  POSTPARTUM_PILLAR_NAMES,
  POSTPARTUM_PILLAR_DESCRIPTIONS,

  // Transição
  type BirthInfo,
  type TransitionState,
  type WelcomeMessage,
  type StartTransitionRequest,
  type TransitionResponse,

  // Diário do Puerpério
  type PostpartumDiaryPrompt,
  type PostpartumDiaryEntry,
  type PostpartumDiaryResponse,
  type SavePostpartumDiaryRequest,

  // Check-in com Bebê
  type BabyCheckin,
  type CombinedCheckin,
  type CombinedCheckinResponse,
  type SaveCombinedCheckinRequest,

  // Screening PPD
  type PPDScreeningResult,

  // Contexto
  type PostpartumContext,

  // Responses
  type PostpartumSuccessResponse,
} from "./postpartum";

// ============================================
// PRODUCTS
// ============================================
export {
  // Types
  type ProductType,
  type Product,
  type ProductPrice,
  type ProductRecommendation,
  type RecommendationContext,
  type GetRecommendationsResponse,
  // Constants (samples)
  SAMPLE_DIGITAL_PRODUCTS,
  SAMPLE_JOURNEYS,
} from "./products";

// ============================================
// SYSTEM
// ============================================
export {
  // Types
  type SystemLimits,
  type SystemDisclaimers,
  type OutputLevel,
  type OutputLevelConfig,
  type FailSafeBehavior,
  type TimezoneConfig,
  type SessionConfig,
  type ApiErrorResponse,
  type ApiSuccessResponse,
  // Constants
  SYSTEM_LIMITS,
  SYSTEM_DISCLAIMERS,
  OUTPUT_LEVELS,
  FAIL_SAFE_BEHAVIOR,
  FAIL_SAFE_MESSAGE,
  TIMEZONE_CONFIG,
  SESSION_CONFIG,
} from "./system";