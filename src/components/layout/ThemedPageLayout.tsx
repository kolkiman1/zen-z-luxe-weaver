import type { ReactNode } from 'react';

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Optional top hero block (e.g. banner) rendered above the layout grid. */
  hero?: ReactNode;
  /** Optional meta row below title (chips, counts, breadcrumbs, etc.). */
  meta?: ReactNode;
  /** Optional right/left rail content. Layout differs per theme. */
  aside?: ReactNode;
  /** Main content. */
  children: ReactNode;
  className?: string;
  /** Whether the aside should be sticky (desktop). */
  stickyAside?: boolean;
};

export default function ThemedPageLayout({
  title,
  subtitle,
  hero,
  meta,
  aside,
  children,
  className,
  stickyAside = true,
}: Props) {
  const { theme } = useTheme();

  if (theme === 'brutalist') {
    return (
      <div className={cn('container-luxury', className)}>
        {hero}

        <header className="mb-6 border-2 border-border bg-card px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-body text-2xl sm:text-3xl md:text-4xl font-black uppercase tracking-tight">
                {title}
              </h1>
              {subtitle ? (
                <p className="mt-2 text-sm text-muted-foreground tracking-[0.14em] uppercase">{subtitle}</p>
              ) : null}
              {meta ? <div className="mt-3">{meta}</div> : null}
            </div>
            <div className="shrink-0 text-xs tracking-[0.35em] uppercase text-muted-foreground">Y2K / GRID / TYPE</div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          {aside ? (
            <aside
              className={cn(
                'border-2 border-border bg-card p-4',
                stickyAside && 'lg:sticky lg:top-28 lg:self-start'
              )}
            >
              {aside}
            </aside>
          ) : null}

          <section className="min-w-0">{children}</section>
        </div>
      </div>
    );
  }

  if (theme === 'artisan') {
    return (
      <div className={cn('container-luxury', className)}>
        {hero}

        <header className="mb-8 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="mx-auto h-px w-24 bg-border/70" />
            <h1 className="mt-5 font-display text-3xl sm:text-4xl md:text-5xl leading-tight">{title}</h1>
            {subtitle ? <p className="mt-3 text-sm sm:text-base text-muted-foreground">{subtitle}</p> : null}
            {meta ? <div className="mt-4 flex justify-center">{meta}</div> : null}
            <div className="mx-auto mt-6 h-px w-36 bg-border/60" />
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-12">
          <section className={cn('lg:col-span-8 xl:col-span-9 min-w-0', aside ? '' : 'lg:col-span-12')}>
            <div className="surface-panel rounded-3xl p-4 sm:p-6 md:p-8">{children}</div>
          </section>

          {aside ? (
            <aside className={cn('lg:col-span-4 xl:col-span-3', stickyAside && 'lg:sticky lg:top-28 lg:self-start')}>
              <div className="surface-panel rounded-3xl p-4 sm:p-6">{aside}</div>
            </aside>
          ) : null}
        </div>
      </div>
    );
  }

  // editorial (default)
  return (
    <div className={cn('container-luxury', className)}>
      {hero}

      <header className="mb-8">
        <div className="grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl leading-[0.95] tracking-[-0.03em]">{title}</h1>
            {subtitle ? <p className="mt-3 max-w-2xl text-sm sm:text-base text-muted-foreground">{subtitle}</p> : null}
            {meta ? <div className="mt-5">{meta}</div> : null}
          </div>
          <div className="lg:col-span-4">
            <div className="glass rounded-2xl p-4">
              <p className="text-xs tracking-[0.32em] uppercase text-muted-foreground">Curated layout</p>
              <p className="mt-2 text-sm text-muted-foreground">Editorial pages use spacious rails + quiet surfaces.</p>
            </div>
          </div>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-12">
        <section className={cn('lg:col-span-8 xl:col-span-9 min-w-0', aside ? '' : 'lg:col-span-12')}>
          {children}
        </section>
        {aside ? (
          <aside className={cn('lg:col-span-4 xl:col-span-3', stickyAside && 'lg:sticky lg:top-28 lg:self-start')}>
            <div className="bg-card/80 backdrop-blur rounded-2xl border border-border p-4 sm:p-6">{aside}</div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}
