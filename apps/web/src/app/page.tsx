import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/guard";

/**
 * Página raiz - redireciona baseado no estado de autenticação
 */
export default async function HomePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/entrar");
  }

  if (!user.profile.onboardingCompleted) {
    redirect("/gestante/onboarding");
  }

  redirect("/gestante/bussola");
}
