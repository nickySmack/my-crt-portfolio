import Link from 'next/link';
import HoverWinkingAvatar from '../components/HoverWinkingAvatar';
import Terminal from '../components/Terminal';
import Typewriter from '../components/Typewriter';
import { about, links, profile, skills } from '../lib/content';

// Rendered on the server so the full portfolio is in the HTML. <Typewriter>
// animates it on a first visit; data-type-speed sets ms per character.
export default function Home() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <Typewriter>
        <header className="flex items-center gap-4 mb-8">
          <HoverWinkingAvatar
            staticSrc="/8bit-avatar.png"
            animatedSrc="/8bit-avatar.gif"
            alt={`8-bit avatar of ${profile.name}`}
            width={120}
            height={120}
          />
          <h1 data-type-speed="30" className="crt-flicker-on-hover my-0 flex-1">
            {profile.greeting}
          </h1>
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
            {links.map((link) => (
              <li key={link.href} className="mb-1 ml-4">
                {link.internal ? (
                  <Link href={link.href}>{link.text}</Link>
                ) : (
                  <a href={link.href} target="_blank" rel="noopener noreferrer">
                    {link.text}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </section>
      </Typewriter>

      <div className="after-intro">
        <Terminal />
      </div>
    </main>
  );
}
