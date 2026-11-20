import { PageSchema, CoupleBlockProps, EventsBlockProps } from '@/types/schema';
import { TemplateValues } from '../types';

/** Bind wedding data while preserving ceremony time, family addresses and template layout. */
export function personalize(schema: PageSchema, values: TemplateValues, defaults: TemplateValues): PageSchema {
  const short = (name: string) => name.trim().split(/\s+/).slice(-2).join(' ');
  return {
    ...schema,
    blocks: schema.blocks.map(block => {
      if (block.type === 'HERO') return { ...block, props: { ...block.props, groomName: short(values.groomName || ''), brideName: short(values.brideName || ''), eventDate: values.eventDate, coverImageUrl: values.coverImageUrl || defaults.coverImageUrl } };
      if (block.type === 'COUPLE') {
        const props = block.props as unknown as CoupleBlockProps;
        return { ...block, props: { ...props, weddingDateText: values.eventDate, groom: { ...props.groom, name: values.groomName, displayName: short(values.groomName || '') }, bride: { ...props.bride, name: values.brideName, displayName: short(values.brideName || '') } } };
      }
      if (block.type === 'EVENTS') {
        const props = block.props as unknown as EventsBlockProps;
        const banquet = props.groomEvents.find(event => event.id === 'banquet');
        const minutes = (time: string) => /^\d{1,2}:\d{2}$/.test(time) ? Number(time.split(':')[0]) * 60 + Number(time.split(':')[1]) : undefined;
        const before = minutes(banquet?.timeText || '');
        const after = minutes(values.eventTime || '');
        const shiftTime = (time: string) => {
          const original = minutes(time);
          if (original === undefined || before === undefined || after === undefined) return time;
          const shifted = ((original + after - before) % 1440 + 1440) % 1440;
          return `${String(Math.floor(shifted / 60)).padStart(2, '0')}:${String(shifted % 60).padStart(2, '0')}`;
        };
        return { ...block, props: { ...props, receptionTime: props.receptionTime ? shiftTime(props.receptionTime) : props.receptionTime, timeline: props.timeline?.map(item => ({ ...item, time: shiftTime(item.time) })), groomEvents: props.groomEvents.map(event => event.id === 'ceremony' ? { ...event, dateText: values.eventDate } : { ...event, dateText: values.eventDate, timeText: values.eventTime, locationName: values.venueName, address: values.venueAddress }) } };
      }
      if (block.type === 'GIFTBOX' && (values.groomName !== defaults.groomName || values.brideName !== defaults.brideName)) return { ...block, props: { ...block.props, groomAccount: undefined, brideAccount: undefined } };
      return block;
    }),
  };
}
