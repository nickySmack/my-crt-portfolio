// Single source of truth for portfolio copy. Rendered as HTML on the home page,
// printed by terminal commands, and used to ground the "ask" agent.

export const profile = {
  name: 'Nicholas Herrewyn',
  handle: 'herrewyn',
  role: 'Engineering Manager — Conversational AI & Contact Center',
  greeting: 'welcome', // drawn by <DoomLogo>
  tagline: 'Welcome to my web portfolio. Thanks for dropping by.',
};

export const about =
  'I am an engineering manager at NYS ITS, leading the teams that architect, develop, and maintain cloud contact center and conversational AI solutions. This includes ACD, IVR, Chatbots, reporting, and more. I am passionate about tech and learning new things. In my free time I enjoy spending time outside camping, making maple syrup, keeping honey bees, gardening, playing the button accordion, working on cool tech projects in my lab, and spending time with my family.';

export const skills = [
  'Mastery of NICE InContact Hosted Contact Center, experience with most other contact center solutions',
  'Highly Proficient with Google Cloud Contact Center solutions, including dialogflow CX and associated tooling',
  'Deep understanding of Cloud Platforms like GCP, AWS, and Digital Ocean',
  'Experience developing using languages including JavaScript and Python',
  'Reporting experience using BigQuery, Looker, MSSQL, IBM Cognos, and of course the most important database of them all Excel',
  'Leadership, Mentorship, and Project Management experience',
];

export const resumeUrl =
  'https://storage.googleapis.com/nicholas_herrewyn_resume/Nick_Herrewyn_Resume_2026.pdf';

// Based on the resume PDF above (contact details deliberately left out), plus the
// Engineering Manager role that started in October 2026 and isn't in the PDF yet.
// Keep this current: nickbot answers from it.
export const resume = {
  title: 'Engineering Manager — Conversational AI & Contact Center',
  website: 'https://herrewyngeneralindustries.com',
  summary:
    'Engineering Manager at NYS ITS, building conversational AI and contact center systems for New York State government since 2013. Leads an 8-person development team, organized as two supervising developers who each lead their own small team, building virtual agents for NYS agencies, from public-facing chatbots to internal RAG-based knowledgebase tools. Specializes in Retrieval Augmented Generation, deterministic virtual agents that extend the role of a human representative, and the middleware and internal tooling that connect them to agency systems.',
  skills: {
    'Languages & Frameworks': 'JavaScript, Node.js, Python',
    'Platforms & Tools':
      'Google Cloud Platform, Dialogflow CX, NICE CXone, Amazon Web Services, Oracle CRM, Git, GitHub, GitLab',
    'Product & Engineering Practices':
      'RESTful API Integration, Product Driven Software Development Lifecycle (SDLC), Contact Center Administration, Supervision & Mentoring, Executive Reporting, Generative AI, Conversational Design',
  },
  experience: [
    {
      role: 'Engineering Manager',
      org: 'NYS ITS | Chief Digital Office | Communication Services',
      dates: 'October 2026 – Present',
      points: [
        'Manages an 8-person development team: two supervising developers, each leading their own small team of developers',
      ],
    },
    {
      role: 'Supervising Developer',
      org: 'NYS ITS | Chief Digital Office | Communication Services',
      dates: '2023 – 2026',
      points: [
        'Led a team of developers on omnichannel virtual agent design, development, and deployment for New York State public-facing services',
        'Delivered 5+ production chatbots from concept to completion using Dialogflow CX and Generative AI technologies',
        'Integrated virtual agents with Oracle CRM and other systems via RESTful APIs, enabling data lookups and personalized interactions',
        'Achieved 25%+ call deflection by deploying telephony bots that resolve common questions and look up caller status',
        'Developed middleware API connecting ChatNY chat client to multiple backends via provider-agnostic adapters',
      ],
    },
    {
      role: 'Developer',
      org: 'NYS ITS | Contact Center Support and Development',
      dates: '2022 – 2023',
      points: [
        'Designed, deployed, and maintained cloud-based contact center solutions for NYS agency clients',
        'Stood up 6+ new contact centers while concurrently supporting and maintaining a portfolio of 21 active contact centers',
        'Reduced deployment time and improved uptime by developing boilerplate templates containing all core contact routing logic',
      ],
    },
    {
      role: 'Contact Center Administrator',
      org: 'NYS DTF | Contact Center Division | Contact Center Services',
      dates: '2014 – 2022',
      points: [
        'Administered and maintained NICE InContact CXone contact center platform serving NYS Department of Tax and Finance',
        'Deployed and managed NICE Engage call recording application for compliance and quality assurance',
        'Delivered executive-level reporting on call center performance, capacity, and service levels',
        'Supported a contact center handling more than 1 million calls/year across 400+ agents',
      ],
    },
    {
      role: 'Contact Center Representative',
      org: 'NYS DTF | Contact Center Division',
      dates: '2013 – 2014',
      points: [
        'Assisted New York State taxpayers with tax inquiries, account issues, and general guidance',
        'Built foundational knowledge of contact center operations, quality standards, and customer service best practices',
      ],
    },
  ],
  projects: [
    {
      name: 'AI Assist (Generative AI Virtual Agent)',
      tech: 'Dialogflow CX, Google Cloud, Python, RAG, Vertex AI',
      description:
        'An internal knowledgebase tool deployed across two NYS agencies that lets contact center administrators upload curated agency PDFs as grounding material for a Gemini-powered virtual agent. Agents get fast, accurate, source-grounded answers to internal questions in real time, reducing reliance on supervisors and deep research while keeping responses grounded in official agency content. Agency administrators maintain the knowledge using internal management and testing tooling.',
    },
    {
      name: 'Wanda (Deterministic Virtual Agent)',
      tech: 'Dialogflow CX, Google Cloud, Node.js, Twilio, BigQuery',
      description:
        'A deterministic virtual agent serving NYS Department of Health customers who use or seek WIC benefits. It guides users to fast answers about WIC eligibility and services and submits referrals directly to local WIC offices. A notable technical challenge was configuring the Twilio SMS integration, including campaign registration.',
    },
  ],
};

