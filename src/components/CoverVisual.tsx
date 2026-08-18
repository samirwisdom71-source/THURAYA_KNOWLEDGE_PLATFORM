import Image from 'next/image';
import { query } from '@/lib/db';
import type { MediaAsset } from '@/lib/types';

export async function CoverVisual({
  assetId,
  fallbackSrc,
  alt,
  className = '',
  sizes = '(max-width: 720px) 92vw, 33vw',
  priority = false,
}: {
  assetId?: unknown;
  fallbackSrc: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const id = typeof assetId === 'string' && assetId ? assetId : null;
  if (id) {
    const result = await query<MediaAsset>('SELECT * FROM media_assets WHERE id=$1 LIMIT 1', [id]).catch(() => null);
    const asset = result?.rows?.[0];
    if (asset?.visibility === 'public' && asset.public_safe_review) {
      return (
        <div className={`coverVisual ${className}`.trim()}>
          <img src={`/api/media/${encodeURIComponent(id)}`} alt={alt || asset.alt_ar || ''} />
        </div>
      );
    }
  }
  return (
    <div className={`coverVisual ${className}`.trim()}>
      <Image src={fallbackSrc} alt={alt} fill sizes={sizes} priority={priority} />
    </div>
  );
}
