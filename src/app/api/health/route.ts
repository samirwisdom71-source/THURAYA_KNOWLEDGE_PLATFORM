import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
export async function GET(){try{await query('SELECT 1');return NextResponse.json({status:'ok',database:'ok',time:new Date().toISOString()},{headers:{'cache-control':'no-store'}})}catch{return NextResponse.json({status:'degraded',database:'unavailable'},{status:503,headers:{'cache-control':'no-store'}})}}
