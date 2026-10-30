import React, { Suspense } from 'react';
import { PageSchema } from '@/types/schema';
import { COMPONENT_REGISTRY } from './ComponentRegistry';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FallingEffects } from '@/components/common/FallingEffects';
import { BackgroundMusic } from '@/components/common/BackgroundMusic';
import { OpeningEnvelope } from '@/components/common/OpeningEnvelope';

/**
 * PageRenderer Component
 * Purpose: Bộ máy duyệt mảng blocks từ JSON Schema và dựng giao diện động
 * Props:
 *   - schema: Cấu trúc PageSchema
 *   - slug: Đường dẫn slug duy nhất của thiệp
 * Key States: Không có (stateless engine)
 */
interface PageRendererProps {
  schema: PageSchema;
  slug?: string;
  containerClassName?: string;
}

export function PageRenderer({ schema, slug, containerClassName }: PageRendererProps) {
  const { theme, effects, blocks = [] } = schema;

  return (
    <main
      style={{
        backgroundColor: theme?.backgroundColor,
        color: theme?.primaryColor,
      }}
      className="relative min-h-screen w-full"
    >
      {/* Opening Envelope Split-Panels Animation */}
      {effects?.openingEffect?.enabled && (
        <OpeningEnvelope config={effects.openingEffect} />
      )}

      {/* Floating Background Music Player */}
      {effects?.musicUrl && <BackgroundMusic musicUrl={effects.musicUrl} />}

      {/* Falling Particle Overlay */}
      {effects?.fallingType && <FallingEffects type={effects.fallingType} />}

      {/* Dynamic Blocks Container */}
      <div className={`w-full ${containerClassName || 'max-w-3xl sm:max-w-4xl'} mx-auto flex flex-col`}>
        {blocks.map((block) => {
          const Component = COMPONENT_REGISTRY[block.type];
          if (!Component) return null;

          return (
            <ErrorBoundary key={block.id}>
              <Suspense fallback={<div className="h-24 w-full bg-neutral-100 animate-pulse my-2" />}>
                <Component {...block.props} slug={slug} />
              </Suspense>
            </ErrorBoundary>
          );
        })}
      </div>
    </main>
  );
}

