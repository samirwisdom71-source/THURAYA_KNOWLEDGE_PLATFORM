import { NextResponse } from 'next/server';
import { assertSameOrigin, requireAdminApi } from '@/lib/auth';
import { parseContentMutation, assertPublishable, validateArticleSources, maybeTranslate } from '@/lib/admin-content';
import { query } from '@/lib/db';
import type { ContentItem } from '@/lib/types';
import { audit } from '@/lib/audit';
import { requestIp } from '@/lib/rate-limit';

export async function GET(req:Request){try{await requireAdminApi();const u=new URL(req.url);const type=u.searchParams.get('type');const r=await query<ContentItem>(type?'SELECT * FROM content_items WHERE content_type=$1 ORDER BY updated_at DESC LIMIT 400':'SELECT * FROM content_items ORDER BY updated_at DESC LIMIT 400',type?[type]:[]);return NextResponse.json({items:r.rows})}catch{return NextResponse.json({error:'Unauthorized'},{status:401})}}

export async function POST(req:Request){
  try{
    assertSameOrigin(req); const user=await requireAdminApi(); const input=parseContentMutation(await req.json());
    await assertPublishable(input); await validateArticleSources(input);
    const exists=await query('SELECT 1 FROM content_items WHERE content_type=$1 AND slug=$2',[input.contentType,input.slug]);
    if(exists.rowCount)return NextResponse.json({error:'Slug مستخدم بالفعل في هذا النوع'},{status:409});
    const firstPublished=input.status==='published'?new Date():null;
    const empty={translation_status:'not_started',translation_source_hash:null} as ContentItem;
    const tr=await maybeTranslate(empty,input);
    const r=await query<ContentItem>(`INSERT INTO content_items(content_type,slug,status,visibility,first_published_at,show_publish_date,data_ar,data_en,private_data,translation_status,translation_source_hash,manual_override_en) VALUES($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9::jsonb,$10,$11,$12) RETURNING *`,[input.contentType,input.slug,input.status,input.visibility,firstPublished,input.showPublishDate,JSON.stringify(input.dataAr),JSON.stringify(tr.dataEn),JSON.stringify(input.privateData||{}),tr.status,tr.hash,input.manualOverrideEn||false]);
    await audit(user,'create','content_item',r.rows[0].id,{content_type:input.contentType,slug:input.slug,status:input.status,show_publish_date:input.showPublishDate},requestIp(req));
    return NextResponse.json({item:r.rows[0]},{status:201});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Invalid request'},{status:(e as any)?.status||400});}
}
