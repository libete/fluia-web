/**
 * @fluia/firebase - Client SDK
 *
 * Firebase Client inicializado uma única vez.
 * Usar APENAS no lado do cliente (browser).
 */

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithRedirect,
  signInWithPopup,
  getRedirectResult,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  Auth,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  Firestore,
} from "firebase/firestore";

// ============================================
// Configuração
// ============================================

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// ============================================
// Inicialização (singleton)
// ============================================

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    return getApp();
  }
  return initializeApp(firebaseConfig);
}

// Lazy initialization
let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getClientApp(): FirebaseApp {
  if (!_app) {
    _app = getFirebaseApp();
  }
  return _app;
}

export function getClientAuth(): Auth {
  if (!_auth) {
    _auth = getAuth(getClientApp());
  }
  return _auth;
}

export function getClientFirestore(): Firestore {
  if (!_db) {
    _db = getFirestore(getClientApp());
  }
  return _db;
}

// ============================================
// Autenticação - Google
// ============================================

const googleProvider = new GoogleAuthProvider();

/**
 * Inicia o fluxo de login com Google.
 * Usa Popup em desenvolvimento (mais simples) e Redirect em produção (mais confiável).
 * Retorna o idToken se Popup, ou null se Redirect (token vem depois via handleRedirectResult).
 */
export async function loginWithGoogle(): Promise<string | null> {
  const auth = getClientAuth();
  
  // Em desenvolvimento, usar Popup (evita problema do init.json)
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        const idToken = await result.user.getIdToken(true);
        return idToken;
      }
      return null;
    } catch (error) {
      console.error("[Firebase Client] Popup login error:", error);
      throw error;
    }
  }
  
  // Em produção, usar Redirect (mais confiável)
  await signInWithRedirect(auth, googleProvider);
  return null;
}

/**
 * Processa o resultado do redirect após voltar do Google.
 * Retorna o idToken se login bem-sucedido, null caso contrário.
 */
export async function handleRedirectResult(): Promise<string | null> {
  const auth = getClientAuth();

  try {
    const result = await getRedirectResult(auth);

    if (!result?.user) {
      return null;
    }

    // Força refresh do token para garantir validade
    const idToken = await result.user.getIdToken(true);
    return idToken;
  } catch (error) {
    console.error("[Firebase Client] Redirect result error:", error);
    return null;
  }
}

/**
 * Obtém o idToken do usuário atual (se logado).
 */
export async function getCurrentUserIdToken(): Promise<string | null> {
  const auth = getClientAuth();
  const user = auth.currentUser;

  if (!user) {
    return null;
  }

  return user.getIdToken(true);
}

/**
 * Faz logout no Firebase Auth (cliente).
 * Nota: O cookie de sessão deve ser removido separadamente via API.
 */
export async function signOut(): Promise<void> {
  const auth = getClientAuth();
  await firebaseSignOut(auth);
}

/**
 * Observa mudanças no estado de autenticação.
 */
export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = getClientAuth();
  return onAuthStateChanged(auth, callback);
}

// ============================================
// Exports de tipos
// ============================================

export type { User, Auth, FirebaseApp, Firestore };