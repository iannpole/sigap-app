import { getDataSource } from "@/lib/data-source";
import { comparePassword, signToken } from "@/lib/auth";
import { Admin } from "@/entities";
import { ok, fail, readJson, serverError } from "@/lib/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const body = await readJson(req);
  const username = body?.username;
  const password = body?.password;
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
    return fail("username dan password wajib diisi", 400);
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
    if (!admin || !valid) return fail("Username atau password salah", 401);

    return ok({ token: signToken(admin.id), admin: { id: admin.id, username: admin.username } });
  } catch (err) {
    console.error("POST /api/auth/login", err);
    return serverError();
  }
}
