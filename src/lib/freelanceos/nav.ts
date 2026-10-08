import {
  Bot,
  FolderKanban,
  LayoutDashboard,
  Receipt,
  Settings,
  Timer,
  Users,
  Wallet,
  type LucideIcon,
} from 'lucide-react';

export type AppNavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** False while the module hasn't shipped — rendered as "Soon", not a link. */
  available: boolean;
};

export const APP_NAV: AppNavItem[] = [
  { label: 'Dashboard', href: '/app/', icon: LayoutDashboard, available: true },
  { label: 'Clients', href: '/app/clients/', icon: Users, available: true },
  { label: 'Projects', href: '/app/projects/', icon: FolderKanban, available: true },
  { label: 'Invoices', href: '/app/invoices/', icon: Receipt, available: true },
  { label: 'Expenses', href: '/app/expenses/', icon: Wallet, available: true },
  { label: 'Time', href: '/app/time/', icon: Timer, available: false },
  { label: 'Assistant', href: '/app/assistant/', icon: Bot, available: false },
  { label: 'Settings', href: '/app/settings/', icon: Settings, available: true },
];

/** Dashboard matches only itself; sections also match their sub-pages. */
export function isNavItemActive(href: string, pathname: string | null): boolean {
  if (!pathname) return false;
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  if (href === '/app/') return path === '/app/';
  return path.startsWith(href);
}
