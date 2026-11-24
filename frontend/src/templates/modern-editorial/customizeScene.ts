import {
  EditorialScene,
  SceneCustomizeSettings,
  SceneDocument,
  SceneNode,
  SceneNodeProps,
  SceneTemplateConfig,
} from './types';

const SCRIPT_FONTS =
  /^(?:UVNHoaTay1\.TTF|GreatVibes-Regular\.ttf|Fz-Photograph\.ttf|CaliforniaPalmsScript-Regular\.otf|AnalogueRed-55Regular\.ttf)$/i;
const COLOR_KEYS = [
  'color',
  'backgroundColor',
  'borderColor',
  'fill',
  'stroke',
  'boxShadow',
  'iconColor',
  'buttonBackground',
  'wishNameFontColor',
] as const;
const COVER_NODES = new Set(['n6Z25RUiRX']);
const GIFT_BUTTON_NODES = new Set([
  '9_Ltd-qpy5',
  '9Z_86Pq8W8',
  '6RnLobm4Zx',
  '79i2dwTWrn',
  'VS7nCq7MfZ',
  '3Ikdx-BU0X',
]);

const MOBILE_DATE_FIXES: Record<string, Partial<SceneNodeProps>> = {
  ulpJ0a_cMP: { top: '584px' },
  ut4vQ3DBHV: { top: '615px' },
  Z3LDtLX5ns: { top: '589px' },
  RG9_1q5_VK: { top: '589px', left: '252px', width: '48px', textAlign: 'right' },
  '-4MyMrpxv1': { top: '589px', left: '304px', width: '52px', textAlign: 'left' },
};

function validHex(value?: string): string | undefined {
  return typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value.trim()) ? value.trim() : undefined;
}

