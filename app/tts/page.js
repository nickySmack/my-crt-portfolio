import LoginForm from '../../components/LoginForm';
import PageShell from '../../components/PageShell';
import TTSKiosk from '../../components/TTSKiosk';
import { getSession } from '../../lib/session';

export const metadata = {
  title: 'Text-to-Speech',
  description: 'AI voice synthesis kiosk.',
};

export default async function TTSPage() {
  const session = await getSession();

  return (
    <PageShell signedIn={Boolean(session)}>
      {session ? <TTSKiosk /> : <LoginForm title="AI Text-to-Speech Kiosk" />}
    </PageShell>
  );
}
