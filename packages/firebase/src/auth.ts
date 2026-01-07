/**
 * @fluia/firebase - Auth Module
 *
 * FunÃƒÂ§ÃƒÂµes de autenticaÃƒÂ§ÃƒÂ£o, perfil e sessÃƒÂ£o.
 * Combina Admin SDK com lÃƒÂ³gica de negÃƒÂ³cio FLUIA.
 */

import { getAdminAuth, getAdminFirestore, verifySessionCookie } from "./admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { getDateKey } from "@fluia/contracts";

// ============================================
// Tipos
// ============================================

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
  dueDate: Timestamp | null;
  gestationalWeekAtCreation: number | null;
  isFirstPregnancy: boolean | null;
  baselineMood: number | null;
  timezone: string;
  locale: string;

  // Consentimentos
  consentHealthData: boolean;
  consentMarketing: boolean;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastSeenAt: Timestamp;
  lastActiveDate: string; // YYYY-MM-DD
}

export interface SessionUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

// ============================================
// Constantes
// ============================================

const PROFILES_COLLECTION = "profiles";
const DEFAULT_TIMEZONE = "America/Sao_Paulo";
const DEFAULT_LOCALE = "pt-BR";

// ============================================
// Perfil
// ============================================

/**
 * ObtÃƒÂ©m o perfil do usuÃƒÂ¡rio.
 * Retorna null se nÃƒÂ£o existir.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const db = getAdminFirestore();
  const doc = await db.collection(PROFILES_COLLECTION).doc(uid).get();

  if (!doc.exists) {
    return null;
  }

  return doc.data() as UserProfile;
}

/**
 * Cria o perfil base do usuÃƒÂ¡rio apÃƒÂ³s primeiro login.
 * NÃƒÂ£o sobrescreve se jÃƒÂ¡ existir.
 */
export async function createUserProfile(
  uid: string,
  data: {
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    provider: string;
  }
): Promise<UserProfile> {
  const db = getAdminFirestore();
  const profileRef = db.collection(PROFILES_COLLECTION).doc(uid);

  const now = Timestamp.now();
  const today = getDateKey(DEFAULT_TIMEZONE);

  const profile: UserProfile = {
    uid,
    email: data.email,
    displayName: data.displayName,
    photoURL: data.photoURL,
    provider: data.provider,

    // Onboarding pendente
    onboardingCompleted: false,
    onboardingStep: 0,

    // Dados gestacionais (null atÃƒÂ© onboarding)
    dueDate: null,
    gestationalWeekAtCreation: null,
    isFirstPregnancy: null,
    baselineMood: null,
    timezone: DEFAULT_TIMEZONE,
    locale: DEFAULT_LOCALE,

    // Consentimentos pendentes
    consentHealthData: false,
    consentMarketing: false,

    // Metadata
    createdAt: now,
    updatedAt: now,
    lastSeenAt: now,
    lastActiveDate: today,
  };

  await profileRef.set(profile, { merge: true });

  return profile;
}

/**
 * Atualiza campos do perfil.
 */
export async function updateUserProfile(
  uid: string,
  updates: Partial<Omit<UserProfile, "uid" | "createdAt">>
): Promise<void> {
  const db = getAdminFirestore();
  const profileRef = db.collection(PROFILES_COLLECTION).doc(uid);

  await profileRef.update({
    ...updates,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * Atualiza lastSeenAt e lastActiveDate.
 * Chamar em cada acesso autenticado.
 */
export async function touchUserProfile(uid: string, timezone?: string): Promise<void> {
  const db = getAdminFirestore();
  const profileRef = db.collection(PROFILES_COLLECTION).doc(uid);

  const tz = timezone || DEFAULT_TIMEZONE;
  const today = getDateKey(tz);

  await profileRef.update({
    lastSeenAt: FieldValue.serverTimestamp(),
    lastActiveDate: today,
    updatedAt: FieldValue.serverTimestamp(),
  });
}

/**
 * ObtÃƒÂ©m ou cria o perfil do usuÃƒÂ¡rio.
 * Usa dados do Firebase Auth se precisar criar.
 */
export async function getOrCreateUserProfile(
  uid: string,
  authData?: {
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    provider: string;
  }
): Promise<UserProfile> {
  let profile = await getUserProfile(uid);

  if (!profile) {
    // Se nÃƒÂ£o temos authData, buscar do Firebase Auth
    if (!authData) {
      const auth = getAdminAuth();
      const userRecord = await auth.getUser(uid);

      authData = {
        email: userRecord.email || null,
        displayName: userRecord.displayName || null,
        photoURL: userRecord.photoURL || null,
        provider: userRecord.providerData[0]?.providerId || "unknown",
      };
    }

    profile = await createUserProfile(uid, authData);
  } else {
    // Atualiza lastSeen
    await touchUserProfile(uid, profile.timezone);
  }

  return profile;
}

// ============================================
// Helpers
// ============================================

// getDateKey importado de @fluia/contracts

/**
 * Calcula a semana gestacional a partir da DPP.
 */
export function calculateGestationalWeek(dueDate: Date): number {
  const now = new Date();
  const msPerDay = 24 * 60 * 60 * 1000;
  const msPerWeek = 7 * msPerDay;

  const daysUntilDue = Math.floor(
    (dueDate.getTime() - now.getTime()) / msPerDay
  );
  const weeksUntilDue = Math.floor(daysUntilDue / 7);

  // GestaÃƒÂ§ÃƒÂ£o normal = 40 semanas
  const currentWeek = 40 - weeksUntilDue;

  // Clamp entre 1 e 42 semanas
  return Math.max(1, Math.min(42, currentWeek));
}

// ============================================
// Re-exports
// ============================================

export { verifySessionCookie, createSessionCookie, revokeUserSessions } from "./admin";
