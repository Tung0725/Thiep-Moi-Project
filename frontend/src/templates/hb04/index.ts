import dynamic from 'next/dynamic';
import { TemplatePackage } from '../types';
import { weddingFields } from '../weddingFields';
import { personalize } from './personalize';

export const hb04: TemplatePackage = {
  id: 'hb04', version: 1, kind: 'wedding', width: 400,
  fields: weddingFields,
  layoutModes: ['STACK'],
  supportedBlocks: ['HERO', 'COUPLE', 'EVENTS', 'GALLERY', 'GIFTBOX', 'THANKYOU', 'WISHES', 'COUNTDOWN', 'LOCATION'],
  fonts: [{ label: 'Great Vibes', value: 'serif' }, { label: 'Ballet', value: 'Ballet' }],
  Renderer: dynamic(() => import('./Renderer')),
  personalize,
};
