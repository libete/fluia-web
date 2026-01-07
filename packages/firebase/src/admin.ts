/**
 * @fluia/firebase - Admin SDK
 *
 * Firebase Admin inicializado uma única vez.
 * Usar APENAS no lado do servidor (API routes, middleware, SSR).
 */

import {
  initializeApp,
  getApps,
  getApp,
  cert,
  App,
  ServiceAccount,
} from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

// ============================================
// Inicialização (singleton)
// ============================================

function getServiceAccount(): ServiceAccount | undefined {
  // Opção 1: Variáveis de ambiente individuais (produção/Vercel)
  if (
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
    process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
    process.env.FIREBASE_ADMIN_PRIVATE_KEY
  ) {
    return {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      // Private key vem com \n escapado em variáveis de ambiente
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, "\n"),
    };
  }

  // Opção 2: Arquivo JSON local (desenvolvimento)
  const serviceAccountPath =
    process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH ||
    "./service-account.json";

  const absolutePath = resolve(process.cwd(), serviceAccountPath);

  if (existsSync(absolutePath)) {
    try {
      const fileContent = readFileSync(absolutePath, "utf-8");
      return JSON.parse(fileContent) as ServiceAccount;
    } catch (error) {
      console.error("[Firebase Admin] Error reading service account file:", error);
    }
  }

  return undefined;
}

function initializeAdminApp(): App {
  if (getApps().length > 0) {
    return getApp();
  }

  const serviceAccount = getServiceAccount();

  if (!serviceAccount) {
    throw new Error(
      "[Firebase Admin] No service account found. " +
        "Set FIREBASE_ADMIN_* environment variables or provide service-account.json file."
    );
  }

  return initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  });
}

// Lazy initialization
let _adminApp: App | null = null;
let _adminAuth: Auth | null = null;
let _adminDb: Firestore | null = null;

export function getAdminApp(): App {
  if (!_adminApp) {
    _adminApp = initializeAdminApp();
  }
  return _adminApp;
}

export function getAdminAuth(): Auth {
  if (!_adminAuth) {
    _adminAuth = getAuth(getAdminApp());
  }
  return _adminAuth;
}

export function getAdminFirestore(): Firestore {
  if (!_adminDb) {
    _adminDb = getFirestore(getAdminApp());
  }
  return _adminDb;
}
// ============================================
// Sessão - Criação e Verificação
// ============================================

/**
 * Duração da sessão em milissegundos.
 * Default: 90 dias (padrão FLUIA)
 */
const SESSION_DURATION_MS = (() => {
  const days = Number(process.env.SESSION_MAX_AGE_DAYS ?? 7);
  const ms = days * 24 * 60 * 60 * 1000;

  // Firebase: mínimo 5 min, máximo 14 dias
  return Math.min(
    Math.max(ms, 5 * 60 * 1000),
    14 * 24 * 60 * 60 * 1000
  );
})();

/**
 * Cria um session cookie a partir de um idToken.
 * Retorna o cookie string para ser setado no header.
 */
export async function createSessionCookie(idToken: string): Promise<string> {
  const auth = getAdminAuth();

  // Verifica se o token é válido antes de criar a sessão
  await auth.verifyIdToken(idToken);

  // Cria o session cookie
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: SESSION_DURATION_MS,
  });

  return sessionCookie;
}

/**
 * Verifica um session cookie e retorna os dados decodificados.
 * Lança erro se o cookie for inválido ou expirado.
 */
export async function verifySessionCookie(
  sessionCookie: string,
  checkRevoked: boolean = true
): Promise<{
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}> {
  const auth = getAdminAuth();

  const decodedClaims = await auth.verifySessionCookie(
    sessionCookie,
    checkRevoked
  );

  return {
    uid: decodedClaims.uid,
    email: decodedClaims.email,
    name: decodedClaims.name,
    picture: decodedClaims.picture,
  };
}

/**
 * Revoga todas as sessões de um usuário.
 * Usar quando o usuário faz logout ou por segurança.
 */
export async function revokeUserSessions(uid: string): Promise<void> {
  const auth = getAdminAuth();
  await auth.revokeRefreshTokens(uid);
}

// ============================================
// Exports de tipos
// ============================================

export type { App, Auth, Firestore };
export { Timestamp } from "firebase-admin/firestore";
