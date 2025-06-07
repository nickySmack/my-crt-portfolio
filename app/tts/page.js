// app/tts/page.js
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import CRTContainer from '../../components/CRTContainer';
import TypewriterText from '../../components/TypewriterText';


export default function TTSPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [textToSynthesize, setTextToSynthesize] = useState('Hello from my portfolio! This is a test of the Resemble AI voice synthesis.');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const audioContextRef = useRef(null); // Use refs for AudioContext objects that don't need to trigger re-renders
  const analyserNodeRef = useRef(null);
  const audioSourceNodeRef = useRef(null); // To keep track of the current source

  const [audioBuffer, setAudioBuffer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const MAX_CHARS = 3000;

  // Setup AudioContext and AnalyserNode once on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserNodeRef.current = audioContextRef.current.createAnalyser();
      analyserNodeRef.current.fftSize = 2048; // Set fftSize (power of 2, e.g., 256, 512, 1024, 2048)
      
      // Connect analyser to destination (output)
      analyserNodeRef.current.connect(audioContextRef.current.destination);
    }

    return () => { // Cleanup on unmount
      if (audioSourceNodeRef.current) {
        audioSourceNodeRef.current.stop();
        audioSourceNodeRef.current.disconnect();
      }
      if (analyserNodeRef.current && audioContextRef.current) {
        analyserNodeRef.current.disconnect(audioContextRef.current.destination);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setAudioBuffer(null);
    if (isPlaying && audioSourceNodeRef.current) {
        audioSourceNodeRef.current.stop();
        // audioSourceNodeRef.current.disconnect(); // Source will be disconnected in onended or when new one is created
        setIsPlaying(false); // Ensure isPlaying is false before new audio is loaded
    }

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, text: textToSynthesize }),
      });
      const data = await response.json();
      if (response.ok && data.success && audioContextRef.current) {
        setSuccessMessage('Audio synthesized successfully! Ready to play.');
        const audioData = Uint8Array.from(atob(data.audio_content), c => c.charCodeAt(0)).buffer;
        const decodedBuffer = await audioContextRef.current.decodeAudioData(audioData);
        setAudioBuffer(decodedBuffer);
      } else {
        setErrorMessage(data.message || 'An error occurred.');
      }
    } catch (error) {
      console.error("TTS Page Error:", error);
      setErrorMessage('Failed to connect to the server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = useCallback(() => {
    if (!audioBuffer || !audioContextRef.current || !analyserNodeRef.current) {
      console.warn("Audio components not ready for playback.");
      return;
    }
    const audioContext = audioContextRef.current;
    const analyserNode = analyserNodeRef.current;

    if (isPlaying) {
      if (audioSourceNodeRef.current) {
        audioSourceNodeRef.current.stop();
        // Disconnection happens in 'onended' or when a new source is made
      }
      setIsPlaying(false);
    } else {
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }
      
      // If there's an old source, disconnect it first
      if (audioSourceNodeRef.current) {
        audioSourceNodeRef.current.disconnect();
      }

      const newSource = audioContext.createBufferSource();
      newSource.buffer = audioBuffer;
      newSource.connect(analyserNode); // Analyser is already connected to destination
      
      newSource.start();
      newSource.onended = () => {
        setIsPlaying(false);
        if (newSource === audioSourceNodeRef.current) { // Ensure we're acting on the correct node
          newSource.disconnect();
          audioSourceNodeRef.current = null;
        }
      };
      audioSourceNodeRef.current = newSource; // Store the new source
      setIsPlaying(true);
    }
  }, [audioBuffer, isPlaying]); // Dependencies for useCallback

  console.log("AnalyserNode for Visualizer:", analyserNodeRef.current);

  return (
    // Top-level simple div for overall page structure and constraints
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      
      <CRTContainer className="mb-8 text-center"> {/* Title Section */}
         <h1 style={{ textShadow: '0 0 7px var(--crt-green)' }}>AI Text-to-Speech Kiosk</h1>
         <TypewriterText text=":: Authenticate and enter text to generate voice output ::" delay={20} />
      </CRTContainer>

      <form onSubmit={handleSubmit} className="kiosk-form">
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="text">Text to Synthesize</label>
          <textarea
            id="text"
            value={textToSynthesize}
            onChange={(e) => setText(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Audio'}
        </button>
      </form>


      {errorMessage && (
        <CRTContainer className="my-4 p-3 md:p-4 text-red-500" style={{textShadow: '0 0 3px red'}}>
          <p>Error: {errorMessage}</p>
        </CRTContainer>
      )}
      {successMessage && !errorMessage && (
        <CRTContainer className="my-4 p-3 md:p-4 text-[var(--crt-green)]">
          <p>{successMessage}</p>
        </CRTContainer>
      )}

      {audioBuffer && ( // Only show visualizer and play button if audioBuffer is ready
        <div className="mt-6 p-4 md:p-6 text-center">
          <button
            onClick={handlePlayPause}
            className="p-2 px-4 border border-[var(--crt-green)] hover:bg-[var(--crt-green)] hover:text-[var(--crt-dark)] transition-all duration-200 crt-flicker-on-hover"
          >
            {isPlaying ? 'Pause ⏹️' : 'Play ▶️'}
          </button>

        </div>
      )}
    </div>
  );
}