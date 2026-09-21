'use client';

import {FormEvent,useState} from 'react';
import './tracking.css';

const steps=[
 ['order_confirmed','Order Confirmed'],['processing','Processing'],['packed','Packed'],['shipped','Shipped'],['out_for_delivery','Out for Delivery'],['delivered','Delivered'],
] as const;
type Status=typeof steps[number][0]|'cancelled';
type Order={order_number:string;status:Status;created_at:string;courier_name?:string|null;tracking_number?:string|null;tracking_link?:string|null;estimated_delivery_date?:string|null};
const labels=Object.fromEntries(steps) as Record<string,string>;
const normalize=(status:string):Status=>status==='pending'||status==='confirmed'?'order_confirmed':status as Status;

export default function TrackOrder(){
 const [order,setOrder]=useState<Order|null>(null),[message,setMessage]=useState(''),[loading,setLoading]=useState(false);
 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault();setLoading(true);setMessage('');setOrder(null);
  const response=await fetch('/api/order-tracking',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))});
  const data=await response.json();setLoading(false);
  if(response.ok)setOrder({...data,status:normalize(data.status)});else setMessage(data.error||'Unable to track this order right now.');
 }
 const active=order&&order.status!=='cancelled'?steps.findIndex(([key])=>key===order.status): -1;
 return <main className="tracking-page"><section className="tracking-intro"><p className="tracking-eyebrow">PUNJAB HOSIERY</p><h1>Track your order</h1><p>Enter the order ID sent after checkout and the same phone number used for the order.</p><form className="tracking-form" onSubmit={submit}><label>Order ID<input name="order_number" placeholder="Example: PH-..." required/></label><label>Phone number<input name="phone" inputMode="tel" placeholder="Phone used for the order" required/></label><button disabled={loading}>{loading?'Checking…':'Track order'}</button></form>{message&&<p className="tracking-error" role="alert">{message}</p>}</section>{order&&<section className="tracking-card" aria-live="polite"><div className="tracking-card-head"><div><p className="tracking-eyebrow">ORDER {order.order_number}</p><h2>{order.status==='cancelled'?'Cancelled':labels[order.status]||'Order Confirmed'}</h2></div><span className={'status-pill '+(order.status==='cancelled'?'cancelled':'')}>{order.status==='cancelled'?'Cancelled':labels[order.status]}</span></div>{order.status==='cancelled'?<p className="tracking-cancelled">This order has been cancelled. Please contact us if you need help.</p>:<ol className="tracking-timeline">{steps.map(([key,label],index)=><li className={index<=active?'complete':''} key={key}><span>{index<active?'✓':index+1}</span><b>{label}</b></li>)}</ol>}<div className="tracking-details">{order.estimated_delivery_date&&<p><b>Estimated delivery</b><span>{new Date(`${order.estimated_delivery_date}T00:00:00`).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</span></p>}{order.courier_name&&<p><b>Courier</b><span>{order.courier_name}</span></p>}{order.tracking_number&&<p><b>Tracking / AWB</b><span>{order.tracking_number}</span></p>}{order.tracking_link&&<a href={order.tracking_link} target="_blank" rel="noreferrer">Track with courier ↗</a>}</div></section>}</main>;
}
