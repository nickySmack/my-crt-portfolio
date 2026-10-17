'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Frame for the secondary pages: a back link, and a log out button when signed in.
export default function PageShell({ children, signedIn = false }) {
  const router = useRouter();

  const logout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.refresh();
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 min-h-dvh flex flex-col">
      <nav className="flex items-center justify-between mb-10">
        <Link href="/">&lt; cd ~</Link>
        {signedIn && (
          <button type="button" onClick={logout}>
            Log out
          </button>
        )}
      </nav>
      <div className="flex-1 flex flex-col justify-center">{children}</div>
    </main>
  );
}
