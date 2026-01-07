/**
 * @fluia/firebase
 *
 * Pacote centralizado de Firebase para FLUIA.
 * Única fonte de verdade para Client e Admin SDK.
 */

// Client exports (browser only)
export {
  getClientApp,
  getClientAuth,
  getClientFirestore,
  loginWithGoogle,
  handleRedirectResult,
  getCurrentUserIdToken,
  signOut,
  onAuthChange,
} from "./client";

// Admin exports (server only)
export {
  getAdminApp,
  getAdminAuth,
  getAdminFirestore,
  createSessionCookie,
  verifySessionCookie,
  revokeUserSessions,
} from "./admin";

// Auth module exports
export {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  touchUserProfile,
  getOrCreateUserProfile,
  calculateGestationalWeek,
} from "./auth";

// Re-export getDateKey from contracts (centralizado)
export { getDateKey } from "@fluia/contracts";

// Re-export Timestamp para uso em API routes
export { Timestamp } from "firebase-admin/firestore";

// Types
export type { UserProfile, SessionUser } from "./auth";
export type { User, Auth as ClientAuth, Firestore as ClientFirestore } from "./client";
export type { App as AdminApp, Auth as AdminAuth, Firestore as AdminFirestore } from "./admin";