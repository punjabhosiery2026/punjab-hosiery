-- Run once in Supabase SQL Editor after category-migration.sql.
-- Safely moves all existing top-level Kurtis products into Women > Kurtis.
update public.products
set category='Women', subcategory=coalesce(nullif(subcategory,''),'Kurtis')
where category='Kurtis';

-- Kurtis is no longer a top-level category. Its styles are Women subcategories.
update public.product_subcategories set is_enabled=false where category='Kurtis';
insert into public.product_subcategories(category,name,sort_order) values
('Women','Kurtis',1),('Women','Daily Wear Kurtis',2),('Women','Embroidered Kurtis',3),('Women','Printed Kurtis',4),('Women','Straight Kurtis',5),('Women','A-Line Kurtis',6),('Women','Winter Kurtis',7),('Women','Kurti Sets',8)
on conflict(category,name) do update set is_enabled=true;
