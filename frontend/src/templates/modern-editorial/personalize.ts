import { PageSchema } from '@/types/schema';
import { TemplateValues } from '../types';

export const DS03_BLOCK = 'DS03_RUNTIME';
const CONTENT_FIELDS = ['groomName', 'brideName', 'eventDate', 'eventTime', 'venueName', 'venueAddress', 'coverImageUrl'] as const;
const SAFE_DATA_IMAGE_URL = /^data:image\/(?:jpeg|png|webp|avif);base64,[A-Za-z0-9+/=]+$/;
const MAX_DATA_IMAGE_LENGTH = 600_000;
type ContentField = typeof CONTENT_FIELDS[number];
export type Ds03Values = Partial<Record<ContentField, string>>;

const DEFAULT_HERO_TITLE = 'WEDDING';
const DEFAULT_HERO_SUBTITLE = 'Trân trọng kính mời bạn cùng gia đình đến chứng kiến khoảnh khắc hạnh phúc của chúng tôi.';
const DEFAULT_COUPLE_QUOTE = 'Khoảnh khắc tuyệt vời nhất trong đời chính là...';
const DEFAULT_STORY_SUBTITLE = 'My eyes find love in you.';
const DEFAULT_GIFT_TITLE = 'Hộp mừng cưới';
const DEFAULT_THANKYOU_TITLE = 'Thank you';
const DEFAULT_GROOM_NAME = 'Minh Anh';
const DEFAULT_BRIDE_NAME = 'Yến Nhi';
const DEFAULT_EVENT_DATE = '2026-06-18';
const DEFAULT_EVENT_TIME = '11:00';
const DEFAULT_VENUE_NAME = 'Tư gia nhà trai';
const DEFAULT_VENUE_ADDRESS = 'KDT Vinhomes Oceanpark, Gia Lâm, Hà Nội';

const DEFAULT_GROOM_PHOTO = '/templates/ds03-sang-trong/runtime/v1/media/images/201d5e88-155e-4deb-a1e2-c03534858b1f-full.webp';
const DEFAULT_BRIDE_PHOTO = '/templates/ds03-sang-trong/runtime/v1/media/images/74596fe2-2c97-4957-a0f2-3939c3680f0c-full.webp';
const DEFAULT_COVER_PHOTO = '/templates/ds03-sang-trong/runtime/v1/media/images/34cb7f65-3999-4f76-bf0f-a00553c88b35-full.webp';
const DEFAULT_THANKYOU_PHOTO = '/templates/ds03-sang-trong/runtime/v1/media/images/537cceef-5576-4beb-aa78-5589748cc49d-full.webp';

const STORY_GALLERY_NODE_IDS = ['TMZbNDGpg-', 'qw9cETBd6x', '3HgqNhP-oU'] as const;
const DEFAULT_STORY_IMAGES = [
  '/templates/ds03-sang-trong/runtime/v1/media/images/537cceef-5576-4beb-aa78-5589748cc49d-full.webp',
  '/templates/ds03-sang-trong/runtime/v1/media/images/c965dda0-7902-407d-961b-f60cd22584ad-full.webp',
  '/templates/ds03-sang-trong/runtime/v1/media/images/0de33790-0cc0-429f-9c16-6adeeef29e07-full.webp',
];

const ALBUM_GALLERY_NODE_IDS = ['PmyZXEqFRE', '0RJwUg66AD', 'RKjPkevSoA', 'djYrsFtjW8', '4-p8a3D3rQ'] as const;
const DEFAULT_ALBUM_IMAGES = [
  '/templates/ds03-sang-trong/runtime/v1/media/images/70b9b436-ccbd-456a-ae4b-da2e25f6a99b-full.webp',
  '/templates/ds03-sang-trong/runtime/v1/media/images/97b81eac-0c78-4fbb-9dc4-7e709fa2b413-full.webp',
  '/templates/ds03-sang-trong/runtime/v1/media/images/daf539e0-112a-4a45-a696-d8120a68bad9-full.webp',
  '/templates/ds03-sang-trong/runtime/v1/media/images/4640e788-1411-4836-a589-b54d0f8c105b-full.webp',
  '/templates/ds03-sang-trong/runtime/v1/media/images/7b487820-2ffa-40f7-b36a-1402f58c6b87-full.webp',
];

