-- Drop existing policies on customer_addresses table
DROP POLICY IF EXISTS "Users can view their own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can insert their own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can update their own addresses" ON public.customer_addresses;
DROP POLICY IF EXISTS "Users can delete their own addresses" ON public.customer_addresses;

-- Recreate policies with explicit TO authenticated requirement
CREATE POLICY "Users can view their own addresses" 
ON public.customer_addresses 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own addresses" 
ON public.customer_addresses 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own addresses" 
ON public.customer_addresses 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own addresses" 
ON public.customer_addresses 
FOR DELETE 
TO authenticated
USING (auth.uid() = user_id);