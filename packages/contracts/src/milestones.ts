/**
 * FLUIA — Milestones Contracts
 * 
 * Vocabulário oficial dos marcos da FLUIA.
 * Apenas tipos e estruturas que cruzam fronteiras.
 * 
 * ❌ Não contém: regras, decisões, condições, redirects
 * ✅ Contém: eventos factuais, tipos, respostas neutras
 * 
 * CONCEITO:
 * - Marcos são CELEBRAÇÕES, não ofertas
 * - FREE vê celebração básica
 * - PREMIUM vê celebração + produto exclusivo
 * - Cada marco acontece UMA VEZ (não tem cooldown)
 * 
 * @version 1.0.0
 */

// ============================================
// TIPOS BASE
// ============================================

/**
 * Tipos de marco de PRESENÇA
 * Baseados em dias de check-in (presenceDays)
 */
export type PresenceMilestoneType =
  | "PRESENCE_7"    // 7 dias de presença
  | "PRESENCE_30"   // 30 dias de presença
  | "PRESENCE_60"   // 60 dias de presença
  | "PRESENCE_100"  // 100 dias de presença
  | "JOURNEY_COMPLETE"; // Jornada completa (pós-parto)

/**
 * Tipos de marco GESTACIONAL
 * Baseados em semana gestacional
 */
export type GestationalMilestoneType =
  | "NEW_WEEK"        // Nova semana (toda semana)
  | "TRIMESTER_1_END" // Fim do 1º trimestre (semana 14)
  | "TRIMESTER_2_END" // Fim do 2º trimestre (semana 28)
  | "TERM_37"         // Termo (semana 37)
  | "DUE_DATE_40";    // DPP (semana 40)

/**
 * Todos os tipos de marco
 */
export type MilestoneType = PresenceMilestoneType | GestationalMilestoneType;

/**
 * Categoria do marco
 */
export type MilestoneCategory = "presence" | "gestational";

/**
 * Ações possíveis em um marco
 * 
 * shown: marco foi apresentado
 * dismissed: usuária fechou sem interagir
 * explored: usuária explorou o produto (Premium)
 */
export type MilestoneAction = "shown" | "dismissed" | "explored";

// ============================================
// EVENTO FACTUAL (persistido no Firestore)
// ============================================

/**
 * Evento factual de marco.
 * 
 * Regras:
 * - Append-only (nunca editado)
 * - Representa algo que ACONTECEU
 * - Cada marco só acontece UMA VEZ
 * 
 * Caminho Firestore: profiles/{uid}/milestones/{eventId}
 */
export interface MilestoneEvent {
  /** ID único do marco */
  milestoneId: string;
  
  /** Tipo do marco */
  type: MilestoneType;
  
  /** Categoria */
  category: MilestoneCategory;
  
  /** Ação realizada */
  action: MilestoneAction;
  
  /** Timestamp ISO do evento */
  timestamp: string;
  
  /** Contexto adicional */
  context?: {
    /** Dias de presença no momento */
    presenceDays?: number;
    /** Semana gestacional no momento */
    gestationalWeek?: number;
    /** Trimestre no momento */
    trimester?: 1 | 2 | 3;
  };
}

// ============================================
// SUGESTÃO (gerada pela Engine, não persistida)
// ============================================

/**
 * Badge visual do marco
 */
export interface MilestoneBadge {
  /** Emoji ou ícone */
  icon: string;
  /** Cor primária (hex) */
  color: string;
  /** Nome do badge */
  name: string;
}

/**
 * Produto exclusivo do marco (Premium)
 */
export interface MilestoneProduct {
  /** ID do produto */
  productId: string;
  /** Tipo do produto */
  productType: 
    | "special_letter"      // Carta especial do bebê
    | "monthly_compilation" // Compilação mensal
    | "evolution_report"    // Relatório de evolução
    | "retrospective"       // Retrospectiva completa
    | "certificate"         // Certificado de jornada
    | "week_letter"         // Carta da semana
    | "trimester_closure"   // Encerramento de trimestre
    | "term_special"        // Especial de termo
    | "journey_book";       // Livro da jornada
  /** Título do produto */
  title: string;
  /** Descrição curta */
  description: string;
  /** Disponível apenas para Premium */
  premiumOnly: boolean;
}

/**
 * Sugestão de marco gerada pela Engine.
 * 
 * Regras:
 * - Calculada em tempo real
 * - Não é persistida
 * - UI decide como apresentar
 */
export interface MilestoneSuggestion {
  /** ID único para tracking */
  milestoneId: string;
  
  /** Tipo do marco */
  type: MilestoneType;
  
  /** Categoria */
  category: MilestoneCategory;
  
  /** Título da celebração */
  title: string;
  
  /** Mensagem de celebração (FREE) */
  celebrationMessage: string;
  
  /** Mensagem do bebê (contextual) */
  babyMessage: string;
  
  /** Badge visual */
  badge: MilestoneBadge;
  
  /** Produto exclusivo (Premium) */
  product?: MilestoneProduct;
  
  /** Tom da mensagem */
  tone: "celebratory" | "reflective" | "emotional";
  
  /** Dados contextuais para personalização */
  contextData: {
    /** Valor numérico do marco (dias ou semana) */
    value: number;
    /** Label formatado ("7 dias", "Semana 24") */
    label: string;
  };
}

// ============================================
// CONTEXTO PARA AVALIAÇÃO (input da Engine)
// ============================================

/**
 * Contexto necessário para avaliar marcos.
 * Passado para a Engine, não persistido.
 */
export interface MilestoneEvaluationContext {
  /** ID da usuária */
  uid: string;
  
  /** Dias de presença (check-ins únicos) */
  presenceDays: number;
  
  /** Jornadas completas */
  completedJourneys: number;
  
  /** Semana gestacional atual */
  gestationalWeek: number;
  
  /** Semana gestacional do último check-in */
  lastGestationalWeek?: number;
  
  /** Trimestre atual (1, 2, 3) */
  trimester: 1 | 2 | 3;
  
  /** É premium? */
  isPremium: boolean;
  
  /** Bebê já nasceu? */
  isPostpartum: boolean;
  
  /** Nome do bebê (para mensagens) */
  babyName?: string;
  
  /** Eventos de marco passados */
  events: MilestoneEvent[];
}

// ============================================
// REQUESTS API
// ============================================

/**
 * Request para marcar marco como visto
 */
export interface MarkMilestoneSeenRequest {
  milestoneId: string;
  type: MilestoneType;
}

/**
 * Request para explorar produto do marco
 */
export interface ExploreMilestoneProductRequest {
  milestoneId: string;
  type: MilestoneType;
  productId: string;
}

// ============================================
// RESPONSES API
// ============================================

/**
 * Resposta do GET /api/milestone
 */
export interface MilestoneEvaluationResponse {
  /** Marcos pendentes (pode ter mais de 1) */
  milestones: MilestoneSuggestion[];
  
  /** Quantidade de marcos pendentes */
  count: number;
}

/**
 * Resposta do POST /api/milestone/seen
 */
export interface MarkMilestoneSeenResponse {
  success: boolean;
}

/**
 * Resposta do POST /api/milestone/explore
 */
export interface ExploreMilestoneProductResponse {
  success: boolean;
  /** Conteúdo do produto (se Premium) */
  content?: {
    type: string;
    data: unknown;
  };
  /** Mensagem se não for Premium */
  message?: string;
}