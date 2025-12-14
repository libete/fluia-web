/**
 * API Route: POST /api/auth/onboarding
 *
 * Salva dados do onboarding incrementalmente.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifySessionCookie,
  updateUserProfile,
  calculateGestationalWeek,
} from "@fluia/firebase";
import { Timestamp } from "firebase-admin/firestore";

const SESSION_COOKIE_NAME = "__session";

export async function POST(request: NextRequest) {
  try {
    // Verifica sessão
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

    if (!sessionCookie?.value) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const session = await verifySessionCookie(sessionCookie.value);
    const { step, data } = await request.json();

    // Monta update baseado no step
    const updates: Record<string, unknown> = {
      onboardingStep: step,
    };

    // Step 1: Due date
    if (data.dueDate) {
      const dueDateObj = new Date(data.dueDate);
      updates.dueDate = Timestamp.fromDate(dueDateObj);
      updates.gestationalWeekAtCreation = calculateGestationalWeek(dueDateObj);
    }

    // Step 2: First pregnancy
    if (data.isFirstPregnancy !== undefined) {
      updates.isFirstPregnancy = data.isFirstPregnancy;
    }

    // Step 3: Mood + consent + complete
    if (data.baselineMood !== undefined) {
      updates.baselineMood = data.baselineMood;
    }

    if (data.consentHealthData !== undefined) {
      updates.consentHealthData = data.consentHealthData;
    }

    if (data.onboardingCompleted) {
      updates.onboardingCompleted = true;
      updates.onboardingCompletedAt = Timestamp.now();
    }

    // Salva no Firestore
    await updateUserProfile(session.uid, updates);

    return NextResponse.json({ success: true, step });
  } catch (error) {
    console.error("[API /auth/onboarding] Error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}
