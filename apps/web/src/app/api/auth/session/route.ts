/**
 * API Route: POST /api/auth/session
 *
 * Cria cookie de sessão a partir do idToken do Firebase.
 * Chamado pelo cliente após login com Google.
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  createSessionCookie,
  getOrCreateUserProfile,
} from "@fluia/firebase";

const SESSION_COOKIE_NAME = "__session";
const SESSION_MAX_AGE_DAYS = parseInt(
  process.env.SESSION_MAX_AGE_DAYS || "90",
  10
);
const SESSION_MAX_AGE_SECONDS = SESSION_MAX_AGE_DAYS * 24 * 60 * 60;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "idToken is required" },
        { status: 400 }
      );
    }

    // Cria o session cookie via Firebase Admin
    const sessionCookie = await createSessionCookie(idToken);

    // Define o cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_MAX_AGE_SECONDS,
      path: "/",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API /auth/session] Error creating session:", error);

    // Erro específico do Firebase
    if (error instanceof Error) {
      if (error.message.includes("Firebase ID token has expired")) {
        return NextResponse.json(
          { error: "Token expired. Please login again." },
          { status: 401 }
        );
      }

      if (error.message.includes("Firebase ID token has invalid")) {
        return NextResponse.json(
          { error: "Invalid token. Please login again." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/auth/session
 *
 * Remove o cookie de sessão (logout).
 */
export async function DELETE() {
  try {
    const cookieStore = await cookies();

    // Remove o cookie
    cookieStore.delete(SESSION_COOKIE_NAME);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API /auth/session] Error deleting session:", error);
    return NextResponse.json(
      { error: "Failed to delete session" },
      { status: 500 }
    );
  }
}
