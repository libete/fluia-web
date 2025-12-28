/**
 * ============================================
 * ARQUIVO: packages/contracts/src/rituals.ts
 * ============================================
 * 
 * FLUIA — Rituals Contracts
 * 
 * Vocabulário oficial dos rituais da FLUIA.
 * Apenas tipos e estruturas que cruzam fronteiras.
 * 
 * CONCEITO:
 * - Rituais são momentos especiais de conexão
 * - Baseados em horário do dia ou eventos específicos
 * - PREMIUM ONLY
 * 
 * @version 1.0.0
 */

// ============================================
// TIPOS BASE
// ============================================

/**
 * Tipos de ritual disponíveis
 */
export type RitualType =
  | "morning"      // Ritual Matinal (5h-10h)
  | "evening"      // Ritual Noturno (19h-23h)
  | "sunday"       // Ritual de Domingo
  | "trimester";   // Ritual de Trimestre

/**
 * Momento do dia
 */
export type TimeOfDay = "morning" | "afternoon" | "evening" | "night";

/**
 * Status do ritual
 */
export type RitualStatus = "available" | "completed" | "missed" | "locked";

/**
 * Ações possíveis em um ritual
 */
export type RitualAction = "started" | "completed" | "skipped";

// ============================================
// EVENTO FACTUAL (persistido no Firestore)
// ============================================

/**
 * Evento factual de ritual.
 * 
 * Regras:
 * - Append-only (nunca editado)
 * - Representa algo que ACONTECEU
 * 
 * Caminho Firestore: profiles/{uid}/rituals/{eventId}
 */
export interface RitualEvent {
  /** ID único do ritual */
  ritualId: string;
  
  /** Tipo do ritual */
  type: RitualType;
  
  /** Ação realizada */
  action: RitualAction;
  
  /** Timestamp ISO do evento */
  timestamp: string;
  
  /** Data do ritual (YYYY-MM-DD) */
  date: string;
  
  /** Duração em segundos (se completado) */
  durationSeconds?: number;
  
  /** Contexto adicional */
  context?: {
    trimester?: 1 | 2 | 3;
    gestationalWeek?: number;
  };
}

// ============================================
// ETAPA DO RITUAL
// ============================================

/**
 * Tipo de etapa do ritual
 */
export type RitualStepType =
  | "breathing"      // Exercício de respiração
  | "meditation"     // Meditação guiada
  | "visualization"  // Visualização
  | "affirmation"    // Afirmação positiva
  | "gratitude"      // Gratidão
  | "intention"      // Intenção do dia
  | "reflection"     // Reflexão
  | "connection"     // Conexão com bebê
  | "closure";       // Encerramento

/**
 * Etapa individual do ritual
 */
export interface RitualStep {
  /** ID da etapa */
  stepId: string;
  
  /** Ordem da etapa */
  order: number;
  
  /** Tipo da etapa */
  type: RitualStepType;
  
  /** Título */
  title: string;
  
  /** Instrução principal */
  instruction: string;
  
  /** Duração sugerida em segundos */
  durationSeconds: number;
  
  /** Áudio guiado (se houver) */
  audioUrl?: string;
  
  /** Imagem de fundo */
  backgroundImage?: string;
}

// ============================================
// RITUAL COMPLETO
// ============================================

/**
 * Definição completa de um ritual
 */
export interface RitualDefinition {
  /** Tipo do ritual */
  type: RitualType;
  
  /** Título do ritual */
  title: string;
  
  /** Descrição curta */
  description: string;
  
  /** Mensagem de abertura */
  openingMessage: string;
  
  /** Mensagem do bebê */
  babyMessage: string;
  
  /** Duração total estimada em minutos */
  estimatedMinutes: number;
  
  /** Etapas do ritual */
  steps: RitualStep[];
  
  /** Mensagem de encerramento */
  closingMessage: string;
  
  /** Ícone */
  icon: string;
  
  /** Cores do tema */
  theme: {
    primary: string;
    background: string;
    accent: string;
  };
}

// ============================================
// SUGESTÃO (gerada pela Engine)
// ============================================

/**
 * Sugestão de ritual disponível
 */
export interface RitualSuggestion {
  /** ID único para tracking */
  ritualId: string;
  
  /** Tipo do ritual */
  type: RitualType;
  
  /** Status atual */
  status: RitualStatus;
  
  /** Título */
  title: string;
  
  /** Descrição curta */
  description: string;
  
  /** Mensagem do bebê (teaser) */
  babyTeaser: string;
  
  /** Duração estimada */
  estimatedMinutes: number;
  
  /** Ícone */
  icon: string;
  
  /** Janela de disponibilidade */
  availability: {
    /** Hora de início (0-23) */
    startHour: number;
    /** Hora de fim (0-23) */
    endHour: number;
    /** Expira em (ISO timestamp) */
    expiresAt: string;
  };
  
  /** Razão contextual */
  reason: string;
}

// ============================================
// CONTEXTO PARA AVALIAÇÃO
// ============================================

/**
 * Contexto para avaliar rituais disponíveis
 */
export interface RitualEvaluationContext {
  /** ID da usuária */
  uid: string;
  
  /** É premium? */
  isPremium: boolean;
  
  /** Hora atual (0-23) */
  currentHour: number;
  
  /** Dia da semana (0=domingo, 6=sábado) */
  dayOfWeek: number;
  
  /** Data atual (YYYY-MM-DD) */
  currentDate: string;
  
  /** Trimestre atual */
  trimester: 1 | 2 | 3;
  
  /** Semana gestacional */
  gestationalWeek: number;
  
  /** Trimestre mudou recentemente? */
  trimesterJustChanged: boolean;
  
  /** Nome do bebê */
  babyName?: string;
  
  /** Eventos passados */
  events: RitualEvent[];
}

// ============================================
// REQUESTS API
// ============================================

/**
 * Request para iniciar ritual
 */
export interface StartRitualRequest {
  ritualId: string;
  type: RitualType;
}

/**
 * Request para completar ritual
 */
export interface CompleteRitualRequest {
  ritualId: string;
  type: RitualType;
  durationSeconds: number;
}

/**
 * Request para pular ritual
 */
export interface SkipRitualRequest {
  ritualId: string;
  type: RitualType;
}

// ============================================
// RESPONSES API
// ============================================

/**
 * Resposta do GET /api/ritual
 */
export interface RitualEvaluationResponse {
  /** Rituais disponíveis agora */
  available: RitualSuggestion[];
  
  /** Próximo ritual (se nenhum disponível agora) */
  next?: {
    type: RitualType;
    availableAt: string;
    title: string;
  };
}

/**
 * Resposta do GET /api/ritual/:type
 */
export interface GetRitualResponse {
  /** Definição completa do ritual */
  ritual: RitualDefinition;
  
  /** Personalização para a usuária */
  personalization: {
    babyName: string;
    gestationalWeek: number;
    trimester: 1 | 2 | 3;
  };
}

/**
 * Resposta do POST /api/ritual/start
 */
export interface StartRitualResponse {
  success: boolean;
  ritual: RitualDefinition;
}

/**
 * Resposta do POST /api/ritual/complete
 */
export interface CompleteRitualResponse {
  success: boolean;
  /** Mensagem de parabéns */
  congratsMessage: string;
  /** Streak de rituais */
  streak?: number;
}

/**
 * Resposta do POST /api/ritual/skip
 */
export interface SkipRitualResponse {
  success: boolean;
}