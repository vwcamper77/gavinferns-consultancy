import { Pool, type PoolClient } from "pg";

let pool: Pool | undefined;
export function database() {
  if (!process.env.ACQUISITION_DATABASE_URL) throw new Error("Acquisition database is not configured");
  return pool ??= new Pool({ connectionString: process.env.ACQUISITION_DATABASE_URL, max: 4, connectionTimeoutMillis: 5000 });
}
export async function transaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    const result = await work(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
