import { requireUser } from "@/lib/auth/guard";
import { redirect } from "next/navigation";
import OnboardingClient from "./onboarding-client";

/**
 * Página de Onboarding
 *
 * Server Component que verifica estado e renderiza Client Component.
 */
export default async function OnboardingPage() {
  const user = await requireUser();

  // Se já completou onboarding, vai para bússola
  if (user.profile.onboardingCompleted) {
    redirect("/gestante/bussola");
  }

  return (
    <OnboardingClient
      uid={user.uid}
      currentStep={user.profile.onboardingStep}
      displayName={user.profile.displayName}
    />
  );
}
