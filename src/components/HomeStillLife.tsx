import Image from 'next/image';

export function HomeStillLife({
  src,
  alt,
  className = '',
  priority = false,
  sizes = '(max-width: 1050px) 92vw, 48vw',
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <div className={`homeStillLife ${className}`.trim()}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} />
    </div>
  );
}
