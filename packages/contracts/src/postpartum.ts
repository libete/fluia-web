/**
 * ============================================
 * ARQUIVO: packages/contracts/src/postpartum.ts
 * ============================================
 * 
 * FLUIA — Postpartum Extension Contracts
 * 
 * Vocabulário oficial da extensão puerpério da FLUIA.
 * Apenas tipos e estruturas que cruzam fronteiras.
 * 
 * CONCEITO:
 * - Transição suave da gravidez para o puerpério
 * - Novos pilares adaptados à realidade pós-parto
 * - Check-in com bebê nascido (nova dinâmica)
 * - PREMIUM ONLY (extensão natural do plano)
 * 
 * @version 1.0.0
 */

// ============================================
// TIPOS BASE
// ============================================

/**
 * Tipos de produto de puerpério
 */
export type PostpartumProductType =
  | "transition"        // Transição Pós-Parto
  | "diary"             // Diário do Puerpério
  | "baby_checkin";     // Check-in com Bebê Nascido

/**
 * Fase do puerpério
 */
export type PostpartumPhase =
  | "immediate"    // 0-10 dias (puerpério imediato)
  | "early"        // 11-45 dias (puerpério tardio)
  | "late"         // 46-90 dias (puerpério remoto)
  | "extended";    // 90+ dias

/**
 * Status da transição
 */
export type TransitionStatus =
  | "pending"      // Ainda grávida
  | "initiated"    // Bebê nasceu, transição iniciada
  | "in_progress"  // Em processo de adaptação
  | "completed";   // Transição concluída

// ============================================
// PILARES DO PUERPÉRIO
// ============================================

/**
 * Pilares adaptados para o puerpério
 * (diferentes da gravidez)
 */
export type PostpartumPillar =
  | "RF"   // Recuperação Física
  | "SE"   // Saúde Emocional
  | "VB"   // Vínculo com Bebê
  | "RA";  // Rede de Apoio

export const POSTPARTUM_PILLAR_NAMES: Record<PostpartumPillar, string> = {
  RF: "Recuperação Física",
  SE: "Saúde Emocional",
  VB: "Vínculo com Bebê",
  RA: "Rede de Apoio",
};

export const POSTPARTUM_PILLAR_DESCRIPTIONS: Record<PostpartumPillar, string> = {
  RF: "Como seu corpo está se recuperando do parto",
  SE: "Suas emoções e bem-estar mental",
  VB: "A conexão e cuidado com seu bebê",
  RA: "O suporte que você está recebendo",
};

// ============================================
// TRANSIÇÃO PÓS-PARTO
// ============================================

/**
 * Informações do nascimento
 */
export interface BirthInfo {
  /** Data do nascimento */
  birthDate: string;
  
  /** Hora do nascimento */
  birthTime?: string;
  
  /** Tipo de parto */
  birthType: "vaginal" | "cesarean" | "other";
  
  /** Peso do bebê (gramas) */
  babyWeightGrams?: number;
  
  /** Altura do bebê (cm) */
  babyHeightCm?: number;
  
  /** Nome final do bebê */
  babyName: string;
  
  /** Sexo do bebê (se quiser revelar) */
  babySex?: "male" | "female" | "prefer_not_say";
  
  /** Local do nascimento */
  birthPlace?: string;
  
  /** Notas pessoais sobre o parto */
  birthNotes?: string;
}

/**
 * Estado da transição
 */
export interface TransitionState {
  /** Status atual */
  status: TransitionStatus;
  
  /** Informações do nascimento */
  birthInfo?: BirthInfo;
  
  /** Fase atual do puerpério */
  phase: PostpartumPhase;
  
  /** Dias desde o nascimento */
  daysSinceBirth: number;
  
  /** Semanas desde o nascimento */
  weeksSinceBirth: number;
  
  /** Data de início da transição */
  transitionStartedAt?: string;
  
  /** Data de conclusão da transição */
  transitionCompletedAt?: string;
  
