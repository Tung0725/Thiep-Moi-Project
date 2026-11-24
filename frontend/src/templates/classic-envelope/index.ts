import dynamic from 'next/dynamic';
import { TemplatePackage } from '../types';
import { weddingFields } from '../weddingFields';
import { personalize } from './personalize';

export const classicEnvelope: TemplatePackage = {
  id: 'classic-envelope',
  version: 1,
  kind: 'wedding',
  width: 900,
  fixedDesign: false,
  fields: [
    ...weddingFields,
    { key: 'ceremonyTime', label: 'Giờ làm lễ', type: 'time' },
    { key: 'groomFather', label: 'Cha chú rể', type: 'text' },
    { key: 'groomMother', label: 'Mẹ chú rể', type: 'text' },
    { key: 'brideFather', label: 'Cha cô dâu', type: 'text' },
    { key: 'brideMother', label: 'Mẹ cô dâu', type: 'text' },
  ],
  supportedBlocks: [
    'HERO',
    'COUPLE',
    'EVENTS',
    'GALLERY',
    'GIFTBOX',
    'THANKYOU',
    'WISHES',
    'SONG_HY_GREEN',
  ],
  layoutModes: ['STACK'],
  fonts: [
    { label: 'Viaoda Libre', value: 'Viaoda Libre' },
    { label: 'Big Caslon', value: 'Big Caslon' },
    { label: 'Cormorant Garamond', value: 'Cormorant Garamond' },
    { label: 'Playfair Display', value: 'Playfair Display' },
    { label: 'Times New Roman', value: 'Times New Roman' },
  ],
  Renderer: dynamic(() => import('./Renderer'), { ssr: false }),
  personalize,
};
