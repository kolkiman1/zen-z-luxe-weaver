import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/layout/Header';
import HeaderEditorial from '@/components/layout/themes/HeaderEditorial';
import HeaderBrutalist from '@/components/layout/themes/HeaderBrutalist';

const ThemedHeader = () => {
  const { theme } = useTheme();
  if (theme === 'editorial') return <HeaderEditorial />;
  if (theme === 'brutalist') return <HeaderBrutalist />;
  return <Header />;
};

export default ThemedHeader;
