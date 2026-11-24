'use client';

import React, { useMemo } from 'react';
import { HeroBlockProps } from '@/types/schema';
import { TemplateRendererProps } from '../types';
import PolaroidRenderer from './polaroid/PolaroidRenderer';
import ArchRenderer from './arch/ArchRenderer';
import { normalizeClassicSchema } from './normalize';

/**
 * Unified Engine 1 (`classic-envelope@1`, 900px desktop / 480px mobile).
 * Dispatches between the two classic layouts (`polaroid` for Minimalism-style, `arch` for Song Hỷ-style)
 * with 100% original effects preserved and dynamic JSON theme colors/typography applied.
 */
export default function ClassicEnvelopeRenderer(props: TemplateRendererProps) {
  const normalizedSchema = useMemo(
    () => normalizeClassicSchema(props.schema),
    [props.schema]
  );
  const hero = normalizedSchema.blocks.find((block) => block.type === 'HERO')?.props as unknown as
    | HeroBlockProps
    | undefined;
  const hasLegacySongHy = props.schema.blocks.some((block) => block.type === 'SONG_HY_GREEN');
  const heroVariant =
    hero?.variant || normalizedSchema.theme.heroVariant || (hasLegacySongHy ? 'arch' : 'polaroid');

  if (heroVariant === 'arch') {
    return <ArchRenderer {...props} schema={normalizedSchema} />;
  }

  return <PolaroidRenderer {...props} schema={normalizedSchema} />;
}
