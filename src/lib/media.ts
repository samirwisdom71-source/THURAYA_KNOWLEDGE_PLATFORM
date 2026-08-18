import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import sharp from 'sharp';
import { query } from './db';
import type { MediaAsset } from './types';

const MAX_BYTES = 25 * 1024 * 1024;
const allowed = new Set([
  'image/jpeg','image/png','image/webp','image/avif',
  'application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain','text/csv'
]);

function storageRoot() { return path.resolve(process.env.STORAGE_DIR || './storage'); }
function safeName(name:string) { return name.normalize('NFKC').replace(/[^a-zA-Z0-9._-]+/g,'-').replace(/-+/g,'-').slice(-120) || 'file'; }
function kindFor(mime:string): MediaAsset['kind'] { if (mime.startsWith('image/')) return 'image'; if (mime.startsWith('audio/')) return 'audio'; if (mime.startsWith('video/')) return 'video'; if (mime.includes('pdf') || mime.includes('document') || mime.includes('sheet') || mime.startsWith('text/')) return 'document'; return 'other'; }

export async function saveUpload(file: File, meta: {altAr?:string;altEn?:string;consentStatus?:MediaAsset['consent_status']}) {
  if (file.size <= 0 || file.size > MAX_BYTES) throw new Error('File size is not allowed');
  if (!allowed.has(file.type)) throw new Error('File type is not allowed');
  const buffer = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash('sha256').update(buffer).digest('hex');
  const existing = await query<MediaAsset>('SELECT * FROM media_assets WHERE sha256=$1 LIMIT 1',[sha256]);
  if (existing.rows[0]) return existing.rows[0];
  const id = randomUUID();
  const privateDir = path.join(storageRoot(),'private');
  const publicDir = path.join(storageRoot(),'public');
  await fs.mkdir(privateDir,{recursive:true}); await fs.mkdir(publicDir,{recursive:true});
  const originalName = safeName(file.name);
  const privateFile = path.join(privateDir,`${id}-${originalName}`);
  await fs.writeFile(privateFile,buffer,{mode:0o600});
  let publicPath: string | null = null;
  const metadata: Record<string,unknown> = {};
  if (file.type.startsWith('image/')) {
    const img = sharp(buffer,{failOn:'error'}).rotate();
    const info = await img.metadata();
    metadata.width = info.width || null; metadata.height = info.height || null;
    const output = `${id}.webp`;
    const publicFile = path.join(publicDir,output);
    // Re-encode without original EXIF/GPS metadata.
    await img.resize({width:2400,height:2400,fit:'inside',withoutEnlargement:true}).webp({quality:84}).toFile(publicFile);
    publicPath = output;
  } else {
    // Documents stay private until public-safe review; when approved the same private file is streamed through a guarded route.
    publicPath = null;
  }
  const r = await query<MediaAsset>(`INSERT INTO media_assets(kind,original_name,mime_type,size_bytes,private_path,public_path,sha256,alt_ar,alt_en,consent_status,public_safe_review,visibility,metadata)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,false,'private',$11::jsonb) RETURNING *`,[
    kindFor(file.type),file.name,file.type,file.size,privateFile,publicPath,sha256,meta.altAr||null,meta.altEn||null,meta.consentStatus||'not_applicable',JSON.stringify(metadata)
  ]);
  return r.rows[0];
}

export async function mediaFilePath(asset: MediaAsset, publicRequest:boolean) {
  if (publicRequest) {
    if (!asset.public_safe_review || asset.visibility !== 'public') return null;
    if (asset.kind === 'image' && asset.public_path) return path.join(storageRoot(),'public',asset.public_path);
    return asset.private_path;
  }
  return asset.private_path;
}

export async function removeMediaFiles(asset: MediaAsset) {
  await fs.unlink(asset.private_path).catch(()=>{});
  if (asset.public_path) await fs.unlink(path.join(storageRoot(),'public',asset.public_path)).catch(()=>{});
}
