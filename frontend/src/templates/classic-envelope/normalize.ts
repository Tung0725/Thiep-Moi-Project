import {
  BankAccountInfo,
  CoupleBlockProps,
  EventsBlockProps,
  PageSchema,
  UIBlock,
} from '@/types/schema';

interface LegacySongHyData {
  date?: string;
  time?: string;
  banquetTime?: string;
  heroPhoto?: string;
  groomFullName?: string;
  brideFullName?: string;
  groomShortName?: string;
  brideShortName?: string;
  groomFather?: string;
  groomMother?: string;
  brideFather?: string;
  brideMother?: string;
  groomAddress?: string | { vi?: string };
  brideAddress?: string | { vi?: string };
  groomLabel?: string | { vi?: string };
  brideLabel?: string | { vi?: string };
  announcementLine1?: string;
  announcementLine2?: string;
  address?: string | { vi?: string };
  mapPlaceName?: string;
  ceremonies?: Array<{ id?: string; date?: string; time?: string; header?: string | { vi?: string } }>;
  galleryImages?: Array<{ url?: string }>;
  dresscodeColors?: string[];
  timelineEvents?: Array<{ time?: string; label?: string | { vi?: string } }>;
  giftMethods?: Array<{
    for?: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  }>;
  envelopeInviteMessage?: string | { vi?: string };
}

function readLocalized(value?: string | { vi?: string; en?: string }): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.vi || value.en || '';
}

function shortName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  return parts.length > 2 ? parts.slice(-2).join(' ') : full.trim();
}

/**
 * Normalizes legacy single-block `SONG_HY_GREEN` invitations saved in older DB rows
 * into the unified 7-block schema so Engine 1 renders old and new invitations identically.
 */
