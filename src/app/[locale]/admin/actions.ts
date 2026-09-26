// src/app/admin/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createSession, deleteSession, secureCompare } from '@/lib/session';

export async function loginAction(prevState: any, formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  const validUsername = process.env.ADMIN_USERNAME || '';
  const validPassword = process.env.ADMIN_PASSWORD || '';

  // Проверка логина и пароля
  const isUsernameValid = secureCompare(username || '', validUsername);
  const isPasswordValid = secureCompare(password || '', validPassword);

  if (!isUsernameValid || !isPasswordValid) {
    return { error: 'Неверный логин или пароль' };
  }

  await createSession(username);
  redirect('/admin');
}

export async function logoutAction() {
  await deleteSession();
  redirect('/admin/login');
}