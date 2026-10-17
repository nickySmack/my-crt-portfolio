import { Conversation } from '../../components/conversation';
import LoginForm from '../../components/LoginForm';
import PageShell from '../../components/PageShell';
import { getSession } from '../../lib/session';

export const metadata = {
  title: 'Voice Agent',
  description: 'Talk to a real-time conversational AI voice agent.',
};

export default async function AgentPage() {
  const session = await getSession();

  return (
    <PageShell signedIn={Boolean(session)}>
      {session ? <Conversation /> : <LoginForm title="Conversational AI Access" />}
    </PageShell>
  );
}
