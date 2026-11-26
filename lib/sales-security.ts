import { createHash, createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { database } from "./sales-db";
import { acquisitionEnabled } from "./sales-config";

const derive = promisify(scrypt);
const sessionHours = 8;
const cookieName = "gavinferns-sales";
export type SalesUser = { id: string; email: string; role: "sales" | "advertising" };

export async function passwordMatches(password: string, encoded: string) {
  const [salt, hash] = encoded.split(":");
  const valid = /^[a-f0-9]{32}$/.test(salt) && /^[a-f0-9]{128}$/.test(hash ?? "");
  const supplied = await derive(password, valid ? salt : "0".repeat(32), 64) as Buffer;
  return valid && timingSafeEqual(supplied, Buffer.from(hash, "hex"));
}
export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
export async function session() {
  if (!acquisitionEnabled) return;
  const token = (await cookies()).get(cookieName)?.value;
  if (!token || !/^[a-f0-9]{64}$/.test(token)) return;
  const { rows } = await database().query<SalesUser>(
    `SELECT u.id, u.email, u.role FROM sales_sessions s JOIN sales_users u ON u.id = s.user_id
     WHERE s.token_hash = $1 AND s.expires_at > now() AND u.active`, [hashToken(token)],
  );
  return rows[0];
}
export async function beginSession(user: SalesUser, secure: boolean) {
  const token = randomBytes(32).toString("hex");
  await database().query("INSERT INTO sales_sessions VALUES ($1,$2,now()+interval '8 hours')", [hashToken(token), user.id]);
  (await cookies()).set(cookieName, token, { httpOnly: true, sameSite: "strict", path: "/", secure, maxAge: sessionHours * 3600 });
}
export async function endSession() {
  const jar = await cookies();
  const token = jar.get(cookieName)?.value;
  if (token) await database().query("DELETE FROM sales_sessions WHERE token_hash=$1", [hashToken(token)]);
  jar.delete(cookieName);
}
export function sameOrigin(request: Request) {
  const expected = process.env.SITE_ACQUISITION_ORIGIN ?? new URL(request.url).origin;
  return request.headers.get("origin") === expected;
}
export function secureCookie(request: Request) {
  return process.env.SITE_ACQUISITION_ORIGIN?.startsWith("https:") ?? new URL(request.url).protocol === "https:";
}
export async function withinLimit(request: Request, scope: string, max: number, windowSeconds: number) {
  const forwarded = process.env.VERCEL === "1" ? "x-vercel-forwarded-for" : process.env.SITE_TRUSTED_CLIENT_IP_HEADER;
  const address = (forwarded ? request.headers.get(forwarded) : null)?.split(",")[0].trim() || "local";
  return withinIdentifierLimit(address, scope, max, windowSeconds);
}
export async function withinIdentifierLimit(identifier: string, scope: string, max: number, windowSeconds: number) {
  const key = createHmac("sha256", process.env.ACQUISITION_SECURITY_KEY!).update(scope + ":" + identifier).digest("hex");
  const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
  const expires = new Date((bucket + 1) * windowSeconds * 1000);
  const { rows } = await database().query<{ hits: number }>(`
    INSERT INTO acquisition_limits (key,bucket,hits,expires_at) VALUES ($1,$2,1,$3)
    ON CONFLICT (key) DO UPDATE SET bucket=EXCLUDED.bucket,expires_at=EXCLUDED.expires_at,
    hits=CASE WHEN acquisition_limits.bucket=EXCLUDED.bucket THEN acquisition_limits.hits+1 ELSE 1 END
    RETURNING hits`, [key, bucket, expires]);
  return rows[0].hits <= max;
}
export async function readJson(request: Request, limit = 12000): Promise<unknown> {
  if (!request.headers.get("content-type")?.startsWith("application/json") || !request.body) throw new Error("Invalid body");
  const reader = request.body.getReader();
  const decoder = new TextDecoder();
  let size = 0, body = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      throw new Error("Body too large");
    }
    body += decoder.decode(value, { stream: true });
  }
  return JSON.parse(body + decoder.decode());
}
