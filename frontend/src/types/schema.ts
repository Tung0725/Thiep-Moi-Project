/**
 * Core JSON-Driven UI Schema Contracts
 * Reference: docs/search/json_driven_UI.md and docs/search/architecture.md
 */

export type LayoutMode = 'STACK' | 'FREE_CANVAS';

export type FallingEffectType = 'NONE' | 'PETALS' | 'SNOW' | 'HEARTS';

export type BlockType = 'HERO' | 'COUNTDOWN' | 'LOCATION' | 'WISHES' | 'GALLERY';

export interface ElementLayout {
  x?: number;
  y?: number;
  width?: number | string;
  height?: number | string;
  zIndex?: number;
  rotation?: number;
}

export interface HeroBlockProps {
  brideName: string;
  groomName: string;
  eventDate: string;
  coverImageUrl: string;
  title?: string;
  subtitle?: string;
}

export interface CountdownBlockProps {
  targetDate: string;
  title?: string;
  description?: string;
}

export interface LocationBlockProps {
  ceremonyVenue: string;
  address: string;
  mapUrl?: string;
  eventTime?: string;
}

export interface WishesBlockProps {
  title?: string;
  subtitle?: string;
  allowRsvp?: boolean;
  slug?: string;
}

export interface GalleryBlockProps {
  images?: string[];
  title?: string;
}

export type BlockPropsMap = {
  HERO: HeroBlockProps;
  COUNTDOWN: CountdownBlockProps;
  LOCATION: LocationBlockProps;
  WISHES: WishesBlockProps;
  GALLERY: GalleryBlockProps;
};

export interface UIBlock<T = Record<string, unknown>> {
  id: string;
  type: BlockType;
  isHidden?: boolean;
  layout?: ElementLayout;
  props: T;
}

export interface ThemeConfig {
  primaryColor: string;
  backgroundColor: string;
  headingFont: string;
  bodyFont: string;
}

export interface EffectsConfig {
  fallingType: FallingEffectType;
  musicUrl?: string;
}

export interface PageSchema {
  version: number;
  layoutMode: LayoutMode;
  theme: ThemeConfig;
  effects: EffectsConfig;
  blocks: UIBlock[];
}
