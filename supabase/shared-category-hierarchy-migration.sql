-- Run once in Supabase SQL Editor after the earlier category migrations.
-- Keeps the single products table; no products, images, prices, stock, cart, or orders are deleted.
alter table public.products add column if not exists child_subcategory text;

-- Shared hierarchy used by the customer header and Admin category picker.
create table if not exists public.category_nodes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.category_nodes(id) on delete cascade,
  name text not null,
  slug text not null,
  level smallint not null check(level between 1 and 3),
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  unique(parent_id,slug)
);
alter table public.category_nodes enable row level security;
create policy "Public can read enabled category nodes" on public.category_nodes for select using(is_enabled=true);

-- Existing Women > Kurtis products stay valid; deep Kurti styles can go in child_subcategory.
update public.products set category='Women',subcategory='Kurtis' where category='Kurtis';

-- New Arrival and Sale remain independent booleans: is_new_arrival, is_on_sale.
-- Do not use them as category names.
