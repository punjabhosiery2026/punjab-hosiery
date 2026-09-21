const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = {};
for (const line of fs.readFileSync('.env.local', 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
}

const labels = {
  '-maroon': ['Maroon', '#7B263B'],
  '-red': ['Mauve', '#9A6F7F'],
  '-navy': ['Off White', '#E8E0D1'],
  '-teal': ['Teal Blue', '#1F6675'],
  '-pink': ['Brown', '#4B302A'],
  '-black': ['Purple', '#6E5869'],
  '-beige': ['Taupe', '#8B7E6B'],
  '-grey': ['Grey', '#858A95'],
};

async function main() {
  const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
  const { data, error } = await db.from('products').select('id,variants').eq('slug', 'premium-cable-knit-button-cardigan').single();
  if (error) throw error;
  const variants = data.variants.map((variant) => {
    const key = Object.keys(labels).find((suffix) => String(variant.id).endsWith(suffix));
    if (!key) throw new Error(`Unknown variant ${variant.id}`);
    const [color, colorHex] = labels[key];
    return { ...variant, color, colorHex };
  });
  const result = await db.from('products').update({ variants, colours: variants.map((variant) => variant.color), updated_at: new Date().toISOString() }).eq('id', data.id);
  if (result.error) throw result.error;
  console.log(`Updated: ${variants.map((variant) => variant.color).join(', ')}`);
}

main().catch((error) => { console.error(error.message); process.exit(1); });
