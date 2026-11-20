import dynamic from 'next/dynamic';
import { TemplatePackage } from '../types';
import { weddingFields } from '../weddingFields';
import { personalize } from './personalize';

export const minimalismV1: TemplatePackage = {
  id: 'minimalism-dark-red', version: 1, kind: 'wedding', width: 430,
  fields: weddingFields,
  layoutModes: ['STACK'],
  supportedBlocks: ['HERO', 'COUPLE', 'EVENTS', 'GALLERY', 'GIFTBOX', 'THANKYOU', 'WISHES'],
  fonts: [{ label: 'Cormorant Garamond', value: 'MinimalismCormorant' }, { label: 'Times New Roman', value: 'Times New Roman' }],
  Renderer: dynamic(() => import('./Renderer')),
  personalize,
};

export const minimalism: TemplatePackage = {
  ...minimalismV1,
  version: 2,
  width: 900,
  fonts: [{ label: 'Viaoda Libre (mẫu gốc)', value: 'Viaoda Libre' }, { label: 'Cormorant Garamond', value: 'Cormorant Garamond' }],
  Renderer: dynamic(() => import('./OriginalRenderer')),
};
