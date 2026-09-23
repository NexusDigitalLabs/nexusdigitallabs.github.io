import { notFound } from 'next/navigation';
import LessonPageClient from '@/components/academy/LessonPageClient';
import { LESSONS, PHASES, getLessonBySlug, lessonMetaDescription, lessonKeywords } from '@/data/academy';
import { pageMetadata, absoluteSiteUrl, SITE_NAME } from '@/lib/seo';

export function generateStaticParams() {
  return LESSONS.filter((l) => l.status === 'ready').map((l) => ({ lessonSlug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ lessonSlug: string }> }) {
  const { lessonSlug } = await params;
  const lesson = getLessonBySlug(lessonSlug);
  if (!lesson || lesson.status !== 'ready') {
    return pageMetadata({
      title: 'Lesson — AI Engineer Academy',
      description: 'A free AI engineer course lesson.',
      path: `/academy/${lessonSlug}/`,
    });
  }
  return pageMetadata({
    title: `${lesson.title} — AI Engineer Academy`,
    description: lessonMetaDescription(lesson),
    keywords: lessonKeywords(lesson),
    path: `/academy/${lesson.slug}/`,
    absoluteTitle: true,
    type: 'article',
  });
}

export default async function LessonPage({ params }: { params: Promise<{ lessonSlug: string }> }) {
  const { lessonSlug } = await params;
  const lesson = getLessonBySlug(lessonSlug);
  if (!lesson || lesson.status !== 'ready' || !lesson.content) {
    notFound();
  }

  const phase = PHASES.find((p) => p.id === lesson.phaseId);
  const lessonUrl = absoluteSiteUrl(`/academy/${lesson.slug}/`);
  const academyUrl = absoluteSiteUrl('/academy/');
  const educationalLevel = phase?.id === 'foundations' ? 'Beginner' : phase?.id === 'production' ? 'Advanced' : 'Intermediate';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LearningResource',
            name: lesson.title,
            description: lessonMetaDescription(lesson),
            url: lessonUrl,
            inLanguage: 'en',
            educationalLevel,
            learningResourceType: 'Lesson',
            isAccessibleForFree: true,
            isPartOf: {
              '@type': 'Course',
              name: 'AI Engineer Academy',
              url: academyUrl,
            },
            provider: {
              '@type': 'Organization',
              name: SITE_NAME,
              sameAs: absoluteSiteUrl('/'),
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteSiteUrl('/') },
              { '@type': 'ListItem', position: 2, name: 'AI Engineer Academy', item: academyUrl },
              { '@type': 'ListItem', position: 3, name: lesson.title, item: lessonUrl },
            ],
          }),
        }}
      />
      <LessonPageClient lesson={lesson} />
    </>
  );
}
