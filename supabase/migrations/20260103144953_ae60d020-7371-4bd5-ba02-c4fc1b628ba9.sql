-- Allow guest checkout by making orders.user_id optional
ALTER TABLE public.orders
  ALTER COLUMN user_id DROP NOT NULL;
