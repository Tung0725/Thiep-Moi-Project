import { PageSchema } from '@/types/schema';
import { hb04 } from './hb04';
import { ds03, modernEditorial } from './modern-editorial';
import { classicEnvelope } from './classic-envelope';
import { TemplatePackage } from './types';

const packages = new Map<string, TemplatePackage>(
  [
    hb04,
    classicEnvelope,
    { ...classicEnvelope, id: 'minimalism-dark-red', version: 1 },
    { ...classicEnvelope, id: 'minimalism-dark-red', version: 2 },
    { ...classicEnvelope, id: 'song-hy-green', version: 1 },
    modernEditorial,
    ds03,
  ].map((template) => [`${template.id}@${template.version}`, template])
);

/** Legacy schemas keep their original renderer until explicitly saved with a binding. */
export function resolveTemplate(schema: PageSchema): TemplatePackage | undefined {
  const binding =
    schema.template ??
    (schema.theme.design === 'MINIMALISM_DARK_RED'
      ? { id: 'minimalism-dark-red', version: 1 }
      : { id: hb04.id, version: 1 });
  return packages.get(`${binding.id}@${binding.version}`);
}

export function pinTemplate(schema: PageSchema): PageSchema {
  const template = resolveTemplate(schema);
  if (!template) return schema;
  return { ...schema, template: { id: template.id, version: template.version } };
}
