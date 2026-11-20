import dynamic from 'next/dynamic';
import { TemplatePackage } from '../types';
import { weddingFields } from '../weddingFields';
import { personalize } from './personalize';

export const songHyGreen: TemplatePackage = {
  id: 'song-hy-green', version: 1, kind: 'wedding', width: 900,
  fixedDesign: true,
  fields: [...weddingFields,
    { key: 'ceremonyTime', label: 'Giờ làm lễ', type: 'time' },
    { key: 'groomFather', label: 'Cha chú rể', type: 'text' },
    { key: 'groomMother', label: 'Mẹ chú rể', type: 'text' },
    { key: 'brideFather', label: 'Cha cô dâu', type: 'text' },
    { key: 'brideMother', label: 'Mẹ cô dâu', type: 'text' },
  ],
  supportedBlocks: ['SONG_HY_GREEN'], layoutModes: ['STACK'],
  fonts: [{ label: 'Big Caslon (mẫu gốc)', value: 'Big Caslon' }],
  Renderer: dynamic(() => import('./Renderer'), { ssr: false }),
  personalize,
};
