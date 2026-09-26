'use client';

import { useState, useTransition } from 'react';
import { loginAction } from '../actions';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await loginAction(null, formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <div style={{ maxWidth: 360, margin: '100px auto', padding: 20 }}>
      <h1>Вход в админку</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Логин:</label>
          <input
            type="text"
            name="username"
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
        </div>
        <div>
          <label>Пароль:</label>
          <input
            type="password"
            name="password"
            required
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
        </div>

        {error && <p style={{ color: 'red', margin: '10px 0' }}>{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          style={{ width: '100%', padding: 10, cursor: 'pointer' }}
        >
          {isPending ? 'Вход...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}