export function isEditorialSchema(schema: PageSchema): boolean {
  const id = schema.template?.id;
  if (id === 'modern-editorial' || id === 'ds03') return true;
  return schema.blocks.some((b) => b.type === DS03_BLOCK || typeof b.props?.sectionId === 'string');
}

export function personalize(schema: PageSchema, values: TemplateValues, defaults: TemplateValues): PageSchema {
  const hasLegacy = schema.blocks.some((block) => block.type === DS03_BLOCK);
  if (hasLegacy) {
    const changed = CONTENT_FIELDS.filter(field => typeof values[field] === 'string' && values[field] !== defaults[field]);
    const overrides = Object.fromEntries(changed.map(field => [field, values[field]]));
    return {
      ...schema,
      blocks: schema.blocks.map(block => block.type === DS03_BLOCK
        ? { ...block, props: { ...block.props, values: overrides } }
        : block),
    };
  }

  return {
    ...schema,
    blocks: schema.blocks.map((block) => {
      if (block.type === 'HERO') {
        return {
          ...block,
          props: {
            ...block.props,
            groomName: values.groomName || DEFAULT_GROOM_NAME,
            brideName: values.brideName || DEFAULT_BRIDE_NAME,
            eventDate: values.eventDate || DEFAULT_EVENT_DATE,
            coverImageUrl: values.coverImageUrl || block.props.coverImageUrl || DEFAULT_COVER_PHOTO,
          },
        };
      }
      if (block.type === 'EVENTS' && block.props.sectionId === 'SApg6qJVE-') {
        const list = Array.isArray(block.props.groomEvents)
          ? [...(block.props.groomEvents as Array<Record<string, unknown>>)]
          : [];
        const first = list[0] || { id: 'main-invite', title: 'Hôn lễ được tổ chức vào lúc' };
        list[0] = {
          ...first,
          timeText: values.eventTime || DEFAULT_EVENT_TIME,
          dateText: values.eventDate || DEFAULT_EVENT_DATE,
          locationName: values.venueName || DEFAULT_VENUE_NAME,
          address: values.venueAddress || DEFAULT_VENUE_ADDRESS,
        };
        return {
          ...block,
          props: { ...block.props, groomEvents: list },
        };
      }
      if (block.type === 'COUPLE') {
        const groom = (block.props.groom as Record<string, unknown>) || {};
        const bride = (block.props.bride as Record<string, unknown>) || {};
        return {
          ...block,
          props: {
            ...block.props,
            groom: { ...groom, name: values.groomName || DEFAULT_GROOM_NAME },
            bride: { ...bride, name: values.brideName || DEFAULT_BRIDE_NAME },
          },
        };
      }
      return block;
    }),
  };
}

export interface EditorialSettings {
  visible: boolean;
  sceneUrl?: string;
  values: Ds03Values;
  photoOverrides: Record<string, string>;
  textOverrides: Record<string, string>;
  orderedSectionIds: string[] | null;
}

