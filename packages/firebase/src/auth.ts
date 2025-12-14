/**
 * @fluia/firebase - Auth Module
 *
 * Funções de autenticação, perfil e sessão.
 * Combina Admin SDK com lógica de negócio FLUIA.
 */

import { getAdminAuth, getAdminFirestore, verifySessionCookie } from "./admin";
import { FieldValue, Timestamp } from "firebase-admin/firestore";

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
 * Obtém o perfil do usuário.
 * Retorna null se não existir.
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
 * Cria o perfil base do usuário após primeiro login.
 * Não sobrescreve se já existir.
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

    // Dados gestacionais (null até onboarding)
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
 * Obtém ou cria o perfil do usuário.
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
    // Se não temos authData, buscar do Firebase Auth
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

/**
 * Retorna a data no formato YYYY-MM-DD para o timezone especificado.
 * Considera o reset às 04:00 (padrão FLUIA).
 */
export function getDateKey(timezone: string): string {
  const now = new Date();

  // Ajusta para o timezone
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat("en-CA", options);
  const parts = formatter.formatToParts(now);

  const year = parts.find((p) => p.type === "year")?.value;
  const month = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);

  // Se antes das 04:00, considera como dia anterior
  if (hour < 4) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const yFormatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });

    return yFormatter.format(yesterday);
  }

  return `${year}-${month}-${day}`;
}

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

  // Gestação normal = 40 semanas
  const currentWeek = 40 - weeksUntilDue;

  // Clamp entre 1 e 42 semanas
  return Math.max(1, Math.min(42, currentWeek));
}

// ============================================
// Re-exports
// ============================================

export { verifySessionCookie, createSessionCookie, revokeUserSessions } from "./admin";
