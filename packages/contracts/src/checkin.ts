/**
 * @fluia/contracts - Check-in Types
 * 
 * Tipos relacionados ao check-in diário.
 * 
 * REGRA FUNDAMENTAL:
 * O check-in é a ÚNICA fonte primária de verdade.
 * Tudo na FLUIA deriva do check-in.
 */

import type { DateKey, ScaleValue, NullableScaleValue, DayMoment } from "./shared";

// ============================================
// DIMENSÕES DO CHECK-IN (Escala 5 níveis)
// ============================================

/**
 * Dimensões coletadas no check-in diário.
 * Todas usam escala de 5 níveis (Kahneman).
 */
export interface CheckinDimensions {
  /** Como está o humor geral (1-5) */
  mood: ScaleValue;
  
  /** Nível de energia (1-5) */
  energy: ScaleValue;
  
  /** Estado corporal (1-5) */
  body: ScaleValue;
  
  /** Sensação de vínculo com o bebê (1-5) */
  bond: ScaleValue;
}

/** Dimensões com valores opcionais (durante preenchimento) */
export type PartialCheckinDimensions = {
  [K in keyof CheckinDimensions]: NullableScaleValue;
};

// ============================================
// CHECK-IN INPUT
// ============================================

/**
 * Input do check-in diário.
 * Enviado pela usuária ao completar o check-in.
 */
export interface DailyCheckinInput {
  /** Dimensões emocionais (escala 1-5) */
  dimensions: CheckinDimensions;
  
  /** Emoções selecionadas (tags) - opcional */
  emotions?: string[];
  
  /** Notas livres - opcional */
  notes?: string;
  
  /** Momento do dia em que foi feito */
  moment: DayMoment;
}

// ============================================
// CHECK-IN STORED
// ============================================

/**
 * Check-in armazenado no Firestore.
 * Collection: profiles/{uid}/checkins/{dateKey}
 */
export interface StoredCheckin {
  /** ID do usuário */
  uid: string;
  
  /** Chave do dia (YYYY-MM-DD, considera reset 04:00) */
  dateKey: DateKey;
  
  /** Dados do check-in */
  dimensions: CheckinDimensions;
  emotions?: string[];
  notes?: string;
  moment: DayMoment;
  
  /** Semana gestacional no momento do check-in */
  gestationalWeek: number;
  
  /** Timestamps */
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CHECK-IN RESPONSE
// ============================================

/** Response ao salvar check-in */
export interface DailyCheckinResponse {
  /** Chave do dia salvo */
  dateKey: DateKey;
  
  /** Status da operação */
  status: "saved" | "updated";
  
  /** Indica se é o primeiro check-in do usuário */
  isFirstCheckin?: boolean;
}

// ============================================
// PRESETS DE LABELS (para UI)
// ============================================

/** Labels para cada nível da escala de humor */
export const MOOD_LABELS = {
  1: { emoji: "😔", label: "Difícil" },
  2: { emoji: "😕", label: "Baixo" },
  3: { emoji: "😐", label: "Neutro" },
  4: { emoji: "🙂", label: "Bem" },
  5: { emoji: "😊", label: "Ótimo" },
} as const;

/** Labels para cada nível da escala de energia */
export const ENERGY_LABELS = {
  1: { emoji: "😴", label: "Exausta" },
  2: { emoji: "🥱", label: "Cansada" },
  3: { emoji: "😌", label: "Ok" },
  4: { emoji: "🙂", label: "Bem" },
  5: { emoji: "✨", label: "Disposta" },
} as const;

/** Labels para cada nível da escala corporal */
export const BODY_LABELS = {
  1: { emoji: "😣", label: "Tenso" },
  2: { emoji: "😕", label: "Desconforto" },
  3: { emoji: "😐", label: "Neutro" },
  4: { emoji: "🙂", label: "Confortável" },
  5: { emoji: "😌", label: "Relaxado" },
} as const;

/** Labels para cada nível da escala de vínculo */
export const BOND_LABELS = {
  1: { emoji: "💭", label: "Distante" },
  2: { emoji: "🤔", label: "Incerta" },
  3: { emoji: "💜", label: "Presente" },
  4: { emoji: "🥰", label: "Próxima" },
  5: { emoji: "💗", label: "Conectada" },
} as const;

/** Tipo para acessar labels por dimensão */
export type DimensionLabels = typeof MOOD_LABELS | typeof ENERGY_LABELS | typeof BODY_LABELS | typeof BOND_LABELS;

/** Mapa de labels por dimensão */
export const DIMENSION_LABELS_MAP = {
  mood: MOOD_LABELS,
  energy: ENERGY_LABELS,
  body: BODY_LABELS,
  bond: BOND_LABELS,
} as const;

// ============================================
// EMOÇÕES PRÉ-DEFINIDAS (Tags)
// ============================================

/** Emoções que a usuária pode selecionar como tags */
export const EMOTION_TAGS = [
  "ansiosa",
  "calma",
  "feliz",
  "triste",
  "irritada",
  "esperançosa",
  "preocupada",
  "grata",
  "cansada",
  "animada",
  "insegura",
  "confiante",
  "sobrecarregada",
  "em paz",
] as const;

export type EmotionTag = typeof EMOTION_TAGS[number];
