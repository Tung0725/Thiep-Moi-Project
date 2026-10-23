import dynamic from 'next/dynamic';
import React from 'react';
import { BlockType } from '@/types/schema';

export const COMPONENT_REGISTRY: Record<BlockType, React.ComponentType<any>> = {
  HERO: dynamic(() => import('./blocks/HeroBlock'), {
    ssr: true,
  }),
  COUNTDOWN: dynamic(() => import('./blocks/CountdownBlock'), {
    ssr: false,
  }),
  LOCATION: dynamic(() => import('./blocks/LocationBlock'), {
    ssr: true,
  }),
  WISHES: dynamic(() => import('./blocks/WishesBlock'), {
    ssr: false,
  }),
  GALLERY: dynamic(() => import('./blocks/HeroBlock'), {
    ssr: false,
  }),
};
