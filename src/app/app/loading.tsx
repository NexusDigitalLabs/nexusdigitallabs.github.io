import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6" aria-busy="true" aria-label="Loading">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-56 md:col-span-2" />
        <Skeleton className="h-56" />
      </div>
    </div>
  );
}
