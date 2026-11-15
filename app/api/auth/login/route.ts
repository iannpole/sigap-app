import { getDataSource } from "@/lib/data-source";
import { comparePassword, signToken, setAdminCookie } from "@/lib/auth";
import { Admin } from "@/entities";
import { ok, fail, readJson, serverError } from "@/lib/api";
import { loginBlocked, recordLoginFailure, clearLoginFailures, clientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await readJson(req);
  const username = body?.username;
  const password = body?.password;
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return fail("username dan password wajib diisi", 400);
  }

  const userKey = `login-user:${username.toLowerCase().slice(0, 100)}`;
  const keys = [`login-ip:${clientIp(req)}`, userKey];
  if (await loginBlocked(keys)) {
    return fail("Terlalu banyak percobaan login. Coba lagi beberapa menit lagi.", 429);
  }

  try {
    const ds = await getDataSource();
    const admin = await ds
      .getRepository(Admin)
      .createQueryBuilder("a")
      .addSelect("a.passwordHash")
      .where("a.username = :username", { username })
      .getOne();

    // Same message for unknown user and wrong password so valid usernames don't leak.
    const valid = admin ? await comparePassword(password, admin.passwordHash) : false;
    if (!admin || !valid) {
      await recordLoginFailure(keys);
      return fail("Username atau password salah", 401);
    }

    await clearLoginFailures(userKey);
    const res = ok({ admin: { id: admin.id, username: admin.username } });
    setAdminCookie(res, signToken(admin.id));
    return res;
  } catch (err) {
    console.error("POST /api/auth/login", err);
    return serverError();
  }
}
