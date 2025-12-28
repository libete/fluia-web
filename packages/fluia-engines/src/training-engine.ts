/**
 * @fluia/engines - Training Engine
 * 
 * ENGINE 4: Gerencia execução e feedback de treinos.
 * 
 * RESPONSABILIDADE:
 * - Validar conclusão de treino
 * - Coletar feedback simples
 * - Calcular streaks e badges
 * - SEMPRE reconhecer esforço, não resultado
 * 
 * REGRAS FUNDAMENTAIS (Documento p.18):
 * - Taxa de sucesso esperada ≥ 90%
 * - Feedback sempre positivo
 * - Foco na experiência, não no desempenho
 * - Concluir = microvitória
 */

import type { TrainingPrescription } from "./prescription-engine";

// ============================================
// TYPES
// ============================================

export type FeedbackTone = "warm" | "celebratory" | "gentle";

export interface TrainingFeedback {
  /** Mensagem de reconhecimento */
  message: string;
  /** Tom do feedback */
  tone: FeedbackTone;
  /** Se ganhou badge */
  badgeAwarded?: Badge;
}

export interface Badge {
  /** ID único do badge */
  id: string;
  /** Nome do badge */
  name: string;
  /** Descrição */
  description: string;
  /** Emoji/ícone */
  icon: string;
}

export interface StreakInfo {
  /** Dias consecutivos */
  current: number;
  /** Maior sequência já alcançada */
  longest: number;
  /** Se está em risco de perder (última prática >24h) */
  atRisk: boolean;
}

export interface TrainingCompleteInput {
  /** Treino completado */
  training: TrainingPrescription;
  /** Tempo real gasto (segundos) */
  actualDurationSeconds: number;
  /** Feedback opcional da usuária */
  userFeedback?: {
    /** Como se sentiu após (1-5) */
    emotionalShift?: 1 | 2 | 3 | 4 | 5;
    /** Esforço percebido (1-5) */
    perceivedEffort?: 1 | 2 | 3 | 4 | 5;
  };
  /** Histórico de treinos (para calcular streaks) */
  trainingHistory?: {
    lastCompletedDate?: string; // YYYY-MM-DD
    currentStreak?: number;
    longestStreak?: number;
    totalCompleted?: number;
  };
}

export interface TrainingCompleteResponse {
  /** Feedback imediato */
  feedback: TrainingFeedback;
  /** Badge conquistado (se aplicável) */
  badgeAwarded?: Badge;
  /** Se ficou elegível para micromoment */
  micromomentEligible: boolean;
  /** Informações de streak atualizadas */
  streakInfo: StreakInfo;
}

// ============================================
// CONSTANTS
// ============================================

/** Catálogo de badges */
const BADGE_CATALOG: Badge[] = [
  {
    id: "first-step",
    name: "Primeiro Passo",
    description: "Você completou seu primeiro treino!",
    icon: "🌱",
  },
  {
    id: "week-streak",
    name: "Uma Semana",
    description: "7 dias seguidos cuidando de você!",
    icon: "✨",
  },
  {
    id: "month-streak",
    name: "Um Mês",
    description: "30 dias de presença e cuidado!",
    icon: "🌟",
  },
  {
    id: "breathing-master",
    name: "Respiração Consciente",
    description: "Completou 10 treinos de respiração",
    icon: "🌬️",
  },
  {
    id: "bond-master",
    name: "Conexão Profunda",
    description: "Completou 10 treinos de vínculo",
    icon: "💗",
  },
  {
    id: "mindfulness-master",
    name: "Atenção Plena",
    description: "Completou 10 treinos de mindfulness",
    icon: "🧘",
  },
];

/** Templates de feedback por tom */
const FEEDBACK_TEMPLATES = {
  warm: [
    "Você dedicou esse tempo para vocês duas. Isso importa. 💜",
    "Cada treino é um cuidado. E você acabou de se cuidar. 🌸",
    "Parar para praticar já é uma vitória. Parabéns! ✨",
  ],
  celebratory: [
    "Incrível! Você está construindo um hábito lindo! 🌟",
    "Que orgulho! Mais um treino completado! 🎉",
    "Você está indo tão bem! Continue assim! 💪",
  ],
  gentle: [
    "Você fez o possível hoje. E isso é suficiente. 💜",
    "Obrigada por esse momento de presença. 🌸",
    "Concluir é sempre uma vitória, não importa como foi. ✨",
  ],
} as const;

// ============================================
// CORE FUNCTIONS
// ============================================

/**
 * Verifica se treino foi completado (>= 70% do tempo esperado).
 */
function isTrainingCompleted(
  expectedMinutes: number,
  actualSeconds: number
): boolean {
  const expectedSeconds = expectedMinutes * 60;
  const threshold = expectedSeconds * 0.7; // 70% mínimo
  return actualSeconds >= threshold;
}

/**
 * Calcula streak atualizado.
 */
