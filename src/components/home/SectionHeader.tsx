import { Link } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import { AnimatedButton } from '@/components/ui/animated-button';

type SectionHeaderCta = {
  label: string;
  to: string;
  variant?: 'ghost' | 'outline' | 'primary';
};

type SectionHeaderProps = {
  align?: 'left' | 'center';
  tagline?: string;
  headline: React.ReactNode;
  headlineHighlight?: React.ReactNode;
  description?: React.ReactNode;
  cta?: SectionHeaderCta;
  actions?: React.ReactNode;
};

const SectionHeader = ({
  align = 'left',
  tagline,
  headline,
  headlineHighlight,
  description,
  cta,
  actions,
}: SectionHeaderProps) => {
  const { activeTheme } = useTheme();

  const isCenter = align === 'center';
  const wrapperClass = isCenter ? 'text-center' : 'text-center sm:text-left';
  const descriptionClass = isCenter ? 'max-w-xl mx-auto' : 'max-w-lg';

  const headlineClass =
    activeTheme === 'brutalist'
      ? 'font-body font-black uppercase tracking-[-0.02em]'
      : 'font-display';

  const ctaVariant = cta?.variant ?? 'ghost';
  const ctaClassName =
    activeTheme === 'brutalist'
      ? 'gap-2 text-sm sm:text-base uppercase tracking-[0.22em]'
      : 'gap-2 text-sm sm:text-base';

  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-4 ${wrapperClass}`}>
      <div>
        {tagline ? (
          <p className="text-primary text-xs sm:text-sm font-medium uppercase tracking-widest mb-2 block">
            {tagline}
          </p>
        ) : null}

        <h2 className={`${headlineClass} text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-2 sm:mb-3`}>
          {headline}{' '}
          {headlineHighlight ? <span className="text-gradient-gold">{headlineHighlight}</span> : null}
        </h2>

        {description ? (
          <p className={`text-muted-foreground text-sm sm:text-base ${descriptionClass}`}>{description}</p>
        ) : null}
      </div>

      <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-3">
        {actions}
        {cta ? (
          <Link to={cta.to} className={isCenter ? 'w-full sm:w-auto' : undefined}>
            <AnimatedButton
              variant={ctaVariant === 'primary' ? 'ghost' : ctaVariant}
              className={ctaVariant === 'primary' ? `btn-primary ${ctaClassName}` : ctaClassName}
              glowColor={ctaVariant === 'outline' ? 'gold' : 'gold'}
              showArrow
            >
              {cta.label}
            </AnimatedButton>
          </Link>
        ) : null}
      </div>
    </div>
  );
};

export default SectionHeader;
