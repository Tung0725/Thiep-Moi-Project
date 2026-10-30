import dynamic from 'next/dynamic';
import React from 'react';
import { BlockType } from '@/types/schema';

export const COMPONENT_REGISTRY: Record<BlockType, React.ComponentType<any>> = {
  HERO: dynamic(() => import('./blocks/HeroBlock'), {
    ssr: true,
  }),
  COUPLE: dynamic(() => import('./blocks/CoupleBlock'), {
    ssr: true,
  }),
  COUNTDOWN: dynamic(() => import('./blocks/CountdownBlock'), {
    ssr: false,
  }),
  LOCATION: dynamic(() => import('./blocks/LocationBlock'), {
    ssr: true,
  }),
  EVENTS: dynamic(() => import('./blocks/EventsBlock'), {
    ssr: true,
  }),
  GALLERY: dynamic(() => import('./blocks/GalleryBlock'), {
    ssr: false,
  }),
  GIFTBOX: dynamic(() => import('./blocks/GiftBoxBlock'), {
    ssr: false,
  }),
  THANKYOU: dynamic(() => import('./blocks/ThankYouBlock'), {
    ssr: true,
  }),
  WISHES: dynamic(() => import('./blocks/WishesBlock'), {
    ssr: false,
  }),
};

