import type { Metadata } from 'next';
import ClassManagerNav from '../ClassManagerNav';
import DemoFlowClient from './DemoFlowClient';

export const metadata: Metadata = {
  title: { absolute: 'Class Manager — Demo' },
  description: 'Click through how Class Manager runs tuition classes: registration, fees, class access, attendance, marks and reports.',
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
  alternates: { canonical: '/p/class-manager/demo/' },
};

export default function ClassManagerDemoPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pt-6 pb-16 sm:px-6">
      <ClassManagerNav active="demo" />
      <header className="mt-10 mb-8 max-w-2xl">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--ndl-text)] sm:text-4xl text-balance">
          See a month of classes, start to finish
        </h1>
        <p className="mt-3 text-[var(--ndl-text-secondary)]">
          Pick tutor or institute, then click through each screen. Every button works, using sample students and
          fees.
        </p>
      </header>
      <DemoFlowClient />
    </div>
  );
}
