import * as jose from "jose";

export const SESSION_COOKIE = "onix_session";

function key(): Uint8Array | null {
  const s = process.env.SESSION_SECRET;
  if (!s) return null;
  return new TextEncoder().encode(s);
}

export async function signSession(userId: string): Promise<string> {
  const k = key();
  if (!k) throw new Error("SESSION_SECRET no configurado");
  return await new jose.SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(k);
}

export async function getSession(req: Request): Promise<{ userId: string } | null> {
  const k = key();
  if (!k) return null;
  const token = (req.headers.get("cookie") ?? "")
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  if (!token) return null;
  try {
    const { payload } = await jose.jwtVerify(token, k);
    if (typeof payload.userId !== "string" || !payload.userId) return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}