function calculateStreak(
  lastCompletedDate: string | undefined,
  currentStreak: number = 0,
  longestStreak: number = 0
): StreakInfo {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

  if (!lastCompletedDate) {
    // Primeiro treino
    return {
      current: 1,
      longest: Math.max(1, longestStreak),
      atRisk: false,
    };
  }

  // Calcular diferença em dias
  const lastDate = new Date(lastCompletedDate);
  const todayDate = new Date(today);
  const diffDays = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  let newCurrent = currentStreak;
  let atRisk = false;

  if (diffDays === 0) {
    // Mesmo dia - mantém streak
    newCurrent = currentStreak;
  } else if (diffDays === 1) {
    // Dia seguido - aumenta streak
    newCurrent = currentStreak + 1;
  } else {
    // Quebrou streak
    newCurrent = 1;
  }

  // Streak em risco se última prática foi há 1 dia
  atRisk = diffDays === 1;

  return {
    current: newCurrent,
    longest: Math.max(newCurrent, longestStreak),
    atRisk,
  };
}

/**
 * Verifica se deve conceder badge.
 */
function checkBadgeAward(
  totalCompleted: number,
  currentStreak: number,
  trainingType: string
): Badge | undefined {
  // Primeiro treino
  if (totalCompleted === 1) {
    return BADGE_CATALOG.find(b => b.id === "first-step");
  }

  // Streak de 7 dias
  if (currentStreak === 7) {
    return BADGE_CATALOG.find(b => b.id === "week-streak");
  }

  // Streak de 30 dias
  if (currentStreak === 30) {
    return BADGE_CATALOG.find(b => b.id === "month-streak");
  }

  // Masters (10 treinos do mesmo tipo)
  // TODO: implementar contagem por tipo quando tivermos histórico detalhado

  return undefined;
}

/**
 * Seleciona mensagem de feedback apropriada.
 */
function selectFeedback(
  tone: FeedbackTone,
  hasStreak: boolean
): string {
  const templates = FEEDBACK_TEMPLATES[tone];
  const randomIndex = Math.floor(Math.random() * templates.length);
  return templates[randomIndex];
}

/**
 * Determina tom do feedback baseado no estado.
 */
function determineFeedbackTone(
  userFeedback?: TrainingCompleteInput["userFeedback"],
  currentStreak?: number
): FeedbackTone {
  // Se tem streak alto, celebrar
  if (currentStreak && currentStreak >= 3) {
    return "celebratory";
  }

  // Se usuária se sentiu mal, ser gentil
  if (userFeedback?.emotionalShift && userFeedback.emotionalShift <= 2) {
    return "gentle";
  }

  // Padrão: warm
  return "warm";
}

/**
 * Verifica se ficou elegível para micromoment.
 * (Micromoment só é oferecido após treino completado com sucesso)
 */
function checkMicromomentEligibility(
  completed: boolean,
  emotionalShift?: number
): boolean {
  if (!completed) return false;

  // Se usuária se sentiu mal, não oferecer micromoment
  if (emotionalShift && emotionalShift <= 2) return false;

  return true;
}

// ============================================
// MAIN ENGINE FUNCTION
// ============================================

/**
 * ENGINE 4: Training Engine
 * 
 * Processa conclusão de treino e gera feedback.
 * 
 * @param input - Treino + duração + feedback da usuária
 * @returns TrainingCompleteResponse - Feedback + badge + streak
 */
export function processTrainingCompletion(
  input: TrainingCompleteInput
): TrainingCompleteResponse {
  const {
    training,
    actualDurationSeconds,
    userFeedback,
    trainingHistory = {},
  } = input;

  // 1. Verificar se foi completado
  const completed = isTrainingCompleted(
    training.durationMinutes,
    actualDurationSeconds
  );

  if (!completed) {
    // Treino não completado - feedback gentil
    return {
      feedback: {
        message: "Tudo bem não completar. Você já fez o importante: parou para tentar. 💜",
        tone: "gentle",
      },
      micromomentEligible: false,
      streakInfo: {
        current: trainingHistory.currentStreak || 0,
        longest: trainingHistory.longestStreak || 0,
        atRisk: false,
      },
    };
  }

  // 2. Calcular streak
  const streakInfo = calculateStreak(
    trainingHistory.lastCompletedDate,
    trainingHistory.currentStreak,
    trainingHistory.longestStreak
  );

  // 3. Verificar badge
  const totalCompleted = (trainingHistory.totalCompleted || 0) + 1;
  const badgeAwarded = checkBadgeAward(
    totalCompleted,
    streakInfo.current,
    training.type
  );

  // 4. Determinar tom do feedback
  const tone = determineFeedbackTone(userFeedback, streakInfo.current);

  // 5. Selecionar mensagem
  const message = selectFeedback(tone, streakInfo.current > 1);

  // 6. Verificar elegibilidade para micromoment
  const micromomentEligible = checkMicromomentEligibility(
    completed,
    userFeedback?.emotionalShift
  );

  return {
    feedback: {
      message,
      tone,
      badgeAwarded,
    },
    badgeAwarded,
    micromomentEligible,
    streakInfo,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Retorna todos os badges disponíveis.
 */
export function getAllBadges(): Badge[] {
  return [...BADGE_CATALOG];
}

/**
 * Busca badge por ID.
 */
export function getBadgeById(id: string): Badge | undefined {
  return BADGE_CATALOG.find(b => b.id === id);
}

/**
 * Calcula percentual de conclusão do treino.
 */
export function calculateCompletionPercentage(
  expectedMinutes: number,
  actualSeconds: number
): number {
  const expectedSeconds = expectedMinutes * 60;
  const percentage = (actualSeconds / expectedSeconds) * 100;
  return Math.min(100, Math.round(percentage));
}
