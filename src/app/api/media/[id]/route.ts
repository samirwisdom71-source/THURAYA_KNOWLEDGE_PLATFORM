import fs from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { mediaFilePath } from '@/lib/media';
import type { MediaAsset } from '@/lib/types';

export async function GET(req:Request,{params}:{params:Promise<{id:string}>}) {
  const {id}=await params;
  const r=await query<MediaAsset>('SELECT * FROM media_assets WHERE id=$1 LIMIT 1',[id]);
  const asset=r.rows[0];
  if(!asset)return NextResponse.json({error:'not found'},{status:404});
  const filePath=await mediaFilePath(asset,true);
  if(!filePath)return NextResponse.json({error:'not public'},{status:404});
  try{
    const bytes=await fs.readFile(filePath);
    const download=new URL(req.url).searchParams.get('download')==='1';
    if(download) await query('UPDATE media_assets SET download_count=download_count+1 WHERE id=$1',[id]).catch(()=>{});
    return new NextResponse(bytes,{headers:{
      'content-type':asset.kind==='image'&&asset.public_path?'image/webp':asset.mime_type,
      'content-length':String(bytes.length),
      'cache-control':asset.kind==='image'?'public, max-age=31536000, immutable':'private, max-age=0',
      'content-disposition':`${download?'attachment':'inline'}; filename*=UTF-8''${encodeURIComponent(asset.original_name)}`
    }});
  }catch{return NextResponse.json({error:'file missing'},{status:404});}
}
