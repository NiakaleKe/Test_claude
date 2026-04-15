// @vitest-environment node
import { vi, test, expect, beforeEach } from "vitest";
import { SignJWT } from "jose";
import { NextRequest } from "next/server";

vi.mock("server-only", () => ({}));

const cookieStore = {
  get: vi.fn(),
  set: vi.fn(),
  delete: vi.fn(),
};

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve(cookieStore)),
}));

const JWT_SECRET = new TextEncoder().encode("development-secret-key");

async function makeToken(
  payload: object,
  expiresIn: string = "7d"
): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresIn)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// --- createSession ---

test("createSession sets an httpOnly cookie with a valid JWT", async () => {
  const { createSession } = await import("@/lib/auth");

  await createSession("user-1", "user@example.com");

  expect(cookieStore.set).toHaveBeenCalledOnce();
  const [name, token, options] = cookieStore.set.mock.calls[0];

  expect(name).toBe("auth-token");
  expect(typeof token).toBe("string");
  expect(options.httpOnly).toBe(true);
  expect(options.sameSite).toBe("lax");
  expect(options.path).toBe("/");
});

test("createSession encodes userId and email in the token", async () => {
  const { createSession } = await import("@/lib/auth");
  const { jwtVerify } = await import("jose");

  await createSession("user-42", "hello@test.com");

  const token = cookieStore.set.mock.calls[0][1];
  const { payload } = await jwtVerify(token, JWT_SECRET);

  expect(payload.userId).toBe("user-42");
  expect(payload.email).toBe("hello@test.com");
});

// --- getSession ---

test("getSession returns null when no cookie is present", async () => {
  const { getSession } = await import("@/lib/auth");
  cookieStore.get.mockReturnValue(undefined);

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns the session payload for a valid token", async () => {
  const { getSession } = await import("@/lib/auth");
  const token = await makeToken({ userId: "user-1", email: "a@b.com" });
  cookieStore.get.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session?.userId).toBe("user-1");
  expect(session?.email).toBe("a@b.com");
});

test("getSession returns null for an expired token", async () => {
  const { getSession } = await import("@/lib/auth");
  const token = await makeToken({ userId: "user-1", email: "a@b.com" }, "-1s");
  cookieStore.get.mockReturnValue({ value: token });

  const session = await getSession();

  expect(session).toBeNull();
});

test("getSession returns null for a malformed token", async () => {
  const { getSession } = await import("@/lib/auth");
  cookieStore.get.mockReturnValue({ value: "not.a.jwt" });

  const session = await getSession();

  expect(session).toBeNull();
});

// --- deleteSession ---

test("deleteSession removes the auth-token cookie", async () => {
  const { deleteSession } = await import("@/lib/auth");

  await deleteSession();

  expect(cookieStore.delete).toHaveBeenCalledWith("auth-token");
});

// --- verifySession ---

function makeRequest(cookie?: string): NextRequest {
  const url = "http://localhost/api/test";
  const headers = cookie ? { cookie } : undefined;
  return new NextRequest(url, { headers });
}

test("verifySession returns null when no cookie is present", async () => {
  const { verifySession } = await import("@/lib/auth");

  const session = await verifySession(makeRequest());

  expect(session).toBeNull();
});

test("verifySession returns the session payload for a valid token", async () => {
  const { verifySession } = await import("@/lib/auth");
  const token = await makeToken({ userId: "user-7", email: "x@y.com" });

  const session = await verifySession(makeRequest(`auth-token=${token}`));

  expect(session?.userId).toBe("user-7");
  expect(session?.email).toBe("x@y.com");
});

test("verifySession returns null for an expired token", async () => {
  const { verifySession } = await import("@/lib/auth");
  const token = await makeToken({ userId: "user-7", email: "x@y.com" }, "-1s");

  const session = await verifySession(makeRequest(`auth-token=${token}`));

  expect(session).toBeNull();
});

test("verifySession returns null for a malformed token", async () => {
  const { verifySession } = await import("@/lib/auth");

  const session = await verifySession(makeRequest("auth-token=garbage"));

  expect(session).toBeNull();
});
