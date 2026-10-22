import Link from 'next/link';
import DoomLogo from '../components/DoomLogo';
import NickFace from '../components/NickFace';
import Terminal from '../components/Terminal';
import Typewriter from '../components/Typewriter';
import { about, links, profile, skills } from '../lib/content';
import { liveDemos } from '../lib/live-demos';

// Rendered on the server so the full portfolio is in the HTML. <Typewriter>
// animates it on a first visit; data-type-speed sets ms per character.
export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Typewriter>
        <header className="mb-8">
          <h1 className="mt-0 mb-2">
            <span className="sr-only-crt">{profile.greeting}</span>
            <DoomLogo text={profile.greeting} />
          </h1>
          <NickFace />
          <p data-type-speed="30" className="crt-flicker-on-hover mt-6 mb-0 text-[2.2rem] leading-[1.1]">
            {profile.tagline}
          </p>
        </header>

        <section aria-labelledby="about-heading">
          <h2 id="about-heading" data-type-speed="30" className="crt-flicker-on-hover">
            The important stuff:
          </h2>
          <p data-type-speed="5" className="crt-flicker-on-hover">
            {about}
          </p>
        </section>

        <section aria-labelledby="skills-heading">
          <h2 id="skills-heading" data-type-speed="30" className="crt-flicker-on-hover">
            Technical Skills:
          </h2>
          <ul data-type-speed="12" className="crt-flicker-on-hover ml-4 list-disc">
            {skills.map((skill) => (
              <li key={skill} className="mb-1 ml-4">
                {skill}
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="links-heading">
          <h2 id="links-heading" data-type-speed="30" className="crt-flicker-on-hover">
            Links:
          </h2>
          <p data-type-speed="12" className="crt-flicker-on-hover">
            Check out some of my other cobweb filled corners of the web!
          </p>
          <ul data-type-speed="15" className="crt-flicker-on-hover ml-4 list-disc">
            {links.map((link) => {
              const demo = liveDemos[link.id];
              return (
                <li key={link.href} className="mb-1 ml-4">
                  {link.internal ? (
                    <Link href={link.href}>{link.text}</Link>
                  ) : (
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      {link.text}
                    </a>
                  )}
                  {demo && (
                    <div className="mt-2 mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                      <a
                        href={demo.href}
                        target="_blank"
                        rel="noopener"
                        aria-label={demo.label}
                        className="btn"
                      >
                        [ Try it live ]
                      </a>
                      <span className="opacity-80">{demo.note}</span>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      </Typewriter>

      <div className="after-intro">
        <Terminal />
      </div>
    </main>
  );
}
