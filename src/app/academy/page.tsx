import AcademyLobbyClient from '@/components/academy/AcademyLobbyClient';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'AI Engineer Academy — Free Course',
  description:
    'A free, self-paced course from Python foundations to production AI systems: RAG, agents, evals, and deployment. No account, no payment.',
  path: '/academy/',
  keywords: [
    'AI engineer roadmap', 'learn AI engineering', 'free AI course', 'RAG tutorial',
    'AI agents course', 'LLM engineering course', 'python for AI',
  ],
  absoluteTitle: true,
  ogTitle: 'AI Engineer Academy — Free Course',
  ogDescription: 'Python to production AI systems, one free lesson at a time.',
});

export default function AcademyPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: 'AI Engineer Academy',
            description:
              'A free, self-paced course from Python foundations to production AI systems: RAG, agents, evals, and deployment.',
            provider: {
              '@type': 'Organization',
              name: 'NexusDigitalLabs',
              sameAs: 'https://nexusdigitallabs.dev',
            },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            url: 'https://nexusdigitallabs.dev/academy/',
          }),
        }}
      />
      <AcademyLobbyClient />
    </>
  );
}
