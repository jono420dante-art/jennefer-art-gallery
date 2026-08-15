import { createHash, timingSafeEqual } from "node:crypto";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import type { Request } from "express";
import { ENV } from "./env";

export const NATIVE_ADMIN_COOKIE = "jennefer_admin_session";
const NATIVE_ADMIN_OPEN_ID = "gallery-native-admin";
const SESSION_DURATION_MS = 8 * 60 * 60 * 1000;

export type NativeAdminUser = {
  id: number;
  openId: string;
  name: string;
  email: null;
  loginMethod: "native_admin";
  role: "admin";
};

function getSecretKey() {
  if (!ENV.cookieSecret) throw new Error("Session signing secret is not configured");
  return new TextEncoder().encode(ENV.cookieSecret);
}

function constantTimeEquals(value: string, expected: string) {
  const valueHash = createHash("sha256").update(value).digest();
  const expectedHash = createHash("sha256").update(expected).digest();
  return timingSafeEqual(valueHash, expectedHash);
}

export function areNativeAdminCredentialsValid(username: string, password: string) {
  if (!ENV.adminPortalUsername || !ENV.adminPortalPassword) return false;
  const usernameMatches = constantTimeEquals(username, ENV.adminPortalUsername);
  const passwordMatches = constantTimeEquals(password, ENV.adminPortalPassword);
  return usernameMatches && passwordMatches;
}

export async function createNativeAdminSession() {
  const expiresAt = Math.floor((Date.now() + SESSION_DURATION_MS) / 1000);
  return new SignJWT({
    openId: NATIVE_ADMIN_OPEN_ID,
    role: "admin",
    authType: "native_admin",
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(NATIVE_ADMIN_OPEN_ID)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecretKey());
}

export async function getNativeAdminUser(req: Request): Promise<NativeAdminUser | null> {
  const cookieValue = parseCookieHeader(req.headers.cookie ?? "")[NATIVE_ADMIN_COOKIE];
  if (!cookieValue) return null;

  try {
    const { payload } = await jwtVerify(cookieValue, getSecretKey(), { algorithms: ["HS256"] });
    if (
      payload.sub !== NATIVE_ADMIN_OPEN_ID ||
      payload.openId !== NATIVE_ADMIN_OPEN_ID ||
      payload.role !== "admin" ||
      payload.authType !== "native_admin"
    ) {
      return null;
    }

    return {
      id: 0,
      openId: NATIVE_ADMIN_OPEN_ID,
      name: "Gallery Administrator",
      email: null,
      loginMethod: "native_admin",
      role: "admin",
    };
  } catch {
    return null;
  }
}
