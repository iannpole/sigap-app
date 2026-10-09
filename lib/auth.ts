import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDataSource } from './data-source';
import { Admin } from '../entities';

const SALT_ROUNDS = 10;

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not set.');
  return secret;
}

export function signToken(adminId: number): string {
  return jwt.sign({ adminId }, getSecret(), { expiresIn: '7d' });
}

export function verifyToken(token: string): { adminId: number } | null {
  try {
    const payload = jwt.verify(token, getSecret());
    if (
      typeof payload === 'object' &&
      payload !== null &&
      typeof payload.adminId === 'number'
    ) {
      return { adminId: payload.adminId };
    }
    return null;
  } catch {
    return null;
  }
}

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export function comparePassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function getAuthAdmin(
  req: Request
): Promise<{ id: number; username: string } | null> {
  const header = req.headers.get('authorization');
  if (!header) return null;
  const m = /^Bearer\s+(\S+)$/i.exec(header);
  if (!m) return null;
  const payload = verifyToken(m[1]);
  if (!payload) return null;

  const ds = await getDataSource();
  // passwordHash has select:false, so it is never loaded here.
  const admin = await ds.getRepository(Admin).findOneBy({ id: payload.adminId });
  return admin ? { id: admin.id, username: admin.username } : null;
}
