import { query } from '@/lib/db';
import type { MediaAsset } from '@/lib/types';

export async function MediaVisual({assetId,alt='',className=''}:{assetId?:unknown;alt?:string;className?:string}) {
  const id=typeof assetId==='string'&&assetId?assetId:null;
  if (id) {
    const r=await query<MediaAsset>('SELECT * FROM media_assets WHERE id=$1 LIMIT 1',[id]).catch(()=>null);
    const asset=r?.rows?.[0];
    if(asset?.visibility==='public'&&asset.public_safe_review){
      return <div className={`mediaVisual ${className}`}><img src={`/api/media/${encodeURIComponent(id)}`} alt={alt||asset.alt_ar||''}/></div>;
    }
  }
  return <div className={`mediaPlaceholder ${className}`}><div className="placeholderOrb"/><span>{alt || 'THURAYA'}</span></div>;
}
