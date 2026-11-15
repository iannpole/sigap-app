import { cookies } from 'next/headers';
import { ADMIN_COOKIE, verifyToken } from './auth';
import { getDataSource } from './data-source';
import type { Admin } from '../entities';

export async function getAdminSession(): Promise<{ id: number; username: string } | null> {
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;

  const ds = await getDataSource();
  // Nama string, bukan class: DataSource yang di-cache bisa berasal dari bundle lain.
  const admin = await ds.getRepository<Admin>('Admin').findOneBy({ id: payload.adminId });
  return admin ? { id: admin.id, username: admin.username } : null;
}
