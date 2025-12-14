import { requireOnboardedUser } from "@/lib/auth/guard";
import { calculateGestationalWeek, getDateKey } from "@fluia/firebase";
import BussolaClient from "./bussola-client";

/**
 * Página da Bússola - Hub Diário
 *
 * O coração da FLUIA.
 * Determina automaticamente o que a gestante deve fazer hoje.
 */
export default async function BussolaPage() {
  const user = await requireOnboardedUser();
  const { profile } = user;

  // Calcula semana gestacional atual
  const gestationalWeek = profile.dueDate
    ? calculateGestationalWeek(profile.dueDate.toDate())
    : null;

  // Data atual no timezone da usuária
  const dateKey = getDateKey(profile.timezone);

  return (
    <BussolaClient
      displayName={profile.displayName}
      gestationalWeek={gestationalWeek}
      dateKey={dateKey}
      timezone={profile.timezone}
    />
  );
}
