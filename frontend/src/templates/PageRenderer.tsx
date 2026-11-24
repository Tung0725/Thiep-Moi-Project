import React from 'react';
import { resolveTemplate } from '@/templates/registry';
import { TemplateRendererProps } from '@/templates/types';

/** Routes a pinned schema to its template package; layout and styling belong to that package. */
export function PageRenderer(props: TemplateRendererProps) {
  const template = resolveTemplate(props.schema);
  if (!template) return <div role="alert" className="p-6 text-center">Phiên bản mẫu thiệp này chưa được hỗ trợ.</div>;
  if (!template.layoutModes.includes(props.schema.layoutMode)) return <div role="alert" className="p-6 text-center">Mẫu thiệp không hỗ trợ chế độ bố cục {props.schema.layoutMode}.</div>;
  const unsupported = props.schema.blocks.find(block => !block.isHidden && !template.supportedBlocks.includes(block.type));
  if (unsupported) return <div role="alert" className="p-6 text-center">Mẫu thiệp không hỗ trợ khối {unsupported.type}.</div>;
  const Renderer = template.Renderer;
  return <Renderer {...props} />;
}
