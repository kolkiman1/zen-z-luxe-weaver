import { useTheme } from '@/contexts/ThemeContext';
import Footer from '@/components/layout/Footer';
import FooterEditorial from '@/components/layout/themes/FooterEditorial';
import FooterBrutalist from '@/components/layout/themes/FooterBrutalist';

const ThemedFooter = () => {
  const { activeTheme } = useTheme();
  if (activeTheme === 'editorial') return <FooterEditorial />;
  if (activeTheme === 'brutalist') return <FooterBrutalist />;
  return <Footer />;
};

export default ThemedFooter;