export const links = [
  { text: 'My Resume', href: resumeUrl },
  { text: 'Gifford Hill Gold', href: 'https://giffordhillgold.com' },
  { text: 'Sweet Beans Bakery', href: 'https://sweetbeansbaking.com' },
  { id: 'storai', text: 'Storai Book Studio', href: 'https://storaibook.studio' },
  { text: 'Conversational AI Agent', href: '/agent', internal: true },
];

// Plain-text dossier for the language model. Keep it factual: the agent is told
// to answer only from this.
export function portfolioAsText() {
  return [
    `Name: ${profile.name} (goes by Nick)`,
    `Current title: ${resume.title}`,
    '',
    'RESUME (most current source for titles, dates, and experience)',
    '',
    'Summary:',
    resume.summary,
    '',
    'Skills:',
    ...Object.entries(resume.skills).map(([group, list]) => `- ${group}: ${list}`),
    '',
    'Work experience:',
    ...resume.experience.flatMap((job) => [
      `${job.role}, ${job.org} (${job.dates})`,
      ...job.points.map((p) => `- ${p}`),
    ]),
    '',
    'Notable work projects:',
    ...resume.projects.flatMap((p) => [`${p.name} — ${p.tech}`, p.description]),
    '',
    'PORTFOLIO SITE',
    '',
    'About (in his own words):',
    about,
    '',
    'Skills listed on the site:',
    ...skills.map((s) => `- ${s}`),
    '',
    'Personal projects and links:',
    `- Personal website: ${resume.website}`,
    '- Storai Book Studio has a "Try it live" button on the home page: a free 24-hour guest pass to make one illustrated, narrated picture book. No sign-up.',
    ...links
      .filter((l) => !l.internal)
      .map((l) => `- ${l.text}: ${l.href}`),
  ].join('\n');
}
