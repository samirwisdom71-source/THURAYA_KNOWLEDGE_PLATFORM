'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

export function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      el.classList.add('is-visible');
      observer.disconnect();
    }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const style = delay ? { '--reveal-delay': `${delay}ms` } as CSSProperties : undefined;
  return <div ref={ref} className={`reveal ${className}`.trim()} style={style}>{children}</div>;
}
