import type { ReactNode } from 'react';

import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  className?: string;
};

/**
 * Theme-aware page background layer.
 * Visual-only: does not change page logic or layout semantics.
 */
export default function ThemedPageFrame({ children, className }: Props) {
  const { activeTheme } = useTheme();

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {activeTheme === 'brutalist' && (
          <>
            <div className="hero-overlay-tech" />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px), linear-gradient(hsl(var(--border)) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
                opacity: 0.14,
              }}
            />
            <div className="absolute -top-24 -left-24 h-80 w-80 bg-primary/15 blur-3xl" />
            <div className="absolute -bottom-28 -right-28 h-96 w-96 bg-accent/10 blur-3xl" />
          </>
        )}

        {activeTheme === 'editorial' && (
          <>
            <div className="hero-overlay-runway" />
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px), linear-gradient(hsl(var(--border)) 1px, transparent 1px)',
                backgroundSize: '120px 120px',
                opacity: 0.06,
              }}
            />
          </>
        )}

        {activeTheme === 'artisan' && (
          <>
            <div className="hero-overlay-artisan" />
            <div
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 18% 20%, hsl(var(--accent) / 0.8) 0%, transparent 55%), radial-gradient(circle at 82% 70%, hsl(var(--primary) / 0.55) 0%, transparent 60%)',
              }}
            />
          </>
        )}
      </div>

      <div className="relative z-10">{children}</div>
    </div>
  );
}
