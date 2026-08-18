import type { ReactNode } from 'react';
import { HomeStillLife } from './HomeStillLife';

export function PageHero({
  kicker,
  title,
  description,
  image,
  imageAlt,
  children,
}: {
  kicker: string;
  title: string;
  description?: string;
  image: string;
  imageAlt: string;
  children?: ReactNode;
}) {
  return (
    <section className="pageHero pageHeroVisual">
      <div className="container pageHeroGrid">
        <div className="pageHeroCopy">
          <span className="kicker">{kicker}</span>
          <h1>{title}</h1>
          {description ? <p>{description}</p> : null}
          {children}
        </div>
        <HomeStillLife src={image} alt={imageAlt} className="pageHeroMedia" sizes="(max-width: 1050px) 92vw, 46vw" priority />
      </div>
    </section>
  );
}
