/**
 * Middleware de autenticação FLUIA
 *
 * Protege rotas /gestante/* verificando cookie de sessão.
 * Redireciona para /entrar se não autenticado.
 * Passa pathname via header para o layout verificar onboarding.
 */
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Nome do cookie de sessão
const SESSION_COOKIE_NAME = "__session";

// Rotas públicas (não precisam de autenticação)
const PUBLIC_ROUTES = ["/entrar", "/api/auth/session", "/__/auth"];

// Rotas que precisam de autenticação
const PROTECTED_PREFIXES = ["/gestante"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignora arquivos estáticos e API routes públicas
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Verifica se é rota pública
  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route)
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Verifica se é rota protegida
  const isProtectedRoute = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Verifica cookie de sessão
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie?.value) {
    // Não autenticado - redireciona para /entrar
    const loginUrl = new URL("/entrar", request.url);
    // Preserva a URL de destino para redirect pós-login
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Autenticado - permite acesso
  // Adiciona pathname no header para o layout verificar onboarding
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)",
  ],
};