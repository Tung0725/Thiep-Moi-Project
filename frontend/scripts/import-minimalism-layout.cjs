const fs = require('node:fs');
const path = require('node:path');
const postcss = require('postcss');
const ts = require('typescript');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '../..');
const read = name => JSON.parse(fs.readFileSync(path.join(root, 'extracted_templates', name), 'utf8'));
const source = read('open-tree.json');
const cover = read('cover-tree.json');
const body = read('gift-body-tree.json');
const rsvpBody = read('rsvp-body-tree.json');
const resources = read('manifest.json').resources;
const base = '/templates/minimalism-do-dam/archive/';
const assets = new Map(resources.map(resource => [new URL(resource.url).pathname, base + resource.rel_path]));
const text = node => typeof node === 'string' ? node : node.children.map(text).join('');
const find = (node, predicate) => typeof node === 'string' ? undefined : predicate(node) ? node : node.children.map(child => find(child, predicate)).find(Boolean);
const card = find(source, node => node.attrs['data-showcase-root'] !== undefined);
const gift = find(body, node => node.tag === 'dialog' && node.attrs.open !== undefined);
let rsvp;
function locate(node, parents = []) {
  if (typeof node === 'string') return;
  if (node.tag === 'form' && node.attrs.class === 'space-y-4') rsvp = parents.findLast(parent => parent.attrs.class?.includes('fixed inset-0'));
  node.children.forEach(child => locate(child, [...parents, node]));
}
locate(rsvpBody);
if (!card || !gift || !rsvp) throw new Error('Capture the original open, gift and RSVP states first.');
const classes = new Set();
const rewrite = value => {
  if (typeof value !== 'string') return value;
  for (const resource of resources) {
    const original = new URL(resource.url);
    const localUrl = original.hostname === 'chungdoi.com'
      ? `http://localhost:3100${original.pathname}${original.search}`
      : `http://localhost:3100/__archive/${original.hostname}${original.pathname}${original.search}`;
    if (value === resource.url || value === localUrl || value === original.pathname + original.search) return base + resource.rel_path;
  }
  for (const [pathname, local] of [...assets].sort((a, b) => b[0].length - a[0].length)) {
    value = value.replaceAll(`http://localhost:3100/__archive/assets.chungdoi.com${pathname}`, local)
      .replaceAll(`https://assets.chungdoi.com${pathname}`, local)
      .replaceAll(`http://localhost:3100${pathname}`, local);
    if (value === pathname || value.includes(`url(${pathname})`) || value.includes(`url("${pathname}")`)) value = value.replaceAll(pathname, local);
  }
  return value;
};
function clean(node) {
  if (typeof node === 'string') return node;
  if (['script', 'noscript'].includes(node.tag)) return null;
  const attrs = { ...node.attrs };
  delete attrs.open;
  if (node.tag !== 'input' || attrs.type !== 'radio') delete attrs.value;
  delete attrs.nonce;
  for (const key of Object.keys(attrs)) {
    if (key.startsWith('on')) delete attrs[key];
    else if (key === 'style') attrs.style = Object.fromEntries(Object.entries(attrs.style).map(([key, value]) => [key, rewrite(value)]));
    else attrs[key] = rewrite(attrs[key]);
  }
  if (node.tag === 'iframe') attrs.src = 'https://maps.google.com/maps?output=embed';
  if (attrs.class) attrs.class.split(/\s+/).forEach(value => classes.add(value));
  return { tag: node.tag, attrs, children: node.children.map(clean).filter(child => child !== null) };
}
const parts = card.children;
const expectedSections = [[2, 'header', 'Save The Date'], [3, 'section', 'THÔNG TIN LỄ'], [4, 'div', 'ALBUM'], [5, 'section', 'THÔNG TIN TIỆC'], [9, 'div', 'Sổ lưu bút'], [10, 'div', 'Hộp Quà'], [11, 'footer', 'Sự hiện diện']];
for (const [index, tag, label] of expectedSections) {
  const node = parts[index];
  if (!node || node.tag !== tag || !text(node).toLocaleUpperCase('vi-VN').includes(label.toLocaleUpperCase('vi-VN'))) {
    throw new Error(`Source structure changed at ${label}; review section mapping before importing.`);
  }
}
const layout = {
  provenance: { source: 'https://chungdoi.com/vi/mau-thiep/minimalism-do-dam/demo', method: 'Original rendered element tree and original compiled CSS; no remote JavaScript executes.' },
  shell: clean({ ...source, children: [{ ...card, children: [] }] }),
  decorations: parts.slice(0, 2).map(clean),
  cover: clean(cover),
  sections: { HERO: [clean(parts[2])], COUPLE: [clean(parts[3])], GALLERY: [clean(parts[4])], EVENTS: parts.slice(5, 9).map(clean), WISHES: [clean(parts[9])], GIFTBOX: [clean(parts[10])], THANKYOU: [clean(parts[11])] },
  credit: clean(parts[12]),
  photo: clean(parts[13]),
  gift: clean(gift),
  rsvp: clean(rsvp),
};
const coverContent = find(layout.cover, node => node.attrs.style?.zIndex === '10');
const coverSeal = find(layout.cover, node => node.attrs.style?.animationName === 'seal-pulse');
const coverPanel = find(layout.cover, node => node.attrs.style?.clipPath);
if (!coverContent || !coverSeal || !coverPanel) throw new Error('Missing opening animation targets.');
coverContent.attrs['data-cover-part'] = 'card';
coverSeal.attrs['data-cover-part'] = 'seal';
coverPanel.attrs['data-cover-part'] = 'panel';
const configFile = '59526-668c753ae1999f5f.js';
const configBundle = fs.readFileSync(path.join(root, 'extracted_templates/scripts', configFile), 'utf8');
const configAst = ts.createSourceFile(configFile, configBundle, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const property = (node, name) => node?.properties?.find(item => ts.isPropertyAssignment(item) && item.name.getText(configAst) === name)?.initializer;
const sourceModules = [];
const locateModule = node => {
  if (ts.isPropertyAssignment(node) && node.name.getText(configAst) === '90662') sourceModules.push(node.initializer);
  ts.forEachChild(node, locateModule);
};
locateModule(configAst);
if (sourceModules.length !== 1) throw new Error('Missing original Minimalism component module 90662.');
const configs = [];
const assetObjects = [];
const locateConfig = node => {
  if (ts.isObjectLiteralExpression(node)) {
    if (property(node, 'theme') && property(node, 'decorations') && property(node, 'fonts')) configs.push(node);
    if (property(node, 'flower2')?.text === '/images/themes/minimalism-dark-red/flower2-decoration.webp') assetObjects.push(node);
  }
  ts.forEachChild(node, locateConfig);
};
locateConfig(sourceModules[0]);
if (configs.length !== 1 || assetObjects.length !== 1) throw new Error('Ambiguous original opening configuration.');
const assetVariable = assetObjects[0].parent.name?.getText(configAst);
function staticValue(node) {
  if (!node) throw new Error('Missing static opening configuration value.');
  if (ts.isStringLiteral(node)) return node.text;
  if (ts.isNumericLiteral(node)) return Number(node.text);
  if (ts.isPrefixUnaryExpression(node) && node.operator === ts.SyntaxKind.ExclamationToken) return !staticValue(node.operand);
  if (node.kind === ts.SyntaxKind.TrueKeyword || node.kind === ts.SyntaxKind.FalseKeyword) return node.kind === ts.SyntaxKind.TrueKeyword;
  if (ts.isArrayLiteralExpression(node)) return node.elements.map(staticValue);
  if (ts.isObjectLiteralExpression(node)) return Object.fromEntries(node.properties.map(item => {
    if (!ts.isPropertyAssignment(item)) throw new Error('Unsupported opening configuration property.');
    return [item.name.getText(configAst), staticValue(item.initializer)];
  }));
  if (ts.isPropertyAccessExpression(node) && node.expression.getText(configAst) === assetVariable) return staticValue(property(assetObjects[0], node.name.text));
  throw new Error(`Opening configuration requires review: ${node.getText(configAst)}`);
}
const openingConfig = staticValue(configs[0]);
if (openingConfig.theme.particleType !== 'hearts' || openingConfig.decorations.sealType !== 'heart') throw new Error('Opening particle/seal type changed; review conditional effect layers.');
if (Object.keys(openingConfig.decorations).some(key => !['sealType', 'cardImages', 'ogCardImages'].includes(key))) throw new Error('Unmapped opening decoration options.');
if (openingConfig.decorations.cardImages.some(image => Object.keys(image).some(key => !['src', 'className', 'flyOnOpen'].includes(key)))) throw new Error('Unmapped opening image behavior.');
layout.coverMotion = {
  particleColors: openingConfig.theme.particleColors,
  flyingDecorations: openingConfig.decorations.cardImages.filter(image => image.flyOnOpen).map((image, index) => {
    const flipped = image.className.includes('-scale-x-100');
    const className = image.className.replace('-scale-x-100', '').replace(/\bobject-contain\b/g, '').replace(/\s+/g, ' ').trim();
    return { tag: 'div', attrs: { class: `jsx-353cb38c53e4a74a absolute pointer-events-none ${className}`, 'data-cover-flight': index }, children: [
      { tag: 'img', attrs: { src: rewrite(image.src), alt: '', 'aria-hidden': 'true', class: 'jsx-353cb38c53e4a74a pointer-events-none block h-auto max-h-full w-full object-contain', style: { '--fly-scale-x': flipped ? '-1' : '1', animation: 'dragon-fly-forward 1.2s ease-in forwards' } }, children: [] },
    ] };
  }),
};
if (layout.coverMotion.flyingDecorations.length !== 2 || layout.coverMotion.particleColors.length !== 4) throw new Error('Opening effect configuration changed; review all active layers.');
layout.provenance.openingConfig = { file: configFile, moduleId: 90662, sha256: crypto.createHash('sha256').update(configBundle).digest('hex') };
const motionSources = [
  { file: '57034-09348eea77495863.js', styleId: '353cb38c53e4a74a', required: ['envelope-away', 'seal-break', 'seal-ring', 'particle-burst', 'ambient-fall', 'dragon-fly-forward'] },
  { file: '71675-f26cd3a2da64af56.js', styleId: '1370451c15a89ae2', required: ['ienvFloatMain', 'ienvSparkleAnim', 'ienvGrow', 'ienvWave', 'ienvBackWave'] },
];
const motionCss = motionSources.map(source => {
  const bundle = fs.readFileSync(path.join(root, 'extracted_templates/scripts', source.file), 'utf8');
  const ast = ts.createSourceFile(source.file, bundle, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const matches = [];
  const visit = node => {
    if (ts.isObjectLiteralExpression(node)) {
      const property = name => node.properties.find(item => ts.isPropertyAssignment(item) && item.name?.getText(ast).replaceAll('"', '').replaceAll("'", '') === name);
      const id = property('id')?.initializer;
      const children = property('children')?.initializer;
      if (id && ts.isStringLiteral(id) && id.text === source.styleId && children && ts.isStringLiteral(children)) matches.push(children.text);
    }
    ts.forEachChild(node, visit);
  };
  visit(ast);
  if (matches.length !== 1) throw new Error(`Expected one original motion stylesheet ${source.styleId}, got ${matches.length}.`);
  const style = postcss.parse(matches[0]);
  const keyframes = new Set();
  style.walkAtRules('keyframes', rule => keyframes.add(rule.params));
  for (const animation of source.required) if (!keyframes.has(animation)) throw new Error(`Missing original keyframes ${animation}.`);
  source.sha256 = crypto.createHash('sha256').update(bundle).digest('hex');
  return style.toString();
}).join('\n');
layout.provenance.motionSources = motionSources;
const scrollSource = '60193-5e71a53cd1a8947b.js';
layout.provenance.autoScroll = { file: scrollSource, moduleId: 82730, sha256: crypto.createHash('sha256').update(fs.readFileSync(path.join(root, 'extracted_templates/scripts', scrollSource))).digest('hex'), startDelayMs: 2000, defaultSpeed: 50 };
const personFields = {
  'Hoàng Long': 'groom.shortName', 'Bảo Ngọc': 'bride.shortName',
  'Đặng Hoàng Long': 'groom.name', 'Vũ Bảo Ngọc': 'bride.name',
  'Đặng Văn Thắng': 'groom.fatherName', 'Bùi Thị Mai': 'groom.motherName',
  'Vũ Đức Trung': 'bride.fatherName', 'Ngô Thị Hạnh': 'bride.motherName',
  'Quận 1, TP. Hồ Chí Minh': 'groom.address', 'Quận 3, TP. Hồ Chí Minh': 'bride.address',
};
function bindText(node, fields) {
  if (typeof node === 'string') return;
  const content = text(node);
  if (node.children.every(child => typeof child === 'string') && fields[content]) {
    node.attrs['data-text-binding'] = fields[content];
    return;
  }
  node.children.forEach(child => bindText(child, fields));
}
for (const name of ['HERO', 'COUPLE']) layout.sections[name].forEach(node => bindText(node, personFields));
bindText(layout.cover, { ...personFields, '3 tháng 1, 2026': 'wedding.dateLabel' });
const dateFields = prefix => ({
  '03': `${prefix}.day`, '2026': `${prefix}.year`, 'THÁNG 01': `${prefix}.month`,
  'THỨ BẢY': `${prefix}.weekday`,
});
layout.sections.COUPLE.forEach(node => bindText(node, {
  ...dateFields('ceremony'), 'VÀO LÚC 09:00': 'ceremony.timeLabel',
  'LỄ THÀNH HÔN ĐƯỢC CỬ HÀNH TẠI\nTƯ GIA': 'ceremony.venueLabel',
}));
bindText(layout.sections.EVENTS[0], { ...dateFields('banquet'), '18:00': 'banquet.time', '17:30': 'banquet.receptionTime', 'Tháng 1 / 2026': 'banquet.calendarTitle' });
bindText(layout.sections.EVENTS[1], { 'Trung Tâm Hội Nghị White Palace, 194 Hoàng Văn Thụ, Phường 9, Quận Phú Nhuận, TP. Hồ Chí Minh': 'banquet.address' });
const timeline = find(layout.sections.EVENTS[3], node => node.children.length === 5 && node.children.every(child => typeof child !== 'string' && text(child).match(/^\d{2}:\d{2}/)));
if (!timeline) throw new Error('Missing source timeline binding.');
timeline.children.forEach((node, index) => {
  const time = find(node, child => child.children.some(item => typeof item === 'string' && /^\d{2}:\d{2}$/.test(item)));
  if (!time) throw new Error(`Missing timeline time ${index}.`);
  time.attrs['data-text-binding'] = `timeline.${index}.time`;
});
for (const side of ['groom', 'bride']) {
  const owner = side === 'groom' ? 'TRAN TUAN KIET' : 'LE MINH ANH';
  bindText(layout.gift, {
    [owner]: `${side}.account.ownerName`,
    [side === 'groom' ? 'Vietcombank' : 'Techcombank']: `${side}.account.bankName`,
    [side === 'groom' ? '1023456789' : '9988776655']: `${side}.account.accountNumber`,
    [`${side === 'groom' ? 'Chú Rể' : 'Cô Dâu'} - ${owner}`]: `${side}.account.heading`,
  });
}
const bindings = new Set();
function collectBindings(node) {
  if (typeof node === 'string') return;
  if (node.attrs['data-text-binding']) bindings.add(node.attrs['data-text-binding']);
  node.children.forEach(collectBindings);
}
[layout.cover, layout.gift, ...Object.values(layout.sections).flat()].forEach(collectBindings);
const requiredBindings = [...Object.values(personFields), 'wedding.dateLabel', 'ceremony.timeLabel', 'ceremony.venueLabel', 'banquet.time', 'banquet.receptionTime', 'banquet.calendarTitle', 'banquet.address'];
for (const prefix of ['ceremony', 'banquet']) for (const field of ['day', 'month', 'year', 'weekday']) requiredBindings.push(`${prefix}.${field}`);
for (const side of ['groom', 'bride']) for (const field of ['heading', 'ownerName', 'bankName', 'accountNumber']) requiredBindings.push(`${side}.account.${field}`);
for (let index = 0; index < 5; index++) requiredBindings.push(`timeline.${index}.time`);
for (const binding of requiredBindings) if (!bindings.has(binding)) throw new Error(`Missing source field ${binding}; review data mapping.`);
const css = postcss.parse(fs.readFileSync(path.join(root, 'extracted_templates/styles/f676fc8b9884024b.css'), 'utf8'));
const fonts = [];
const initialProperties = [];
css.walkAtRules('property', rule => {
  const value = rule.nodes?.find(node => node.prop === 'initial-value')?.value;
  if (value) initialProperties.push(`${rule.params}:${value}`);
});
css.walkAtRules('font-face', rule => {
  if ([...assets.keys()].some(asset => rule.toString().includes(asset))) fonts.push(rewrite(rule.toString()));
  rule.remove();
});
css.walkAtRules(rule => { if (rule.nodes && rule.nodes.length === 0) rule.remove(); });
const target = path.join(root, 'frontend/src/templates/minimalism-dark-red');
const publicDir = path.join(root, 'frontend/public/template-designs/minimalism-dark-red');
fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(target, 'source-layout.json'), JSON.stringify(layout));
fs.writeFileSync(path.join(target, 'source-fonts.css'), fonts.join('\n'));
const inline = read('inline-styles.json').join('\n');
const output = `@layer properties{*,::before,::after{${initialProperties.join(';')}}}\n` + rewrite(css.toString()) + '\n' + rewrite(inline) + '\n' + rewrite(motionCss) + '\n:host{display:block;font-family:ui-sans-serif,system-ui,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol","Noto Color Emoji";font-weight:300;line-height:1.5;color:#511419;background:#fff7eb;-webkit-font-smoothing:auto}dialog{position:fixed}';
fs.writeFileSync(path.join(publicDir, 'v2.css'), output);
console.log(`Imported original layout (${JSON.stringify(layout).length} chars), ${classes.size} classes, ${output.length} CSS chars, ${fonts.length} font faces.`);
