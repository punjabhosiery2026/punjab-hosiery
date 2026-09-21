-- Run once in Supabase SQL Editor. This keeps the existing products table and existing products.
alter table public.products add column if not exists subcategory text;
alter table public.products add column if not exists is_new_arrival boolean not null default false;
alter table public.products add column if not exists is_on_sale boolean not null default false;
create index if not exists products_category_subcategory_idx on public.products(category,subcategory);
create index if not exists products_new_arrival_idx on public.products(is_new_arrival) where is_new_arrival;
create index if not exists products_on_sale_idx on public.products(is_on_sale) where is_on_sale;

create table if not exists public.product_subcategories (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  name text not null,
  sort_order integer not null default 0,
  is_enabled boolean not null default true,
  unique(category,name)
);
alter table public.product_subcategories enable row level security;
create policy "Public may read enabled subcategories" on public.product_subcategories for select using (is_enabled=true);

insert into public.product_subcategories(category,name,sort_order) values
('Men','Shirts',1),('Men','T-Shirts',2),('Men','Polo T-Shirts',3),('Men','Pants / Trousers',4),('Men','Jeans',5),('Men','Shorts',6),('Men','Track Pants / Lower',7),('Men','Sweaters',8),('Men','Sweatshirts',9),('Men','Hoodies',10),('Men','Jackets',11),('Men','Thermals',12),('Men','Innerwear',13),('Men','Socks',14),('Men','Nightwear',15),
('Women','Kurtis',1),('Women','Kurta Sets',2),('Women','Suits / Salwar Suits',3),('Women','Tops',4),('Women','T-Shirts',5),('Women','Shirts',6),('Women','Jeans',7),('Women','Pants / Trousers',8),('Women','Palazzos',9),('Women','Leggings',10),('Women','Sweaters',11),('Women','Sweatshirts',12),('Women','Hoodies',13),('Women','Jackets',14),('Women','Nightwear',15),('Women','Thermals',16),('Women','Innerwear',17),
('Kurtis','Daily Wear Kurtis',1),('Kurtis','Embroidered Kurtis',2),('Kurtis','Printed Kurtis',3),('Kurtis','Straight Kurtis',4),('Kurtis','A-Line Kurtis',5),('Kurtis','Winter Kurtis',6),('Kurtis','Kurti Sets',7),
('Kids','Boys T-Shirts',1),('Kids','Boys Shirts',2),('Kids','Boys Pants / Jeans',3),('Kids','Boys Tracksuits',4),('Kids','Girls Dresses',5),('Kids','Girls Tops',6),('Kids','Girls Leggings',7),('Kids','Kids Sweaters',8),('Kids','Kids Sweatshirts',9),('Kids','Kids Jackets',10),('Kids','Kids Nightwear',11),('Kids','Baby Wear',12),
('Bedding','Bedsheets',1),('Bedding','Double Bedsheets',2),('Bedding','Single Bedsheets',3),('Bedding','Blankets',4),('Bedding','Comforters',5),('Bedding','Quilts / Razai',6),('Bedding','Pillow Covers',7),('Bedding','Towels',8)
on conflict(category,name) do nothing;

-- Safe mapping for existing products: retains category, only fills an empty subcategory.
update public.products set subcategory=category where subcategory is null and category in ('Men','Women','Kurtis','Kids','Bedding');
