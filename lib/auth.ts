import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import type { NextResponse } from 'next/server';
import { getDataSource } from './data-source';
import { Admin } from '../entities';
import { fail, unauthorized } from './api';
import { allowWrite } from './rate-limit';

const SALT_ROUNDS = 10;
export const ADMIN_COOKIE = 'sigap_admin';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

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

function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.get('cookie');
  if (!raw) return null;
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return part.slice(i + 1).trim();
  }
  return null;
}

function readToken(req: Request): { token: string; fromCookie: boolean } | null {
  const header = req.headers.get('authorization');
  if (header) {
    const m = /^Bearer\s+(\S+)$/i.exec(header);
    return m ? { token: m[1], fromCookie: false } : null;
  }
  const cookie = readCookie(req, ADMIN_COOKIE);
  return cookie ? { token: cookie, fromCookie: true } : null;
}

export async function getAuthAdmin(
  req: Request
): Promise<{ id: number; username: string } | null> {
  const t = readToken(req);
  if (!t) return null;
  const payload = verifyToken(t.token);
  if (!payload) return null;

  const ds = await getDataSource();
  // passwordHash has select:false, so it is never loaded here.
  const admin = await ds.getRepository<Admin>("Admin").findOneBy({ id: payload.adminId });
  return admin ? { id: admin.id, username: admin.username } : null;
}

function allowedOrigins(req: Request): Set<string> {
  const set = new Set<string>([new URL(req.url).origin]);
  for (const o of (process.env.APP_ORIGIN ?? '').split(',')) {
    const t = o.trim().replace(/\/$/, '');
    if (t) set.add(t);
  }
  return set;
}

function requestOrigin(req: Request): string | null {
  const origin = req.headers.get('origin');
  if (origin) return origin;
  const referer = req.headers.get('referer');
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

export function originAllowed(req: Request): boolean {
  const o = requestOrigin(req);
  return o !== null && allowedOrigins(req).has(o);
}

/** Dipakai untuk semua endpoint tulis. Origin hanya diperiksa untuk sesi cookie (rawan CSRF). */
export async function authorizeWrite(
  req: Request
): Promise<{ admin: { id: number; username: string } } | { denied: Response }> {
  const t = readToken(req);
  if (!t) return { denied: unauthorized() };
  const admin = await getAuthAdmin(req);
  if (!admin) return { denied: unauthorized() };
  if (t.fromCookie && !originAllowed(req)) return { denied: fail('Origin tidak diizinkan', 403) };
  if (!(await allowWrite(admin.id))) {
    return { denied: fail('Terlalu banyak permintaan. Coba lagi sebentar lagi.', 429) };
  }
  return { admin };
}

export function setAdminCookie(res: NextResponse, token: string) {
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearAdminCookie(res: NextResponse) {
  res.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
}
