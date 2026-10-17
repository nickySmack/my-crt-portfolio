'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Posts credentials to /api/login, which sets an httpOnly session cookie. The
// page is then refreshed so its Server Component re-reads the session.
export default function LoginForm({ title }) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        router.refresh();
        return;
      }
      setError(data.message || 'Access Denied: Invalid Credentials');
    } catch {
      setError('Connection Error: Unable to contact server.');
    }
    setPending(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-center mb-8">{title}</h1>
      <form onSubmit={handleLogin} className="flex flex-col">
        <label htmlFor="username" className="mb-2">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full"
          required
        />

        <label htmlFor="password" className="mt-6 mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full"
          required
        />

        <p className="error-text mt-4 min-h-[1.35em]" role="alert">
          {error}
        </p>

        <div className="flex justify-center">
          <button type="submit" className="mt-4" disabled={pending}>
            {pending ? 'Authenticating…' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}
