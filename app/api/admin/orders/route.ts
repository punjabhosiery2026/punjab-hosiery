import {NextResponse} from 'next/server';
import {z} from 'zod';
import {supabaseServer} from '@/lib/supabase/server';

async function admin(request:Request){
 const token=request.headers.get('authorization')?.replace('Bearer ','');
 if(!token)return null;
 const db=supabaseServer();
 const user=await db.auth.getUser(token);
 if(!user.data.user)return null;
 const profile=await db.from('profiles').select('role').eq('id',user.data.user.id).single();
 return profile.data?.role==='admin'?db:null;
}

const Tracking=z.object({
 id:z.string().uuid(),
 status:z.enum(['order_confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled']),
 courier_name:z.string().trim().max(100).nullable().optional(),
 tracking_number:z.string().trim().max(120).nullable().optional(),
 tracking_link:z.string().trim().url().nullable().optional(),
 estimated_delivery_date:z.string().date().nullable().optional(),
});

export async function PATCH(request:Request){
 const db=await admin(request);
 if(!db)return NextResponse.json({error:'Unauthorized'},{status:401});
 const parsed=Tracking.safeParse(await request.json());
 if(!parsed.success)return NextResponse.json({error:'Enter a valid order status and tracking details.'},{status:400});
 const {id,...tracking}=parsed.data;
 const result=await db.from('orders').update(tracking).eq('id',id).select().single();
 return result.error?NextResponse.json({error:result.error.message},{status:400}):NextResponse.json(result.data);
}
