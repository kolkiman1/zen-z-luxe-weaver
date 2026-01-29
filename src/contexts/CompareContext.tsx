import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Product } from '@/lib/data';
import { toast } from 'sonner';

type CompareItem = {
  id: string;
  product_id: string;
  created_at: string;
  product: Product;
};

type CompareContextType = {
  items: CompareItem[];
  isOpen: boolean;
  open: () => void;
  close: () => void;
  clear: () => Promise<void>;
  isInCompare: (productId: string) => boolean;
  toggle: (product: Product) => Promise<void>;
  loading: boolean;
};

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<CompareItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('compare_items')
        .select('id, product_id, created_at, product:products(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const mapped: CompareItem[] = (data ?? []).filter(Boolean).map((row: any) => ({
        id: row.id,
        product_id: row.product_id,
        created_at: row.created_at,
        product: row.product,
      }));

      setItems(mapped);
    } catch (e: any) {
      console.error('compare_items fetch failed', e);
      toast.error('Failed to load compare items');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const isInCompare = useCallback(
    (productId: string) => items.some((it) => it.product_id === productId),
    [items]
  );

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const clear = useCallback(async () => {
    if (!user) {
      toast.message('Sign in to manage Compare');
      return;
    }

    const prev = items;
    setItems([]);
    setIsOpen(false);

    const { error } = await supabase.from('compare_items').delete().eq('user_id', user.id);
    if (error) {
      setItems(prev);
      toast.error('Failed to clear compare');
    }
  }, [items, user]);

  const toggle = useCallback(
    async (product: Product) => {
      if (!user) {
        toast.message('Sign in to use Compare');
        return;
      }

      if (isInCompare(product.id)) {
        const existing = items.find((it) => it.product_id === product.id);
        if (!existing) return;

        setItems((prev) => prev.filter((it) => it.product_id !== product.id));
        const { error } = await supabase
          .from('compare_items')
          .delete()
          .eq('id', existing.id)
          .eq('user_id', user.id);

        if (error) {
          toast.error('Failed to update compare');
          fetchItems();
        }
        return;
      }

      // UI pre-check (DB trigger enforces too)
      if (items.length >= 2) {
        toast.message('Compare supports up to 2 items');
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('compare_items')
          .insert({ user_id: user.id, product_id: product.id })
          .select('id, product_id, created_at, product:products(*)')
          .single();

        if (error) {
          // Trigger error message is not very friendly; normalize.
          if (String(error.message || '').includes('compare_limit_reached')) {
            toast.message('Compare supports up to 2 items');
          } else {
            throw error;
          }
          return;
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const row: any = data;
        const next: CompareItem = {
          id: row.id,
          product_id: row.product_id,
          created_at: row.created_at,
          product: row.product,
        };
        setItems((prev) => [...prev, next]);

        // Auto-open when 2 selected
        const nextCount = items.length + 1;
        if (nextCount >= 2) setIsOpen(true);
      } catch (e: any) {
        console.error('compare_items toggle failed', e);
        toast.error('Failed to update compare');
      } finally {
        setLoading(false);
      }
    },
    [fetchItems, isInCompare, items, user]
  );

  const value = useMemo<CompareContextType>(
    () => ({
      items,
      isOpen,
      open,
      close,
      clear,
      isInCompare,
      toggle,
      loading,
    }),
    [clear, close, isInCompare, items, isOpen, loading, open, toggle]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
};

export const useCompare = () => {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error('useCompare must be used within a CompareProvider');
  return ctx;
};