export function normalizeClassicSchema(schema: PageSchema): PageSchema {
  const legacyBlock = schema.blocks.find((block) => block.type === 'SONG_HY_GREEN');
  if (!legacyBlock || !legacyBlock.props?.data) {
    return schema;
  }

  const data = legacyBlock.props.data as LegacySongHyData;
  const groomFull = data.groomFullName || 'Chú Rể';
  const brideFull = data.brideFullName || 'Cô Dâu';
  const groomShort = data.groomShortName || shortName(groomFull);
  const brideShort = data.brideShortName || shortName(brideFull);
  const weddingDate = data.date || '';
  const banquetTime = data.banquetTime || data.time || '18:00';
  const venueAddress = readLocalized(data.address);
  const venueName = data.mapPlaceName || venueAddress.split(',')[0]?.trim() || 'Địa điểm tiệc cưới';
  const ceremony = data.ceremonies?.[0];
  const ceremonyHeader = readLocalized(ceremony?.header) || 'LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI';
  const ceremonyLines = ceremonyHeader.split('\n').map((s) => s.trim()).filter(Boolean);

  const groomGift = data.giftMethods?.find((m) => m.for === 'groom');
  const brideGift = data.giftMethods?.find((m) => m.for === 'bride');
  const toAccount = (
    method: NonNullable<LegacySongHyData['giftMethods']>[number] | undefined,
    label: string,
    qrCodeUrl: string
  ): BankAccountInfo | undefined => {
    if (!method?.accountNumber) return undefined;
    return {
      label,
      ownerName: method.accountName || '',
      bankName: method.bankName || '',
      accountNumber: method.accountNumber,
      qrCodeUrl,
    };
  };

  const blocks: UIBlock[] = [
    {
      id: 'hero-1',
      type: 'HERO',
      props: {
        title: 'SAVE THE DATE',
        groomName: groomShort,
        brideName: brideShort,
        eventDate: weddingDate,
        coverImageUrl: data.heroPhoto || '',
        variant: 'arch',
      },
    },
    {
      id: 'couple-1',
      type: 'COUPLE',
      props: {
        sectionTitle: 'THÔNG TIN LỄ CƯỚI',
        weddingDateText: weddingDate,
        announcementLine1: data.announcementLine1 || 'TRÂN TRỌNG BÁO TIN',
        announcementLine2: data.announcementLine2 || 'LỄ THÀNH HÔN CỦA CON CHÚNG TÔI',
        groom: {
          name: groomFull,
          displayName: groomShort,
          role: 'GROOM',
          titleLabel: readLocalized(data.groomLabel) || 'TRƯỞNG NAM',
          photoUrl: data.heroPhoto || '',
          fatherName: data.groomFather || '',
          motherName: data.groomMother || '',
          address: readLocalized(data.groomAddress),
        },
        bride: {
          name: brideFull,
          displayName: brideShort,
          role: 'BRIDE',
          titleLabel: readLocalized(data.brideLabel) || 'ÚT NỮ',
          photoUrl: data.heroPhoto || '',
          fatherName: data.brideFather || '',
          motherName: data.brideMother || '',
          address: readLocalized(data.brideAddress),
        },
      } satisfies CoupleBlockProps,
    },
    {
      id: 'ceremony-1',
      type: 'EVENTS',
      props: {
        title: 'LỄ THÀNH HÔN',
        groomEvents: [
          {
            id: 'ceremony',
            title: ceremonyLines[0] || 'LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI',
            dateText: ceremony?.date || weddingDate,
            timeText: ceremony?.time || '09:00',
            locationName: ceremonyLines[1] || 'TƯ GIA',
            address: readLocalized(data.groomAddress),
          },
        ],
        brideEvents: [],
      } satisfies EventsBlockProps,
    },
    {
      id: 'gallery-1',
      type: 'GALLERY',
      props: {
        title: 'ALBUM ẢNH',
        images: (data.galleryImages || [])
          .map((item) => item?.url)
          .filter((url): url is string => Boolean(url)),
      },
    },
    {
      id: 'banquet-1',
      type: 'EVENTS',
      props: {
        title: 'THÔNG TIN TIỆC CƯỚI',
        groomEvents: [
          {
            id: 'banquet',
            title: 'TIỆC CƯỚI SẼ DIỄN RA VÀO LÚC',
            dateText: weddingDate,
            timeText: banquetTime,
            locationName: venueName,
            address: venueAddress,
          },
        ],
        brideEvents: [],
        receptionTime: '17:30',
        showMapEmbed: true,
        dressCodeColors: data.dresscodeColors || [],
        timeline: (data.timelineEvents || []).map((item) => ({
          time: item.time || '',
          label: readLocalized(item.label),
        })),
      } satisfies EventsBlockProps,
    },
    {
      id: 'wishes-1',
      type: 'WISHES',
      props: {
        title: 'Sổ lưu bút & RSVP',
        subtitle: 'Gửi lời chúc phúc và xác nhận tham dự cùng chúng mình',
        allowRsvp: true,
      },
    },
    {
      id: 'giftbox-1',
      type: 'GIFTBOX',
      props: {
        title: 'Hộp Quà Mừng',
        groomAccount: toAccount(groomGift, 'Chú Rể', '/templates/song-hy-xanh/archive/images/qr-png_2.png'),
        brideAccount: toAccount(brideGift, 'Cô Dâu', '/templates/song-hy-xanh/archive/images/qr-png.png'),
      },
    },
    {
      id: 'thankyou-1',
      type: 'THANKYOU',
      props: {
        title: 'Trân trọng cảm ơn',
        message: 'Sự hiện diện của quý khách là niềm vinh hạnh lớn của gia đình chúng tôi.',
      },
    },
  ];

  return {
    ...schema,
    theme: {
      ...schema.theme,
      heroVariant: schema.theme.heroVariant || 'arch',
      accentColor: schema.theme.accentColor || '#c9a24a',
      decorations: {
        sealText: '囍',
        sealImageUrl: '/templates/song-hy-xanh/archive/images/chu-hy.webp',
        inviteMessage: readLocalized(data.envelopeInviteMessage) || 'Trân trọng kính mời',
        ...schema.theme.decorations,
      },
    },
    blocks,
  };
}
