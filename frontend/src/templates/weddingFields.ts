import { TemplateField } from './types';

export const weddingFields: TemplateField[] = [
  { key: 'groomName', label: 'Họ và tên Chú Rể', type: 'text', required: true },
  { key: 'brideName', label: 'Họ và tên Cô Dâu', type: 'text', required: true },
  { key: 'groomPhone', label: 'Số điện thoại Chú Rể', type: 'tel' },
  { key: 'bridePhone', label: 'Số điện thoại Cô Dâu', type: 'tel' },
  { key: 'eventDate', label: 'Ngày tổ chức', type: 'date', required: true },
  { key: 'eventTime', label: 'Giờ khai tiệc', type: 'time', required: true },
  { key: 'venueName', label: 'Địa điểm tổ chức', type: 'text', required: true },
  { key: 'venueAddress', label: 'Địa chỉ', type: 'text', required: true },
  { key: 'coverImageUrl', label: 'Đường dẫn ảnh bìa', type: 'text' },
];