function particleDataUri(type: 'HEARTS' | 'PETALS' | 'SNOW', color: string): string {
  const svg =
    type === 'HEARTS'
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${color}" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>`
      : type === 'SNOW'
        ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="#ffffff" fill-opacity="0.88"/></svg>`
        : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="${color}" d="M12 2C9 6 7 10 9 15c1.5 3.5 4.5 5 3 7 3-1 6-4 6-9 0-4.5-2.5-8-6-11z"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function replaceThemeColors(
  value: string,
  primaryOverride?: string,
  accentOverride?: string,
  bgOverride?: string
): string {
  let out = value;
  if (primaryOverride) out = out.replace(/#5f6459/gi, primaryOverride);
  if (accentOverride) out = out.replace(/#928362/gi, accentOverride);
  if (bgOverride) out = out.replace(/#(?:fcf9fe|f9f6fa|f8f9fa)/gi, bgOverride);
  return out;
}

export function customizeScene(
  scene: EditorialScene,
  settings: SceneCustomizeSettings
): {
  template: SceneTemplateConfig;
  desktop: SceneDocument;
  mobile: SceneDocument;
} {
  const values = settings.values ?? {};
  const rawPrimary = validHex(settings.theme.primaryColor);
  const primaryOverride =
    rawPrimary && !['#5f6459', '#424e32'].includes(rawPrimary.toLowerCase()) ? rawPrimary : undefined;
  const rawAccent = validHex(settings.theme.accentColor);
  const accentOverride = rawAccent && rawAccent.toLowerCase() !== '#928362' ? rawAccent : undefined;
  const rawBg = validHex(settings.theme.backgroundColor);
  const bgOverride =
    rawBg && !['#fcf9fe', '#f9f6fa'].includes(rawBg.toLowerCase()) ? rawBg : undefined;
  const headingFontOverride =
    settings.theme.headingFont && settings.theme.headingFont !== 'inherit'
      ? settings.theme.headingFont
      : undefined;

  const address = values.venueAddress || values.venueName;
  const venue = values.venueName;
  const calendarDate = /^\d{4}-\d{2}-\d{2}$/.test(values.eventDate ?? '') ? values.eventDate! : '';
  const calendarTime = /^\d{2}:\d{2}$/.test(values.eventTime ?? '') ? values.eventTime! : '';
  const parsedDate = calendarDate ? new Date(`${calendarDate}T12:00:00Z`) : null;
  const hasDate = Boolean(parsedDate && !Number.isNaN(parsedDate.getTime()));
  const weekdayLabel =
    hasDate && parsedDate
      ? new Intl.DateTimeFormat('vi-VN', { weekday: 'long', timeZone: 'UTC' }).format(parsedDate)
      : '';
  const [year, month, day] = calendarDate ? calendarDate.split('-') : ['', '', ''];
  const mapsUrl = address
    ? `https://www.google.com/maps/search/?${new URLSearchParams({ api: '1', query: address })}`
    : '';
  const weddingTitle = `Lễ cưới của ${values.groomName || 'Minh Anh'} & ${values.brideName || 'Yến Nhi'}`;

  const fieldTexts: Record<string, string | undefined> = {
    groom: values.groomName,
    bride: values.brideName,
    groomLocation: address,
    brideLocation: address,
    groomSolarHour: calendarTime ? calendarTime.replace(':', ' giờ ') : undefined,
    groomSolarDayOfWeek: weekdayLabel || undefined,
    groomSolarDay: hasDate ? day : undefined,
    groomSolarMonth: hasDate ? `${month} -` : undefined,
    groomSolarYear: hasDate ? year : undefined,
  };

  const recolorString = (val: string) =>
    replaceThemeColors(val, primaryOverride, accentOverride, bgOverride);

  const transformNode = (node: SceneNode, isMobileDoc: boolean): SceneNode => {
    const props: SceneNodeProps = {
      ...node.props,
      ...(isMobileDoc ? MOBILE_DATE_FIXES[node.id] : undefined),
    };

    if (primaryOverride || accentOverride || bgOverride) {
      for (const key of COLOR_KEYS) {
        const current = props[key];
        if (typeof current === 'string') {
          props[key] = recolorString(current);
        }
      }
      if (props.textComponent && typeof props.textComponent.color === 'string') {
        props.textComponent = {
          ...props.textComponent,
          color: recolorString(props.textComponent.color),
        };
      }
      if (props.iconComponent && typeof props.iconComponent.iconColor === 'string') {
        props.iconComponent = {
          ...props.iconComponent,
          iconColor: recolorString(props.iconComponent.iconColor),
        };
      }
    }

    if (
      headingFontOverride &&
      node.type === 'Text' &&
      Number(props.fontSize) >= 24 &&
      typeof props.fontFamily === 'string' &&
      SCRIPT_FONTS.test(props.fontFamily)
    ) {
      props.fontFamily = headingFontOverride;
    }

    if (typeof settings.textOverrides[node.id] === 'string') {
      props.text = settings.textOverrides[node.id];
    }

    const field = props.initField;
    if (field && typeof fieldTexts[field] === 'string') {
      props.text = fieldTexts[field];
    }

    if (typeof props.text === 'string' && /DateTimeFormat|^events\.\d+\.dateText$/.test(field ?? '')) {
      let nextText = props.text;
      if (calendarTime) nextText = nextText.replace(/\b\d{1,2}:\d{2}\b/, calendarTime);
      if (hasDate) {
        nextText = nextText
          .replace(/\b\d{1,2}\/\d{1,2}\/\d{4}\b/, `${day}/${month}/${year}`)
          .replace(/chủ nhật|thứ [^,\s]+/i, weekdayLabel);
      }
      props.text = nextText;
    }

    if (hasDate && node.id === '3JBo-7S7iQ') {
      props.text = '';
    }

    if (venue && (/^events\.\d+\.venueLabel$/.test(field ?? '') || node.id === 'USAA5ZR3nX')) {
      props.text = node.id === 'USAA5ZR3nX' ? venue : `Tại: ${venue}`;
    }

    if (address && /^events\.\d+\.location$/.test(field ?? '')) {
      props.text = address;
    }

    const overrideUrl =
      typeof settings.photoOverrides[node.id] === 'string' && settings.photoOverrides[node.id]
        ? settings.photoOverrides[node.id]
        : values.coverImageUrl && COVER_NODES.has(node.id)
          ? values.coverImageUrl
          : undefined;
    if (overrideUrl) {
      props.url = overrideUrl;
      // Replaced user photos must fill cleanly instead of keeping the original DS03 cutout crop box.
      props.cropData = undefined;
    }

    if (address && node.id === 'rS1jC6Gqj9') {
      const parameters = new URLSearchParams({ q: address, output: 'embed' });
      props.mapEmbedUrl = `https://www.google.com/maps?${parameters}`;
    }

    if (
      settings.publicCard &&
      (GIFT_BUTTON_NODES.has(node.id) ||
        (/BankInfo\.qrCodeImage$/.test(field ?? '') && !settings.photoOverrides[node.id]))
    ) {
      props.hidden = true;
    }

    if (Array.isArray(props.events)) {
      props.events = props.events.map((event) => {
        const nextEvent = { ...event };
        if (nextEvent.eventType === 'add-to-calendar') {
          if (hasDate) nextEvent.calendarDate = calendarDate;
          if (calendarTime) nextEvent.calendarStartTime = calendarTime;
          if (venue || address) nextEvent.calendarLocation = [venue, address].filter(Boolean).join(', ');
          if (values.groomName || values.brideName) nextEvent.calendarTitle = weddingTitle;
        }
        if (
          mapsUrl &&
          nextEvent.eventType === 'link' &&
          typeof nextEvent.url === 'string' &&
          /https:\/\/(?:maps\.app\.goo\.gl|www\.google\.com\/maps)/.test(nextEvent.url)
        ) {
          nextEvent.url = mapsUrl;
        }
        if (overrideUrl && nextEvent.eventType === 'open-lightbox') {
          nextEvent.lightboxImageUrl = overrideUrl;
        }
        return nextEvent;
      });
    }

    return {
      ...node,
      props,
      children: node.children?.map((child) => transformNode(child, isMobileDoc)),
    };
  };

  const baseTemplate = scene.template;
  const nextTemplate: SceneTemplateConfig = {
    ...baseTemplate,
    pageSettings: {
      ...baseTemplate.pageSettings,
      ...(bgOverride ? { mobilePageBackgroundColor: bgOverride } : {}),
    },
    audioSettings:
      settings.musicUrl === ''
        ? undefined
        : {
            ...baseTemplate.audioSettings,
            ...(typeof settings.musicUrl === 'string' ? { audioUrl: settings.musicUrl } : {}),
          },
    effects:
      settings.fallingType &&
      (settings.fallingType === 'HEARTS' ||
        settings.fallingType === 'PETALS' ||
        settings.fallingType === 'SNOW') &&
      baseTemplate.effects
        ? (() => {
            const color =
              settings.fallingType === 'HEARTS'
                ? validHex(settings.theme.primaryColor) || '#e11d48'
                : settings.fallingType === 'SNOW'
                  ? '#ffffff'
                  : '#f9a8d4';
            const url = particleDataUri(settings.fallingType, color);
            return {
              ...baseTemplate.effects,
              imageUrl: url,
              imageUrls: [{ url, color }],
            };
          })()
        : baseTemplate.effects,
  };

  return {
    template: nextTemplate,
    desktop: { sections: scene.desktop.sections.map((node) => transformNode(node, false)) },
    mobile: { sections: (scene.mobile?.sections || scene.desktop.sections).map((node) => transformNode(node, true)) },
  };
}
