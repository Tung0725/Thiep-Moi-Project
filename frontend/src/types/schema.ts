/**
 * Core JSON-Driven UI Schema Contracts
 * Reference: docs/search/json_driven_UI.md and docs/search/architecture.md
 */

export type LayoutMode = 'STACK' | 'FREE_CANVAS';

export type FallingEffectType = 'NONE' | 'PETALS' | 'SNOW' | 'HEARTS';

export type BlockType =
  | 'HERO'
  | 'COUNTDOWN'
  | 'LOCATION'
  | 'WISHES'
  | 'GALLERY'
  | 'COUPLE'
  | 'EVENTS'
  | 'GIFTBOX'
  | 'THANKYOU';

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
  subtitle?: string;
}

export interface CoupleMemberInfo {
  name: string;
  role: 'GROOM' | 'BRIDE';
  photoUrl: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  storyQuote?: string;
}

export interface CoupleBlockProps {
  groom: CoupleMemberInfo;
  bride: CoupleMemberInfo;
  quote?: string;
  sectionTitle?: string;
}

export interface SingleEventItem {
  id?: string;
  title: string;
  dateText: string;
  timeText: string;
  locationName: string;
  address: string;
  mapUrl?: string;
  illustrationUrl?: string;
}

export interface EventsBlockProps {
  title?: string;
  groomEvents: SingleEventItem[];
  brideEvents: SingleEventItem[];
}

export interface BankAccountInfo {
  ownerName: string;
  bankName: string;
  accountNumber: string;
  qrCodeUrl: string;
  label: string;
}

export interface GiftBoxBlockProps {
  title?: string;
  subtitle?: string;
  groomAccount?: BankAccountInfo;
  brideAccount?: BankAccountInfo;
}

export interface ThankYouBlockProps {
  title?: string;
  message?: string;
  imageUrl?: string;
}

export type BlockPropsMap = {
  HERO: HeroBlockProps;
  COUNTDOWN: CountdownBlockProps;
  LOCATION: LocationBlockProps;
  WISHES: WishesBlockProps;
  GALLERY: GalleryBlockProps;
  COUPLE: CoupleBlockProps;
  EVENTS: EventsBlockProps;
  GIFTBOX: GiftBoxBlockProps;
  THANKYOU: ThankYouBlockProps;
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

export interface OpeningEffectConfig {
  enabled: boolean;
  leftImage?: string;
  rightImage?: string;
  delayMs?: number;
  durationMs?: number;
}

export interface EffectsConfig {
  fallingType: FallingEffectType;
  musicUrl?: string;
  openingEffect?: OpeningEffectConfig;
}

export interface PageSchema {
  version: number;
  layoutMode: LayoutMode;
  theme: ThemeConfig;
  effects: EffectsConfig;
  blocks: UIBlock[];
}

