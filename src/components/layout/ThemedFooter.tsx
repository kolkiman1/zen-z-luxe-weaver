import { useTheme } from '@/contexts/ThemeContext';
import Footer from '@/components/layout/Footer';
import FooterEditorial from '@/components/layout/themes/FooterEditorial';
import FooterBrutalist from '@/components/layout/themes/FooterBrutalist';

const ThemedFooter = () => {
  const { theme } = useTheme();
  if (theme === 'editorial') return <FooterEditorial />;
  if (theme === 'brutalist') return <FooterBrutalist />;
  return <Footer />;
};

export default ThemedFooter;
