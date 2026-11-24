import { ComponentType } from 'react';
import { BlockType, LayoutMode, PageSchema } from '@/types/schema';

export type TemplateValues = Record<string, string>;

export interface TemplateRendererProps {
  schema: PageSchema;
  slug?: string;
  embedded?: boolean;
  containerClassName?: string;
  onEndReached?: (reached: boolean) => void;
}

export interface TemplateField {
  key: string;
  label: string;
  type: 'text' | 'date' | 'time' | 'tel' | 'image';
  required?: boolean;
}

export interface TemplatePackage {
  id: string;
  version: number;
  kind: string;
  width: number;
  fixedDesign?: boolean;
  fields: TemplateField[];
  supportedBlocks: readonly BlockType[];
  layoutModes: readonly LayoutMode[];
  fonts: { label: string; value: string }[];
  Renderer: ComponentType<TemplateRendererProps>;
  personalize: (schema: PageSchema, values: TemplateValues, defaults: TemplateValues) => PageSchema;
}
