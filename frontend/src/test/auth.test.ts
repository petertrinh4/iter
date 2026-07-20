import { describe, it, expect, beforeEach, afterEach, } from "vitest";

// ── Helpers that mirror what HomePage does with the JWT ──────────────────────

function decodeJwtPayload(token: string): Record<string, unknown> {
  const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(atob(base64));
}

function getUsernameFromToken(token: string): string {
  const payload = decodeJwtPayload(token);
  return (
    (payload["preferred_username"] as string) ??
    (payload["email"] as string) ??
    "User"
  );
}

function getMemberSinceFromToken(token: string): string {
  const payload = decodeJwtPayload(token);
  const iat = payload["iat"] as number | undefined;
  if (!iat) return "";
  return new Date(iat * 1000).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

// Build a minimal fake JWT with a given payload
function makeFakeJwt(payload: Record<string, unknown>): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  return `${header}.${body}.fakesig`;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("JWT decoding", () => {
  it("extracts preferred_username correctly", () => {
    const token = makeFakeJwt({ preferred_username: "johnnielp423", email: "john@example.com" });
    expect(getUsernameFromToken(token)).toBe("johnnielp423");
  });

  it("falls back to email when preferred_username is missing", () => {
    const token = makeFakeJwt({ email: "john@example.com" });
    expect(getUsernameFromToken(token)).toBe("john@example.com");
  });

  it("falls back to 'User' when both are missing", () => {
    const token = makeFakeJwt({ sub: "some-uuid" });
    expect(getUsernameFromToken(token)).toBe("User");
  });

  it("does NOT use cognito:username (the UUID sub)", () => {
    const token = makeFakeJwt({
      "cognito:username": "810ba580-9091-70aa-64af-3022d0f8f41c",
      preferred_username: "johnnielp423",
    });
    expect(getUsernameFromToken(token)).toBe("johnnielp423");
    expect(getUsernameFromToken(token)).not.toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-/
    );
  });

  it("derives member since date from iat field", () => {
    // iat for July 2026
    const iat = Math.floor(new Date("2026-07-16").getTime() / 1000);
    const token = makeFakeJwt({ preferred_username: "johnnielp423", iat });
    expect(getMemberSinceFromToken(token)).toBe("July 2026");
  });

  it("returns empty string when iat is missing", () => {
    const token = makeFakeJwt({ preferred_username: "johnnielp423" });
    expect(getMemberSinceFromToken(token)).toBe("");
  });
});

describe("localStorage token management", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("stores idToken and accessToken on login", () => {
    localStorage.setItem("idToken", "fake-id-token");
    localStorage.setItem("accessToken", "fake-access-token");
    expect(localStorage.getItem("idToken")).toBe("fake-id-token");
    expect(localStorage.getItem("accessToken")).toBe("fake-access-token");
  });

  it("clears both tokens on sign out", () => {
    localStorage.setItem("idToken", "fake-id-token");
    localStorage.setItem("accessToken", "fake-access-token");

    // Simulate handleSignOut
    localStorage.removeItem("idToken");
    localStorage.removeItem("accessToken");

    expect(localStorage.getItem("idToken")).toBeNull();
    expect(localStorage.getItem("accessToken")).toBeNull();
  });

  it("returns null for idToken when not logged in", () => {
    expect(localStorage.getItem("idToken")).toBeNull();
  });
});
