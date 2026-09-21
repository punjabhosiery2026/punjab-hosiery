import {NextResponse} from 'next/server';import {z} from 'zod';import {supabaseServer} from '@/lib/supabase/server';
const Schema=z.object({order_number:z.string().min(4),phone:z.string().min(8)});

export async function POST(request:Request){
 const data=Schema.safeParse(await request.json());
 if(!data.success)return NextResponse.json({error:'Enter your order ID and phone number.'},{status:400});
 const result=await supabaseServer().from('orders').select('order_number,status,created_at,courier_name,tracking_number,tracking_link,estimated_delivery_date').eq('order_number',data.data.order_number.trim()).eq('phone',data.data.phone.trim()).maybeSingle();
 return result.data?NextResponse.json(result.data):NextResponse.json({error:'No matching order was found. Check the order ID and phone number.'},{status:404});
}
