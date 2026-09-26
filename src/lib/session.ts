// src/lib/session.ts
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import crypto from 'crypto';

const SECRET_KEY = process.env.SESSION_SECRET || 'fallback-secret-key-at-least-32-characters-long';
const key = new TextEncoder().encode(SECRET_KEY);

const COOKIE_NAME = 'admin_session';

// Безопасное сравнение строк
export function secureCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

// Создание сессионного токена
export async function createSession(username: string) {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const expiresAtSeconds = nowInSeconds + 24 * 60 * 60; // 24 часа

  // Передаем iat и exp прямо в payload
  const token = await new SignJWT({
    username,
    role: 'admin',
    iat: nowInSeconds,
    exp: expiresAtSeconds,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(key);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(expiresAtSeconds * 1000),
    path: '/',
  });
}

// Проверка сессионного токена
export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}

// Удаление сессии (Logout)
export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}