  /** Etapas de onboarding completadas */
  onboardingSteps: {
    birthInfoCompleted: boolean;
    firstPostpartumCheckin: boolean;
    pillarsIntroduced: boolean;
    firstBabyCheckin: boolean;
  };
}

/**
 * Mensagem de boas-vindas ao puerpério
 */
export interface WelcomeMessage {
  /** Título */
  title: string;
  
  /** Mensagem principal */
  message: string;
  
  /** Mensagem do bebê */
  babyMessage: string;
  
  /** Dicas para a fase */
  tips: string[];
  
  /** O que muda na FLUIA */
  changes: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
}

/**
 * Request para iniciar transição
 */
export interface StartTransitionRequest {
  birthInfo: BirthInfo;
}

/**
 * Resposta da transição
 */
export interface TransitionResponse {
  state: TransitionState;
  welcomeMessage?: WelcomeMessage;
}

// ============================================
// DIÁRIO DO PUERPÉRIO
// ============================================

/**
 * Prompt específico para puerpério
 */
export interface PostpartumDiaryPrompt {
  /** ID do prompt */
  promptId: string;
  
  /** Categoria */
  category:
    | "recovery"      // Recuperação física
    | "emotion"       // Estado emocional
    | "bonding"       // Vínculo com bebê
    | "support"       // Rede de apoio
    | "sleep"         // Sono (da mãe)
    | "feeding"       // Amamentação/alimentação
    | "identity"      // Nova identidade
    | "relationship"; // Relacionamentos
  
  /** Texto do prompt */
  text: string;
  
  /** Fase do puerpério relevante */
  relevantPhases: PostpartumPhase[];
  
  /** Placeholder */
  placeholder: string;
  
  /** Dica de escrita */
  writingTip?: string;
}

/**
 * Entrada do diário do puerpério
 */
export interface PostpartumDiaryEntry {
  /** ID da entrada */
  entryId: string;
  
  /** Data */
  date: string;
  
  /** Dias desde o nascimento */
  daysSinceBirth: number;
  
  /** Fase do puerpério */
  phase: PostpartumPhase;
  
  /** Prompt usado */
  prompt: PostpartumDiaryPrompt;
  
  /** Resposta */
  response: string;
  
  /** Contexto emocional */
  emotionalContext: {
    zone: number;
    dominantPillar: PostpartumPillar;
  };
  
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
  
  /** Tags */
  tags?: string[];
  
  /** Foto */
  photoUrl?: string;
}

/**
 * Resposta do diário do puerpério
 */
export interface PostpartumDiaryResponse {
  /** Entradas */
  entries: PostpartumDiaryEntry[];
  
  /** Prompt sugerido */
  todayPrompt: PostpartumDiaryPrompt;
  
  /** Alternativas */
  alternativePrompts: PostpartumDiaryPrompt[];
  
  /** Estatísticas */
  stats: {
    totalEntries: number;
    streakDays: number;
    favoriteCategory: string;
  };
}

/**
 * Request para salvar entrada
 */
export interface SavePostpartumDiaryRequest {
  entryId?: string;
  promptId: string;
  response: string;
  tags?: string[];
  photoUrl?: string;
}

// ============================================
// CHECK-IN COM BEBÊ NASCIDO
// ============================================

/**
 * Check-in do bebê
 */
export interface BabyCheckin {
  /** ID do check-in */
  checkinId: string;
  
  /** Data */
  date: string;
  
  /** Dias de vida */
  daysOld: number;
  
  /** Semanas de vida */
  weeksOld: number;
  
  /** Sono (horas nas últimas 24h) */
  sleepHours?: number;
  
  /** Mamadas/alimentações */
  feedingCount?: number;
  
  /** Humor do bebê (1-5) */
  babyMood: number;
  
  /** Marcos observados */
  milestones?: string[];
  
  /** Peso atual (se pesou) */
  currentWeightGrams?: number;
  
  /** Observações */
  notes?: string;
  
  /** Foto do dia */
  photoUrl?: string;
  
  /** Timestamp */
  createdAt: string;
}

/**
 * Check-in combinado (mãe + bebê)
 */
