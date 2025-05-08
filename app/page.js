'use client'; // This is a Client Component

import { useState, useEffect } from 'react';
import TypewriterText from '../components/TypewriterText';
import CRTContainer from '../components/CRTContainer';
import HoverWinkingAvatar from '../components/HoverWinkingAvatar';

const contentSections = [
  { type: 'heading', level: 1, text: 'Welcome to my web portfolio. Thanks for dropping by.' },
  { type: 'heading', level: 2, text: 'The important stuff:' },
  { type: 'paragraph', text: 'I am a developer working for NYS ITS. I specialize in the design, development, and maintenance of cloud contact center solutions. This includes ACD, IVR, Chatbots, reporting, and more. I am passionate about tech and learning new things. In my free time I enjoy spending time outside camping, making maple syrup, keeping honey bees, gardening, working on cool tech projects in my lab, and spending time with my family.' },
  { type: 'heading', level: 2, text: 'Technical Skills:' },
  { type: 'list', items: [
    'Mastery of NICE InContact Hosted Contact Center, experience with most other contact center solutions',
    'Highly Proficient with Google Cloud Contact Center solutions, including dialogflow CX and associated tooling',
    'Deep understanding of Cloud Platforms like GCP, AWS, and Digital Ocean',
    'Experience developing using languages including JavaScript and Python',
    'Reporting experience using BigQuery, Looker, MSSQL, IBM Cognos, and of course the most important database of them all Excel',
    'Leadership, Mentorship, and Project Management experience'
  ]},
  { type: 'heading', level: 2, text: 'Links:' },
  { type: 'paragraph', text: 'Check out some of my other cobweb filled corners of the web!' },
  { type: 'list', items: [
    { text: 'My Resume', href: 'https://storage.googleapis.com/nicholas_herrewyn_resume/Nicholas_Herrewyn_Resume.pdf' },
    { text: 'Gifford Hill Gold', href: 'https://giffordhillgold.com' },
    { text: 'Sweet Beans Bakery', href: 'https://sweetbeansbaking.com' },
  ]},
];

export default function Home() {
  const [renderedSectionsCount, setRenderedSectionsCount] = useState(0);

  // Effect to gradually increase the number of sections being typed
  useEffect(() => {
    if (renderedSectionsCount < contentSections.length) {
      const timer = setTimeout(() => {
        setRenderedSectionsCount(renderedSectionsCount + 1);
      }, renderedSectionsCount === 0 ? 500 : 100); // Initial delay, then quicker

      return () => clearTimeout(timer);
    }
  }, [renderedSectionsCount]);


  // Function to render a single section
  const renderSection = (section, index) => {
    const isVisible = index < renderedSectionsCount; // Only show sections up to the current count

    if (!isVisible) return null;

    switch (section.type) {
      case 'paragraph':
        return (
          <CRTContainer key={index} className="my-4"> {/* Add margin for spacing */}
            <p><TypewriterText text={section.text} delay={5} /></p> {/* Adjust typing speed */}
          </CRTContainer>
        );
      case 'heading':
        const HeadingTag = `h${section.level}`;
        return (
          <CRTContainer key={index} className="my-6">
            <HeadingTag><TypewriterText text={section.text} delay={30} /></HeadingTag> {/* Adjust typing speed */}
          </CRTContainer>
        );
      case 'list':
        return (
           <CRTContainer key={index} className="my-4">
             <ul>
                {section.items.map((item, itemIndex) => (
                   <li key={itemIndex} className="mb-1 ml-4 list-disc"> {/* Add list styling */}
                     {/* Check if item is a string or object (for links) */}
                     {typeof item === 'string' ? (
                        <TypewriterText text={item} delay={15} /> // Adjust typing speed
                     ) : (
                        <a href={item.href} target="_blank" rel="noopener noreferrer">
                           <TypewriterText text={item.text} delay={15} /> {/* Adjust typing speed */}
                        </a>
                     )}
                   </li>
                 ))}
             </ul>
           </CRTContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Add the avatar component here */}
      {/* Update the paths based on your filenames in the public folder */}
      <div className="flex items-center gap-4 mb-8"> {/* Use flexbox to align avatar and welcome */}
         <HoverWinkingAvatar
            staticSrc="/8bit-avatar.png" // Path from the public folder
            animatedSrc="/8bit-avatar.gif" // Path from the public folder
            alt="8-bit avatar waving"
            width={120} // Adjust size as needed
            height={120} // Adjust size as needed
         />
         {/* Wrap the welcome message in CRTContainer and Typewriter */}
         <CRTContainer className="my-0 flex-grow"> {/* flex-grow makes the text take remaining space */}
            <h1><TypewriterText text={contentSections[0].text} delay={30} /></h1>
         </CRTContainer>
      </div>


      {/* Render subsequent sections */}
      {contentSections.slice(1).map((section, index) =>
        renderSection(section, index + 1)
      )}
    </div>
  );
}