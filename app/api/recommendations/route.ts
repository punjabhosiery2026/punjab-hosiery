import {NextResponse} from 'next/server';import {recommendationsFor} from '@/lib/recommendations';
export async function GET(request:Request){const ids=new URL(request.url).searchParams.get('ids')?.split(',').filter(Boolean)||[];return NextResponse.json(await recommendationsFor(ids,6))}
