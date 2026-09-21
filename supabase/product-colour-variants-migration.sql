alter table public.products
  add column if not exists variants jsonb not null default '[]'::jsonb;

alter table public.order_items
  add column if not exists colour text;

drop function if exists public.place_order(jsonb,jsonb,text);
create function public.place_order(p_customer jsonb,p_items jsonb,p_coupon text default null) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_order uuid; v_item jsonb; v_product products; v_subtotal numeric:=0; v_discount numeric:=0; v_coupon coupons; v_colour text; v_variant jsonb; v_variant_stock integer;
begin
  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from products where id=(v_item->>'product_id')::uuid and is_active=true for update;
    if not found or v_product.stock_quantity < (v_item->>'quantity')::int then raise exception 'Item unavailable or insufficient stock'; end if;
    v_colour:=nullif(trim(v_item->>'colour'),'');
    if coalesce(jsonb_array_length(v_product.variants),0)>0 then
      if v_colour is null then raise exception 'Please select a colour for %',v_product.name; end if;
      select value into v_variant from jsonb_array_elements(v_product.variants) where lower(value->>'color')=lower(v_colour) limit 1;
      if v_variant is null or coalesce((v_variant->>'in_stock')::boolean,true)=false then raise exception 'Selected colour is unavailable'; end if;
      if v_variant ? 'stock_quantity' then
        v_variant_stock:=coalesce((v_variant->>'stock_quantity')::integer,0);
        if v_variant_stock < (v_item->>'quantity')::int then raise exception 'Selected colour has insufficient stock'; end if;
      end if;
    end if;
    v_subtotal:=v_subtotal+v_product.retail_price*(v_item->>'quantity')::int;
  end loop;
  if nullif(trim(p_coupon),'') is not null then
    select * into v_coupon from coupons where upper(code)=upper(trim(p_coupon)) and is_active=true and (start_date is null or start_date<=now()) and (expiry_date is null or expiry_date>=now()) for update;
    if not found then raise exception 'This coupon is invalid, inactive, or expired'; end if;
    if v_coupon.usage_limit is not null and v_coupon.usage_count>=v_coupon.usage_limit then raise exception 'This coupon has reached its usage limit'; end if;
    if v_subtotal<v_coupon.minimum_order_amount then raise exception 'Minimum order amount for this coupon is ₹%',v_coupon.minimum_order_amount; end if;
    if v_coupon.discount_type='percentage' then v_discount:=v_subtotal*v_coupon.discount_value/100; elsif v_coupon.discount_type='fixed' then v_discount:=v_coupon.discount_value; else v_discount:=0; end if;
    if v_coupon.maximum_discount is not null then v_discount:=least(v_discount,v_coupon.maximum_discount); end if;
    v_discount:=least(v_discount,v_subtotal); update coupons set usage_count=usage_count+1 where id=v_coupon.id;
  end if;
  insert into orders(order_number,customer_name,phone,whatsapp,email,address,city,state,pin_code,notes,subtotal,discount,total,coupon_code) values ('PH-'||to_char(now(),'YYMMDD')||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,6)),p_customer->>'name',p_customer->>'phone',p_customer->>'whatsapp',p_customer->>'email',p_customer->>'address',p_customer->>'city',p_customer->>'state',p_customer->>'pin_code',p_customer->>'notes',v_subtotal,v_discount,greatest(0,v_subtotal-v_discount),case when v_coupon.id is null then null else v_coupon.code end) returning id into v_order;
  for v_item in select * from jsonb_array_elements(p_items) loop
    select * into v_product from products where id=(v_item->>'product_id')::uuid for update; v_colour:=nullif(trim(v_item->>'colour'),'');
    update products set stock_quantity=stock_quantity-(v_item->>'quantity')::int,variants=case when v_colour is null or coalesce(jsonb_array_length(variants),0)=0 then variants else (select jsonb_agg(case when lower(value->>'color')=lower(v_colour) and value ? 'stock_quantity' then jsonb_set(jsonb_set(value,'{stock_quantity}',to_jsonb(greatest(0,(value->>'stock_quantity')::integer-(v_item->>'quantity')::integer))),'{in_stock}',to_jsonb(greatest(0,(value->>'stock_quantity')::integer-(v_item->>'quantity')::integer)>0)) else value end) from jsonb_array_elements(variants)) end,updated_at=now() where id=v_product.id;
    insert into order_items(order_id,product_id,product_name,unit_price,quantity,colour) values(v_order,v_product.id,v_product.name,v_product.retail_price,(v_item->>'quantity')::int,v_colour);
  end loop;
  return jsonb_build_object('order_id',v_order,'discount',v_discount,'coupon_code',case when v_coupon.id is null then null else v_coupon.code end);
end $$;
