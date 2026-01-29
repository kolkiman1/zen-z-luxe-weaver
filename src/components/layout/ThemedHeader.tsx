import { useTheme } from '@/contexts/ThemeContext';
import Header from '@/components/layout/Header';
import HeaderEditorial from '@/components/layout/themes/HeaderEditorial';
import HeaderBrutalist from '@/components/layout/themes/HeaderBrutalist';

const ThemedHeader = () => {
  const { activeTheme } = useTheme();
  if (activeTheme === 'editorial') return <HeaderEditorial />;
  if (activeTheme === 'brutalist') return <HeaderBrutalist />;
  return <Header />;
};

export default ThemedHeader;
