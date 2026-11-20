import { PageSchema } from '@/types/schema';
import { hb04 } from './hb04';
import { minimalism, minimalismV1 } from './minimalism-dark-red';
import { songHyGreen } from './song-hy-green';
import { TemplatePackage } from './types';

const packages = new Map<string, TemplatePackage>(
  [hb04, minimalismV1, minimalism, songHyGreen].map(template => [`${template.id}@${template.version}`, template]),
);

/** Legacy schemas keep their original renderer until explicitly saved with a binding. */
export function resolveTemplate(schema: PageSchema): TemplatePackage | undefined {
  const binding = schema.template ?? (schema.theme.design === 'MINIMALISM_DARK_RED'
    ? { id: minimalism.id, version: 1 } : { id: hb04.id, version: 1 });
  return packages.get(`${binding.id}@${binding.version}`);
}

export function pinTemplate(schema: PageSchema): PageSchema {
  const template = resolveTemplate(schema);
  if (!template) return schema;
  return { ...schema, template: { id: template.id, version: template.version } };
}
