import {
  CoupleBlockProps,
  EventsBlockProps,
  GalleryBlockProps,
  GiftBoxBlockProps,
  HeroBlockProps,
  PageSchema,
  ThankYouBlockProps,
} from '@/types/schema';
import {
  DS03_BLOCK,
  isEditorialSchema,
  readPhotoOverrides,
} from '@/templates/modern-editorial/personalize';
import { DS03_SLOT_META } from '@/templates/modern-editorial/photoSlots';

export type PhotoSlotGroup = 'cover' | 'couple' | 'events' | 'album' | 'closing' | 'qr';

export interface PhotoSlot {
  id: string;
  group: PhotoSlotGroup;
  groupLabel: string;
  label: string;
  locationHint: string;
  url: string;
  defaultUrl?: string;
  aspectClass?: string;
  removable?: boolean;
  albumIndex?: number;
  ds03NodeId?: string;
}

export const MAX_DYNAMIC_ALBUM_PHOTOS = 12;

/**
 * Checks whether the current template supports adding/removing/reordering album photos dynamically.
 */
export function supportsDynamicAlbum(schema: PageSchema): boolean {
  if (isEditorialSchema(schema)) return false;
  return schema.blocks.some(
    (block) => (block.type === 'GALLERY' || block.type === 'SONG_HY_GREEN') && !block.isHidden
  );
}

/**
 * Extracts all real user-editable image slots on the current template in top-to-bottom order.
 */
