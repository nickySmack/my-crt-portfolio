'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Oscilloscope from './Oscilloscope';
import { TTS_MAX_CHARS } from '../lib/limits';

export default function TTSKiosk() {
  const [text, setText] = useState('Hello from my portfolio! This is a test of the Resemble AI voice synthesis.');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [audioBuffer, setAudioBuffer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const samplesRef = useRef(null);

  // Created lazily inside a click handler so browsers don't block it as autoplay.
  const ensureAudioContext = () => {
    if (!audioContextRef.current) {
      const ctx = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.connect(ctx.destination);
      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      samplesRef.current = new Uint8Array(analyser.fftSize);
    }
    return audioContextRef.current;
  };

  const stop = () => {
    sourceRef.current?.stop();
    sourceRef.current = null;
    setIsPlaying(false);
  };

  useEffect(
    () => () => {
      sourceRef.current?.stop();
      audioContextRef.current?.close();
    },
    []
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ctx = ensureAudioContext();
    stop();
    setIsLoading(true);
    setErrorMessage('');
    setAudioBuffer(null);

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok && data.success) {
        const bytes = Uint8Array.from(atob(data.audio_content), (c) => c.charCodeAt(0));
        setAudioBuffer(await ctx.decodeAudioData(bytes.buffer));
      } else if (response.status === 401) {
        setErrorMessage('Your session expired. Refresh and sign in again.');
      } else {
        setErrorMessage(data.message || 'An error occurred.');
      }
    } catch (error) {
      console.error('TTS error:', error);
      setErrorMessage('Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const play = async () => {
    const ctx = ensureAudioContext();
    if (ctx.state === 'suspended') await ctx.resume();
    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(analyserRef.current);
    source.onended = () => {
      if (sourceRef.current === source) stop();
    };
    source.start();
    sourceRef.current = source;
    setIsPlaying(true);
  };

  const getWaveform = useCallback(() => {
    analyserRef.current.getByteTimeDomainData(samplesRef.current);
    return samplesRef.current;
  }, []);

  return (
    <section className="flex flex-col gap-6" aria-labelledby="tts-heading">
      <header>
        <h1 id="tts-heading" className="mb-2">AI Text-to-Speech Kiosk</h1>
        <p className="opacity-80">Enter text to generate voice output with Resemble AI.</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label htmlFor="tts-text">Text to synthesize</label>
        <textarea
          id="tts-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={TTS_MAX_CHARS}
          rows={5}
          className="resize-y"
          required
        />
        <div className="flex items-center justify-between">
          <span className="opacity-70">
            {text.length}/{TTS_MAX_CHARS}
          </span>
          <button type="submit" disabled={isLoading || !text.trim()}>
            {isLoading ? 'Generating…' : 'Generate Audio'}
          </button>
        </div>
      </form>

      <p className="error-text min-h-[1.35em]" role="alert">
        {errorMessage}
      </p>

      {audioBuffer && (
        <div className="flex flex-col gap-4">
          <Oscilloscope getData={getWaveform} active={isPlaying} mode="wave" />
          <div>
            <button type="button" onClick={isPlaying ? stop : play} className="crt-flicker-on-hover">
              {isPlaying ? '[ Stop ]' : '[ Play ]'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
