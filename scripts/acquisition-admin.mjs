import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import pg from "pg";

const connectionString = process.env.ACQUISITION_ADMIN_DATABASE_URL ?? process.env.ACQUISITION_DATABASE_URL;
if (!connectionString) throw new Error("Set ACQUISITION_ADMIN_DATABASE_URL");
const db = new pg.Client({ connectionString });
const [command, role, inputEmail] = process.argv.slice(2);
await db.connect();
try {
  if (command === "migrate") {
    await db.query(await readFile(new URL("../db/acquisition.sql", import.meta.url), "utf8"));
    console.log("Acquisition schema ready.");
  } else if (command === "user" && ["sales", "advertising"].includes(role) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inputEmail ?? "")) {
    if (process.stdin.isTTY) throw new Error("Pipe a password from a secure prompt or password manager.");
    const password = readFileSync(0, "utf8").replace(/\r?\n$/, "");
    if (password.length < 16 || password.length > 256) throw new Error("Use a unique password of 16–256 characters.");
    const salt = randomBytes(16).toString("hex");
    const hash = salt + ":" + scryptSync(password, salt, 64).toString("hex");
    await db.query("BEGIN");
    const { rows: [user] } = await db.query(
      `INSERT INTO sales_users (id,email,password_hash,role) VALUES ($1,$2,$3,$4)
       ON CONFLICT (email) DO UPDATE SET password_hash=EXCLUDED.password_hash,role=EXCLUDED.role,active=true RETURNING id`,
      [randomUUID(), inputEmail.toLowerCase(), hash, role],
    );
    await db.query("DELETE FROM sales_sessions WHERE user_id=$1", [user.id]);
    await db.query("COMMIT");
    console.log("Sales account provisioned.");
  } else if (command === "revoke" && role) {
    await db.query("UPDATE sales_users SET active=false WHERE email=$1", [role.toLowerCase()]);
    await db.query("DELETE FROM sales_sessions WHERE user_id IN (SELECT id FROM sales_users WHERE email=$1)", [role.toLowerCase()]);
    console.log("Sales account revoked.");
  } else if (command === "prune" && /^\d{1,4}$/.test(role ?? "") && Number(role) >= 30) {
    await db.query("BEGIN");
    await db.query("DELETE FROM sales_sessions WHERE expires_at<=now()");
    await db.query("DELETE FROM acquisition_limits WHERE expires_at < now()-interval '2 hours'");
    await db.query("DELETE FROM leads WHERE stage IN ('new','lost','nurture') AND created_at<now()-make_interval(days => $1)", [Number(role)]);
    await db.query("COMMIT");
    console.log("Expired sessions and eligible records pruned.");
  } else {
    throw new Error("Use migrate, user <sales|advertising> <email>, revoke <email>, or prune <approved-retention-days>.");
  }
} finally {
  await db.end();
}
