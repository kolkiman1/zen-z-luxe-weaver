-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  original_price DECIMAL(10, 2),
  category TEXT NOT NULL,
  subcategory TEXT,
  images TEXT[] NOT NULL DEFAULT '{}',
  sizes TEXT[] DEFAULT '{}',
  colors JSONB DEFAULT '[]',
  in_stock BOOLEAN DEFAULT true,
  stock_quantity INTEGER DEFAULT 0,
  is_new BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  rating DECIMAL(2, 1) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer inquiries table
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'closed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Products RLS policies (public read, admin write)
CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Inquiries RLS policies
CREATE POLICY "Users can create inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view their own inquiries"
  ON public.inquiries FOR SELECT
  USING (
    auth.uid() = user_id OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can update inquiries"
  ON public.inquiries FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admin policies for viewing all orders
CREATE POLICY "Admins can view all orders"
  ON public.orders FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders"
  ON public.orders FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all order items"
  ON public.order_items FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Update triggers
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better query performance
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_slug ON public.products(slug);
CREATE INDEX idx_inquiries_status ON public.inquiries(status);

-- Insert sample products
INSERT INTO public.products (name, slug, description, price, original_price, category, images, sizes, colors, in_stock, stock_quantity, is_new, is_featured, rating, review_count) VALUES
('Classic Cotton Tee', 'classic-cotton-tee', 'Premium quality cotton t-shirt with a modern fit', 2499, 2999, 'men', ARRAY['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'], ARRAY['S', 'M', 'L', 'XL'], '[{"name": "White", "hex": "#FFFFFF"}, {"name": "Black", "hex": "#000000"}]', true, 50, true, true, 4.5, 24),
('Silk Evening Dress', 'silk-evening-dress', 'Elegant silk dress perfect for special occasions', 12999, 15999, 'women', ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800'], ARRAY['XS', 'S', 'M', 'L'], '[{"name": "Black", "hex": "#000000"}, {"name": "Navy", "hex": "#1a1a2e"}]', true, 25, true, true, 4.8, 15),
('Gold Chain Necklace', 'gold-chain-necklace', '18K gold plated chain necklace', 4999, NULL, 'jewelry', ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'], ARRAY[]::TEXT[], '[{"name": "Gold", "hex": "#C9A96E"}]', true, 100, false, true, 4.7, 32),
('Premium Leather Belt', 'premium-leather-belt', 'Genuine leather belt with brushed metal buckle', 3499, 3999, 'accessories', ARRAY['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800'], ARRAY['S', 'M', 'L', 'XL'], '[{"name": "Brown", "hex": "#8B4513"}, {"name": "Black", "hex": "#000000"}]', true, 75, false, true, 4.6, 18),
('Slim Fit Blazer', 'slim-fit-blazer', 'Modern slim fit blazer for formal occasions', 8999, 10999, 'men', ARRAY['https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800'], ARRAY['S', 'M', 'L', 'XL'], '[{"name": "Charcoal", "hex": "#36454F"}, {"name": "Navy", "hex": "#1a1a2e"}]', true, 30, true, false, 4.4, 12),
('Designer Handbag', 'designer-handbag', 'Luxury leather handbag with gold hardware', 7999, NULL, 'accessories', ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'], ARRAY[]::TEXT[], '[{"name": "Tan", "hex": "#D2B48C"}, {"name": "Black", "hex": "#000000"}]', true, 40, false, true, 4.9, 45);