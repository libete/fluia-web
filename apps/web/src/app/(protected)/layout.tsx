/**
 * Layout para rotas protegidas /gestante/*
 *
 * Verifica autenticação E onboarding antes de renderizar children.
 * EXCEÇÃO: A própria rota de onboarding não exige onboarding completo.
 */

import { headers } from "next/headers";
import { requireUser, requireOnboardedUser } from "@/lib/auth/guard";
import { SubscriptionProvider } from "@/hooks/useSubscription";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pegar a URL atual para saber se estamos no onboarding
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Se estamos na rota de onboarding, só exige autenticação
  if (pathname.includes("/onboarding")) {
    await requireUser();
  } else {
    // Para outras rotas, exige autenticação E onboarding completo
    await requireOnboardedUser();
  }

  return <SubscriptionProvider>{children}</SubscriptionProvider>;
}