export function getTemplatePhotoSlots(
  schema: PageSchema,
  formData: Record<string, string>,
  defaults: Record<string, string>
): PhotoSlot[] {
  if (isEditorialSchema(schema)) {
    const ds03Block = schema.blocks.find((block) => block.type === DS03_BLOCK);
    if (ds03Block?.isHidden) return [];
    const heroBlock = schema.blocks.find((block) => block.type === 'HERO');
    const overrides = readPhotoOverrides(
      ds03Block?.props.photoOverrides ?? heroBlock?.props.photoOverrides
    );
    const customCover =
      formData.coverImageUrl && formData.coverImageUrl !== defaults.coverImageUrl
        ? formData.coverImageUrl
        : undefined;

    return DS03_SLOT_META.map((meta) => {
      const url =
        overrides[meta.nodeId] ||
        (meta.nodeId === 'n6Z25RUiRX' && customCover ? customCover : meta.defaultUrl);
      return {
        id: `ds03:${meta.nodeId}`,
        ds03NodeId: meta.nodeId,
        group: meta.group,
        groupLabel: meta.groupLabel,
        label: meta.label,
        locationHint: meta.locationHint,
        url,
        defaultUrl: meta.defaultUrl,
        aspectClass: meta.aspectClass,
      };
    });
  }

  const slots: PhotoSlot[] = [];
  const songHyBlock = schema.blocks.find(
    (block) => block.type === 'SONG_HY_GREEN' && !block.isHidden
  );
  if (songHyBlock) {
    const data = (songHyBlock.props.data as Record<string, unknown>) || {};
    const heroPhoto =
      formData.coverImageUrl ||
      (typeof data.heroPhoto === 'string' ? data.heroPhoto : '') ||
      defaults.coverImageUrl ||
      '';
    slots.push({
      id: 'hero-cover',
      group: 'cover',
      groupLabel: 'Ảnh bìa & Đầu trang',
      label: 'Ảnh bìa khung cung',
      locationHint: 'Mục 1 · Đầu thiệp',
      url: heroPhoto,
      defaultUrl: defaults.coverImageUrl || '',
      aspectClass: 'aspect-[3/4]',
    });

    const gallery = Array.isArray(data.galleryImages)
      ? (data.galleryImages as Array<{ url?: string }>)
      : [];
    gallery.forEach((item, idx) => {
      if (!item?.url) return;
      slots.push({
        id: `gallery-${idx}`,
        group: 'album',
        groupLabel: 'Album ảnh cưới',
        label: `Ảnh album #${idx + 1}`,
        locationHint: `Album cưới · Vị trí ${idx + 1}`,
        url: item.url,
        aspectClass: 'aspect-[3/4]',
        removable: true,
        albumIndex: idx,
      });
    });

    return slots;
  }

  const isClassicEnvelope =
    schema.template?.id === 'classic-envelope' ||
    schema.template?.id === 'minimalism-dark-red' ||
    schema.template?.id === 'song-hy-green';
  const heroBlock = schema.blocks.find((block) => block.type === 'HERO' && !block.isHidden);
  const heroProps = heroBlock?.props as unknown as HeroBlockProps | undefined;
  if (heroBlock) {
    const heroLabel = isClassicEnvelope
      ? schema.theme.heroVariant === 'arch'
        ? 'Ảnh bìa khung cung'
        : 'Ảnh Polaroid đầu thiệp'
      : 'Ảnh bìa chính';
    slots.push({
      id: 'hero-cover',
      group: 'cover',
      groupLabel: 'Ảnh bìa & Đầu trang',
      label: heroLabel,
      locationHint: 'Mục 1 · Đầu thiệp',
      url: formData.coverImageUrl || heroProps?.coverImageUrl || defaults.coverImageUrl || '',
      defaultUrl: defaults.coverImageUrl || heroProps?.coverImageUrl || '',
      aspectClass: 'aspect-[3/4]',
    });
  }

  const coupleBlock = schema.blocks.find((block) => block.type === 'COUPLE' && !block.isHidden);
  const coupleProps = coupleBlock?.props as unknown as CoupleBlockProps | undefined;
  if (!isClassicEnvelope && coupleProps?.groom && coupleProps?.bride) {
    slots.push({
      id: 'couple-groom',
      group: 'couple',
      groupLabel: 'Chân dung Dâu & Rể',
      label: 'Chân dung Chú Rể',
      locationHint: 'Mục Chú Rể & Hộp quà',
      url: coupleProps.groom.photoUrl || '',
      aspectClass: 'aspect-square',
    });
    slots.push({
      id: 'couple-bride',
      group: 'couple',
      groupLabel: 'Chân dung Dâu & Rể',
      label: 'Chân dung Cô Dâu',
      locationHint: 'Mục Cô Dâu & Hộp quà',
      url: coupleProps.bride.photoUrl || '',
      aspectClass: 'aspect-square',
    });
  }

  const eventsBlock = schema.blocks.find((block) => block.type === 'EVENTS' && !block.isHidden);
  const eventsProps = eventsBlock?.props as unknown as EventsBlockProps | undefined;
  if (!isClassicEnvelope && eventsProps) {
    (eventsProps.groomEvents || []).forEach((ev, index) => {
      if (!ev.illustrationUrl) return;
      slots.push({
        id: `event-groom-${index}`,
        group: 'events',
        groupLabel: 'Ảnh Sự kiện cưới',
        label: ev.title || `Sự kiện Nhà Trai #${index + 1}`,
        locationHint: 'Mục Sự kiện · Tab Nhà Trai',
        url: ev.illustrationUrl,
        aspectClass: 'aspect-square',
      });
    });
    (eventsProps.brideEvents || []).forEach((ev, index) => {
      if (!ev.illustrationUrl) return;
      slots.push({
        id: `event-bride-${index}`,
        group: 'events',
        groupLabel: 'Ảnh Sự kiện cưới',
        label: ev.title || `Sự kiện Nhà Gái #${index + 1}`,
        locationHint: 'Mục Sự kiện · Tab Nhà Gái',
        url: ev.illustrationUrl,
        aspectClass: 'aspect-square',
      });
    });
  }

  const galleryBlock = schema.blocks.find((block) => block.type === 'GALLERY' && !block.isHidden);
  const galleryProps = galleryBlock?.props as unknown as GalleryBlockProps | undefined;
  if (galleryProps && Array.isArray(galleryProps.images)) {
    galleryProps.images.forEach((imgUrl, idx) => {
      slots.push({
        id: `gallery-${idx}`,
        group: 'album',
        groupLabel: 'Album ảnh cưới',
        label: `Ảnh album #${idx + 1}`,
        locationHint: `Album cưới · Vị trí ${idx + 1}`,
        url: imgUrl,
        aspectClass: 'aspect-[3/4]',
        removable: true,
        albumIndex: idx,
      });
    });
  }

  const thankYouBlock = schema.blocks.find((block) => block.type === 'THANKYOU' && !block.isHidden);
  const thankYouProps = thankYouBlock?.props as unknown as ThankYouBlockProps | undefined;
  if (!isClassicEnvelope && thankYouProps?.imageUrl) {
    slots.push({
      id: 'thankyou-bg',
      group: 'closing',
      groupLabel: 'Ảnh Cuối trang',
      label: 'Ảnh nền Lời cảm ơn',
      locationHint: 'Cuối thiệp · Thank You',
      url: thankYouProps.imageUrl,
      aspectClass: 'aspect-[3/4]',
    });
  }

  const giftBlock = schema.blocks.find((block) => block.type === 'GIFTBOX' && !block.isHidden);
  const giftProps = giftBlock?.props as unknown as GiftBoxBlockProps | undefined;
  if (giftProps?.groomAccount?.qrCodeUrl) {
    slots.push({
      id: 'qr-groom',
      group: 'qr',
      groupLabel: 'Mã QR Mừng cưới',
      label: 'Mã QR Chú Rể',
      locationHint: 'Hộp mừng cưới',
      url: giftProps.groomAccount.qrCodeUrl,
      aspectClass: 'aspect-square',
    });
  }
  if (giftProps?.brideAccount?.qrCodeUrl) {
    slots.push({
      id: 'qr-bride',
      group: 'qr',
      groupLabel: 'Mã QR Mừng cưới',
      label: 'Mã QR Cô Dâu',
      locationHint: 'Hộp mừng cưới',
      url: giftProps.brideAccount.qrCodeUrl,
      aspectClass: 'aspect-square',
    });
  }

  return slots;
}

