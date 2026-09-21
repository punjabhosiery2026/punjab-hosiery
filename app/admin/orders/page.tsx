'use client';

import {useEffect,useState} from 'react';
import {supabaseBrowser} from '@/lib/supabase/browser';
import './orders.css';

const statuses=[['order_confirmed','Order Confirmed'],['processing','Processing'],['packed','Packed'],['shipped','Shipped'],['out_for_delivery','Out for Delivery'],['delivered','Delivered'],['cancelled','Cancelled']] as const;
type Order=Record<string,any>;
const normalize=(status:string)=>status==='pending'||status==='confirmed'?'order_confirmed':status;

export default function Orders(){
 const [data,setData]=useState<Order[]>([]),[message,setMessage]=useState(''),[saving,setSaving]=useState<string|null>(null);
 async function token(){const session=await supabaseBrowser().auth.getSession();return session.data.session?.access_token||''}
 async function load(){const r=await fetch('/api/admin/data?kind=orders',{headers:{Authorization:`Bearer ${await token()}`}});if(r.ok)setData(await r.json());else setMessage('Unable to load orders. Please sign in again.');}
 useEffect(()=>{void load()},[]);
 function change(id:string,key:string,value:string){setData(all=>all.map(order=>order.id===id?{...order,[key]:value}:order));}
 async function save(order:Order){
  setSaving(order.id);setMessage('');
  const payload={id:order.id,status:normalize(order.status),courier_name:order.courier_name||null,tracking_number:order.tracking_number||null,tracking_link:order.tracking_link||null,estimated_delivery_date:order.estimated_delivery_date||null};
  const r=await fetch('/api/admin/orders',{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:`Bearer ${await token()}`},body:JSON.stringify(payload)});const result=await r.json();setSaving(null);
  if(r.ok){setData(all=>all.map(item=>item.id===order.id?{...item,...result}:item));setMessage(`Tracking details saved for ${order.order_number}.`)}else setMessage(result.error||'Unable to save tracking details.');
 }
 return <main className="admin-orders"><div className="admin-orders-title"><div><p>ORDER MANAGEMENT</p><h1>Customer orders</h1><span>Update the status and delivery details. Customers can see them after entering their order ID and matching phone number.</span></div></div>{message&&<p className="admin-orders-message">{message}</p>}<div className="admin-orders-list">{data.map(order=><article className="admin-order" key={order.id}><div className="admin-order-summary"><div><b>{order.order_number}</b><p>{order.customer_name} · {order.phone} · {order.city}, {order.state}</p><span>{order.order_items?.map((item:any)=>`${item.product_name}${item.colour?` — ${item.colour}`:''} × ${item.quantity}`).join(', ')}</span></div><strong>₹{order.total}</strong></div><div className="admin-order-fields"><label>Status<select value={normalize(order.status||'order_confirmed')} onChange={e=>change(order.id,'status',e.target.value)}>{statuses.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Courier name<input value={order.courier_name||''} onChange={e=>change(order.id,'courier_name',e.target.value)} placeholder="e.g. Delhivery"/></label><label>Tracking / AWB<input value={order.tracking_number||''} onChange={e=>change(order.id,'tracking_number',e.target.value)} placeholder="Courier tracking number"/></label><label>Tracking link<input value={order.tracking_link||''} onChange={e=>change(order.id,'tracking_link',e.target.value)} placeholder="https://..."/></label><label>Estimated delivery<input type="date" value={order.estimated_delivery_date||''} onChange={e=>change(order.id,'estimated_delivery_date',e.target.value)}/></label><button onClick={()=>void save(order)} disabled={saving===order.id}>{saving===order.id?'Saving…':'Save tracking'}</button></div></article>)}{!data.length&&<p className="admin-orders-empty">No orders yet.</p>}</div></main>;
}
