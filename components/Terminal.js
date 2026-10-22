'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { about, links, profile, resumeUrl, skills } from '../lib/content';
import { ASK_MAX_CHARS } from '../lib/limits';

const PROMPT = `guest@${profile.handle}:~$`;
const THEMES = ['green', 'amber', 'white'];

function setTheme(name) {
  const root = document.documentElement;
  if (name === 'green') delete root.dataset.theme;
  else root.dataset.theme = name;
  try {
    localStorage.setItem('crt-theme', name);
  } catch {}
}

function LinkList() {
  return (
    <ul className="ml-6 list-disc">
      {links.map((l) => (
        <li key={l.href}>
          {l.internal ? (
            <Link href={l.href}>{l.text}</Link>
          ) : (
            <a href={l.href} target="_blank" rel="noopener noreferrer">
              {l.text}
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}

const COMMANDS = {
  help: {
    description: 'list available commands',
    run: ({ print }) =>
      print(
        <table className="border-separate border-spacing-x-4 -ml-4">
          <tbody>
            {Object.entries(COMMANDS)
              .filter(([, c]) => !c.hidden)
              .map(([name, c]) => (
                <tr key={name}>
                  <td className="align-top whitespace-nowrap">{c.usage ?? name}</td>
                  <td>{c.description}</td>
                </tr>
              ))}
          </tbody>
        </table>
      ),
  },
  about: { description: 'who is this guy?', run: ({ print }) => print(about) },
  skills: {
    description: 'technical skills',
    run: ({ print }) =>
      print(
        <ul className="ml-6 list-disc">
          {skills.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      ),
  },
  projects: { description: 'projects and links', run: ({ print }) => print(<LinkList />) },
  resume: {
    description: 'open my resume (PDF)',
    run: ({ print }) => {
      window.open(resumeUrl, '_blank', 'noopener');
      print(
        <>
          Opening{' '}
          <a href={resumeUrl} target="_blank" rel="noopener noreferrer">
            resume.pdf
          </a>
          …
        </>
      );
    },
  },
  ask: {
    usage: 'ask <question>',
    description: 'ask nickbot (AI) anything about me',
    run: ({ args, ask, print }) =>
      args ? ask(args) : print("Usage: ask <question>   e.g. ask what does Nick do at NYS ITS?"),
  },
  agent: {
    description: 'talk to my voice AI agent',
    run: ({ print, router }) => {
      print('Dialing…');
      router.push('/agent');
    },
  },
  theme: {
    usage: `theme <${THEMES.join('|')}>`,
    description: 'change phosphor color',
    run: ({ args, print, error }) => {
      if (!THEMES.includes(args)) return error(`Usage: theme <${THEMES.join('|')}>`);
      setTheme(args);
      print(`Phosphor set to ${args}.`);
    },
  },
  clear: { description: 'clear the screen', run: ({ clear }) => clear() },
  whoami: { hidden: true, run: ({ print }) => print('guest. But we can fix that: try "ask how do I contact Nick?"') },
  date: { hidden: true, run: ({ print }) => print(new Date().toString()) },
  sudo: { hidden: true, run: ({ error }) => error('guest is not in the sudoers file. This incident will be reported.') },
  exit: { hidden: true, run: ({ print }) => print("There is no escape. (Try 'help'.)") },
  links: { hidden: true, run: (ctx) => COMMANDS.projects.run(ctx) },
};

let nextId = 0;
const line = (kind, content) => ({ id: nextId++, kind, content });

export default function Terminal() {
  const router = useRouter();
  const [lines, setLines] = useState(() => [
    line('output', "Type 'help' to see available commands, or 'ask' me something."),
  ]);
  const [input, setInput] = useState('');
  const [streamingId, setStreamingId] = useState(null);
  const busy = streamingId !== null;
  const history = useRef([]);
  const historyIndex = useRef(-1);
  const chat = useRef([]); // conversation with nickbot, for follow-up questions
  const abortRef = useRef(null);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  // Keep the prompt in view as output arrives (but don't jump there on page load).
  // Compares against the lines last seen rather than a "mounted" flag, which
  // StrictMode's second effect run in dev would flip and then scroll anyway.
  const shownLines = useRef(null);
  useEffect(() => {
    if (shownLines.current && shownLines.current !== lines) {
      endRef.current?.scrollIntoView({ block: 'nearest' });
    }
    shownLines.current = lines;
  }, [lines]);

  // After the intro, typing anywhere on the page goes to the prompt.
  useEffect(() => {
    const focusOnType = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.key.length !== 1) return;
      if (document.documentElement.classList.contains('intro')) return;
      if (e.target.closest?.('input, textarea, select, [contenteditable]')) return;
      inputRef.current?.focus();
    };
    window.addEventListener('keydown', focusOnType);
    return () => window.removeEventListener('keydown', focusOnType);
  }, []);

  const print = (content, kind = 'output') => setLines((ls) => [...ls, line(kind, content)]);

  const ask = async (question) => {
    if (question.length > ASK_MAX_CHARS) {
      return print(`Keep it under ${ASK_MAX_CHARS} characters, please.`, 'error');
    }
    const messages = [...chat.current, { role: 'user', content: question }];
    const reply = line('bot', '');
    setLines((ls) => [...ls, reply]);
    setStreamingId(reply.id);
    const controller = new AbortController();
    abortRef.current = controller;
    let answer = '';

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        throw new Error(error || `nickbot error ${res.status}`);
      }
      const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        answer += value;
        setLines((ls) => ls.map((l) => (l.id === reply.id ? { ...l, content: answer } : l)));
      }
      if (!answer) throw new Error('nickbot had nothing to say. Try again in a moment.');
      chat.current = [...messages, { role: 'assistant', content: answer }].slice(-8);
    } catch (err) {
      if (err.name === 'AbortError') {
        print('^C', 'error');
      } else {
        setLines((ls) => ls.filter((l) => l.id !== reply.id || answer));
        print(err.message, 'error');
      }
    } finally {
      abortRef.current = null;
      setStreamingId(null);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  };

  const run = (raw) => {
    const text = raw.trim();
    setLines((ls) => [...ls, line('input', text)]);
    if (!text) return;
    history.current = [text, ...history.current.filter((h) => h !== text)].slice(0, 50);
    historyIndex.current = -1;

    const [name, ...rest] = text.split(/\s+/);
    const command = COMMANDS[name.toLowerCase()];
    if (!command) {
      return print(`command not found: ${name}. Type 'help' for a list.`, 'error');
    }
    command.run({
      args: rest.join(' '),
      print,
      error: (msg) => print(msg, 'error'),
      clear: () => setLines([]),
      ask,
      router,
    });
  };

  const onKeyDown = (e) => {
    if (e.key === 'c' && e.ctrlKey && busy) {
      e.preventDefault();
      abortRef.current?.abort();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const max = history.current.length - 1;
      const i = Math.max(-1, Math.min(max, historyIndex.current + (e.key === 'ArrowUp' ? 1 : -1)));
      historyIndex.current = i;
      setInput(i === -1 ? '' : history.current[i]);
    } else if (e.key === 'Tab') {
      const matches = Object.keys(COMMANDS).filter((c) => !COMMANDS[c].hidden && c.startsWith(input));
      if (input && !input.includes(' ') && matches.length) {
        e.preventDefault();
        if (matches.length === 1) setInput(`${matches[0]} `);
        else print(matches.join('  '));
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (busy) return;
    run(input);
    setInput('');
  };

  return (
    <section
      aria-label="Interactive terminal"
      className="mt-10 border-0 border-t border-dashed border-[var(--phosphor-dim)] pt-6"
      onClick={(e) => {
        if (!e.target.closest('a, button') && !window.getSelection()?.toString()) inputRef.current?.focus();
      }}
    >
      <div role="log" aria-live="polite" className="space-y-1">
        {lines.map((l) => (
          <div key={l.id} className={l.kind === 'error' ? 'error-text' : undefined}>
            {l.kind === 'input' ? (
              <>
                <span className="opacity-70">{PROMPT}</span> {l.content}
              </>
            ) : l.kind === 'bot' ? (
              <p className="whitespace-pre-wrap">
                <span className="opacity-70">nickbot&gt;</span> {l.content}
                {l.id === streamingId && <span className="blink">▌</span>}
              </p>
            ) : (
              l.content
            )}
          </div>
        ))}
      </div>

      <form onSubmit={onSubmit} className="flex items-baseline gap-2 mt-1">
        <label htmlFor="terminal-input" className="opacity-70 whitespace-nowrap">
          {PROMPT}
          <span className="sr-only-crt"> Terminal command</span>
        </label>
        <input
          ref={inputRef}
          id="terminal-input"
          className="terminal-input flex-1 min-w-0"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          readOnly={busy}
          placeholder={busy ? 'thinking… (Ctrl+C to cancel)' : ''}
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
          enterKeyHint="send"
        />
      </form>
      <div ref={endRef} />
    </section>
  );
}