export interface CombinedCheckin {
  /** ID do check-in */
  checkinId: string;
  
  /** Data */
  date: string;
  
  /** Dias desde nascimento */
  daysSinceBirth: number;
  
  /** Fase do puerpério */
  phase: PostpartumPhase;
  
  /** Check-in da mãe */
  motherCheckin: {
    /** Zona emocional (1-5) */
    zone: number;
    
    /** Scores dos pilares */
    scores: Record<PostpartumPillar, number>;
    
    /** Como dormiu */
    sleepQuality: 1 | 2 | 3 | 4 | 5;
    
    /** Horas de sono */
    sleepHours?: number;
    
    /** Nível de dor (0-10) */
    painLevel?: number;
    
    /** Está amamentando? */
    isBreastfeeding?: boolean;
    
    /** Dificuldades com amamentação */
    breastfeedingChallenges?: string[];
  };
  
  /** Check-in do bebê */
  babyCheckin: BabyCheckin;
  
  /** Mensagem gerada */
  generatedMessage: string;
  
  /** Prática sugerida */
  suggestedPractice?: {
    type: string;
    name: string;
    reason: string;
  };
  
  /** Timestamp */
  createdAt: string;
}

/**
 * Resposta do check-in combinado
 */
export interface CombinedCheckinResponse {
  /** Check-in salvo */
  checkin: CombinedCheckin;
  
  /** Mensagem de acolhimento */
  welcomeMessage: string;
  
  /** Insights */
  insights?: Array<{
    type: "tip" | "warning" | "celebration";
    title: string;
    message: string;
    icon: string;
  }>;
  
  /** Deve mostrar alerta? */
  showAlert?: {
    type: "ppd_screening" | "support_needed" | "medical_attention";
    message: string;
    action: string;
  };
}

/**
 * Request para check-in combinado
 */
export interface SaveCombinedCheckinRequest {
  motherCheckin: {
    zone: number;
    scores: Record<PostpartumPillar, number>;
    sleepQuality: 1 | 2 | 3 | 4 | 5;
    sleepHours?: number;
    painLevel?: number;
    isBreastfeeding?: boolean;
    breastfeedingChallenges?: string[];
  };
  babyCheckin: {
    sleepHours?: number;
    feedingCount?: number;
    babyMood: number;
    milestones?: string[];
    currentWeightGrams?: number;
    notes?: string;
    photoUrl?: string;
  };
}

// ============================================
// SCREENING DE DEPRESSÃO PÓS-PARTO
// ============================================

/**
 * Resultado do screening simplificado
 * (Baseado em Edinburgh Postnatal Depression Scale simplificada)
 */
export interface PPDScreeningResult {
  /** Score total */
  score: number;
  
  /** Nível de risco */
  riskLevel: "low" | "moderate" | "high";
  
  /** Recomendação */
  recommendation: string;
  
  /** Deve sugerir ajuda profissional? */
  suggestProfessionalHelp: boolean;
  
  /** Data do screening */
  screenedAt: string;
}

// ============================================
// CONTEXTO PARA GERAÇÃO
// ============================================

/**
 * Contexto do puerpério
 */
export interface PostpartumContext {
  /** ID da usuária */
  uid: string;
  
  /** É premium? */
  isPremium: boolean;
  
  /** Nome do bebê */
  babyName: string;
  
  /** Nome da mãe */
  motherName?: string;
  
  /** Informações do nascimento */
  birthInfo: BirthInfo;
  
  /** Fase atual */
  phase: PostpartumPhase;
  
  /** Dias desde nascimento */
  daysSinceBirth: number;
  
  /** Semanas desde nascimento */
  weeksSinceBirth: number;
  
  /** Zona emocional média recente */
  recentAvgZone: number;
  
  /** Está amamentando? */
  isBreastfeeding: boolean;
}

// ============================================
// RESPONSES API GERAIS
// ============================================

/**
 * Resposta de sucesso
 */
export interface PostpartumSuccessResponse {
  success: boolean;
  message?: string;
}