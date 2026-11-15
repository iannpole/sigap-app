import { getDataSource } from './data-source';

const LOGIN_WINDOW_SEC = 15 * 60;
const LOGIN_MAX_FAILS = 5;
const WRITE_WINDOW_SEC = 60;
const WRITE_MAX = 60;

/** Menghitung satu percobaan dalam jendela waktu. Mengembalikan false jika melewati batas. */
async function hit(key: string, max: number, windowSec: number): Promise<boolean> {
  const ds = await getDataSource();
  const rows: { count: number }[] = await ds.query(
    `INSERT INTO rate_limits ("key", "count", "reset_at")
     VALUES ($1, 1, now() + make_interval(secs => $2))
     ON CONFLICT ("key") DO UPDATE SET
       "count" = CASE WHEN rate_limits."reset_at" < now() THEN 1 ELSE rate_limits."count" + 1 END,
       "reset_at" = CASE WHEN rate_limits."reset_at" < now() THEN now() + make_interval(secs => $2) ELSE rate_limits."reset_at" END
     RETURNING "count"`,
    [key, windowSec]
  );
  return rows[0].count <= max;
}

async function blocked(key: string, max: number): Promise<boolean> {
  const ds = await getDataSource();
  const rows: unknown[] = await ds.query(
    `SELECT 1 FROM rate_limits WHERE "key" = $1 AND "reset_at" > now() AND "count" >= $2`,
    [key, max]
  );
  return rows.length > 0;
}

export function loginBlocked(keys: string[]): Promise<boolean> {
  return Promise.all(keys.map((k) => blocked(k, LOGIN_MAX_FAILS))).then((r) => r.some(Boolean));
}

export async function recordLoginFailure(keys: string[]): Promise<void> {
  await Promise.all(keys.map((k) => hit(k, LOGIN_MAX_FAILS, LOGIN_WINDOW_SEC)));
}

export async function clearLoginFailures(key: string): Promise<void> {
  const ds = await getDataSource();
  await ds.query(`DELETE FROM rate_limits WHERE "key" = $1`, [key]);
}

/** Batas tulis per admin. Mengembalikan false jika sudah melewati batas. */
export function allowWrite(adminId: number): Promise<boolean> {
  return hit(`write:${adminId}`, WRITE_MAX, WRITE_WINDOW_SEC);
}

/** Hanya andalkan X-Forwarded-For jika aplikasi berada di belakang proxy tepercaya. */
export function clientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
}