export function extractEditorialSettings(schema: PageSchema): EditorialSettings {
  const legacy = schema.blocks.find((item) => item.type === DS03_BLOCK);
  if (legacy) {
    return {
      visible: !legacy.isHidden,
      sceneUrl: typeof legacy.props.sceneUrl === 'string' ? legacy.props.sceneUrl : undefined,
      values: readOverrides(legacy.props.values),
      photoOverrides: readPhotoOverrides(legacy.props.photoOverrides),
      textOverrides: readTextOverrides(legacy.props.textOverrides),
      orderedSectionIds: null,
    };
  }

  const visibleBlocks = schema.blocks.filter((item) => !item.isHidden);
  if (visibleBlocks.length === 0) {
    return {
      visible: false,
      values: {},
      photoOverrides: {},
      textOverrides: {},
      orderedSectionIds: [],
    };
  }

  const hero = schema.blocks.find((item) => item.type === 'HERO');
  const invite = schema.blocks.find(
    (item) => item.type === 'EVENTS' && item.props.sectionId === 'SApg6qJVE-'
  );
  const couple = schema.blocks.find((item) => item.type === 'COUPLE');
  const storyGallery = schema.blocks.find(
    (item) => item.type === 'GALLERY' && item.props.sectionId === 'fFDaX7WHAU'
  );
  const albumGallery = schema.blocks.find(
    (item) => item.type === 'GALLERY' && item.props.sectionId === 'Non88UDtG_'
  );
  const giftBox = schema.blocks.find((item) => item.type === 'GIFTBOX');
  const thankYou = schema.blocks.find((item) => item.type === 'THANKYOU');

  const sceneUrl = typeof hero?.props.sceneUrl === 'string' ? hero.props.sceneUrl : undefined;
  const inviteEvent = Array.isArray(invite?.props.groomEvents)
    ? (invite.props.groomEvents[0] as Record<string, unknown> | undefined)
    : undefined;
  const groomObj = couple?.props.groom as Record<string, unknown> | undefined;
  const brideObj = couple?.props.bride as Record<string, unknown> | undefined;

  const groomName =
    (typeof hero?.props.groomName === 'string' && hero.props.groomName) ||
    (typeof groomObj?.name === 'string' ? groomObj.name : undefined);
  const brideName =
    (typeof hero?.props.brideName === 'string' && hero.props.brideName) ||
    (typeof brideObj?.name === 'string' ? brideObj.name : undefined);
  const eventDate =
    (typeof hero?.props.eventDate === 'string' && hero.props.eventDate) ||
    (typeof inviteEvent?.dateText === 'string' ? inviteEvent.dateText : undefined);
  const eventTime = typeof inviteEvent?.timeText === 'string' ? inviteEvent.timeText : undefined;
  const venueName = typeof inviteEvent?.locationName === 'string' ? inviteEvent.locationName : undefined;
  const venueAddress = typeof inviteEvent?.address === 'string' ? inviteEvent.address : undefined;
  const coverImageUrl = typeof hero?.props.coverImageUrl === 'string' ? hero.props.coverImageUrl : undefined;

  const rawValues: Record<string, unknown> = {};
  if (groomName && groomName !== DEFAULT_GROOM_NAME) rawValues.groomName = groomName;
  if (brideName && brideName !== DEFAULT_BRIDE_NAME) rawValues.brideName = brideName;
  if (eventDate && eventDate !== DEFAULT_EVENT_DATE) rawValues.eventDate = eventDate;
  if (eventTime && eventTime !== DEFAULT_EVENT_TIME) rawValues.eventTime = eventTime;
  if (venueName && venueName !== DEFAULT_VENUE_NAME) rawValues.venueName = venueName;
  if (venueAddress && venueAddress !== DEFAULT_VENUE_ADDRESS) rawValues.venueAddress = venueAddress;
  if (coverImageUrl && coverImageUrl !== DEFAULT_COVER_PHOTO) rawValues.coverImageUrl = coverImageUrl;

  const photoOverrides = readPhotoOverrides(hero?.props.photoOverrides);
  const groomPhoto = typeof groomObj?.photoUrl === 'string' ? mediaUrl(groomObj.photoUrl) : undefined;
  if (groomPhoto && groomPhoto !== DEFAULT_GROOM_PHOTO && !photoOverrides['lovG9hBAc1']) {
    photoOverrides['lovG9hBAc1'] = groomPhoto;
  }
  const bridePhoto = typeof brideObj?.photoUrl === 'string' ? mediaUrl(brideObj.photoUrl) : undefined;
  if (bridePhoto && bridePhoto !== DEFAULT_BRIDE_PHOTO && !photoOverrides['rQsmEdD5eM']) {
    photoOverrides['rQsmEdD5eM'] = bridePhoto;
  }

  if (Array.isArray(storyGallery?.props.images)) {
    STORY_GALLERY_NODE_IDS.forEach((nodeId, idx) => {
      const next = mediaUrl((storyGallery.props.images as unknown[])[idx]);
      if (next && next !== DEFAULT_STORY_IMAGES[idx] && !photoOverrides[nodeId]) {
        photoOverrides[nodeId] = next;
      }
    });
  }

  if (Array.isArray(albumGallery?.props.images)) {
    ALBUM_GALLERY_NODE_IDS.forEach((nodeId, idx) => {
      const next = mediaUrl((albumGallery.props.images as unknown[])[idx]);
      if (next && next !== DEFAULT_ALBUM_IMAGES[idx] && !photoOverrides[nodeId]) {
        photoOverrides[nodeId] = next;
      }
    });
  }

  const thankYouPhoto =
    typeof thankYou?.props.imageUrl === 'string' ? mediaUrl(thankYou.props.imageUrl) : undefined;
  if (thankYouPhoto && thankYouPhoto !== DEFAULT_THANKYOU_PHOTO && !photoOverrides['kIaZgnQXf1']) {
    photoOverrides['kIaZgnQXf1'] = thankYouPhoto;
  }

  const textOverrides = readTextOverrides(hero?.props.textOverrides);
  if (typeof hero?.props.title === 'string' && hero.props.title !== DEFAULT_HERO_TITLE) {
    textOverrides['PQyGkvFmr-'] = hero.props.title;
  }
  if (typeof hero?.props.subtitle === 'string' && hero.props.subtitle !== DEFAULT_HERO_SUBTITLE) {
    textOverrides['AL9vjrI7lj'] = hero.props.subtitle;
  }
  if (typeof couple?.props.quote === 'string' && couple.props.quote !== DEFAULT_COUPLE_QUOTE) {
    textOverrides['nCcxuKr6fx'] = couple.props.quote;
  }
  if (typeof storyGallery?.props.subtitle === 'string' && storyGallery.props.subtitle !== DEFAULT_STORY_SUBTITLE) {
    textOverrides['erbYdfyGHG'] = storyGallery.props.subtitle;
  }
  if (typeof giftBox?.props.title === 'string' && giftBox.props.title !== DEFAULT_GIFT_TITLE) {
    textOverrides['8YxnOylCAE'] = giftBox.props.title;
  }
  if (typeof thankYou?.props.title === 'string' && thankYou.props.title !== DEFAULT_THANKYOU_TITLE) {
    textOverrides['pEdiXlyD4i'] = thankYou.props.title;
  }

  const orderedSectionIds = visibleBlocks
    .map((block) => (typeof block.props.sectionId === 'string' ? block.props.sectionId : null))
    .filter((id): id is string => Boolean(id));

  return {
    visible: true,
    sceneUrl,
    values: readOverrides(rawValues),
    photoOverrides,
    textOverrides,
    orderedSectionIds: orderedSectionIds.length > 0 ? orderedSectionIds : null,
  };
}

