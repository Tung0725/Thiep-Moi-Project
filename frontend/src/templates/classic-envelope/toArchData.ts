import {
  CoupleBlockProps,
  EventsBlockProps,
  GalleryBlockProps,
  GiftBoxBlockProps,
  HeroBlockProps,
  PageSchema,
  ThankYouBlockProps,
} from '@/types/schema';

function bankMeta(bankName: string): { bankBin: string; bankCode: string; bankLogo: string } {
  const lower = bankName.toLowerCase();
  if (lower.includes('vietcombank') || lower.includes('vcb')) {
    return { bankBin: '970436', bankCode: 'VCB', bankLogo: 'https://api.vietqr.io/img/VCB.png' };
  }
  if (lower.includes('bidv')) {
    return { bankBin: '970418', bankCode: 'BIDV', bankLogo: 'https://api.vietqr.io/img/BIDV.png' };
  }
  if (lower.includes('techcombank') || lower.includes('tcb')) {
    return { bankBin: '970407', bankCode: 'TCB', bankLogo: 'https://api.vietqr.io/img/TCB.png' };
  }
  if (lower.includes('mb')) {
    return { bankBin: '970422', bankCode: 'MB', bankLogo: 'https://api.vietqr.io/img/MB.png' };
  }
  return { bankBin: '', bankCode: '', bankLogo: '' };
}

function shortName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  return parts.length > 2 ? parts.slice(-2).join(' ') : full.trim();
}

/**
 * Adapts a unified 7-block `classic-envelope` PageSchema into the prop contract
 * expected by the `arch` layout runtime.
 * If a legacy `SONG_HY_GREEN` block with `props.data` is present, returns it as-is.
 */
