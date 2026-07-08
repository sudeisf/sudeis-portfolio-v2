import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { getPortfolioData } from './integrations.js';

const SESSION_COOKIE = 'admin_session';
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export function hashPasscode(passcode: string): string {
  return crypto.createHash('sha256').update(passcode).digest('hex');
}

function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ ADMIN_SESSION_SECRET is not set. Using an insecure fallback — set this in production.');
  }
  return 'dev-only-insecure-session-secret-change-me';
}

export function getDefaultAdminEmail(): string {
  return process.env.ADMIN_EMAIL?.trim() || 'sudeisfed@gmail.com';
}

function getDefaultPasscodeHash(): string {
  const passcode = process.env.ADMIN_PASSCODE?.trim() || 'sudeis2026';
  return hashPasscode(passcode);
}

export async function getAdminEmail(): Promise<string> {
  const stored = await getPortfolioData('adminEmail', null);
  return stored || getDefaultAdminEmail();
}

export async function verifyAdminCredentials(email: string, passcode: string): Promise<boolean> {
  const normalizedEmail = email.trim().toLowerCase();
  const allowedEmail = (await getAdminEmail()).trim().toLowerCase();
  if (normalizedEmail !== allowedEmail) return false;

  const storedHash = await getPortfolioData('passcodeHash', null);
  const inputHash = hashPasscode(passcode);
  if (storedHash) return inputHash === storedHash;

  const legacyPasscode = await getPortfolioData('passcode', null);
  if (legacyPasscode && passcode === legacyPasscode) return true;

  return inputHash === getDefaultPasscodeHash();
}

function signPayload(payload: string): string {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64url');
}

function createSessionToken(email: string): string {
  const payload = Buffer.from(
    JSON.stringify({ email: email.trim().toLowerCase(), exp: Date.now() + SESSION_MAX_AGE_MS })
  ).toString('base64url');
  return `${payload}.${signPayload(payload)}`;
}

function verifySessionToken(token: string): { email: string } | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return null;
  if (signPayload(payload) !== signature) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { email?: string; exp?: number };
    if (!data.email || !data.exp || Date.now() > data.exp) return null;
    return { email: data.email };
  } catch {
    return null;
  }
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map((part) => {
      const [key, ...rest] = part.trim().split('=');
      return [key, decodeURIComponent(rest.join('='))];
    })
  );
}

export function setAdminSessionCookie(res: Response, email: string): void {
  const token = createSessionToken(email);
  const secure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const parts = [
    `${SESSION_COOKIE}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.floor(SESSION_MAX_AGE_MS / 1000)}`,
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearAdminSessionCookie(res: Response): void {
  const secure = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const parts = [
    `${SESSION_COOKIE}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0',
  ];
  if (secure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function getSessionFromRequest(req: Request): { email: string } | null {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];
  if (!token) return null;
  return verifySessionToken(token);
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  const session = getSessionFromRequest(req);
  if (!session) {
    res.status(401).json({ error: 'Authentication required.' });
    return;
  }

  const allowedEmail = (await getAdminEmail()).trim().toLowerCase();
  if (session.email !== allowedEmail) {
    res.status(403).json({ error: 'Invalid session.' });
    return;
  }

  next();
}
