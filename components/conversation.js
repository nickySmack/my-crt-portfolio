'use client';

import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import Oscilloscope from './Oscilloscope';

export function Conversation() {
  return (
    <ConversationProvider>
      <AgentConsole />
    </ConversationProvider>
  );
}

const STATUS_LABEL = {
  disconnected: 'ON HOOK',
  connecting: 'DIALING…',
  connected: 'CONNECTED',
  error: 'LINE ERROR',
};

function AgentConsole() {
  const [error, setError] = useState('');
  const [transcript, setTranscript] = useState([]);
  const logRef = useRef(null);

  const conversation = useConversation({
    onMessage: ({ message, role, event_id, response_id }) => {
      const id = response_id ?? `evt-${event_id}`;
      // Streamed agent parts share a response_id; replace rather than append.
      setTranscript((lines) => {
        const existing = lines.findIndex((l) => l.id === id);
        if (existing === -1) return [...lines, { id, role, message }];
        const next = [...lines];
        next[existing] = { id, role, message };
        return next;
      });
    },
    onError: (message) => setError(String(message || 'Unknown error')),
    onDisconnect: (details) => {
      if (details?.reason === 'error') setError(details.message || 'Connection lost.');
    },
  });

  const { status, isSpeaking, isMuted, setMuted } = conversation;
  const connected = status === 'connected';

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [transcript]);

  const startConversation = useCallback(async () => {
    setError('');
    setTranscript([]);
    try {
      // Ask for the mic up front so a denial gets a clear message.
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setError('Microphone access is required to talk to the agent.');
      return;
    }

    try {
      const response = await fetch('/api/get-signed-url');
      if (response.status === 401) {
        setError('Your session expired. Refresh and sign in again.');
        return;
      }
      if (!response.ok) throw new Error(response.statusText);
      const { signedUrl } = await response.json();
      conversation.startSession({ signedUrl, connectionType: 'websocket' });
    } catch (err) {
      setError(`Could not start the call: ${err.message}`);
    }
  }, [conversation]);

  const getOutputData = useCallback(
    () => conversation.getOutputByteFrequencyData(),
    [conversation]
  );

  return (
    <section className="flex flex-col gap-6" aria-labelledby="agent-heading">
      <header>
        <h1 id="agent-heading" className="mb-2">Ella Calming Coach 3000</h1>
        <p className="opacity-80">
          A real-time voice agent built on ElevenLabs Conversational AI. Pick up the line and say hello.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-x-6 gap-y-1" aria-live="polite">
        <span>
          LINE: <span className={status === 'error' ? 'error-text' : ''}>{STATUS_LABEL[status] ?? status}</span>
        </span>
        {connected && <span>AGENT: {isSpeaking ? 'SPEAKING' : 'LISTENING'}</span>}
        {connected && isMuted && <span>MIC: MUTED</span>}
      </div>

      <Oscilloscope getData={getOutputData} active={connected} mode="bars" />

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={startConversation}
          disabled={connected || status === 'connecting'}
        >
          [ Call ]
        </button>
        <button type="button" onClick={() => setMuted(!isMuted)} disabled={!connected}>
          [ {isMuted ? 'Unmute' : 'Mute'} ]
        </button>
        <button type="button" onClick={() => conversation.endSession()} disabled={!connected}>
          [ Hang up ]
        </button>
      </div>

      <p className="error-text min-h-[1.35em]" role="alert">
        {error}
      </p>

      {transcript.length > 0 && (
        <div
          ref={logRef}
          role="log"
          aria-label="Call transcript"
          className="max-h-72 overflow-y-auto border-0 border-t border-dashed border-[var(--phosphor-dim)] pt-4 space-y-2"
        >
          {transcript.map((line) => (
            <p key={line.id}>
              <span className="opacity-70">{line.role === 'user' ? 'YOU>' : 'ELLA>'}</span>{' '}
              {line.message}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
