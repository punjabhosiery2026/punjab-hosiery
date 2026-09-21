'use client';

import Link from 'next/link';

type FeaturedProduct={id:string;name:string;slug:string;category?:string|null;retail_price:number;image?:string};

function Card({product,decorative=false}:{product:FeaturedProduct;decorative?:boolean}){const content=<><div>{product.image?<img src={product.image} alt={decorative?'':product.name}/>:<span>Punjab Hosiery</span>}</div><small>{product.category||'Punjab Hosiery'}</small><b>{product.name}</b><strong>₹{product.retail_price}</strong></>;return decorative?<div className="featured-carousel-card">{content}</div>:<Link className="featured-carousel-card" href={`/product/${product.slug}`}>{content}</Link>}

export default function FeaturedCarousel({products}:{products:FeaturedProduct[]}){
  if(!products.length)return null;
  return <div className="featured-carousel" aria-label="Featured products"><div className="featured-carousel-track">{products.map(product=><Card key={product.id} product={product}/>)}{products.map(product=><div className="featured-carousel-copy" aria-hidden="true" key={`copy-${product.id}`}><Card product={product} decorative/></div>)}</div></div>;
}
