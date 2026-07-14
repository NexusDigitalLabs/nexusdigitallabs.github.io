import { Suspense } from 'react';
import LoginForm from '@/components/LoginForm';
import { pageMetadata } from '@/lib/seo';

export const metadata = pageMetadata({
  title: 'Sign in',
  description: 'Sign in to NexusDigitalLabs with Google or a magic link. No password required.',
  path: '/login/',
  ogTitle: 'Sign in — NexusDigitalLabs',
  ogDescription: 'Continue with Google or email a magic link. Fast, private account access.',
});

export default function LoginPage() {
  return (
    <section className="relative overflow-hidden ndl-dot-grid py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="absolute top-[-120px] right-[15%] w-[450px] h-[450px] rounded-full"
          style={{ background: 'radial-gradient(circle,rgba(37,99,235,0.11) 0%,transparent 65%)', filter: 'blur(80px)' }}
        />
      </div>

      <div className="relative max-w-lg mx-auto px-6 sm:px-10">
        <p className="text-xs font-semibold tracking-widest text-blue-400 uppercase mb-4">Account</p>
        <h1 className="text-3xl sm:text-4xl font-light tracking-tight mb-3" style={{ color: 'var(--ndl-text)' }}>
          Sign in
        </h1>
        <p
          className="text-sm sm:text-base font-light leading-relaxed mb-10"
          style={{ color: 'var(--ndl-muted)' }}
        >
          Use Google or a one-time magic link. No passwords to remember. Account data is handled
          as described in our{' '}
          <a href="/privacy-policy/" className="underline" style={{ color: 'var(--ndl-accent)' }}>
            Privacy Policy
          </a>
          .
        </p>

        <Suspense
          fallback={
            <div
              className="w-full max-w-md mx-auto h-40 rounded-xl ndl-skeleton"
              aria-hidden="true"
            />
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </section>
  );
}
