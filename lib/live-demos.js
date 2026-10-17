import 'server-only';

// "Try it live" buttons, keyed by link id in lib/content.js. Kept out of that
// module because the terminal imports it into the client bundle, and out of the
// nickbot dossier: the code in each URL is an access key that gets rotated if it
// leaks, so it should only ever appear as a button's href. Don't change the URL
// format.
export const liveDemos = {
  storai: {
    href: 'https://www.storaibook.studio/try/hire-nick-xcedza',
    label: 'Try Storai Book Studio live (opens in a new tab)',
    note: 'Instant 24-hour guest pass: make one storybook of your own. No sign-up.',
  },
};
