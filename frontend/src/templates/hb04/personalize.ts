import { PageSchema } from '@/types/schema';
import { TemplateValues } from '../types';

export function personalize(schema: PageSchema, formData: TemplateValues, defaults: TemplateValues): PageSchema {
    const originalSchema = schema;
    const dateParts = formData.eventDate ? formData.eventDate.split('-') : ['2026', '12', '25'];
    const formattedDate = `${dateParts[2]} . ${dateParts[1]} . ${dateParts[0]}`;
    const vietnameseDateText = `Ngày ${dateParts[2]} Tháng ${dateParts[1]} Năm ${dateParts[0]}`;
    const slashDateText = `Ngày ${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
    const fullTargetDate = `${formData.eventDate || '2026-12-25'}T${formData.eventTime || '16:00'}:00`;
    const shortGroom = (formData.groomName || 'Chú rể').trim().split(/\s+/).slice(-2).join(' ');
    const shortBride = (formData.brideName || 'Cô dâu').trim().split(/\s+/).slice(-2).join(' ');

    const updatedBlocks = originalSchema.blocks.map((block) => {
      if (block.type === 'HERO') {
        return {
          ...block,
          props: {
            ...block.props,
            groomName: shortGroom,
            brideName: shortBride,
            eventDate: formattedDate,
            coverImageUrl: formData.coverImageUrl || defaults.coverImageUrl,
          },
        };
      }
      if (block.type === 'COUPLE') {
        const coupleProps = block.props as Record<string, unknown>;
        const prevGroom = (coupleProps.groom as Record<string, unknown>) || {};
        const prevBride = (coupleProps.bride as Record<string, unknown>) || {};
        return {
          ...block,
          props: {
            ...coupleProps,
            weddingDateText: vietnameseDateText,
            groom: {
              ...prevGroom,
              name: formData.groomName || 'Chú rể',
              displayName: shortGroom,
              address: formData.venueAddress || prevGroom.address,
            },
            bride: {
              ...prevBride,
              name: formData.brideName || 'Cô dâu',
              displayName: shortBride,
            },
          },
        };
      }
      if (block.type === 'EVENTS') {
        const eventsProps = block.props as Record<string, unknown>;
        const prevGroomEvents = Array.isArray(eventsProps.groomEvents) ? eventsProps.groomEvents : [];
        return {
          ...block,
          props: {
            ...eventsProps,
            groomEvents: prevGroomEvents.map((ev: Record<string, unknown>) => ({
              ...ev,
              timeText: `Vào Lúc ${formData.eventTime || '16:00'}`,
              dateText: slashDateText,
              locationName: formData.venueName || ev.locationName,
              address: formData.venueAddress || ev.address,
            })),
          },
        };
      }
      if (block.type === 'COUNTDOWN') {
        return {
          ...block,
          props: {
            ...block.props,
            targetDate: fullTargetDate,
          },
        };
      }
      if (block.type === 'LOCATION') {
        return {
          ...block,
          props: {
            ...block.props,
            ceremonyVenue: formData.venueName || 'Trung Tâm Tiệc Cưới',
            address: formData.venueAddress || 'Địa chỉ sảnh tiệc',
            eventTime: `${formData.eventTime || '11:30'} - Ngày ${formattedDate}`,
          },
        };
      }
      return block;
    });

    return {
      ...originalSchema,
      blocks: updatedBlocks,
    };
}
