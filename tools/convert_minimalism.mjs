import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const html = await fs.readFile(path.join(root, 'extracted_templates/pages/demo.html'), 'utf8');
const flight = [...html.matchAll(/self\.__next_f\.push\((\[[\s\S]*?)\)<\/script>/g)]
  .map(match => JSON.parse(match[1])[1] || '').join('');
const record = flight.split('\n').find(line => line.startsWith('5:'));
const original = JSON.parse(record.slice(2))[3].initialData.data;
const metadata = JSON.parse(await fs.readFile(path.join(root, 'extracted_templates/wedding_template_data.json'), 'utf8'));
const manifest = JSON.parse(await fs.readFile(path.join(root, 'extracted_templates/manifest.json'), 'utf8'));
const base = '/templates/minimalism-do-dam/archive/';
const asset = url => {
  const resource = manifest.resources.find(item => item.url === url);
  if (!resource) throw new Error(`Missing captured resource: ${url}`);
  return base + resource.rel_path;
};
const cover = asset(original.heroPhoto);
const schema = {
  version: 1, layoutMode: 'STACK',
  theme: { design: 'MINIMALISM_DARK_RED', primaryColor: '#511419', backgroundColor: '#f8f1e7', headingFont: 'MinimalismCormorant', bodyFont: 'MinimalismLora' },
  effects: { fallingType: 'HEARTS', musicUrl: base + 'audio/50-nam-ve-sau.mp3' },
  blocks: [
    { id: 'hero-1', type: 'HERO', props: { title: 'SAVE THE DATE', groomName: original.groomShortName, brideName: original.brideShortName, eventDate: original.date, coverImageUrl: cover } },
    { id: 'couple-1', type: 'COUPLE', props: { sectionTitle: 'THÔNG TIN LỄ CƯỚI', weddingDateText: original.date,
      groom: { name: original.groomFullName, displayName: original.groomShortName, role: 'GROOM', photoUrl: cover, fatherName: original.groomFather, motherName: original.groomMother, address: original.groomAddress.vi },
      bride: { name: original.brideFullName, displayName: original.brideShortName, role: 'BRIDE', photoUrl: cover, fatherName: original.brideFather, motherName: original.brideMother, address: original.brideAddress.vi } } },
    { id: 'ceremony-1', type: 'EVENTS', props: { title: 'LỄ THÀNH HÔN', groomEvents: [{ id: 'ceremony', title: 'LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI', dateText: original.ceremonyDate, timeText: original.ceremonies[0].time, locationName: 'TƯ GIA', address: original.groomAddress.vi }], brideEvents: [] } },
    { id: 'gallery-1', type: 'GALLERY', props: { title: 'ALBUM ẢNH', images: original.galleryImages.map(image => asset(image.url)) } },
    { id: 'banquet-1', type: 'EVENTS', props: { title: 'THÔNG TIN TIỆC CƯỚI', groomEvents: [{ id: 'banquet', title: 'TIỆC CƯỚI SẼ DIỄN RA VÀO LÚC', dateText: original.date, timeText: original.banquetTime, locationName: metadata.locations[1].name, address: original.address.vi }], brideEvents: [], receptionTime: original.guestReceptionTime, dressCodeColors: original.dresscodeColors, timeline: original.timelineEvents.map(event => ({ time: event.time, label: event.label.vi })) } },
    { id: 'wishes-1', type: 'WISHES', props: { title: 'Sổ lưu bút', subtitle: 'Gửi lời chúc và xác nhận tham dự cùng cô dâu, chú rể', allowRsvp: true } },
    { id: 'giftbox-1', type: 'GIFTBOX', props: { title: 'Hộp Quà Mừng',
      groomAccount: { ownerName: original.giftMethods[0].accountName, bankName: original.giftMethods[0].bankName, accountNumber: original.giftMethods[0].accountNumber, qrCodeUrl: base + 'images/qr-png_2.png', label: 'Chú Rể' },
      brideAccount: { ownerName: original.giftMethods[1].accountName, bankName: original.giftMethods[1].bankName, accountNumber: original.giftMethods[1].accountNumber, qrCodeUrl: base + 'images/qr-png.png', label: 'Cô Dâu' } } },
    { id: 'thankyou-1', type: 'THANKYOU', props: { title: 'Trân trọng cảm ơn', message: 'Sự hiện diện của bạn là niềm vinh hạnh của gia đình chúng tôi.', imageUrl: asset(original.galleryImages[0].url) } },
  ],
};
const template = {
  id: 'minimalism-do-dam', category: 'wedding', title: 'Minimalism Đỏ Đậm', style: 'Tối giản · Đỏ đô & hoa mẫu đơn', views: '0', likes: '0', badge: 'Miễn phí', categoryLabel: 'Cưới',
  imageUrl: base + 'images/minimalism_darkred.webp',
  description: 'Thiệp cưới nền giấy kem, tông đỏ đô, hoa mẫu đơn và dấu triện chữ Hỷ. Phong bì mở thiệp, album ảnh, lịch cưới, lịch trình và sổ lưu bút.',
  defaultData: { groomName: original.groomFullName, brideName: original.brideFullName, groomPhone: '', bridePhone: '', eventDate: original.date, eventTime: original.banquetTime, venueName: metadata.locations[1].name, venueAddress: original.address.vi, coverImageUrl: cover },
  schema,
};
for (const target of ['frontend/src/data/templates/minimalism-do-dam.json', 'backend/src/main/resources/templates/minimalism-do-dam.json']) {
  await fs.mkdir(path.dirname(path.join(root, target)), { recursive: true });
  await fs.writeFile(path.join(root, target), JSON.stringify(template, null, 2) + '\n');
}
console.log('Converted original invitation to native PageSchema and backend seed.');
