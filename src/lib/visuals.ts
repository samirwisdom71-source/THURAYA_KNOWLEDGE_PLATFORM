import type { ContentItem, ContentType } from './types';

export const sectionHero = {
  knowledge: '/section/knowledge.jpg',
  topics: '/section/topics.jpg',
  challenges: '/section/challenges.jpg',
  tools: '/section/tools.jpg',
  library: '/section/library.jpg',
  newsletter: '/section/newsletter.jpg',
  ask: '/section/ask.jpg',
  askSalon: '/ask/salon.jpg',
  askNote: '/ask/note.jpg',
} as const;

export const stills = {
  manuscript: '/stills/manuscript.jpg',
  windowBooks: '/stills/window-books.jpg',
  oliveOil: '/stills/olive-oil.jpg',
  ceramic: '/stills/ceramic.jpg',
  timer: '/stills/timer.jpg',
  cards: '/stills/cards.jpg',
  folios: '/stills/folios.jpg',
  letter: '/stills/letter.jpg',
  cups: '/stills/cups.jpg',
  lantern: '/stills/lantern.jpg',
} as const;

const ALL_STILLS = Object.values(stills);

const TYPE_PREFERRED: Partial<Record<ContentType, string[]>> = {
  article: [stills.manuscript, stills.windowBooks, stills.lantern],
  minute_knowledge: [stills.lantern, stills.manuscript],
  monthly_issue: [stills.oliveOil, stills.ceramic],
  challenge: [stills.timer, stills.cards],
  tool: [stills.cards, stills.timer],
  publication_tool: [stills.cards, stills.folios],
  publication: [stills.folios, stills.manuscript],
  newsletter: [stills.letter, stills.cups],
  ask_thuraya: [stills.cups, stills.letter],
  impact_story: [stills.windowBooks, stills.ceramic],
  community_content: [stills.oliveOil, stills.ceramic, stills.windowBooks],
};

function hashSlug(slug: string) {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) hash = (hash * 33 + slug.charCodeAt(i)) >>> 0;
  return hash;
}

export function fallbackStill(
  item: Pick<ContentItem, 'content_type' | 'slug'>,
  index = 0,
  exclude: string[] = [],
) {
  const preferred = TYPE_PREFERRED[item.content_type] ?? [];
  const pool = [...preferred, ...ALL_STILLS.filter((src) => !preferred.includes(src))]
    .filter((src) => !exclude.includes(src));
  const sequence = pool.length ? pool : ALL_STILLS;
  return sequence[(hashSlug(item.slug) + index) % sequence.length];
}

export function itemAssetId(data: Record<string, unknown>) {
  return data.hero_asset_id ?? data.cover_asset_id ?? data.image_asset_id;
}
