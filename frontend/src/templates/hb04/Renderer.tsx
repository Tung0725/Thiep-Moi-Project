import React, { Suspense } from 'react';
import { PageSchema } from '@/types/schema';
import { COMPONENT_REGISTRY } from './blocks';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FallingEffects } from '@/components/common/FallingEffects';
import { BackgroundMusic } from '@/components/common/BackgroundMusic';
import { OpeningEnvelope } from './OpeningEnvelope';
import { cn } from '@/lib/utils';
import './styles.css';

/**
 * HB04 renderer: owns its 400px layout, block implementations, fonts and envelope.
 * Props:
 *   - schema: Cấu trúc PageSchema.
 *   - slug: Đường dẫn slug duy nhất của thiệp.
 *   - containerClassName: Ghi đè độ rộng khung thiệp (mặc định max-w-[400px] chuẩn mobileWidth của meHappy).
 *   - embedded: Cờ nhúng trong khung xem trước nhỏ (như trên trang /create).
 * Key States: Không có (stateless engine)
 */
interface PageRendererProps {
  schema: PageSchema;
  slug?: string;
  containerClassName?: string;
  embedded?: boolean;
}

export default function Hb04Renderer({
  schema,
  slug,
  containerClassName,
  embedded = false,
}: PageRendererProps) {
  const { theme, effects, blocks = [] } = schema;


  return (
    <main
      style={
        {
          backgroundColor: theme?.backgroundColor || '#FFFFFF',
          color: '#333333',
          '--template-primary': theme?.primaryColor || '#A80606',
          '--hb04-background': theme?.backgroundColor || '#FFFFFF',
          '--hb04-heading': theme?.headingFont === 'serif' ? 'GreatVibes' : theme?.headingFont,
          '--hb04-body': theme?.bodyFont === 'sans-serif' ? 'Source Sans 3' : theme?.bodyFont,
        } as React.CSSProperties
      }
      className="hb04-template relative min-h-screen w-full"
    >
      {/* Falling Particle Overlay */}
      {effects?.fallingType && (
        <FallingEffects type={effects.fallingType} embedded={embedded} />
      )}

      {/* Dynamic Blocks Container (Default 400px mobile-only canvas; overflow-x-clip preserves sticky envelope) */}
      <div
        className={cn('relative w-full max-w-[400px] mx-auto flex flex-col overflow-x-clip bg-white', containerClassName)}
      >
        {/* Opening Envelope Split-Panels (Scoped strictly inside the 400px card for 0px horizontal drift) */}
        {effects?.openingEffect?.enabled && (
          <OpeningEnvelope config={effects.openingEffect} embedded={embedded} />
        )}

        {/* Invitation Sections */}
        {blocks.map((block) => {
          if (block.isHidden) return null;
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

      {/* Floating Background Music Player */}
      {effects?.musicUrl && (
        <BackgroundMusic musicUrl={effects.musicUrl} embedded={embedded} />
      )}
    </main>
  );
}
