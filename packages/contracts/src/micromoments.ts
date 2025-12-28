/**
 * FLUIA — Micromoments Contracts
 * 
 * Vocabulário oficial da monetização FLUIA.
 * Apenas tipos e estruturas que cruzam fronteiras.
 * 
 * ❌ Não contém: regras, decisões, condições, redirects
 * ✅ Contém: eventos factuais, tipos, respostas neutras
 * 
 * REGRAS CANÔNICAS (v1.0):
 * - Check-in mede intenção
 * - Jornada completa mede transformação
 * - Monetização exige transformação
 * 
 * @version 1.1.0
 */

// ============================================
// TIPOS BASE
// ============================================

/**
 * Tipos de micromomento disponíveis no catálogo v1.0
 * 
 * MM2: Rituais de Conexão (após 7 dias + zona 4-5)
 * MM3: Interpretação da Conexão (após prática satisfatória)
 * MM4: Relatório Semanal (7+ jornadas completas)
 */
export type MicromomentType = "MM2" | "MM3" | "MM4";

/**
 * Ações possíveis em um micromomento
 * 
 * shown: micromomento foi apresentado
 * dismiss: usuária ignorou/fechou
 * accept: usuária clicou para saber mais
 */
export type MicromomentAction = "shown" | "dismiss" | "accept";

// ============================================
// EVENTO FACTUAL (persistido no Firestore)
// ============================================

/**
 * Evento factual de micromomento.
 * 
 * Regras:
 * - Append-only (nunca editado)
 * - Representa algo que ACONTECEU
 * - Não é interpretação ou previsão
 * 
 * Caminho Firestore: profiles/{uid}/micromoments/{eventId}
 */
export interface MicromomentEvent {
  /** ID único do micromomento apresentado */
  micromomentId: string;
  
  /** Tipo do micromomento */
  type: MicromomentType;
  
  /** Ação realizada */
  action: MicromomentAction;
  
  /** Timestamp ISO do evento */
  timestamp: string;
  
  /** Contexto opcional (para analytics futuros) */
  context?: {
    zone?: number;
    pillar?: string;
  };
}

// ============================================
// SUGESTÃO (gerada pela Engine, não persistida)
// ============================================

/**
 * Sugestão de micromomento gerada pela Engine.
 * 
 * Regras:
 * - Calculada em tempo real
 * - Não é persistida
 * - UI pode ignorar ou modificar apresentação
 */
export interface MicromomentSuggestion {
  /** ID único para tracking */
  micromomentId: string;
  
  /** Tipo do micromomento */
  type: MicromomentType;
  
  /** Título sugerido (UI pode modificar) */
  title: string;
  
  /** Mensagem sugerida (UI pode modificar) */
  message: string;
  
  /** Tom da mensagem - hint para UI */
  tone: "gentle" | "reflective";
  
  /** Razão contextual (não é venda) */
  reason: string;
}

// ============================================
// CONTEXTO PARA AVALIAÇÃO (input da Engine)
// ============================================

/**
 * Contexto necessário para avaliar elegibilidade.
 * Passado para a Engine, não persistido.
 * 
 * MÉTRICAS DISTINTAS:
 * - presenceDays: check-ins únicos (mede intenção/vínculo)
 * - completedJourneys: dias com dayCompleted=true (mede transformação)
 */
export interface MicromomentEvaluationContext {
  /** ID da usuária */
  uid: string;
  
  /** 
   * Dias de presença (check-ins únicos)
   * Usado para: grace period
   * Responde: "Essa usuária voltou porque algo fez sentido?"
   */
  presenceDays: number;
  
  /**
   * Jornadas completas (dayCompleted === true)
   * Usado para: MM4 eligibility
   * Responde: "Temos dados suficientes para relatório real?"
   */
  completedJourneys: number;
  
  /** Zona emocional atual (1-5) */
  zone: number;
  
  /** Pilar do check-in atual */
  pillar?: string;
  
  /** Nível de risco emocional (1-5) */
  riskLevel: number;
  
  /** Prática foi completada hoje? */
  practiceCompletedToday: boolean;
  
  /** É primeiro acesso do dia? */
  isFirstAccessToday: boolean;
  
  /** Fez check-in hoje? */
  hasCheckinToday: boolean;
  
  /** É premium? */
  isPremium: boolean;
  
  /** Eventos passados (para cálculo de cooldown) */
  events: MicromomentEvent[];
}

// ============================================
// REQUESTS API
// ============================================

/**
 * Request para aceitar micromomento
 */
export interface AcceptMicromomentRequest {
  micromomentId: string;
  type: MicromomentType;
}

/**
 * Request para dispensar micromomento
 */
export interface DismissMicromomentRequest {
  micromomentId: string;
  type: MicromomentType;
}

// ============================================
// RESPONSES API
// ============================================

/**
 * Ação sugerida após evento.
 * UI decide o que fazer com isso.
 * 
 * none: nada a fazer
 * premium-info: mostrar informações premium
 * learn-more: mostrar mais detalhes
 */
export type MicromomentNextAction = "none" | "premium-info" | "learn-more";

/**
 * Resposta do GET /api/micromoment
 */
export interface MicromomentEvaluationResponse {
  /** Sugestão (null se não elegível) */
  suggestion: MicromomentSuggestion | null;
}

/**
 * Resposta do POST /api/micromoment/accept
 */
export interface AcceptMicromomentResponse {
  success: boolean;
  nextAction: MicromomentNextAction;
}

/**
 * Resposta do POST /api/micromoment/dismiss
 */
export interface DismissMicromomentResponse {
  success: boolean;
}