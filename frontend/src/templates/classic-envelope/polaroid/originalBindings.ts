import { CoupleBlockProps, EventsBlockProps, GalleryBlockProps, GiftBoxBlockProps, HeroBlockProps, PageSchema } from '@/types/schema';

export type OriginalNode = string | { tag: string; attrs: Record<string, unknown>; children: OriginalNode[] };

export function originalData(schema: PageSchema) {
  const props = <T,>(type: string) => schema.blocks.find(block => block.type === type && !block.isHidden)?.props as unknown as T | undefined;
  const hero = props<HeroBlockProps>('HERO');
  const couple = props<CoupleBlockProps>('COUPLE');
  const events = schema.blocks.filter(block => block.type === 'EVENTS' && !block.isHidden).map(block => block.props as unknown as EventsBlockProps);
  const banquet = events.find(event => event.groomEvents.some(item => item.id === 'banquet'));
  const ceremony = events.find(event => event.groomEvents.some(item => item.id === 'ceremony'));
  const parseDate = (value?: string) => {
    const iso = value?.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const display = value?.match(/(\d{1,2})\s*[./]\s*(\d{1,2})\s*[./]\s*(\d{4})/);
    return iso ? new Date(+iso[1], +iso[2] - 1, +iso[3]) : display ? new Date(+display[3], +display[2] - 1, +display[1]) : new Date(2026, 0, 3);
  };
  const banquetEvent = banquet?.groomEvents.find(item => item.id === 'banquet');
  const ceremonyEvent = ceremony?.groomEvents.find(item => item.id === 'ceremony');
  const date = parseDate(banquetEvent?.dateText || hero?.eventDate);
  const ceremonyDate = parseDate(ceremonyEvent?.dateText || couple?.weddingDateText || hero?.eventDate);
  const gifts = props<GiftBoxBlockProps>('GIFTBOX');
  const bindings: Record<string, string> = {};
  for (const side of ['groom', 'bride'] as const) {
    const person = couple?.[side];
    for (const field of ['name', 'fatherName', 'motherName', 'address'] as const) bindings[`${side}.${field}`] = person?.[field] || '';
    bindings[`${side}.shortName`] = hero?.[side === 'groom' ? 'groomName' : 'brideName'] || person?.displayName || person?.name || '';
    const account = gifts?.[side === 'groom' ? 'groomAccount' : 'brideAccount'];
    for (const field of ['ownerName', 'bankName', 'accountNumber'] as const) bindings[`${side}.account.${field}`] = account?.[field] || '';
    bindings[`${side}.account.heading`] = account ? `${account.label} - ${account.ownerName}` : '';
  }
  for (const [prefix, eventDate] of [['banquet', date], ['ceremony', ceremonyDate]] as const) {
    bindings[`${prefix}.day`] = String(eventDate.getDate()).padStart(2, '0');
    bindings[`${prefix}.year`] = String(eventDate.getFullYear());
    bindings[`${prefix}.month`] = `THÁNG ${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
    bindings[`${prefix}.weekday`] = eventDate.toLocaleDateString('vi-VN', { weekday: 'long' }).toUpperCase();
  }
  bindings['wedding.dateLabel'] = parseDate(hero?.eventDate).toLocaleDateString('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' });
  bindings['ceremony.timeLabel'] = ceremonyEvent?.timeText ? `VÀO LÚC ${ceremonyEvent.timeText}` : '';
  bindings['ceremony.venueLabel'] = ceremonyEvent ? `LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI\n${ceremonyEvent.locationName}` : '';
  bindings['banquet.time'] = banquetEvent?.timeText || '';
  bindings['banquet.receptionTime'] = banquet?.receptionTime || '';
  bindings['banquet.calendarTitle'] = `Tháng ${date.getMonth() + 1} / ${date.getFullYear()}`;
  bindings['banquet.address'] = banquetEvent?.address || banquetEvent?.locationName || '';
  for (let index = 0; index < 5; index++) bindings[`timeline.${index}.time`] = banquet?.timeline?.[index]?.time || '';
  const boundText = (key: string): string => {
    if (!(key in bindings)) throw new Error(`Unsupported Minimalism binding: ${key}`);
    return bindings[key];
  };
  return { hero, couple, banquet, ceremony, date, ceremonyDate, boundText, gallery: props<GalleryBlockProps>('GALLERY')?.images?.filter(image => image.trim()) || [], gifts };
}

export function nodeText(node: OriginalNode): string {
  return typeof node === 'string' ? node : node.children.map(nodeText).join('');
}

export function replaceNodeText(node: OriginalNode, from: string, to: string): OriginalNode {
  return typeof node === 'string' ? node === from ? to : node : { ...node, children: node.children.map(child => replaceNodeText(child, from, to)) };
}
