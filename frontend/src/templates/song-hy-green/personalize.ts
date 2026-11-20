import { PageSchema } from '@/types/schema';
import { TemplateValues } from '../types';

/** Personalizes original source props without changing its component structure or ceremony time. */
export function personalize(schema: PageSchema, values: TemplateValues, defaults: TemplateValues): PageSchema {
  const short = (name: string) => name.trim().split(/\s+/).slice(-2).join(' ');
  return { ...schema, blocks: schema.blocks.map(block => {
    if (block.type !== 'SONG_HY_GREEN') return block;
    const original = block.props.data as Record<string, unknown>;
    const changedCouple = values.groomName !== defaults.groomName || values.brideName !== defaults.brideName;
    const ceremonies = original.ceremonies as Record<string, unknown>[];
    const data = {
      ...original,
      groomFullName: values.groomName, brideFullName: values.brideName,
      groomShortName: short(values.groomName || ''), brideShortName: short(values.brideName || ''),
      groomFather: values.groomFather ?? original.groomFather, groomMother: values.groomMother ?? original.groomMother,
      brideFather: values.brideFather ?? original.brideFather, brideMother: values.brideMother ?? original.brideMother,
      date: values.eventDate, time: values.eventTime, banquetTime: values.eventTime,
      ceremonies: ceremonies.map(event => ({ ...event, date: values.eventDate, time: values.ceremonyTime || event.time })),
      address: { vi: values.venueAddress || values.venueName },
      heroPhoto: values.coverImageUrl || defaults.coverImageUrl,
      ...(values.venueAddress !== defaults.venueAddress || values.venueName !== defaults.venueName
        ? { mapDisplayMode: 'address', mapAddress: values.venueAddress || values.venueName, mapPlaceName: values.venueName, placeId: '', latitude: undefined, longitude: undefined } : {}),
      ...(changedCouple ? { giftMethods: [], groomAccountNumber: '', brideAccountNumber: '', accountNumber: '', groomAccountName: '', brideAccountName: '' } : {}),
    };
    return { ...block, props: { ...block.props, data } };
  }) };
}
