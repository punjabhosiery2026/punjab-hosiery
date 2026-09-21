-- Punjab Hosiery order tracking: safe, additive fields only.
alter table public.orders
  add column if not exists courier_name text,
  add column if not exists tracking_number text,
  add column if not exists tracking_link text,
  add column if not exists estimated_delivery_date date;

-- Keep existing orders trackable using the new first status.
update public.orders
set status = 'order_confirmed'
where status is null or status in ('pending', 'confirmed');

alter table public.orders
  alter column status set default 'order_confirmed';
