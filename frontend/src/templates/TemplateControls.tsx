'use client';

import React from 'react';
import { PageSchema } from '@/types/schema';
import { FallingEffectType } from '@/types/schema';
import { resolveTemplate } from './registry';

/** Template-owned capabilities drive appearance controls; props carry the schema and update callback, no local state. */
export default function TemplateControls({ schema, onChange }: { schema: PageSchema; onChange: (schema: PageSchema) => void }) {
  const template = resolveTemplate(schema);
  if (!template) return null;
  const move = (index: number, offset: number) => {
    const blocks = [...schema.blocks];
    [blocks[index], blocks[index + offset]] = [blocks[index + offset], blocks[index]];
    onChange({ ...schema, blocks });
  };
  return (
    <fieldset className="space-y-4 border-t border-neutral-200 pt-5">
      {/* Theme and music controls */}
      <legend className="font-bold">Thiết kế thiệp</legend>
      {!template.fixedDesign && <><div className="flex flex-wrap gap-4">
        <label>Màu chủ đạo<input aria-label="Màu chủ đạo" type="color" value={schema.theme.primaryColor} onChange={event => onChange({ ...schema, theme: { ...schema.theme, primaryColor: event.target.value } })} /></label>
        <label>Màu nền<input aria-label="Màu nền" type="color" value={schema.theme.backgroundColor} onChange={event => onChange({ ...schema, theme: { ...schema.theme, backgroundColor: event.target.value } })} /></label>
      </div>
      <label className="block">Font tiêu đề<select className="ml-3 rounded border p-2" value={schema.theme.headingFont} onChange={event => onChange({ ...schema, theme: { ...schema.theme, headingFont: event.target.value } })}>{template.fonts.map(font => <option key={font.value} value={font.value}>{font.label}</option>)}</select></label></>}
      <label className="block">Nhạc nền<input className="mt-1 w-full rounded border p-2" value={schema.effects.musicUrl || ''} onChange={event => onChange({ ...schema, effects: { ...schema.effects, musicUrl: event.target.value } })} /></label>
      {!template.fixedDesign && <label className="block">Hiệu ứng rơi<select className="ml-3 rounded border p-2" value={schema.effects.fallingType} onChange={event => onChange({ ...schema, effects: { ...schema.effects, fallingType: event.target.value as FallingEffectType } })}><option value="NONE">Không có</option><option value="HEARTS">Trái tim</option><option value="PETALS">Cánh hoa</option><option value="SNOW">Tuyết</option></select></label>}
      {/* Section visibility and ordering */}
      {!template.fixedDesign && <div className="space-y-2">{schema.blocks.map((block, index) => <div key={block.id} className="flex items-center gap-2"><label className="flex flex-1 items-center gap-2"><input type="checkbox" checked={!block.isHidden} onChange={event => onChange({ ...schema, blocks: schema.blocks.map(item => item.id === block.id ? { ...item, isHidden: !event.target.checked } : item) })} />{String(block.props.sectionTitle || block.props.title || block.type)}</label><button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Đưa ${block.id} lên`} className="rounded border px-3 py-1 disabled:opacity-30">↑</button><button type="button" disabled={index === schema.blocks.length - 1} onClick={() => move(index, 1)} aria-label={`Đưa ${block.id} xuống`} className="rounded border px-3 py-1 disabled:opacity-30">↓</button></div>)}</div>}
    </fieldset>
  );
}
