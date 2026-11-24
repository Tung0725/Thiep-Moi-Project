import { CoupleBlockProps, EventsBlockProps, PageSchema } from '@/types/schema';
import { TemplateValues } from '../types';
import { normalizeClassicSchema } from './normalize';

function shortName(full: string): string {
  const parts = full.trim().split(/\s+/).filter(Boolean);
  return parts.length > 2 ? parts.slice(-2).join(' ') : full.trim();
}

function parseMinutes(time: string): number | undefined {
  if (!/^\d{1,2}:\d{2}$/.test(time)) return undefined;
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Applies user form values onto a classic-envelope PageSchema while keeping
 * theme colors, decorations, ceremony/banquet independence, and custom block ordering intact.
 */
export function personalize(
  rawSchema: PageSchema,
  values: TemplateValues,
  defaults: TemplateValues
): PageSchema {
  const schema = normalizeClassicSchema(rawSchema);
  const changedCouple =
    values.groomName !== defaults.groomName || values.brideName !== defaults.brideName;

  return {
    ...schema,
    blocks: schema.blocks.map((block) => {
      if (block.type === 'HERO') {
        return {
          ...block,
          props: {
            ...block.props,
            groomName: shortName(values.groomName || ''),
            brideName: shortName(values.brideName || ''),
            eventDate: values.eventDate,
            coverImageUrl: values.coverImageUrl || defaults.coverImageUrl,
          },
        };
      }

      if (block.type === 'COUPLE') {
        const props = block.props as unknown as CoupleBlockProps;
        return {
          ...block,
          props: {
            ...props,
            weddingDateText: values.eventDate,
            groom: {
              ...props.groom,
              name: values.groomName,
              displayName: shortName(values.groomName || ''),
              fatherName: values.groomFather ?? props.groom.fatherName,
              motherName: values.groomMother ?? props.groom.motherName,
            },
            bride: {
              ...props.bride,
              name: values.brideName,
              displayName: shortName(values.brideName || ''),
              fatherName: values.brideFather ?? props.bride.fatherName,
              motherName: values.brideMother ?? props.bride.motherName,
            },
          },
        };
      }

      if (block.type === 'EVENTS') {
        const props = block.props as unknown as EventsBlockProps;
        const banquet = props.groomEvents.find((event) => event.id === 'banquet');
        const before = parseMinutes(banquet?.timeText || '');
        const after = parseMinutes(values.eventTime || '');
        const shiftTime = (time: string) => {
          const original = parseMinutes(time);
          if (original === undefined || before === undefined || after === undefined) return time;
          const shifted = (((original + after - before) % 1440) + 1440) % 1440;
          return `${String(Math.floor(shifted / 60)).padStart(2, '0')}:${String(shifted % 60).padStart(2, '0')}`;
        };

        return {
          ...block,
          props: {
            ...props,
            receptionTime: props.receptionTime ? shiftTime(props.receptionTime) : props.receptionTime,
            timeline: props.timeline?.map((item) => ({ ...item, time: shiftTime(item.time) })),
            groomEvents: props.groomEvents.map((event) => {
              if (event.id === 'ceremony') {
                return {
                  ...event,
                  dateText: values.eventDate,
                  timeText: values.ceremonyTime || event.timeText,
                };
              }
              return {
                ...event,
                dateText: values.eventDate,
                timeText: values.eventTime,
                locationName: values.venueName,
                address: values.venueAddress,
              };
            }),
          },
        };
      }

      if (block.type === 'GIFTBOX' && changedCouple) {
        return {
          ...block,
          props: { ...block.props, groomAccount: undefined, brideAccount: undefined },
        };
      }

      return block;
    }),
  };
}
