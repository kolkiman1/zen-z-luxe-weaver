import { Columns2, X } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { Button } from '@/components/ui/button';

export default function CompareFloatingButton() {
  const { items, open, clear } = useCompare();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
      <Button
        onClick={open}
        className="btn-primary h-11 px-4 rounded-full shadow-lg"
      >
        <Columns2 className="w-4 h-4" />
        <span className="ml-2 text-sm">Compare ({items.length}/2)</span>
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={() => clear()}
        className="h-11 w-11 rounded-full bg-card/80 backdrop-blur"
        aria-label="Clear compare"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
}
