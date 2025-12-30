-- =============================================
-- COMPREHENSIVE SECURITY FIX MIGRATION
-- =============================================

-- 1. FIX DISCOUNT_CODES - Remove public access, add secure validation
-- Drop the public policy that exposes all active discount codes
DROP POLICY IF EXISTS "Anyone can view active discount codes" ON public.discount_codes;

-- Create a secure policy that only allows authenticated users to validate codes they submit
CREATE POLICY "Authenticated users can validate discount codes"
ON public.discount_codes
FOR SELECT
TO authenticated
USING (is_active = true AND expires_at > now());

-- 2. FIX PROFILES - Ensure all policies require authentication
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile"
ON public.profiles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. FIX SAVED_PAYMENT_METHODS - Critical: payment data must require auth
DROP POLICY IF EXISTS "Users can view their own payment methods" ON public.saved_payment_methods;
DROP POLICY IF EXISTS "Users can insert their own payment methods" ON public.saved_payment_methods;
DROP POLICY IF EXISTS "Users can update their own payment methods" ON public.saved_payment_methods;
DROP POLICY IF EXISTS "Users can delete their own payment methods" ON public.saved_payment_methods;

CREATE POLICY "Users can view their own payment methods"
ON public.saved_payment_methods FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment methods"
ON public.saved_payment_methods FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment methods"
ON public.saved_payment_methods FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payment methods"
ON public.saved_payment_methods FOR DELETE TO authenticated
USING (auth.uid() = user_id);

-- 4. FIX ORDERS - Require authentication for all operations
DROP POLICY IF EXISTS "Users can view their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can create their own orders" ON public.orders;
DROP POLICY IF EXISTS "Users can update their own orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Admins can update all orders" ON public.orders;

CREATE POLICY "Users can view their own orders"
ON public.orders FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own orders"
ON public.orders FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own orders"
ON public.orders FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all orders"
ON public.orders FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all orders"
ON public.orders FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. FIX ORDER_ITEMS - Require authentication
DROP POLICY IF EXISTS "Users can view their own order items" ON public.order_items;
DROP POLICY IF EXISTS "Users can create order items for their orders" ON public.order_items;
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;

CREATE POLICY "Users can view their own order items"
ON public.order_items FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
));

CREATE POLICY "Users can create order items for their orders"
ON public.order_items FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()
));

CREATE POLICY "Admins can view all order items"
ON public.order_items FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. FIX INQUIRIES - Require auth for viewing, but allow public creation
DROP POLICY IF EXISTS "Users can view their own inquiries" ON public.inquiries;
DROP POLICY IF EXISTS "Admins can update inquiries" ON public.inquiries;

CREATE POLICY "Users can view their own inquiries"
ON public.inquiries FOR SELECT TO authenticated
USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update inquiries"
ON public.inquiries FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. FIX ADMIN_ACTIVITY_LOGS - Require authentication
DROP POLICY IF EXISTS "Admins can view activity logs" ON public.admin_activity_logs;
DROP POLICY IF EXISTS "Admins can insert activity logs" ON public.admin_activity_logs;

CREATE POLICY "Admins can view activity logs"
ON public.admin_activity_logs FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert activity logs"
ON public.admin_activity_logs FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 8. FIX EMAIL_CAMPAIGNS - Require authentication
DROP POLICY IF EXISTS "Admins can view all campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins can create campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins can update campaigns" ON public.email_campaigns;
DROP POLICY IF EXISTS "Admins can delete campaigns" ON public.email_campaigns;

CREATE POLICY "Admins can view all campaigns"
ON public.email_campaigns FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create campaigns"
ON public.email_campaigns FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update campaigns"
ON public.email_campaigns FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete campaigns"
ON public.email_campaigns FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 9. FIX SITE_SETTINGS - Split public vs admin access
DROP POLICY IF EXISTS "Anyone can view site settings" ON public.site_settings;

-- Only allow viewing non-sensitive settings publicly (filtering by key pattern)
CREATE POLICY "Anyone can view public site settings"
ON public.site_settings FOR SELECT
USING (key IN ('site_name', 'site_logo', 'theme', 'announcement', 'social_links', 'contact_info'));

-- Admins can view all settings including sensitive ones
CREATE POLICY "Admins can view all site settings"
ON public.site_settings FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. FIX INQUIRIES_USER_VIEW - Add RLS policies
-- Enable RLS on the view (if it's a table/materialized view)
-- For regular views, they inherit from base table, but we should add explicit policies
ALTER VIEW public.inquiries_user_view SET (security_invoker = on);

-- 11. FIX USER_ROLES - Require authentication
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can delete user roles" ON public.user_roles;

CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user roles"
ON public.user_roles FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert user roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete user roles"
ON public.user_roles FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 12. FIX PENDING_ADMIN_INVITES - Require authentication
DROP POLICY IF EXISTS "Admins can view pending invites" ON public.pending_admin_invites;
DROP POLICY IF EXISTS "Admins can insert pending invites" ON public.pending_admin_invites;
DROP POLICY IF EXISTS "Admins can delete pending invites" ON public.pending_admin_invites;

CREATE POLICY "Admins can view pending invites"
ON public.pending_admin_invites FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert pending invites"
ON public.pending_admin_invites FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete pending invites"
ON public.pending_admin_invites FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 13. FIX ANNOUNCEMENTS - Require auth for admin operations  
DROP POLICY IF EXISTS "Admins can view all announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can insert announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can update announcements" ON public.announcements;
DROP POLICY IF EXISTS "Admins can delete announcements" ON public.announcements;

CREATE POLICY "Admins can view all announcements"
ON public.announcements FOR SELECT TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert announcements"
ON public.announcements FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update announcements"
ON public.announcements FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete announcements"
ON public.announcements FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 14. FIX PRODUCTS - Keep public read but require auth for admin operations
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Admins can insert products"
ON public.products FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.products FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.products FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));