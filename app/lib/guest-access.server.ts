import { timingSafeEqual } from "node:crypto";

import { createCookie, redirect } from "react-router";

const code =
  process.env.GUEST_ACCESS_CODE ??
  (process.env.NODE_ENV === "production" ? "" : "CADAQUES2026");
const secret =
  process.env.GUEST_SESSION_SECRET ??
  (process.env.NODE_ENV === "production" ? "" : "local-preview-only-secret");

function sessionCookie() {
  if (!code || !secret) {
    throw new Response("Guest access is not configured", { status: 503 });
  }
  return createCookie("landdf_guest", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secrets: [secret],
  });
}

export function validGuestCode(input: string): boolean {
  if (!code) return false;
  const expected = Buffer.from(code.trim().toUpperCase());
  const actual = Buffer.from(input.trim().toUpperCase());
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function hasGuestAccess(request: Request): Promise<boolean> {
  const cookie = sessionCookie();
  const value = await cookie.parse(request.headers.get("Cookie"));
  return value === "confirmed";
}

export async function requireGuestAccess(request: Request): Promise<void> {
  if (!(await hasGuestAccess(request))) {
    const url = new URL(request.url);
    throw redirect(`/access?returnTo=${encodeURIComponent(url.pathname)}`);
  }
}

export function guestCookieHeader(): Promise<string> {
  return sessionCookie().serialize("confirmed");
}

export function safeReturnTo(value: string | null): string {
  return value === "/photos" ? "/photos" : "/guest-info";
}
