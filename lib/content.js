// Single source of truth for portfolio copy. Rendered as HTML on the home page,
// printed by terminal commands, and used to ground the "ask" agent.

export const profile = {
  name: 'Nicholas Herrewyn',
  handle: 'herrewyn',
  role: 'Contact Center & Conversational AI Developer',
  greeting: 'Welcome to my web portfolio. Thanks for dropping by.',
};

export const about =
  'I am a developer working for NYS ITS. I specialize in the design, development, and maintenance of cloud contact center solutions. This includes ACD, IVR, Chatbots, reporting, and more. I am passionate about tech and learning new things. In my free time I enjoy spending time outside camping, making maple syrup, keeping honey bees, gardening, playing the accordion, working on cool tech projects in my lab, and spending time with my family.';

export const skills = [
  'Mastery of NICE InContact Hosted Contact Center, experience with most other contact center solutions',
  'Highly Proficient with Google Cloud Contact Center solutions, including dialogflow CX and associated tooling',
  'Deep understanding of Cloud Platforms like GCP, AWS, and Digital Ocean',
  'Experience developing using languages including JavaScript and Python',
  'Reporting experience using BigQuery, Looker, MSSQL, IBM Cognos, and of course the most important database of them all Excel',
  'Leadership, Mentorship, and Project Management experience',
];

export const resumeUrl =
  'https://storage.googleapis.com/nicholas_herrewyn_resume/Nicholas_Herrewyn_Resume.pdf';

export const links = [
  { text: 'My Resume', href: resumeUrl },
  { text: 'Gifford Hill Gold', href: 'https://giffordhillgold.com' },
  { text: 'Sweet Beans Bakery', href: 'https://sweetbeansbaking.com' },
  { text: 'Storai Book Studio', href: 'https://storaibook.studio' },
  { text: 'Conversational AI Agent', href: '/agent', internal: true },
];

// Plain-text dossier for the language model. Keep it factual: the agent is told
// to answer only from this.
export function portfolioAsText() {
  return [
    `Name: ${profile.name}`,
    `Role: ${profile.role}`,
    '',
    'About:',
    about,
    '',
    'Technical skills:',
    ...skills.map((s) => `- ${s}`),
    '',
    'Projects and links:',
    ...links
      .filter((l) => !l.internal)
      .map((l) => `- ${l.text}: ${l.href}`),
  ].join('\n');
}
