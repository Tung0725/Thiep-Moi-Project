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
  | 'THANKYOU'
  | (string & {});

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
  variant?: 'polaroid' | 'arch' | 'editorial';
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
  displayName?: string;
  role: 'GROOM' | 'BRIDE';
  titleLabel?: string;
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
  weddingDateText?: string;
  announcementLine1?: string;
  announcementLine2?: string;
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
  receptionTime?: string;
  dressCodeColors?: string[];
  timeline?: { time: string; label: string }[];
  showMapEmbed?: boolean;
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
  groomPhotoUrl?: string;
  bridePhotoUrl?: string;
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

export interface ThemeDecorations {
  flowerUrl?: string;
  envelopeUrl?: string;
  paperUrl?: string;
  castleUrl?: string;
  sealImageUrl?: string;
  sealText?: string;
  inviteMessage?: string;
}

export interface ThemeConfig {
  design?: 'MINIMALISM_DARK_RED';
  primaryColor: string;
  backgroundColor: string;
  accentColor?: string;
  headingFont: string;
  bodyFont: string;
  heroVariant?: 'polaroid' | 'arch' | 'editorial';
  decorations?: ThemeDecorations;
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
  template?: { id: string; version: number };
  version: number;
  layoutMode: LayoutMode;
  theme: ThemeConfig;
  effects: EffectsConfig;
  blocks: UIBlock[];
}

