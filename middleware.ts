import {NextResponse,type NextRequest} from 'next/server';

// Edge middleware only checks for the secure login cookie. Every admin data API
// separately validates the Supabase user and admin role before returning data.
export function middleware(req:NextRequest){if(req.nextUrl.pathname==='/admin/login')return NextResponse.next();if(!req.cookies.get('ph-admin-token')?.value)return NextResponse.redirect(new URL('/admin/login',req.url));return NextResponse.next()}
export const config={matcher:['/admin/:path*']};
