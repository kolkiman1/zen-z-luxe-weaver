-- Compare items saved per user
CREATE TABLE IF NOT EXISTS public.compare_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  product_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Foreign key to products for easy joins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'compare_items_product_id_fkey'
  ) THEN
    ALTER TABLE public.compare_items
      ADD CONSTRAINT compare_items_product_id_fkey
      FOREIGN KEY (product_id)
      REFERENCES public.products(id)
      ON DELETE CASCADE;
  END IF;
END $$;

-- Uniqueness per user/product
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'compare_items_user_product_key'
  ) THEN
    ALTER TABLE public.compare_items
      ADD CONSTRAINT compare_items_user_product_key
      UNIQUE (user_id, product_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_compare_items_user_id ON public.compare_items(user_id);
CREATE INDEX IF NOT EXISTS idx_compare_items_created_at ON public.compare_items(created_at);

ALTER TABLE public.compare_items ENABLE ROW LEVEL SECURITY;

-- RLS
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'compare_items' AND policyname = 'Users can view their compare items'
  ) THEN
    CREATE POLICY "Users can view their compare items"
    ON public.compare_items
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'compare_items' AND policyname = 'Users can add compare items'
  ) THEN
    CREATE POLICY "Users can add compare items"
    ON public.compare_items
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'compare_items' AND policyname = 'Users can delete their compare items'
  ) THEN
    CREATE POLICY "Users can delete their compare items"
    ON public.compare_items
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- Enforce max 2 compare items per user
CREATE OR REPLACE FUNCTION public.enforce_compare_limit()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_count integer;
BEGIN
  SELECT COUNT(*) INTO current_count
  FROM public.compare_items
  WHERE user_id = NEW.user_id;

  IF current_count >= 2 THEN
    RAISE EXCEPTION 'compare_limit_reached';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_compare_limit ON public.compare_items;
CREATE TRIGGER trg_enforce_compare_limit
BEFORE INSERT ON public.compare_items
FOR EACH ROW
EXECUTE FUNCTION public.enforce_compare_limit();
