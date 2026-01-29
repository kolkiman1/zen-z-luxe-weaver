import { useTheme } from '@/contexts/ThemeContext';
import MobileMenu from '@/components/layout/MobileMenu';
import MobileMenuEditorial from '@/components/layout/navigation/MobileMenuEditorial';
import MobileMenuBrutalist from '@/components/layout/navigation/MobileMenuBrutalist';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  isAdmin: boolean;
  onSignOut: () => void;
};

const ThemedMobileMenu = (props: Props) => {
  const { activeTheme } = useTheme();
  if (activeTheme === 'editorial') return <MobileMenuEditorial {...props} />;
  if (activeTheme === 'brutalist') return <MobileMenuBrutalist {...props} />;
  return <MobileMenu {...props} />;
};

export default ThemedMobileMenu;
