alter table public.products add column if not exists variants jsonb not null default '[]'::jsonb;
alter table public.order_items add column if not exists variant_id text, add column if not exists colour text, add column if not exists sku text;

update public.products as p set variants = coalesce((select jsonb_agg(jsonb_build_object('id',coalesce(v->>'id',p.id::text||'-'||regexp_replace(lower(coalesce(v->>'color','variant')),'[^a-z0-9]+','-','g')||case when nullif(v->>'size','') is null then '' else '-'||regexp_replace(lower(v->>'size'),'[^a-z0-9]+','-','g') end),'color',coalesce(v->>'color','Colour'),'colorHex',coalesce(v->>'colorHex',v->>'hex','#777777'),'size',nullif(v->>'size',''),'image',v->>'image','sku',coalesce(v->>'sku',upper(regexp_replace(p.slug,'[^a-z0-9]+','-','g')||'-'||regexp_replace(coalesce(v->>'color','variant'),'[^a-zA-Z0-9]+','-','g'))),'stock',coalesce((v->>'stock')::integer,(v->>'stock_quantity')::integer,case when coalesce((v->>'in_stock')::boolean,true) then p.stock_quantity else 0 end))) from jsonb_array_elements(p.variants) v where coalesce(v->>'image','')<>''),'[]'::jsonb) where jsonb_array_length(coalesce(p.variants,'[]'::jsonb))>0;

drop function if exists public.place_order(jsonb,jsonb,text);
create function public.place_order(p_customer jsonb,p_items jsonb,p_coupon text default null) returns jsonb language plpgsql security definer set search_path=public as $$
declare v_order uuid; v_item jsonb; v_product products; v_subtotal numeric:=0; v_discount numeric:=0; v_coupon coupons; v_variant jsonb; v_variant_id text; v_colour text; v_sku text; v_quantity integer;
begin
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_quantity:=(v_item->>'quantity')::integer;
    select * into v_product from products where id=(v_item->>'product_id')::uuid and is_active=true for update;
    if not found or v_product.stock_quantity<v_quantity then raise exception 'Item unavailable or insufficient stock'; end if;
    v_variant_id:=nullif(trim(v_item->>'variant_id'),'');
    if coalesce(jsonb_array_length(v_product.variants),0)>0 then
      if v_variant_id is null then raise exception 'Please select a product variant'; end if;
      select value into v_variant from jsonb_array_elements(v_product.variants) where value->>'id'=v_variant_id limit 1;
      if v_variant is null or coalesce((v_variant->>'stock')::integer,0)<v_quantity then raise exception 'Selected variant is unavailable or insufficient stock'; end if;
    end if;
    v_subtotal:=v_subtotal+v_product.retail_price*v_quantity;
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
    v_quantity:=(v_item->>'quantity')::integer; v_variant_id:=nullif(trim(v_item->>'variant_id'),'');
    select * into v_product from products where id=(v_item->>'product_id')::uuid for update;
    if v_variant_id is not null then select value into v_variant from jsonb_array_elements(v_product.variants) where value->>'id'=v_variant_id limit 1; v_colour:=v_variant->>'color'; v_sku:=v_variant->>'sku'; else v_colour:=null; v_sku:=null; end if;
    update products set stock_quantity=stock_quantity-v_quantity,variants=case when v_variant_id is null or coalesce(jsonb_array_length(variants),0)=0 then variants else (select jsonb_agg(case when value->>'id'=v_variant_id then jsonb_set(value,'{stock}',to_jsonb(greatest(0,(value->>'stock')::integer-v_quantity))) else value end) from jsonb_array_elements(variants)) end,updated_at=now() where id=v_product.id;
    insert into order_items(order_id,product_id,product_name,unit_price,quantity,variant_id,colour,sku) values(v_order,v_product.id,v_product.name,v_product.retail_price,v_quantity,v_variant_id,v_colour,v_sku);
  end loop;
  return jsonb_build_object('order_id',v_order,'discount',v_discount,'coupon_code',case when v_coupon.id is null then null else v_coupon.code end);
end $$;
