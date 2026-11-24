const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const postcss = require('postcss');

const root = path.resolve(__dirname, '../..');
const archive = path.join(root, 'extracted_templates/song-hy-xanh');
const destination = path.join(root, 'frontend/src/templates/song-hy-green');
const manifest = JSON.parse(fs.readFileSync(path.join(archive, 'manifest.json'), 'utf8'));
const supplementary = fs.existsSync(path.join(archive, 'integration-assets.json'))
  ? JSON.parse(fs.readFileSync(path.join(archive, 'integration-assets.json'), 'utf8')).resources : [];
const playback = JSON.parse(fs.readFileSync(path.join(archive, 'playback-data.json'), 'utf8'));
const base = '/templates/song-hy-xanh/archive/';
const factories = {};
const provenance = [];
for (const resource of manifest.resources.filter(item => item.category === 'scripts')) {
  const content = fs.readFileSync(path.join(archive, resource.rel_path), 'utf8');
  if (!content.includes('self.webpackChunk_N_E') || resource.filename.startsWith('webpack-')) continue;
  vm.runInNewContext(content, { self: { webpackChunk_N_E: { push: ([, modules]) => Object.assign(factories, modules) } } });
  provenance.push({ path: resource.rel_path, sha256: crypto.createHash('sha256').update(content).digest('hex') });
}
const assets = {};
for (const resource of [...manifest.resources.filter(item => ['images', 'fonts', 'audio'].includes(item.category)), ...supplementary]) {
  assets[resource.url] = base + resource.rel_path;
  const url = new URL(resource.url);
  if (url.hostname === 'chungdoi.com' || url.hostname === 'assets.chungdoi.com') assets[url.pathname + url.search] = base + resource.rel_path;
}
const rewrite = text => {
  if (assets[text]) return assets[text];
  for (const [original, local] of Object.entries(assets).sort((a, b) => b[0].length - a[0].length)) {
    if (original.startsWith('http')) text = text.replaceAll(original, local);
    else text = text.replaceAll(`url(${original})`, `url(${local})`).replaceAll(`url("${original}")`, `url("${local}")`).replaceAll(`url('${original}')`, `url('${local}')`);
  }
  return text;
};
const overrides = new Set([12115, 95155, 47650, 88661, 20063, 67909, 97558, 36100]);
const visited = new Set();
const modules = [];
const printer = ts.createPrinter({ removeComments: false });
function collect(id) {
  if (visited.has(id) || overrides.has(id)) return;
  visited.add(id);
  const factory = factories[id];
  if (!factory) throw new Error(`Required original module ${id} was not captured.`);
  const ast = ts.createSourceFile(`${id}.js`, `const factory = ${factory.toString()}`, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const fn = ast.statements[0].declarationList.declarations[0].initializer;
  const requireName = fn.parameters[2]?.name.text;
  const telemetry = new Set();
  const scan = node => {
    if (ts.isVariableDeclaration(node) && node.initializer && ts.isCallExpression(node.initializer)
      && node.initializer.expression.getText(ast) === requireName && node.initializer.arguments[0]?.text === '60080') telemetry.add(node.name.getText(ast));
    ts.forEachChild(node, scan);
  };
  scan(fn);
  const transformed = ts.transform(fn, [context => {
    let shadowed = 0;
    const visit = node => {
      if (id === 73873 && ts.isObjectLiteralExpression(node) && node.properties.some(property => property.name?.getText(ast).includes('template-previews/'))) {
        return ts.factory.updateObjectLiteralExpression(node, node.properties.filter(property => property.name?.getText(ast).includes('song_hy_green')));
      }
      if (id === 73873 && ts.isObjectLiteralExpression(node) && node.properties.some(property => property.name?.getText(ast).includes('s.Y4.'))) {
        return ts.factory.updateObjectLiteralExpression(node, node.properties.filter(property => property.name?.getText(ast).includes('SONG_HY_GREEN')));
      }
      if (id === 73873 && ts.isArrayLiteralExpression(node) && node.elements.some(element => ts.isObjectLiteralExpression(element) && element.properties.some(property => property.name?.getText(ast) === 'id' && property.initializer?.getText(ast).startsWith('s.Y4.')))) {
        return ts.factory.updateArrayLiteralExpression(node, node.elements.filter(element => element.getText(ast).includes('id:s.Y4.SONG_HY_GREEN,')));
      }
      if (node !== fn && ts.isFunctionLike(node) && node.parameters.some(parameter => parameter.name.getText(ast) === requireName)) {
        shadowed++;
        const result = ts.visitEachChild(node, visit, context);
        shadowed--;
        return result;
      }
      if (ts.isCallExpression(node)) {
        let callee = node.expression;
        if (ts.isParenthesizedExpression(callee)) callee = callee.expression;
        if (ts.isBinaryExpression(callee) && callee.operatorToken.kind === ts.SyntaxKind.CommaToken) callee = callee.right;
        if (ts.isPropertyAccessExpression(callee) && telemetry.has(callee.expression.getText(ast))) return ts.factory.createVoidZero();
        if (!shadowed && node.expression.getText(ast) === requireName && node.arguments[0] && ts.isNumericLiteral(node.arguments[0])) {
          const dependency = Number(node.arguments[0].text);
          if (dependency === 60080) return ts.factory.createObjectLiteralExpression();
          if (factories[dependency] || overrides.has(dependency)) collect(dependency);
        }
        if (!shadowed && ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText(ast) === requireName
          && node.expression.name.text === 'bind' && node.arguments[1] && ts.isNumericLiteral(node.arguments[1]) && factories[Number(node.arguments[1].text)]) collect(Number(node.arguments[1].text));
        if (ts.isIdentifier(node.expression) && node.expression.text === 'fetch') {
          return ts.factory.updateCallExpression(node, ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('services'), 'request'), undefined,
            node.arguments.map(argument => ts.visitNode(argument, visit)));
        }
      }
      if (ts.isStringLiteral(node)) {
        if (/^AIza[0-9A-Za-z_-]{20,}$/.test(node.text)) {
          return ts.factory.createBinaryExpression(ts.factory.createPropertyAccessExpression(ts.factory.createPropertyAccessExpression(ts.factory.createIdentifier('process'), 'env'), 'NEXT_PUBLIC_GOOGLE_MAPS_API_KEY'), ts.SyntaxKind.QuestionQuestionToken, ts.factory.createStringLiteral(''));
        }
        const value = rewrite(node.text);
        if (value !== node.text) return ts.factory.createStringLiteral(value);
      }
      return ts.visitEachChild(node, visit, context);
    };
    return node => ts.visitNode(node, visit);
  }]);
  modules.push(`${JSON.stringify(id)}: ${printer.printNode(ts.EmitHint.Expression, transformed.transformed[0], ast)}`);
  transformed.dispose();
}
for (const id of [65110, 89777, 6970, 70688]) collect(id);
fs.mkdirSync(destination, { recursive: true });
const header = `/* Generated from captured original component factories. Run frontend/scripts/import-song-hy-xanh.cjs; service calls are redirected to the project adapter and external analytics are removed. */\n`;
fs.writeFileSync(path.join(destination, 'source-runtime.js'), header + `
import * as React from 'react';
import * as JSX from 'react/jsx-runtime';
import * as ReactDOM from 'react-dom';
import dynamic from 'next/dynamic';
import { sourceService as services } from './sourceService';

export function createSourceRuntime(settings) {
  const cache = {};
  const assets = ${JSON.stringify(Object.fromEntries(Object.entries(assets).filter(([key]) => !key.includes('maps.') && !key.includes('google.'))))};
  const localProps = props => {
    if (!props) return props;
    const next = { ...props };
    for (const name of ['src', 'href', 'poster']) if (typeof next[name] === 'string' && assets[next[name]]) next[name] = assets[next[name]];
    return next;
  };
  const modules = {${modules.join(',\n')}};
  const externals = {
    12115: React, 95155: { ...JSX, jsx: (type, props, key) => JSX.jsx(type, localProps(props), key), jsxs: (type, props, key) => JSX.jsxs(type, localProps(props), key) },
    47650: { ...ReactDOM, createPortal: (children, container, key) => ReactDOM.createPortal(children, container === document.body ? settings.portal : container, key) },
    88661: { default: props => ReactDOM.createPortal(React.createElement('style', { 'data-source-style': props.id }, props.children), settings.portal, props.id), __esModule: true },
    20063: { useParams: () => ({ locale: 'vi' }), usePathname: () => window.location.pathname, useSearchParams: () => new URLSearchParams(window.location.search) },
    67909: { default: dynamic },
    97558: { n: () => settings.track },
    36100: { N7: (error, context) => console.error(error, context), Ig: (error, context) => console.error(error, context), HF: (event, context) => console.info(event, context) },
  };
  function require(id) {
    if (externals[id]) return externals[id];
    if (cache[id]) return cache[id].exports;
    if (!modules[id]) throw new Error('Uncaptured original module: ' + id);
    const module = cache[id] = { exports: {} };
    modules[id](module, module.exports, require);
    return module.exports;
  }
  require.d = (target, definitions) => { for (const key in definitions) if (!Object.hasOwn(target, key)) Object.defineProperty(target, key, { enumerable: true, get: definitions[key] }); };
  require.r = target => { Object.defineProperty(target, '__esModule', { value: true }); };
  require.n = module => { const getter = module?.__esModule ? () => module.default : () => module; require.d(getter, { a: getter }); return getter; };
  require.o = (target, key) => Object.hasOwn(target, key);
  require.e = async () => undefined;
  externals[80497] = { ...require(80497), MG: services.mapEmbed };
  return { Template: require(65110).kP, envelope: require(65110).Cc, Envelope: require(89777).m, MusicPlayer: require(43637).T, IntlProvider: require(6970).Dk, SubmissionProvider: require(28048).lk, InvitationProvider: require(70688).IA,
    normalize: data => require(90135).TH(require(90135).$G('song_hy_green', 'vi'), data) };
}
`);
const html = fs.readFileSync(path.join(archive, 'pages/demo.html'), 'utf8');
const flight = [...html.matchAll(/self\.__next_f\.push\((\[.*?\])\)<\/script>/gs)].map(match => JSON.parse(match[1])).filter(chunk => chunk[0] === 1).map(chunk => chunk[1]).join('');
let messages;
const findMessages = node => {
  if (!node || typeof node !== 'object') return;
  if (node.messages?.guestWishFailed) messages = node.messages;
  Object.values(node).forEach(findMessages);
};
for (const line of flight.split('\n')) {
  try { findMessages(JSON.parse(line.slice(line.indexOf(':') + 1))); } catch (error) { if (!(error instanceof SyntaxError)) throw error; }
}
if (!messages) throw new Error('Original locale messages were not found.');
messages.wishModal.aiWishButton = 'Xem lời chúc gợi ý';
messages.wishModal.loading = 'Đang tải lời chúc...';
messages.wishModal.error = 'Không thể tải lời chúc gợi ý. Vui lòng thử lại!';
messages.wishModal.regenerateAI = '↻ Xem gợi ý';
messages.wishModal.generateAI = '✨ Xem gợi ý';
const writeJson = (name, value) => fs.writeFileSync(path.join(destination, name), JSON.stringify(value, null, 2) + '\n');
writeJson('source-messages.json', messages);
writeJson('qr-assets.json', Object.fromEntries(manifest.resources.filter(resource => new URL(resource.url).pathname === '/api/qr-png')
  .map(resource => [new URL(resource.url).searchParams.get('d'), base + resource.rel_path])));