export function readOverrides(values: unknown): Ds03Values {
  if (!values || typeof values !== 'object') return {};
  const fields = values as Record<string, unknown>;
  return Object.fromEntries(
    CONTENT_FIELDS.filter(field => typeof fields[field] === 'string').map(field => {
      const limit = field === 'coverImageUrl' ? MAX_DATA_IMAGE_LENGTH : 2048;
      return [field, String(fields[field]).slice(0, limit)];
    })
  );
}

export function readPhotoOverrides(values: unknown): Record<string, string> {
  if (!values || typeof values !== 'object') return {};
  const entries: [string, string][] = [];
  for (const [nodeId, rawUrl] of Object.entries(values as Record<string, unknown>)) {
    if (!/^[A-Za-z0-9_-]{4,24}$/.test(nodeId)) continue;
    const valid = mediaUrl(rawUrl);
    if (valid) entries.push([nodeId, valid]);
  }
  return Object.fromEntries(entries);
}

export function readTextOverrides(values: unknown): Record<string, string> {
  if (!values || typeof values !== 'object') return {};
  const entries: [string, string][] = [];
  for (const [nodeId, rawText] of Object.entries(values as Record<string, unknown>)) {
    if (!/^[A-Za-z0-9_-]{4,24}$/.test(nodeId) || typeof rawText !== 'string') continue;
    entries.push([nodeId, rawText.slice(0, 2048)]);
  }
  return Object.fromEntries(entries);
}

const LEGACY_DS03_PREFIX = '/template-designs/ds03/v1/';
const DS03_RUNTIME_PREFIX = '/templates/ds03-sang-trong/runtime/v1/';

export function mediaUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value) return undefined;
  if (value.length <= MAX_DATA_IMAGE_LENGTH && SAFE_DATA_IMAGE_URL.test(value)) return value;
  if (value.length > 2048) return undefined;
  try {
    const url = new URL(value, 'https://invitation.invalid');
    if (value.startsWith('/') && url.origin === 'https://invitation.invalid') {
      const normalized = url.pathname + url.search;
      return normalized.startsWith(LEGACY_DS03_PREFIX)
        ? DS03_RUNTIME_PREFIX + normalized.slice(LEGACY_DS03_PREFIX.length)
        : normalized;
    }
    if (url.protocol === 'https:' && !url.username && !url.password) return url.href;
  } catch {
    return undefined;
  }
}
