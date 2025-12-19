import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/lib/data';

interface DbProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  original_price: number | null;
  category: string;
  subcategory: string | null;
  images: string[];
  sizes: string[] | null;
  colors: any;
  description: string | null;
  in_stock: boolean | null;
  is_new: boolean | null;
  is_featured: boolean | null;
}

const transformProduct = (dbProduct: DbProduct): Product => {
  // Handle colors transformation - support both 'hex' and 'value' property names
  const transformedColors = Array.isArray(dbProduct.colors)
    ? dbProduct.colors.map((color: { name: string; hex?: string; value?: string }) => ({
        name: color.name,
        hex: color.hex || color.value || '#000000',
      }))
    : undefined;

  return {
    id: dbProduct.id,
    slug: dbProduct.slug,
    name: dbProduct.name,
    price: dbProduct.price,
    originalPrice: dbProduct.original_price || undefined,
    category: dbProduct.category as 'men' | 'women' | 'jewelry' | 'accessories',
    subcategory: dbProduct.subcategory || '',
    images: dbProduct.images || [],
    sizes: dbProduct.sizes || undefined,
    colors: transformedColors,
    description: dbProduct.description || '',
    details: [],
    inStock: dbProduct.in_stock ?? true,
    isNew: dbProduct.is_new ?? false,
    isFeatured: dbProduct.is_featured ?? false,
  };
};

export const useProducts = (category?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let query = supabase.from('products').select('*');
        
        if (category && category !== 'all' && category !== 'new-arrivals') {
          query = query.eq('category', category);
        }
        
        if (category === 'new-arrivals') {
          query = query.eq('is_new', true);
        }

        const { data, error } = await query.order('created_at', { ascending: false });

        if (error) throw error;

        const transformedProducts = (data || []).map(transformProduct);
        setProducts(transformedProducts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  return { products, loading, error };
};

export const useProduct = (slug: string) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('slug', slug)
          .maybeSingle();

        if (error) throw error;
        if (data) {
          setProduct(transformProduct(data));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  return { product, loading, error };
};

export const useRelatedProducts = (category: string, excludeId: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('category', category)
          .neq('id', excludeId)
          .limit(4);

        if (error) throw error;
        setProducts((data || []).map(transformProduct));
      } catch (err) {
        console.error('Error fetching related products:', err);
      } finally {
        setLoading(false);
      }
    };

    if (category && excludeId) {
      fetchProducts();
    }
  }, [category, excludeId]);

  return { products, loading };
};

export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_featured', true)
          .limit(8);

        if (error) throw error;
        setProducts((data || []).map(transformProduct));
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading };
};

export const useNewArrivals = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_new', true)
          .order('created_at', { ascending: false })
          .limit(8);

        if (error) throw error;
        setProducts((data || []).map(transformProduct));
      } catch (err) {
        console.error('Error fetching new arrivals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return { products, loading };
};
