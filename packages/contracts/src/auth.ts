/**
 * @fluia/contracts - Authentication Types
 *
 * Tipos relacionados a autenticação e sessão.
 */

import type { ISOTimestamp, GestationalTrimester } from "./shared";
import type { BabyProfile, PresenceData, BabyVoiceTracking } from "./baby-voice";

// ============================================
// SESSÃO
// ============================================

/** Request para criar sessão */
export interface CreateSessionRequest {
  /** Firebase ID Token do Google Sign-In */
  idToken: string;
}

/** Response da criação de sessão */
export interface CreateSessionResponse {
  success: boolean;
  /** Indica se é primeiro login (precisa onboarding) */
  isNewUser?: boolean;
}

/** Dados do usuário na sessão (do cookie) */
export interface SessionUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

// ============================================
// PERFIL DO USUÁRIO
// ============================================

/**
 * Perfil completo do usuário no Firestore.
 * Collection: profiles/{uid}
 */
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;

  // Onboarding
  onboardingCompleted: boolean;
  onboardingStep: number;

  // Dados gestacionais (preenchidos no onboarding)
  /** Data Prevista do Parto */
  dueDate: ISOTimestamp | null;
  /** Semana gestacional no momento do cadastro */
  gestationalWeekAtCreation: number | null;
  /** Trimestre atual (derivado) */
  trimester?: GestationalTrimester;
  /** Primeira gestação? */
  isFirstPregnancy: boolean | null;
  /** Humor baseline (onboarding) - escala 1-5 */
  baselineMood: number | null;

  // Localização
  timezone: string;
  locale: string;

  // Consentimentos
  consentHealthData: boolean;
  consentMarketing: boolean;

  // Assinatura
  isPremium: boolean;
  premiumSince?: ISOTimestamp;
  premiumUntil?: ISOTimestamp;

  // Metadata
  createdAt: ISOTimestamp;
  updatedAt: ISOTimestamp;
  lastSeenAt: ISOTimestamp;
  /** Último dia ativo (YYYY-MM-DD) */
  lastActiveDate: string;

  // ============================================
  // BABY VOICE v2 - Campos opcionais
  // ============================================

  /**
   * Dados do bebê (nome, semanas, trimestre).
   * Inicializado após onboarding com dueDate.
   */
  baby?: BabyProfile;

  /**
   * Dados de presença (dias de check-in, streak).
   * Atualizado a cada check-in.
   */
  presence?: PresenceData;

  /**
   * Tracking de mensagens da Voz do Bebê.
   * Evita repetição de conteúdo.
   */
  babyVoice?: BabyVoiceTracking;
}

/** Dados mínimos para criar perfil (do Firebase Auth) */
export interface CreateProfileData {
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider: string;
}

/** Campos atualizáveis do perfil */
export type UpdateProfileData = Partial<
  Omit<UserProfile, "uid" | "createdAt" | "email" | "provider">
>;

// ============================================
// ONBOARDING
// ============================================

/** Request para salvar step do onboarding */
export interface OnboardingStepRequest {
  step: number;
  data: OnboardingStepData;
}

/** Dados de cada step do onboarding */
export interface OnboardingStepData {
  // Step 1: Data prevista do parto
  dueDate?: string;

  // Step 2: Primeira gestação
  isFirstPregnancy?: boolean;

  // Step 3: Humor baseline + consentimento
  baselineMood?: number;
  consentHealthData?: boolean;

  // Step 4 (opcional): Nome carinhoso do bebê
  babyCustomName?: string;

  // Finalização
  onboardingCompleted?: boolean;
}

/** Response do onboarding */
export interface OnboardingStepResponse {
  success: boolean;
  step: number;
}

// ============================================
// NOTA: initializeBabyVoiceFields foi movido
// para baby-voice.ts para evitar require()
// ============================================
