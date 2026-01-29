import { useTheme } from '@/contexts/ThemeContext';
import Hero from '@/components/home/Hero';
import HeroArtisan from '@/components/home/themes/HeroArtisan';
import HeroEditorial from '@/components/home/themes/HeroEditorial';
import HeroBrutalist from '@/components/home/themes/HeroBrutalist';

const ThemeHero = () => {
  const { activeTheme } = useTheme();

  switch (activeTheme) {
    case 'artisan':
      return <HeroArtisan />;
    case 'brutalist':
      return <HeroBrutalist />;
    case 'editorial':
      return <HeroEditorial />;
    default:
      return <Hero />;
  }
};

export default ThemeHero;
