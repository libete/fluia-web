/**
 * SSR Guard - Verificação de sessão no servidor
 *
 * Funções para verificar autenticação em Server Components e Route Handlers.
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  verifySessionCookie,
  getOrCreateUserProfile,
  type UserProfile,
} from "@fluia/firebase";

const SESSION_COOKIE_NAME = "__session";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
  profile: UserProfile;
}

/**
 * Obtém o usuário autenticado atual.
 * Retorna null se não autenticado ou sessão inválida.
 *
 * Uso: Server Components, Route Handlers
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    // Verifica o cookie com Firebase Admin
    const sessionUser = await verifySessionCookie(sessionCookie.value, true);

    // Obtém ou cria o perfil
    const profile = await getOrCreateUserProfile(sessionUser.uid, {
      email: sessionUser.email || null,
      displayName: sessionUser.name || null,
      photoURL: sessionUser.picture || null,
      provider: "google.com",
    });

    return {
      ...sessionUser,
      profile,
    };
  } catch (error) {
    // Cookie inválido ou expirado
    console.error("[Auth Guard] Session verification failed:", error);
    return null;
  }
}

/**
 * Exige usuário autenticado.
 * Redireciona para /entrar se não autenticado.
 *
 * Uso: Server Components de rotas protegidas
 */
export async function requireUser(): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/entrar");
  }

  return user;
}

/**
 * Exige usuário com onboarding completo.
 * Redireciona para /gestante/onboarding se incompleto.
 *
 * Uso: Server Components que precisam de dados gestacionais
 */
export async function requireOnboardedUser(): Promise<AuthenticatedUser> {
  const user = await requireUser();

  if (!user.profile.onboardingCompleted) {
    redirect("/gestante/onboarding");
  }

  return user;
}

/**
 * Verifica se o usuário está autenticado (sem redirect).
 * Útil para lógica condicional.
 */
export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return user !== null;
}

/**
 * Verifica se o usuário completou o onboarding.
 */
export async function hasCompletedOnboarding(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.profile.onboardingCompleted ?? false;
}
