// Minimal cookie-based auth for two hard-coded users from env vars.
// Cookie value is `username.signature` where the signature is HMAC-SHA256 over
// the username with SESSION_SECRET. No DB lookups for auth — just env config.

import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "ness_session";
const COOKIE_TTL_DAYS = 30;

type User = { username: string; password: string };

function loadUsers(): User[] {
  const users: User[] = [];
  for (let i = 1; i <= 10; i++) {
    const username = process.env[`AUTH_USER_${i}`];
    const password = process.env[`AUTH_PASS_${i}`];
    if (username && password) {
      users.push({ username, password });
    }
  }
  return users;
}

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      "SESSION_SECRET is not set or is too short (need at least 16 chars). Set it in .env / Vercel env vars.",
    );
  }
  return secret;
}

function sign(value: string): string {
  return crypto.createHmac("sha256", getSecret()).update(value).digest("hex");
}

function timingSafeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

export function verifyCredentials(username: string, password: string): boolean {
  const users = loadUsers();
  const user = users.find((u) => u.username === username);
  if (!user) return false;
  return timingSafeEqual(user.password, password);
}

export function createSession(username: string) {
  const sig = sign(username);
  const value = `${username}.${sig}`;
  cookies().set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_TTL_DAYS * 24 * 60 * 60,
  });
}

export function destroySession() {
  cookies().delete(COOKIE_NAME);
}

export function getCurrentUser(): string | null {
  try {
    const value = cookies().get(COOKIE_NAME)?.value;
    if (!value) return null;
    const dot = value.lastIndexOf(".");
    if (dot === -1) return null;
    const username = value.slice(0, dot);
    const sig = value.slice(dot + 1);
    if (!username || !sig) return null;
    if (!timingSafeEqual(sign(username), sig)) return null;
    return username;
  } catch {
    return null;
  }
}

export function requireUser(): string {
  const user = getCurrentUser();
  if (!user) {
    // API routes convert this to a 401; pages should call getCurrentUser
    // and redirect themselves.
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export const auth = {
  cookieName: COOKIE_NAME,
};
