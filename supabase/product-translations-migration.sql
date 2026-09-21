-- Run once in Supabase SQL Editor. Keeps one products table and one product per item.
create table if not exists public.product_translations (
  product_id uuid not null references public.products(id) on delete cascade,
  locale text not null check(locale in ('hi','pa','bn','mr','gu','ta','te','kn','ml')),
  title text not null,
  description text,
  search_terms text[] not null default '{}',
  primary key(product_id,locale)
);
alter table public.product_translations enable row level security;
create policy "Public may read product translations" on public.product_translations for select using(true);

-- Example Hindi translation; replace PRODUCT_UUID with an existing product id.
-- insert into public.product_translations(product_id,locale,title,description,search_terms)
-- values('PRODUCT_UUID','hi','लैवेंडर कढ़ाई वाली कुर्ती','आरामदायक कढ़ाई वाली कुर्ती',array['कुर्ती','लैवेंडर']);