export function schemaToArchData(schema: PageSchema): Record<string, unknown> {
  const legacyBlock = schema.blocks.find(
    (block) => block.type === 'SONG_HY_GREEN' && block.props?.data
  );
  if (legacyBlock) {
    return legacyBlock.props.data as Record<string, unknown>;
  }

  const heroBlock = schema.blocks.find((block) => block.type === 'HERO');
  const coupleBlock = schema.blocks.find((block) => block.type === 'COUPLE');
  const galleryBlock = schema.blocks.find((block) => block.type === 'GALLERY');
  const wishesBlock = schema.blocks.find((block) => block.type === 'WISHES');
  const giftBlock = schema.blocks.find((block) => block.type === 'GIFTBOX');
  const thankYouBlock = schema.blocks.find((block) => block.type === 'THANKYOU');

  const eventBlocks = schema.blocks.filter((block) => block.type === 'EVENTS');
  const ceremonyBlock = eventBlocks.find((block) =>
    (block.props as unknown as EventsBlockProps | undefined)?.groomEvents?.some(
      (event) => event.id === 'ceremony'
    )
  );
  const banquetBlock =
    eventBlocks.find((block) =>
      (block.props as unknown as EventsBlockProps | undefined)?.groomEvents?.some(
        (event) => event.id === 'banquet'
      )
    ) || eventBlocks[eventBlocks.length - 1];

  const hero = heroBlock?.props as unknown as HeroBlockProps | undefined;
  const couple = coupleBlock?.props as unknown as CoupleBlockProps | undefined;
  const ceremonyProps = ceremonyBlock?.props as unknown as EventsBlockProps | undefined;
  const banquetProps = banquetBlock?.props as unknown as EventsBlockProps | undefined;
  const gallery = galleryBlock?.props as unknown as GalleryBlockProps | undefined;
  const wishes = wishesBlock?.props as unknown as { allowRsvp?: boolean } | undefined;
  const giftBox = giftBlock?.props as unknown as GiftBoxBlockProps | undefined;
  const thankYou = thankYouBlock?.props as unknown as ThankYouBlockProps | undefined;

  const ceremonyEvent = ceremonyProps?.groomEvents?.[0];
  const banquetEvent = banquetProps?.groomEvents?.[0];
  const groomFullName = couple?.groom?.name || hero?.groomName || 'Chú Rể';
  const brideFullName = couple?.bride?.name || hero?.brideName || 'Cô Dâu';
  const groomShortName = hero?.groomName || couple?.groom?.displayName || shortName(groomFullName);
  const brideShortName = hero?.brideName || couple?.bride?.displayName || shortName(brideFullName);

  const eventDate = banquetEvent?.dateText || hero?.eventDate || couple?.weddingDateText || '';
  const banquetTime = banquetEvent?.timeText || '18:00';
  const venueAddress = banquetEvent?.address || banquetEvent?.locationName || '';
  const venueName = banquetEvent?.locationName || venueAddress;

  const giftMethods = [
    giftBox?.groomAccount
      ? {
          id: 'groom_vietqr',
          for: 'groom',
          type: 'vietqr',
          ...bankMeta(giftBox.groomAccount.bankName),
          bankName: giftBox.groomAccount.bankName,
          accountName: giftBox.groomAccount.ownerName,
          accountNumber: giftBox.groomAccount.accountNumber,
        }
      : null,
    giftBox?.brideAccount
      ? {
          id: 'bride_vietqr',
          for: 'bride',
          type: 'vietqr',
          ...bankMeta(giftBox.brideAccount.bankName),
          bankName: giftBox.brideAccount.bankName,
          accountName: giftBox.brideAccount.ownerName,
          accountNumber: giftBox.brideAccount.accountNumber,
        }
      : null,
  ].filter(Boolean);

  return {
    templateId: 'song_hy_green',
    activeLocales: ['vi'],
    showPhotos: Boolean(heroBlock && !heroBlock.isHidden),
    showFamilyInfo: Boolean(coupleBlock && !coupleBlock.isHidden),
    hideAnnouncement: Boolean(coupleBlock?.isHidden),
    showCeremony: Boolean(ceremonyBlock && !ceremonyBlock.isHidden),
    showGallery: Boolean(galleryBlock && !galleryBlock.isHidden),
    showParty: Boolean(banquetBlock && !banquetBlock.isHidden),
    showDresscode: Boolean(
      banquetBlock && !banquetBlock.isHidden && banquetProps?.dressCodeColors?.length
    ),
    showTimeline: Boolean(
      banquetBlock && !banquetBlock.isHidden && banquetProps?.timeline?.length
    ),
    showGuestbook: Boolean(wishesBlock && !wishesBlock.isHidden),
    showRsvp: wishes?.allowRsvp !== false,
    showBank: Boolean(giftBlock && !giftBlock.isHidden),
    showThankYou: Boolean(thankYouBlock && !thankYouBlock.isHidden),

    heroPhoto: hero?.coverImageUrl || '',
    date: eventDate,
    time: banquetTime,
    banquetTime,

    groomFullName,
    brideFullName,
    groomShortName,
    brideShortName,
    groomFather: couple?.groom?.fatherName || '',
    groomMother: couple?.groom?.motherName || '',
    brideFather: couple?.bride?.fatherName || '',
    brideMother: couple?.bride?.motherName || '',
    groomAddress: { vi: couple?.groom?.address || '' },
    brideAddress: couple?.bride?.address || '',
    groomLabel: { vi: couple?.groom?.titleLabel || 'Trưởng Nam' },
    brideLabel: { vi: couple?.bride?.titleLabel || 'Út Nữ' },
    announcementLine1: couple?.announcementLine1 || 'TRÂN TRỌNG BÁO TIN',
    announcementLine2: couple?.announcementLine2 || 'LỄ THÀNH HÔN CỦA CON CHÚNG TÔI',

    ceremonies: ceremonyEvent
      ? [
          {
            id: ceremonyEvent.id || 'ceremony',
            date: ceremonyEvent.dateText || eventDate,
            time: ceremonyEvent.timeText || '09:00',
            header: {
              vi: [ceremonyEvent.title, ceremonyEvent.locationName].filter(Boolean).join('\n'),
            },
          },
        ]
      : [],

    galleryLayout: 'cards',
    galleryImages: (gallery?.images || []).map((url) => ({
      url,
      position: { x: 0.5, y: 0.5 },
    })),

    address: { vi: venueAddress },
    mapAddress: venueAddress,
    mapPlaceName: venueName,
    mapDisplayMode: 'address',

    dresscodeColors: banquetProps?.dressCodeColors || [],
    timelineEvents: (banquetProps?.timeline || []).map((item, idx) => ({
      id: `tl-${idx}`,
      time: item.time,
      label: { vi: item.label },
    })),

    giftDisplayMode: 'gift_box',
    giftMethods,
    groomAccountNumber: giftBox?.groomAccount?.accountNumber || '',
    brideAccountNumber: giftBox?.brideAccount?.accountNumber || '',
    groomAccountName: giftBox?.groomAccount?.ownerName || '',
    brideAccountName: giftBox?.brideAccount?.ownerName || '',
    groomBankName: giftBox?.groomAccount?.bankName || '',
    brideBankName: giftBox?.brideAccount?.bankName || '',
    ...bankMeta(giftBox?.groomAccount?.bankName || ''),
    ...(giftBox?.brideAccount
      ? {
          brideBankBin: bankMeta(giftBox.brideAccount.bankName).bankBin,
          brideBankCode: bankMeta(giftBox.brideAccount.bankName).bankCode,
          brideBankLogo: bankMeta(giftBox.brideAccount.bankName).bankLogo,
        }
      : {}),

    thankYouNote: thankYou?.message ? { vi: thankYou.message } : undefined,
    envelopeInviteMessage: {
      vi: schema.theme.decorations?.inviteMessage || 'đến dự buổi tiệc chung vui cùng gia đình',
    },
  };
}
