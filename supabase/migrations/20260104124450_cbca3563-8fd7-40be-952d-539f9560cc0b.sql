-- Fix guest checkout: allow inserting order_items without relying on SELECT access to orders (RLS-safe)

-- 1) Helper function (bypasses RLS via SECURITY DEFINER) to validate order ownership
create or replace function public.can_insert_order_item(_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.orders o
    where o.id = _order_id
      and (
        o.user_id is null
        or o.user_id = auth.uid()
      )
  );
$$;

-- 2) Replace insert policies with a single clear policy
-- Note: policy names must match existing ones to drop safely.
drop policy if exists "Anyone can create order items" on public.order_items;
drop policy if exists "Users can create order items for their orders" on public.order_items;

create policy "Can insert order items for owned/guest orders"
on public.order_items
for insert
with check (public.can_insert_order_item(order_id));
