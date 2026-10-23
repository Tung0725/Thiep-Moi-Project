import React, { Suspense } from 'react';
import { PageSchema } from '@/types/schema';
import { COMPONENT_REGISTRY } from './ComponentRegistry';
import { ErrorBoundary } from '@/components/common/ErrorBoundary';
import { FallingEffects } from '@/components/common/FallingEffects';

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
}

export function PageRenderer({ schema, slug }: PageRendererProps) {
  const { theme, effects, blocks = [] } = schema;

  return (
    <main
      style={{
        backgroundColor: theme?.backgroundColor,
        color: theme?.primaryColor,
      }}
      className="relative min-h-screen w-full"
    >
      {/* Falling Particle Overlay */}
      {effects?.fallingType && <FallingEffects type={effects.fallingType} />}

      {/* Dynamic Blocks Container */}
      <div className="w-full max-w-md mx-auto flex flex-col">
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
