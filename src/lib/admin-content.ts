import { query } from './db';
import { validateContentData, validateSlug } from './validators';
import type { ContentItem, ContentStatus, ContentType, Visibility } from './types';
import { allContentTypes } from './content-fields';
import { sourceHash, translateObjectToEnglish } from './translation';

const statuses:ContentStatus[]=['draft','ready','published','archived','awaiting_image'];
const visibilities:Visibility[]=['public','private','unlisted'];

export interface ContentMutation {
  contentType:ContentType;
  slug:string;
  status:ContentStatus;
  visibility:Visibility;
  showPublishDate:boolean;
  dataAr:Record<string,unknown>;
  dataEn?:Record<string,unknown>;
  privateData?:Record<string,unknown>;
  manualOverrideEn?:boolean;
}

export function parseContentMutation(body:any, existingType?:ContentType):ContentMutation {
  const type=(existingType||body.contentType) as ContentType;
  if(!allContentTypes.includes(type))throw new Error('نوع المحتوى غير صالح');
  const slug=String(body.slug||'').trim();
  if(!validateSlug(slug))throw new Error('Slug يجب أن يحتوي حروفًا إنجليزية صغيرة وأرقامًا وشرطات فقط');
  const status=String(body.status||'draft') as ContentStatus;
  const visibility=String(body.visibility||'public') as Visibility;
  if(!statuses.includes(status)||!visibilities.includes(visibility))throw new Error('حالة النشر غير صالحة');
  const dataAr=body.dataAr&&typeof body.dataAr==='object'?body.dataAr:{};
  const missing=validateContentData(type,dataAr);
  if(missing.length)throw new Error(`حقول عربية مطلوبة ناقصة: ${missing.join(', ')}`);
  return {contentType:type,slug,status,visibility,showPublishDate:Boolean(body.showPublishDate),dataAr,dataEn:body.dataEn&&typeof body.dataEn==='object'?body.dataEn:{},privateData:body.privateData&&typeof body.privateData==='object'?body.privateData:{},manualOverrideEn:Boolean(body.manualOverrideEn)};
}

async function reviewedAsset(id:unknown){
  if(typeof id!=='string'||!id)return null;
  const r=await query<{id:string;kind:string;public_safe_review:boolean;visibility:string;consent_status:string}>('SELECT id,kind,public_safe_review,visibility,consent_status FROM media_assets WHERE id=$1 LIMIT 1',[id]);
  return r.rows[0]||null;
}

export async function assertPublishable(input:ContentMutation){
  if(input.status!=='published')return;
  if(input.contentType==='visual_journal'){
    const asset=await reviewedAsset(input.dataAr.image_asset_id);
    if(!asset||asset.kind!=='image'||!asset.public_safe_review||asset.visibility!=='public')throw new Error('اليوميات البصرية تحتاج صورة حقيقية عامة اجتازت Public-safe review');
    if(!['confirmed','not_applicable'].includes(asset.consent_status))throw new Error('حالة موافقة الصورة غير صالحة للنشر');
    if(!String(input.dataAr.alt||'').trim())throw new Error('Alt text مطلوب لليوميات البصرية');
    input.dataAr.public_safe_review=true; input.dataAr.consent_status=asset.consent_status;
  }
  if(input.contentType==='publication'&&input.dataAr.full_document_public===true){
    const asset=await reviewedAsset(input.dataAr.full_document_asset_id);
    if(!asset||!asset.public_safe_review||asset.visibility!=='public')throw new Error('لا يمكن جعل الملف الكامل عامًا قبل إرفاق ملف اجتاز Public-safe review وأصبح Public');
  }
}

export async function validateArticleSources(input:ContentMutation){
  if(input.contentType!=='article')return;
  const keys=Array.isArray(input.dataAr.source_keys)?input.dataAr.source_keys.map(String):[];
  if(!keys.length)return;
  const r=await query<{source_key:string}>('SELECT source_key FROM source_registry WHERE source_key = ANY($1::text[])',[keys]);
  const found=new Set(r.rows.map(x=>x.source_key));
  const missing=keys.filter(k=>!found.has(k));
  if(missing.length)throw new Error(`مصادر غير معرفة: ${missing.join(', ')}`);
}

export async function maybeTranslate(item:ContentItem,input:ContentMutation){
  if(input.status!=='published'||process.env.AUTO_TRANSLATE_ON_PUBLISH!=='true'||input.manualOverrideEn){
    return {dataEn:input.dataEn||{},status:Object.keys(input.dataEn||{}).length?(input.manualOverrideEn?'reviewed':item.translation_status||'translated'):'not_started',hash:item.translation_source_hash||null};
  }
  try{
    const translated=await translateObjectToEnglish(input.dataAr);
    if(!translated)return {dataEn:input.dataEn||{},status:'pending',hash:sourceHash(input.dataAr)};
    return {dataEn:translated,status:'translated',hash:sourceHash(input.dataAr)};
  }catch{return {dataEn:input.dataEn||{},status:'failed',hash:sourceHash(input.dataAr)};}
}
