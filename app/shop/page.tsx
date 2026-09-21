import Link from 'next/link';
import {supabaseServer} from '@/lib/supabase/server';
import type {Product} from '@/lib/types';
import {getProductImage} from '@/lib/product-variants';

const kurtiTypes=['Kurtis','Daily Wear Kurtis','Embroidered Kurtis','Printed Kurtis','Straight Kurtis','A-Line Kurtis','Winter Kurtis','Kurti Sets'];
type Params={category?:string;subcategory?:string;child_subcategory?:string;sale?:string;new?:string;sort?:string;q?:string;size?:string;colour?:string;stock?:string;min?:string;max?:string};

export default async function Shop({searchParams}:{searchParams:Promise<Params>}){
  const s=await searchParams;
  let products:Product[]=[];
  let error='';
  try{
    let q=supabaseServer().from('products').select('*').eq('is_active',true).order('created_at',{ascending:false});
    if(s.category)q=q.eq('category',s.category);
    if(s.subcategory)q=s.subcategory==='Kurtis'?q.in('subcategory',kurtiTypes):q.eq('subcategory',s.subcategory);
    if(s.child_subcategory)q=q.eq('child_subcategory',s.child_subcategory);
    if(s.sale==='true')q=q.eq('is_on_sale',true);
    if(s.sort==='new'||s.new==='true')q=q.eq('is_new_arrival',true);
    if(s.q?.trim())q=q.ilike('name',`%${s.q.trim()}%`);
    if(s.size)q=q.contains('sizes',[s.size]);
    if(s.colour)q=q.contains('colours',[s.colour]);
    if(s.stock==='in')q=q.gt('stock_quantity',0);
    if(s.stock==='out')q=q.eq('stock_quantity',0);
    if(s.min)q=q.gte('retail_price',Number(s.min));
    if(s.max)q=q.lte('retail_price',Number(s.max));
    const result=await q;
    if(result.error)throw result.error;
    products=result.data||[];
  }catch{error='Catalogue is not connected yet. Add your Supabase credentials to .env.local.'}
  const title=s.q?`Search: ${s.q}`:s.child_subcategory||s.subcategory||s.category||(s.sale?'Sale':s.sort==='new'||s.new==='true'?'New Arrivals':'Shop hosiery & garments.');
  const categoryView=Boolean(s.category||s.subcategory||s.child_subcategory);
  const filtered=Boolean(s.q||s.size||s.colour||s.stock||s.min||s.max||s.sale||s.new||s.sort);
  const emptyTitle=filtered?'No matching products yet.':categoryView?`${title} is coming soon.`:'New products are being added.';
  const emptyBody=categoryView?'Our team is preparing this collection. Please check back soon, or browse our available categories.':'Please explore our current collections or check back soon.';
  return <main className="shop-page">
    <p className="shop-kicker">CATALOGUE</p><h1>{title}</h1>
    <form className="shop-filters">
      <input name="q" defaultValue={s.q} placeholder="Search"/>
      <select name="category" defaultValue={s.category||''}><option value="">All categories</option>{['Women','Men','Kids','Bedding'].map(x=><option key={x}>{x}</option>)}</select>
      <select name="size" defaultValue={s.size||''}><option value="">All sizes</option>{['XS','S','M','L','XL','XXL','Free Size'].map(x=><option key={x}>{x}</option>)}</select>
      <input name="colour" defaultValue={s.colour} placeholder="Colour"/>
      <select name="stock" defaultValue={s.stock||''}><option value="">Any stock</option><option value="in">In stock</option><option value="out">Out of stock</option></select>
      <input name="min" defaultValue={s.min} inputMode="numeric" placeholder="Min price"/><input name="max" defaultValue={s.max} inputMode="numeric" placeholder="Max price"/>
      <label><input name="new" type="checkbox" value="true" defaultChecked={s.new==='true'||s.sort==='new'}/> New</label><label><input name="sale" type="checkbox" value="true" defaultChecked={s.sale==='true'}/> Sale</label>
      <button>Apply filters</button><Link href="/shop">Clear</Link>
    </form>
    {error?<p className="shop-error">{error}</p>:products.length?<div className="shop-grid">{products.map(product=>{
      const image=getProductImage(product);
      return <Link className="catalogue-product-card" href={`/product/${product.slug}`} key={product.id} aria-label={`View ${product.name}`}>
        {image?<div className="listing-image-frame"><img src={image} alt={product.name}/></div>:<div className="listing-image-frame">No image yet</div>}
        <div className="catalogue-product-copy">{product.is_new_arrival&&<small>New Arrival</small>}{product.is_on_sale&&<small>Sale</small>}<h2>{product.name}</h2><p>{product.subcategory||product.category} · {product.stock_quantity>0?`${product.stock_quantity} in stock`:'Out of stock'}</p><b>₹{product.retail_price}</b></div>
      </Link>
    })}</div>:<section className="coming-soon-state"><p>NEW COLLECTION</p><h2>{emptyTitle}</h2><span>{emptyBody}</span><Link href="/shop">Browse all available products</Link></section>}
  </main>
}
