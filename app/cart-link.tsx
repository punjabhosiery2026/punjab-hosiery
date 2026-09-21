'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
export default function CartLink(){const[count,setCount]=useState(0);const refresh=()=>{try{const items=JSON.parse(sessionStorage.getItem('cart')||'[]');setCount(items.reduce((total:number,item:{quantity?:number})=>total+(item.quantity||0),0))}catch{setCount(0)}};useEffect(()=>{refresh();window.addEventListener('cart-updated',refresh);window.addEventListener('storage',refresh);return()=>{window.removeEventListener('cart-updated',refresh);window.removeEventListener('storage',refresh)}},[]);return <Link className="header-icon cart-icon" href="/cart" aria-label={`Cart, ${count} items`}>🛒<em>{count}</em></Link>}