const defaults = playback.invitation.initialData.data;
function rewriteData(value) {
  if (typeof value === 'string') return rewrite(value);
  if (Array.isArray(value)) return value.map(rewriteData);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, rewriteData(item)]));
  return value;
}
const data = rewriteData(defaults);
data.comments = playback.invitation.staticComments;
data.musicTrackId = undefined;
writeJson('source-defaults.json', data);
writeJson('source-provenance.json', { entry: 65110, envelope: 89777, moduleIds: [...visited], sourceFiles: provenance,
  adaptations: ['React and ReactDOM use the project runtime', 'RSVP and wishes use project services', 'External analytics removed', 'Captured music replaced with Le Duong by user request'] });
let css = manifest.resources.filter(resource => resource.category === 'styles').map(resource => rewrite(fs.readFileSync(path.join(archive, resource.rel_path), 'utf8'))).join('\n');
const parsed = postcss.parse(css);
const fonts = [];
parsed.walkAtRules('font-face', rule => { fonts.push(rule.toString()); });
const initialProperties = [];
parsed.walkAtRules('property', rule => {
  const initial = rule.nodes.find(node => node.prop === 'initial-value')?.value;
  if (initial) initialProperties.push(`${rule.params}:${initial}`);
});
css = parsed.toString().replace(/:root\b/g, ':host');
css += `\n:host{display:block;${initialProperties.join(';')}}\n@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}\n`;
const design = path.join(root, 'frontend/public/template-designs/song-hy-green');
fs.mkdirSync(design, { recursive: true });
fs.writeFileSync(path.join(design, 'v1.css'), css);
fs.writeFileSync(path.join(destination, 'source-fonts.css'), fonts.join('\n') + '\n');
const shortName = name => name.trim().split(/\s+/).slice(-2).join(' ');
const definition = {
  id: 'song-hy-xanh', category: 'wedding', title: 'Song Hỷ Xanh', style: 'Truyền thống · Song hỷ xanh lá', views: '0', likes: '0', badge: 'Miễn phí', categoryLabel: 'Cưới',
  imageUrl: data.heroPhoto, description: playback.invitation.demoConfig.description,
  defaultData: { groomName: data.groomFullName, brideName: data.brideFullName, groomPhone: '', bridePhone: '', eventDate: data.date, eventTime: data.banquetTime, venueName: 'Gala Center', venueAddress: data.address.vi, coverImageUrl: data.heroPhoto,
    ceremonyTime: data.ceremonies[0].time, groomFather: data.groomFather, groomMother: data.groomMother, brideFather: data.brideFather, brideMother: data.brideMother },
  schema: { version: 1, template: { id: 'song-hy-green', version: 1 }, layoutMode: 'STACK',
    theme: { primaryColor: '#1F3A25', backgroundColor: '#fff7eb', headingFont: 'Big Caslon', bodyFont: 'Baskerville' },
    effects: { fallingType: 'NONE', musicUrl: '/' + playback.audio.objectKey },
    blocks: [{ id: 'song-hy-content', type: 'SONG_HY_GREEN', props: { title: 'Nội dung Song Hỷ Xanh', data: { ...data, groomShortName: shortName(data.groomFullName), brideShortName: shortName(data.brideFullName) } } }] }
};
for (const relative of ['frontend/src/data/templates/song-hy-xanh.json', 'backend/src/main/resources/templates/song-hy-xanh.json']) {
  fs.writeFileSync(path.join(root, relative), JSON.stringify(definition, null, 2) + '\n');
}
console.log(`Imported original native Song Hy components: ${visited.size} modules; original props and styles preserved.`);
