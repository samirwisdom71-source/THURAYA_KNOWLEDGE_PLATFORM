import { NextResponse } from 'next/server';
import { assertSameOrigin, requireAdminApi } from '@/lib/auth';
import { parseContentMutation, assertPublishable, validateArticleSources, maybeTranslate } from '@/lib/admin-content';
import { query } from '@/lib/db';
import type { ContentItem } from '@/lib/types';
import { audit } from '@/lib/audit';
import { requestIp } from '@/lib/rate-limit';

export async function GET(_req:Request,{params}:{params:Promise<{id:string}>}){try{await requireAdminApi();const{id}=await params;const r=await query<ContentItem>('SELECT * FROM content_items WHERE id=$1',[id]);return r.rows[0]?NextResponse.json({item:r.rows[0]}):NextResponse.json({error:'Not found'},{status:404})}catch{return NextResponse.json({error:'Unauthorized'},{status:401})}}

export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){
  try{
    assertSameOrigin(req);const user=await requireAdminApi();const{id}=await params;
    const old=await query<ContentItem>('SELECT * FROM content_items WHERE id=$1',[id]);const item=old.rows[0];if(!item)return NextResponse.json({error:'Not found'},{status:404});
    const input=parseContentMutation(await req.json(),item.content_type);await assertPublishable(input);await validateArticleSources(input);
    const conflict=await query('SELECT 1 FROM content_items WHERE content_type=$1 AND slug=$2 AND id<>$3',[item.content_type,input.slug,id]);if(conflict.rowCount)return NextResponse.json({error:'Slug مستخدم بالفعل في هذا النوع'},{status:409});
    // first_published_at is server-owned and can only be set to the actual first publish time. It is never accepted from the client.
    const firstPublished=item.first_published_at || (input.status==='published'&&!item.seeded_launch_library?new Date():null);
    const tr=await maybeTranslate(item,input);
    const r=await query<ContentItem>(`UPDATE content_items SET slug=$2,status=$3,visibility=$4,first_published_at=$5,show_publish_date=$6,data_ar=$7::jsonb,data_en=$8::jsonb,private_data=$9::jsonb,translation_status=$10,translation_source_hash=$11,manual_override_en=$12,updated_at=now() WHERE id=$1 RETURNING *`,[id,input.slug,input.status,input.visibility,firstPublished,input.showPublishDate,JSON.stringify(input.dataAr),JSON.stringify(tr.dataEn),JSON.stringify(input.privateData||{}),tr.status,tr.hash,input.manualOverrideEn||false]);
    await audit(user,'update','content_item',id,{slug:input.slug,status:input.status,visibility:input.visibility,show_publish_date:input.showPublishDate},requestIp(req));
    return NextResponse.json({item:r.rows[0]});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Invalid request'},{status:(e as any)?.status||400});}
}

export async function DELETE(req:Request,{params}:{params:Promise<{id:string}>}){try{assertSameOrigin(req);const user=await requireAdminApi();const{id}=await params;const r=await query<ContentItem>(`UPDATE content_items SET status='archived',visibility='private',updated_at=now() WHERE id=$1 RETURNING *`,[id]);if(!r.rows[0])return NextResponse.json({error:'Not found'},{status:404});await audit(user,'archive','content_item',id,{},requestIp(req));return NextResponse.json({item:r.rows[0]})}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Unauthorized'},{status:(e as any)?.status||401})}}
