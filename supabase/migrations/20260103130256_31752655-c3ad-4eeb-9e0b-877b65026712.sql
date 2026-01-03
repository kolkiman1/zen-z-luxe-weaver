-- Drop existing insert policy for orders
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;

-- Create new policy that allows both authenticated users and anonymous guests to create orders
CREATE POLICY "Anyone can create orders"
ON public.orders
FOR INSERT
WITH CHECK (
  -- Either the user is authenticated and creating their own order
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  -- Or it's a guest order (no user_id)
  OR user_id IS NULL
);

-- Allow guests to insert order items for their orders
DROP POLICY IF EXISTS "Users can create order items" ON public.order_items;

CREATE POLICY "Anyone can create order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  -- Check if the order_id belongs to the current user or is a guest order
  EXISTS (
    SELECT 1 FROM public.orders o 
    WHERE o.id = order_id 
    AND (o.user_id = auth.uid() OR o.user_id IS NULL)
  )
);

-- Admins can still view all orders including guest orders
-- The existing admin policies already handle this