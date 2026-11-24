import dynamic from 'next/dynamic';
import { TemplatePackage } from '../types';
import { weddingFields } from '../weddingFields';
import { DS03_BLOCK, personalize } from './personalize';

export const modernEditorial: TemplatePackage = {
  id: 'modern-editorial',
  version: 1,
  kind: 'wedding',
  width: 900,
  fixedDesign: false,
  fields: weddingFields,
  supportedBlocks: ['HERO', 'COUPLE', 'COUNTDOWN', 'EVENTS', 'GALLERY', 'GIFTBOX', 'THANKYOU', 'WISHES', DS03_BLOCK],
  layoutModes: ['STACK'],
  fonts: [
    { label: 'Phông chữ gốc', value: 'inherit' },
    { label: 'Great Vibes (Chữ viết tay)', value: 'GreatVibes-Regular.ttf' },
    { label: 'UVN Hoa Tay', value: 'UVNHoaTay1.TTF' },
    { label: 'Fz Photograph', value: 'Fz-Photograph.ttf' },
    { label: 'California Palms Script', value: 'CaliforniaPalmsScript-Regular.otf' },
    { label: 'Analogue Red (Hiện đại)', value: 'AnalogueRed-55Regular.ttf' },
  ],
  Renderer: dynamic(() => import('./Renderer'), { ssr: false }),
  personalize,
};

export const ds03: TemplatePackage = {
  ...modernEditorial,
  id: 'ds03',
  version: 1,
};
