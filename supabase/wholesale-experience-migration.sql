-- Run this once in the Supabase SQL Editor. It is additive: it does not remove products, orders, or categories.
alter table public.products
  add column if not exists wholesale_enabled boolean not null default false,
  add column if not exists wholesale_price_tier_1 numeric(12,2),
  add column if not exists wholesale_price_tier_2 numeric(12,2),
  add column if not exists wholesale_price_tier_3 numeric(12,2),
  add column if not exists bulk_stock_quantity integer,
  add column if not exists recommended_product_ids uuid[] not null default '{}';

alter table public.wholesale_inquiries
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists gstin text,
  add column if not exists quote_items jsonb not null default '[]'::jsonb;

alter table public.wholesale_inquiries
  alter column status set default 'new';
