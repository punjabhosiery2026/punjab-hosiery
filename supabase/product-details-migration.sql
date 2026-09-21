-- Optional product information shown on customer product pages.
-- Safe: this only adds nullable columns and preserves every existing product.
alter table public.products add column if not exists fabric_material text;
alter table public.products add column if not exists care_instructions text;
alter table public.products add column if not exists fit_information text;
