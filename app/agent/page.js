'use client';

import { useState } from 'react';
import { Conversation } from '../../components/conversation';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setIsAuthenticated(true);
      } else {
        setError('Access Denied: Invalid Credentials');
      }
    } catch (err) {
      setError('Connection Error: Unable to contact server.');
    }
  };

  // If authenticated, show the main content.
  if (isAuthenticated) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-between p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
          <h1 className="text-4xl font-bold mb-8 text-center">
            ElevenLabs Conversational AI - Ella Calming Coach 3000
          </h1>
          <Conversation />
        </div>
      </main>
    );
  }

  // Otherwise, show the themed login form.
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl text-center mb-8">Conversational AI Access</h1>
        <form onSubmit={handleLogin} className="flex flex-col">
          <label htmlFor="username" className="mb-2">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full" // Your globals.css will style this
            required
          />

          <label htmlFor="password" className="mt-6 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full" // Your globals.css will style this
            required
          />
          
          {error && <p className="text-red-500 mt-4">{error}</p>}

          <div className="flex justify-center">
            <button
              type="submit"
              // Add significant top margin for spacing
              className="mt-8"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}