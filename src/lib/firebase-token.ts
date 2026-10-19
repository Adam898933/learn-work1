import { createRemoteJWKSet, jwtVerify } from "jose";

// Firebase project used by the Group Chat app for sign-in.
export const FIREBASE_PROJECT_ID = "group-chat-27e49";

const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

/** Verifies a Firebase ID token and returns the account's uid, or null when invalid. */
export async function verifyFirebaseIdToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, JWKS, {
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      audience: FIREBASE_PROJECT_ID,
      algorithms: ["RS256"],
    });
    const uid = typeof payload.sub === "string" ? payload.sub : "";
    return uid && uid.length <= 128 ? uid : null;
  } catch {
    return null;
  }
}
