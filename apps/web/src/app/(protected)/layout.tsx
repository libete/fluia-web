import { requireUser } from "@/lib/auth/guard";

/**
 * Layout para rotas protegidas /gestante/*
 *
 * Verifica autenticação antes de renderizar children.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Garante que usuário está autenticado
  // Redireciona para /entrar se não estiver
  await requireUser();

  return <>{children}</>;
}
