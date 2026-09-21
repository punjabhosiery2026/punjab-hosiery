-- Restores the previously supplied colour/photo pairs for the cable-knit cardigan.
-- Only colours with their own uploaded photo are included.
with cardigan as (
  select id, slug, stock_quantity, images
  from public.products
  where slug = 'premium-cable-knit-button-cardigan'
)
update public.products as p
set variants = jsonb_build_array(
  jsonb_build_object('id', c.id::text || '-maroon', 'color', 'Maroon', 'colorHex', '#7B263B', 'image', c.images[1], 'sku', upper(c.slug) || '-MAROON', 'stock', 19),
  jsonb_build_object('id', c.id::text || '-red',    'color', 'Red',    'colorHex', '#B3262E', 'image', c.images[2], 'sku', upper(c.slug) || '-RED',    'stock', 19),
  jsonb_build_object('id', c.id::text || '-navy',   'color', 'Navy',   'colorHex', '#16213E', 'image', c.images[3], 'sku', upper(c.slug) || '-NAVY',   'stock', 19),
  jsonb_build_object('id', c.id::text || '-teal',   'color', 'Teal',   'colorHex', '#0D7377', 'image', c.images[4], 'sku', upper(c.slug) || '-TEAL',   'stock', 19),
  jsonb_build_object('id', c.id::text || '-pink',   'color', 'Pink',   'colorHex', '#D87093', 'image', c.images[5], 'sku', upper(c.slug) || '-PINK',   'stock', 19),
  jsonb_build_object('id', c.id::text || '-black',  'color', 'Black',  'colorHex', '#171717', 'image', c.images[6], 'sku', upper(c.slug) || '-BLACK',  'stock', 19),
  jsonb_build_object('id', c.id::text || '-beige',  'color', 'Beige',  'colorHex', '#D7C2A3', 'image', c.images[7], 'sku', upper(c.slug) || '-BEIGE',  'stock', 18),
  jsonb_build_object('id', c.id::text || '-grey',   'color', 'Grey',   'colorHex', '#6B7280', 'image', c.images[8], 'sku', upper(c.slug) || '-GREY',   'stock', 18)
),
colours = array['Maroon','Red','Navy','Teal','Pink','Black','Beige','Grey'],
updated_at = now()
from cardigan c
where p.id = c.id;
