import { FallingEffectType } from '@/types/schema';
import { Ds03Values } from './personalize';

export const DEFAULT_SCENE_URL = '/templates/ds03-sang-trong/runtime/v1/scene.json';
export const DEFAULT_AUDIO_PLAY_ICON = '/templates/ds03-sang-trong/runtime/v1/icons/play.png';
export const DEFAULT_AUDIO_PAUSE_ICON = '/templates/ds03-sang-trong/runtime/v1/icons/pause.jpg';

export interface CropData {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface DisplayAnimation {
  id?: string;
  effect: string;
  repeat?: boolean;
  duration?: number;
}

export interface SceneEvent {
  id?: string;
  eventType:
    | 'open-lightbox'
    | 'add-to-calendar'
    | 'link'
    | 'call'
    | 'open-album-modal'
    | 'navigate-section'
    | 'copy-clipboard'
    | 'open-popup'
    | string;
  actionType?: string;
  url?: string;
  openInNewTab?: boolean;
  lightboxImageUrl?: string;
  lightboxMediaType?: string;
  albumModalId?: string;
  popupId?: string;
  targetSectionId?: string;
  sectionId?: string;
  defaultValue?: string;
  callAutoFillField?: string;
  phoneNumber?: string;
  calendarDate?: string;
  calendarTitle?: string;
  calendarLocation?: string;
  calendarStartTime?: string;
  triggerAutoScroll?: boolean;
}

export interface RsvpField {
  kind?: string;
  label?: string;
  enabled?: boolean;
  fieldId: string;
  required?: boolean;
  showLabel?: boolean;
  gridFullWidth?: boolean;
  options?: string;
  optionsLayout?: string;
  defaultValue?: string;
  placeholder?: string;
}

export interface AlbumImageItem {
  id: string;
  alt?: string;
  url: string;
}

export interface SceneButtonTextComponent {
  text?: string;
  color?: string;
  fontSize?: string | number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textTransform?: string;
  textDecoration?: string;
  textAlign?: string;
  opacity?: number;
  textShadow?: { enabled?: boolean; x?: number; y?: number; blur?: number; color?: string };
  textStroke?: { width?: number; color?: string };
}

export interface SceneIconComponent {
  svgCode?: string;
  iconColor?: string;
  preserveOriginalColors?: boolean;
  width?: string | number;
  height?: string | number;
}

export interface SceneNodeProps {
  id?: string;
  className?: string;
  top?: string | number;
  left?: string | number;
  width?: string | number;
  height?: string | number;
  position?: string;
  hidden?: boolean;
  background?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundAttachment?: string;
  backgroundType?: string;
  gradientType?: string;
  gradientAngle?: number;
  gradientColor1?: string;
  gradientColor2?: string;
  borderColor?: string;
  borderStyle?: string;
  borderWidth?: number[] | number;
  borderRadius?: number[] | number;
  radius?: number;
  padding?: number[];
  margin?: number[];
  rotate?: number;
  rotateX?: number;
  rotateY?: number;
  rotateZ?: number;
  scale?: number;
  opacity?: number;
  overlayType?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  displayAnimation?: DisplayAnimation | null;
  events?: SceneEvent[];
  text?: string;
  color?: string | { r: number; g: number; b: number; a: number };
  fontFamily?: string;
  fontSize?: string | number;
  fontWeight?: string;
  fontStyle?: string;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  textAlign?: string;
  textTransform?: string;
  textDecoration?: string;
  url?: string;
  cropData?: CropData;
  initField?: string;
  svgCode?: string;
  iconColor?: string;
  preserveOriginalColors?: boolean;
  buttonStyle?: string;
  enabled?: boolean;
  showIcon?: boolean;
  iconPosition?: string;
  iconHorizontalPosition?: number;
  iconComponent?: SceneIconComponent;
  textComponent?: SceneButtonTextComponent;
  isChildOfButton?: boolean;
  isChildOfGroup?: boolean;
  htmlContent?: string;
  mapEmbedUrl?: string;
  albumImages?: AlbumImageItem[];
  allFields?: RsvpField[];
  formLayout?: string;
  formGap?: number;
  inputHeight?: string;
  inputFontSize?: string;
  inputFontFamily?: string;
  textareaHeight?: string;
  showNameLabel?: boolean;
  showWishLabel?: boolean;
  buttonBackground?: string;
  buttonFontFamily?: string;
  buttonFontSize?: string;
  buttonPadding?: number[];
  wishNameFontSize?: string;
  wishNameFontColor?: string;
  wishNameFontFamily?: string;
  wishContentFontSize?: string;
  wishContentFontFamily?: string;
  autoOpen?: boolean;
  autoOpenDelay?: number;
  [key: string]: unknown;
}

export interface SceneNode {
  id: string;
  type: string;
  props: SceneNodeProps;
  children?: SceneNode[];
  linkedNodes?: Record<string, { $ref?: string } | SceneNode>;
  isCanvas?: boolean;
  hidden?: boolean;
  displayName?: string;
}

export interface SceneDocument {
  sections: SceneNode[];
}

export interface OpeningEffect {
  enabled?: boolean;
  renderer?: string;
  direction?: string;
  imageScaleMode?: string;
  panelBackgroundColor?: string;
  delay?: number;
  duration?: number;
  easing?: string;
  topPanelZIndex?: string;
  preferRightPanelOnTop?: boolean;
  leftPanelImage?: string;
  rightPanelImage?: string;
  mobileLeftPanelImage?: string;
  mobileRightPanelImage?: string;
  leftPanelInitialOffsetX?: number;
  leftPanelInitialOffsetY?: number;
  rightPanelInitialOffsetX?: number;
  rightPanelInitialOffsetY?: number;
  mobileLeftPanelInitialOffsetX?: number;
  mobileLeftPanelInitialOffsetY?: number;
  mobileRightPanelInitialOffsetX?: number;
  mobileRightPanelInitialOffsetY?: number;
}

export interface FallingEffects {
  enabled?: boolean;
  maxSize?: number;
  minSize?: number;
  fallMode?: string;
  fallSpeed?: number;
  imageUrl?: string;
  imageUrls?: Array<{ url: string; color?: string }>;
  coverageLevel?: number;
}

export interface AudioSettings {
  audioUrl?: string;
  autoPlay?: boolean;
  playIconUrl?: string;
  pauseIconUrl?: string;
  useDefaultIcons?: boolean;
  enableAnimations?: boolean;
}

export interface AutoScrollSettings {
  autoScroll?: {
    enabled?: boolean;
    speed?: number;
    speedPreset?: string;
  };
}

export interface SceneTemplateConfig {
  id: number;
  name?: string;
  pageSettings?: {
    mobileOnly?: boolean;
    mobileWidth?: string;
    desktopWidth?: string;
    mobilePageBackgroundColor?: string;
  };
  effects?: FallingEffects;
  audioSettings?: AudioSettings;
  openingEffect?: OpeningEffect;
  customEffects?: AutoScrollSettings;
  fontMap?: Record<string, string>;
}

export interface DemoWish {
  id: string | number;
  weddingPageId?: number;
  guestName: string;
  message?: string | null;
  isPublic?: boolean;
  createdAt: string;
}

export interface EditorialScene {
  version: number;
  template: SceneTemplateConfig;
  svgBank: Record<string, string>;
  desktop: SceneDocument;
  mobile: SceneDocument;
  demoWishes: DemoWish[];
}

export interface SceneCustomizeSettings {
  values: Ds03Values;
  photoOverrides: Record<string, string>;
  textOverrides: Record<string, string>;
  theme: {
    primaryColor?: string;
    backgroundColor?: string;
    accentColor?: string;
    headingFont?: string;
  };
  fallingType?: FallingEffectType;
  musicUrl?: string;
  publicCard: boolean;
}
