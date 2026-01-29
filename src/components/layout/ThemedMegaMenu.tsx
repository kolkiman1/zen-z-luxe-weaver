import { useTheme } from '@/contexts/ThemeContext';
import MegaMenu from '@/components/layout/MegaMenu';
import MegaMenuEditorial from '@/components/layout/navigation/MegaMenuEditorial';
import MegaMenuBrutalist from '@/components/layout/navigation/MegaMenuBrutalist';

type Props = {
  isScrolled: boolean;
  currentPath: string;
};

const ThemedMegaMenu = (props: Props) => {
  const { theme } = useTheme();
  if (theme === 'editorial') return <MegaMenuEditorial {...props} />;
  if (theme === 'brutalist') return <MegaMenuBrutalist {...props} />;
  return <MegaMenu {...props} />;
};

export default ThemedMegaMenu;