/**
 * Applies a photo replacement to the exact schema block or form field matching `slotId`.
 */
export function applyPhotoSlotUpdate(
  schema: PageSchema,
  formData: Record<string, string>,
  defaults: Record<string, string>,
  slotId: string,
  nextUrl: string
): { schema: PageSchema; formData: Record<string, string> } {
  if (slotId === 'hero-cover') {
    return {
      schema,
      formData: { ...formData, coverImageUrl: nextUrl || defaults.coverImageUrl || '' },
    };
  }

  if (slotId.startsWith('ds03:')) {
    const nodeId = slotId.slice(5);
    const meta = DS03_SLOT_META.find((item) => item.nodeId === nodeId);
    const shouldClear = !nextUrl || nextUrl === meta?.defaultUrl;
    const effectiveUrl = shouldClear ? meta?.defaultUrl || '' : nextUrl;
    const storyNodeIds = ['TMZbNDGpg-', 'qw9cETBd6x', '3HgqNhP-oU'];
    const albumNodeIds = ['PmyZXEqFRE', '0RJwUg66AD', 'RKjPkevSoA', 'djYrsFtjW8', '4-p8a3D3rQ'];
    const hasLegacyBlock = schema.blocks.some((block) => block.type === DS03_BLOCK);

    const updatedBlocks = schema.blocks.map((block) => {
      if (block.type === DS03_BLOCK || (!hasLegacyBlock && block.type === 'HERO')) {
        const current = readPhotoOverrides(block.props.photoOverrides);
        const nextOverrides = { ...current };
        if (shouldClear) {
          delete nextOverrides[nodeId];
        } else {
          nextOverrides[nodeId] = nextUrl;
        }
        return {
          ...block,
          props: {
            ...block.props,
            ...(block.type === 'HERO' && nodeId === 'n6Z25RUiRX'
              ? { coverImageUrl: effectiveUrl }
              : {}),
            photoOverrides: nextOverrides,
          },
        };
      }
      if (!hasLegacyBlock && block.type === 'COUPLE' && (nodeId === 'lovG9hBAc1' || nodeId === 'rQsmEdD5eM')) {
        const role = nodeId === 'lovG9hBAc1' ? 'groom' : 'bride';
        const currentRole = (block.props[role] as Record<string, unknown>) || {};
        return {
          ...block,
          props: { ...block.props, [role]: { ...currentRole, photoUrl: effectiveUrl } },
        };
      }
      if (!hasLegacyBlock && block.type === 'GALLERY') {
        const storyIdx = block.props.sectionId === 'fFDaX7WHAU' ? storyNodeIds.indexOf(nodeId) : -1;
        const albumIdx = block.props.sectionId === 'Non88UDtG_' ? albumNodeIds.indexOf(nodeId) : -1;
        const targetIdx = storyIdx !== -1 ? storyIdx : albumIdx;
        if (targetIdx !== -1 && Array.isArray(block.props.images)) {
          const nextImages = [...(block.props.images as string[])];
          nextImages[targetIdx] = effectiveUrl;
          return { ...block, props: { ...block.props, images: nextImages } };
        }
      }
      if (!hasLegacyBlock && block.type === 'THANKYOU' && nodeId === 'kIaZgnQXf1') {
        return { ...block, props: { ...block.props, imageUrl: effectiveUrl } };
      }
      return block;
    });

    const nextFormData =
      nodeId === 'n6Z25RUiRX'
        ? {
            ...formData,
            coverImageUrl: shouldClear ? defaults.coverImageUrl || '' : nextUrl,
          }
        : formData;

    return {
      schema: { ...schema, blocks: updatedBlocks },
      formData: nextFormData,
    };
  }

  if (slotId === 'couple-groom' || slotId === 'couple-bride') {
    const role = slotId === 'couple-groom' ? 'groom' : 'bride';
    const giftField = role === 'groom' ? 'groomPhotoUrl' : 'bridePhotoUrl';
    const updatedBlocks = schema.blocks.map((block) => {
      if (block.type === 'COUPLE') {
        const props = block.props as Record<string, unknown>;
        const target = (props[role] as Record<string, unknown>) || {};
        return { ...block, props: { ...props, [role]: { ...target, photoUrl: nextUrl } } };
      }
      if (block.type === 'GIFTBOX') {
        return { ...block, props: { ...block.props, [giftField]: nextUrl } };
      }
      return block;
    });
    return { schema: { ...schema, blocks: updatedBlocks }, formData };
  }

  if (slotId.startsWith('event-groom-') || slotId.startsWith('event-bride-')) {
    const isGroom = slotId.startsWith('event-groom-');
    const targetIndex = Number(slotId.replace(isGroom ? 'event-groom-' : 'event-bride-', ''));
    const listKey = isGroom ? 'groomEvents' : 'brideEvents';
    const updatedBlocks = schema.blocks.map((block) => {
      if (block.type !== 'EVENTS') return block;
      const list = Array.isArray(block.props[listKey])
        ? [...(block.props[listKey] as Array<Record<string, unknown>>)]
        : [];
      if (!list[targetIndex]) return block;
      list[targetIndex] = { ...list[targetIndex], illustrationUrl: nextUrl };
      return { ...block, props: { ...block.props, [listKey]: list } };
    });
    return { schema: { ...schema, blocks: updatedBlocks }, formData };
  }

  if (slotId.startsWith('gallery-')) {
    const targetIndex = Number(slotId.replace('gallery-', ''));
    const updatedBlocks = schema.blocks.map((block) => {
      if (block.type === 'GALLERY') {
        const images = Array.isArray(block.props.images) ? [...(block.props.images as string[])] : [];
        if (targetIndex < 0 || targetIndex >= images.length) return block;
        images[targetIndex] = nextUrl;
        return { ...block, props: { ...block.props, images } };
      }
      if (block.type === 'SONG_HY_GREEN') {
        const data = (block.props.data as Record<string, unknown>) || {};
        const list = Array.isArray(data.galleryImages)
          ? [...(data.galleryImages as Array<{ url: string; position?: { x: number; y: number } }>)]
          : [];
        if (targetIndex < 0 || targetIndex >= list.length) return block;
        list[targetIndex] = { ...list[targetIndex], url: nextUrl };
        return { ...block, props: { ...block.props, data: { ...data, galleryImages: list } } };
      }
      return block;
    });
    return { schema: { ...schema, blocks: updatedBlocks }, formData };
  }

  if (slotId === 'thankyou-bg') {
    const updatedBlocks = schema.blocks.map((block) =>
      block.type === 'THANKYOU'
        ? { ...block, props: { ...block.props, imageUrl: nextUrl } }
        : block
    );
    return { schema: { ...schema, blocks: updatedBlocks }, formData };
  }

  if (slotId === 'qr-groom' || slotId === 'qr-bride') {
    const accountKey = slotId === 'qr-groom' ? 'groomAccount' : 'brideAccount';
    const updatedBlocks = schema.blocks.map((block) => {
      if (block.type !== 'GIFTBOX') return block;
      const account = (block.props[accountKey] as Record<string, unknown>) || {};
      return {
        ...block,
        props: {
          ...block.props,
          [accountKey]: { ...account, qrCodeUrl: nextUrl },
        },
      };
    });
    return { schema: { ...schema, blocks: updatedBlocks }, formData };
  }

  return { schema, formData };
}

