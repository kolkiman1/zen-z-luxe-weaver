-- Drop and recreate the orders INSERT policy to properly allow guest orders
DROP POLICY IF EXISTS "Anyone can create orders" ON public.orders;

-- Create a policy that allows guest orders (no auth required) with null user_id
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (
  (user_id IS NULL) OR (auth.uid() = user_id)
);

-- Also fix order_items policy for guest orders
DROP POLICY IF EXISTS "Anyone can create order items" ON public.order_items;

CREATE POLICY "Anyone can create order items"
ON public.order_items
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_items.order_id
    AND (o.user_id IS NULL OR o.user_id = auth.uid())
  )
);