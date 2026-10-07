'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import AuthMenu from '@/components/AuthMenu';
import ThemeToggle from '@/components/ThemeToggle';
import { Badge } from '@/components/ui/badge';
import { APP_NAV, isNavItemActive, type AppNavItem } from '@/lib/freelanceos/nav';
import { cn } from '@/lib/utils';

function NavEntry({ item, active, compact }: { item: AppNavItem; active: boolean; compact?: boolean }) {
  const Icon = item.icon;
  const base = cn(
    'flex items-center gap-2.5 rounded-md text-sm font-medium transition-colors',
    compact ? 'shrink-0 px-3 py-1.5' : 'px-3 py-2'
  );

  if (!item.available) {
    return (
      <span
        className={cn(base, 'cursor-default text-muted-foreground/60')}
        aria-disabled="true"
        title={`${item.label} — coming soon`}
      >
        <Icon className="size-4" aria-hidden="true" />
        {item.label}
        {!compact && (
          <Badge variant="outline" className="ml-auto px-1.5 py-0 text-[10px] font-normal">
            Soon
          </Badge>
        )}
      </span>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        base,
        active ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {item.label}
    </Link>
  );
}

/** Authenticated FreelanceOS chrome: sidebar on desktop, scrollable tab strip on mobile. */
export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="fos-app flex min-h-screen bg-background text-foreground">
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r bg-card md:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <Link href="/app/" className="text-base font-semibold tracking-tight">
            FreelanceOS
          </Link>
          <Badge variant="secondary" className="text-[10px]">
            Beta
          </Badge>
        </div>
        <nav aria-label="FreelanceOS" className="flex flex-1 flex-col gap-0.5 px-3">
          {APP_NAV.map((item) => (
            <NavEntry key={item.href} item={item} active={isNavItemActive(item.href, pathname)} />
          ))}
        </nav>
        <div className="flex flex-col gap-1 border-t px-3 py-3 text-sm">
          <Link
            href="/contact/"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <MessageSquare className="size-4" aria-hidden="true" />
            Send feedback
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-md px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            NexusDigitalLabs
          </Link>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className="sticky top-0 z-30 border-b bg-background/90 backdrop-blur"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex h-14 items-center gap-3 px-4 md:px-8">
            <div className="flex min-w-0 items-center gap-2 md:hidden">
              <Link href="/app/" className="font-semibold tracking-tight">
                FreelanceOS
              </Link>
              <Badge variant="secondary" className="text-[10px]">
                Beta
              </Badge>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <ThemeToggle />
              <AuthMenu />
            </div>
          </div>
          <nav aria-label="FreelanceOS" className="flex gap-1 overflow-x-auto px-3 pb-2 md:hidden">
            {APP_NAV.filter((item) => item.available).map((item) => (
              <NavEntry key={item.href} item={item} active={isNavItemActive(item.href, pathname)} compact />
            ))}
          </nav>
        </header>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </div>
    </div>
  );
}