function updateDynamicAlbum(
  schema: PageSchema,
  updater: (urls: string[]) => string[]
): PageSchema {
  const updatedBlocks = schema.blocks.map((block) => {
    if (block.type === 'GALLERY') {
      const current = Array.isArray(block.props.images) ? (block.props.images as string[]) : [];
      return {
        ...block,
        props: { ...block.props, images: updater(current).slice(0, MAX_DYNAMIC_ALBUM_PHOTOS) },
      };
    }
    if (block.type === 'SONG_HY_GREEN') {
      const data = (block.props.data as Record<string, unknown>) || {};
      const existing = Array.isArray(data.galleryImages)
        ? (data.galleryImages as Array<{ url: string; position?: { x: number; y: number } }>)
        : [];
      const nextUrls = updater(existing.map((item) => item.url)).slice(0, MAX_DYNAMIC_ALBUM_PHOTOS);
      return {
        ...block,
        props: {
          ...block.props,
          data: {
            ...data,
            galleryImages: nextUrls.map((url, idx) => ({
              url,
              position: existing[idx]?.position || { x: 0.5, y: 0.5 },
            })),
          },
        },
      };
    }
    return block;
  });

  return { ...schema, blocks: updatedBlocks };
}

export function addAlbumPhotos(schema: PageSchema, newUrls: string[]): PageSchema {
  return updateDynamicAlbum(schema, (urls) => [...urls, ...newUrls]);
}

export function removeAlbumPhoto(schema: PageSchema, index: number): PageSchema {
  return updateDynamicAlbum(schema, (urls) => urls.filter((_, idx) => idx !== index));
}

export function moveAlbumPhoto(schema: PageSchema, index: number, delta: number): PageSchema {
  return updateDynamicAlbum(schema, (urls) => {
    const target = index + delta;
    if (target < 0 || target >= urls.length) return urls;
    const next = [...urls];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
}
