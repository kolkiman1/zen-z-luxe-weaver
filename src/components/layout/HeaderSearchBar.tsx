import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderSearchBarProps {
  onOpen: () => void;
  placeholder?: string;
  className?: string;
  variant?: 'pill' | 'square' | 'brutalist';
}

const HeaderSearchBar = ({
  onOpen,
  placeholder = 'Search for products, brands and more',
  className,
  variant = 'pill',
}: HeaderSearchBarProps) => {
  const shellClass =
    variant === 'brutalist'
      ? 'market-search market-search--brutalist'
      : variant === 'square'
        ? 'market-search market-search--square'
        : 'market-search';

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onOpen}
      className={`${shellClass} ${className || ''}`}
      aria-label="Open search"
    >
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="truncate text-sm text-muted-foreground">{placeholder}</span>
      <span className="ml-auto hidden xl:inline-flex rounded-full bg-secondary px-2 py-1 text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
        Ctrl K
      </span>
    </Button>
  );
};

export default HeaderSearchBar;
