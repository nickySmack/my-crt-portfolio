import { VT323 } from 'next/font/google';
import CRTOverlay from '../components/CRTOverlay';
import { profile, about } from '../lib/content';
import './globals.css';

const vt323 = VT323({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-vt323',
});

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : 'http://localhost:3000';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${profile.name} — ${profile.role}`,
    template: `%s · ${profile.name}`,
  },
  description: about.split('. ').slice(0, 2).join('. ') + '.',
  openGraph: {
    type: 'website',
    siteName: profile.name,
    title: `${profile.name} — ${profile.role}`,
    description: 'Cloud contact centers, IVR, chatbots and conversational AI.',
  },
  twitter: { card: 'summary_large_image' },
};

export const viewport = {
  themeColor: '#000000',
  colorScheme: 'dark',
};

// Runs before first paint: restores the phosphor theme and decides whether the
// boot + typewriter intro plays (first visit this session, motion allowed).
// If the intro never claims the page (e.g. JS failed to hydrate), the failsafe
// reveals everything.
const prePaintScript = `(() => {
  const root = document.documentElement;
  try {
    const theme = localStorage.getItem('crt-theme');
    if (theme) root.dataset.theme = theme;
  } catch {}
  let seen = false;
  try { seen = sessionStorage.getItem('intro-seen') === '1'; } catch {}
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (location.pathname === '/' && !seen && !reduced) {
    root.classList.add('intro', 'booting');
    setTimeout(() => {
      if (!root.dataset.introClaimed) root.classList.remove('intro', 'booting');
    }, 3000);
  }
})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={vt323.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: prePaintScript }} />
      </head>
      <body>
        {children}
        <CRTOverlay />
      </body>
    </html>
  );
}
