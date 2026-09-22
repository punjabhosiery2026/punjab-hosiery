import type {MetadataRoute} from 'next';
import {supabaseServer} from '@/lib/supabase/server';

const base='https://www.punjabhosiery.com';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
  let products:{slug:string;updated_at?:string|null}[]=[];
  try{const result=await supabaseServer().from('products').select('slug,updated_at').eq('is_active',true);products=result.data||[]}catch{}
  const pages=['','/shop','/about','/contact','/shipping','/returns','/terms','/privacy','/wholesale','/track-order'];
  return [...pages.map(path=>({url:`${base}${path}`,lastModified:new Date()})),...products.map(product=>({url:`${base}/product/${product.slug}`,lastModified:product.updated_at?new Date(product.updated_at):new Date()}))];
}
