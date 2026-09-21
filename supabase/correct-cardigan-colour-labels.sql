-- Corrects labels to match the actual uploaded cardigan photographs.
with corrected as (
  select p.id, jsonb_agg(
    case value->>'color'
      when 'Maroon' then jsonb_set(jsonb_set(value,'{color}',to_jsonb('Taupe'::text)),'{colorHex}',to_jsonb('#80715F'::text))
      when 'Red' then jsonb_set(jsonb_set(value,'{color}',to_jsonb('Mauve'::text)),'{colorHex}',to_jsonb('#9A6F7F'::text))
      when 'Navy' then jsonb_set(jsonb_set(value,'{color}',to_jsonb('Navy Blue'::text)),'{colorHex}',to_jsonb('#1D4E6D'::text))
      when 'Teal' then jsonb_set(jsonb_set(value,'{color}',to_jsonb('Teal Blue'::text)),'{colorHex}',to_jsonb('#1F6675'::text))
      when 'Pink' then jsonb_set(jsonb_set(value,'{color}',to_jsonb('Brown'::text)),'{colorHex}',to_jsonb('#4B302A'::text))
      when 'Black' then jsonb_set(jsonb_set(value,'{color}',to_jsonb('Dark Brown'::text)),'{colorHex}',to_jsonb('#30211E'::text))
      else value
    end order by ordinality
  ) as variants
  from public.products p
  cross join lateral jsonb_array_elements(p.variants) with ordinality
  where p.slug='premium-cable-knit-button-cardigan'
  group by p.id
)
update public.products p
set variants=corrected.variants,
    colours=array['Taupe','Mauve','Navy Blue','Teal Blue','Brown','Dark Brown','Beige','Grey'],
    updated_at=now()
from corrected
where p.id=corrected.id;
