/**
 * @fluia/contracts - Training Types
 * 
 * Tipos relacionados à execução e feedback de treinos.
 * 
 * REGRA ÉTICA:
 * - Concluir treino é SEMPRE microvitória
 * - Feedback sempre positivo
 * - Esforço > Resultado
 */

import type { DateKey, MetricKey } from "./shared";

// ============================================
// EXECUÇÃO DE TREINO
// ============================================

/** Request para registrar treino iniciado */
export interface TrainingStartRequest {
  trainingId: string;
}

/** Request para registrar treino concluído */
export interface TrainingCompleteRequest {
  trainingId: string;
  
  /** Duração real em segundos */
  actualDurationSeconds?: number;
  
  /** Feedback opcional da usuária (1-5) */
  userRating?: 1 | 2 | 3 | 4 | 5;
  
  /** Notas opcionais */
  notes?: string;
}

/** Response ao concluir treino */
export interface TrainingCompleteResponse {
  /** Métricas foram atualizadas? */
  metricsUpdated: boolean;
  
  /** Feedback emocional para a usuária */
  feedback: string;
  
  /** Badge conquistado? */
  badgeAwarded: boolean;
  
  /** Nome do badge (se conquistado) */
  badgeName?: string;
  
  /** Elegível para micromomento? */
  micromomentEligible: boolean;
  
  /** Streak atual */
  currentStreak: number;
}

// ============================================
// TREINO ARMAZENADO
// ============================================

/**
 * Registro de treino executado.
 * Collection: profiles/{uid}/trainings/{id}
 */
export interface StoredTraining {
  /** ID único do registro */
  id: string;
  
  /** ID do treino do catálogo */
  trainingId: string;
  
  /** UID do usuário */
  uid: string;
  
  /** Chave do dia */
  dateKey: DateKey;
  
  /** Categoria do treino */
  category: MetricKey;
  
  /** Status */
  status: "started" | "completed" | "skipped";
  
  /** Duração planejada (minutos) */
  plannedDurationMinutes: number;
  
  /** Duração real (segundos) */
  actualDurationSeconds?: number;
  
  /** Avaliação da usuária */
  userRating?: 1 | 2 | 3 | 4 | 5;
  
  /** Notas */
  notes?: string;
  
  /** Timestamps */
  startedAt: string;
  completedAt?: string;
}

// ============================================
// FEEDBACK TEMPLATES
// ============================================

/**
 * Template de feedback pós-treino.
 * 
 * REGRA: Feedback SEMPRE positivo.
 * Foco no esforço, não no resultado.
 */
export interface FeedbackTemplate {
  /** Contexto de uso */
  context: "completion" | "streak" | "firstTime" | "difficult_day";
  
  /** Mensagens possíveis (escolha aleatória) */
  messages: string[];
}

/** Feedbacks padrão */
export const DEFAULT_FEEDBACKS: FeedbackTemplate[] = [
  {
    context: "completion",
    messages: [
      "Você esteve aqui. Isso já é cuidado. 💜",
      "Cada pequeno passo conta. Parabéns! ✨",
      "Cuidar de si é um ato de amor. 🌸",
      "Você dedicou esse momento a você. Isso importa. 💗",
    ],
  },
  {
    context: "streak",
    messages: [
      "Você está construindo um hábito de cuidado. Continue! 🌟",
      "Sua constância é inspiradora. 💪",
      "Dia após dia, você escolhe cuidar de si. 🌺",
    ],
  },
  {
    context: "firstTime",
    messages: [
      "Primeira prática concluída! Bem-vinda à jornada. 🎉",
      "O primeiro passo é sempre especial. Parabéns! 💜",
      "Você começou. Isso é o mais importante. ✨",
    ],
  },
  {
    context: "difficult_day",
    messages: [
      "Mesmo num dia difícil, você cuidou de si. Isso é força. 💜",
      "Não precisa ser perfeito. Só precisa ser possível. 🌸",
      "Você mostrou que se importa consigo. Isso basta. 💗",
    ],
  },
];

// ============================================
// BADGES
// ============================================

/**
 * Badge conquistável.
 */
export interface Badge {
  /** ID único */
  id: string;
  
  /** Nome do badge */
  name: string;
  
  /** Descrição */
  description: string;
  
  /** Emoji/ícone */
  icon: string;
  
  /** Condição para conquistar */
  condition: BadgeCondition;
}

/**
 * Condição para conquistar badge.
 */
export interface BadgeCondition {
  type: "streak" | "total_trainings" | "category_focus" | "first_checkin" | "first_training";
  
  /** Valor necessário (ex: 7 para streak de 7 dias) */
  value?: number;
  
  /** Categoria específica (para category_focus) */
  category?: MetricKey;
}

/** Badges padrão */
export const DEFAULT_BADGES: Badge[] = [
  {
    id: "first-step",
    name: "Primeiro Passo",
    description: "Completou seu primeiro treino",
    icon: "🌱",
    condition: { type: "first_training" },
  },
  {
    id: "week-streak",
    name: "Semana de Cuidado",
    description: "7 dias seguidos de prática",
    icon: "🌟",
    condition: { type: "streak", value: 7 },
  },
  {
    id: "month-streak",
    name: "Mês de Dedicação",
    description: "30 dias seguidos de prática",
    icon: "🏆",
    condition: { type: "streak", value: 30 },
  },
  {
    id: "regulation-master",
    name: "Mestre da Regulação",
    description: "10 treinos de Regulação Emocional",
    icon: "💜",
    condition: { type: "category_focus", value: 10, category: "RE" },
  },
  {
    id: "bond-builder",
    name: "Construtora de Vínculo",
    description: "10 treinos de Conexão Afetiva",
    icon: "💗",
    condition: { type: "category_focus", value: 10, category: "CA" },
  },
];

// ============================================
// STREAK
// ============================================

/**
 * Informações de streak do usuário.
 */
export interface StreakInfo {
  /** Streak atual */
  current: number;
  
  /** Maior streak já alcançado */
  longest: number;
  
  /** Data do último dia com treino */
  lastTrainingDate: DateKey;
  
  /** Streak vai quebrar hoje se não treinar? */
  atRisk: boolean;
}
