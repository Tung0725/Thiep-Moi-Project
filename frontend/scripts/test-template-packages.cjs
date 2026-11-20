const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Module = require('node:module');
const ts = require('typescript');

const resolve = Module._resolveFilename;
Module._resolveFilename = function (request, ...args) {
  return resolve.call(this, request.startsWith('@/') ? path.join(__dirname, '../src', request.slice(2)) : request, ...args);
};
const load = Module._load;
Module._load = function (request, ...args) {
  if (request === 'next/dynamic') return { __esModule: true, default: () => () => null };
  return load.call(this, request, ...args);
};
require.extensions['.ts'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
}).outputText, filename);

const { resolveTemplate, pinTemplate } = require('../src/templates/registry.ts');
const { DEFAULT_TEMPLATES } = require('../src/data/defaultTemplates.ts');
const minimalism = DEFAULT_TEMPLATES.find(template => template.id === 'minimalism-do-dam');
const hb04 = DEFAULT_TEMPLATES.find(template => template.id === 'hb04-basic');
const songHy = DEFAULT_TEMPLATES.find(template => template.id === 'song-hy-xanh');

test('Song Hy keeps source content and clears demo gift accounts when the couple changes', () => {
  const before = JSON.stringify(songHy.schema);
  const template = resolveTemplate(songHy.schema);
  const result = template.personalize(songHy.schema, { ...songHy.defaultData,
    groomName: 'Nguyễn Minh Quân', brideName: 'Trần Hà Linh', eventDate: '2028-02-29', eventTime: '19:15',
    ceremonyTime: '10:30', groomFather: 'Nguyễn Văn Bình', venueAddress: 'Địa chỉ mới', venueName: 'Nhà hàng mới',
  }, songHy.defaultData);
  const data = result.blocks[0].props.data;
  assert.equal(result.template.id, 'song-hy-green');
  assert.equal(data.groomFullName, 'Nguyễn Minh Quân');
  assert.equal(data.groomShortName, 'Minh Quân');
  assert.equal(data.groomFather, 'Nguyễn Văn Bình');
  assert.equal(data.ceremonies[0].date, '2028-02-29');
  assert.equal(data.ceremonies[0].time, '10:30');
  assert.equal(data.banquetTime, '19:15');
  assert.equal(data.address.vi, 'Địa chỉ mới');
  assert.equal(data.placeId, '');
  assert.deepEqual(data.giftMethods, []);
  assert.equal(data.groomAccountNumber, '');
  assert.equal(data.brideAccountNumber, '');
  assert.equal(data.galleryImages.length, 6);
  assert.equal(JSON.stringify(songHy.schema), before);
});

test('Song Hy preserves original timeline discrepancy and selects the approved stored music', () => {
  const result = resolveTemplate(songHy.schema).personalize(songHy.schema, songHy.defaultData, songHy.defaultData);
  const data = result.blocks[0].props.data;
  assert.equal(data.banquetTime, '18:00');
  assert.equal(data.timelineEvents[1].time, '18:30');
  assert.equal(data.giftMethods.length, 2);
  assert.equal(data.comments.length, 6);
  assert.equal(data.dresscodeColors.length, 3);
  assert.match(result.effects.musicUrl, /song-hy-xanh\/archive\/audio\/le-duong\.mp3$/);
});

test('legacy schemas resolve to their original package and unknown versions never fall back', () => {
  const legacy = structuredClone(minimalism.schema);
  delete legacy.template;
  assert.equal(resolveTemplate(legacy).id, 'minimalism-dark-red');
  assert.equal(resolveTemplate({ ...hb04.schema, template: undefined }).id, 'hb04');
  assert.equal(resolveTemplate({ ...legacy, template: { id: 'minimalism-dark-red', version: 999 } }), undefined);
  assert.deepEqual(pinTemplate(legacy).template, { id: 'minimalism-dark-red', version: 1 });
});

test('personalization preserves layout and independently updates banquet and ceremony', () => {
  const original = JSON.stringify(minimalism.schema);
  const template = resolveTemplate(minimalism.schema);
  const schema = template.personalize(minimalism.schema, { ...minimalism.defaultData, groomName: 'Nguyen Minh Quan', eventDate: '2027-06-20', eventTime: '18:45', venueName: 'New Venue' }, minimalism.defaultData);
  const events = schema.blocks.filter(block => block.type === 'EVENTS');
  assert.equal(events[0].props.groomEvents[0].timeText, '09:00');
  assert.equal(events[1].props.groomEvents[0].timeText, '18:45');
  assert.equal(events[1].props.groomEvents[0].locationName, 'New Venue');
  assert.equal(events[1].props.receptionTime, '18:15');
  assert.deepEqual(events[1].props.timeline.map(item => item.time), ['17:45', '18:45', '19:15', '19:45', '21:15']);
  assert.equal(schema.blocks.find(block => block.type === 'GIFTBOX').props.groomAccount, undefined);
  assert.equal(JSON.stringify(minimalism.schema), original);
});

test('custom theme, hidden sections, order and renderer version survive personalization', () => {
  for (const template of [minimalism, hb04]) {
    const schema = structuredClone(template.schema);
    schema.theme.primaryColor = '#123456';
    schema.blocks.reverse();
    schema.blocks[0].isHidden = true;
    const result = pinTemplate(resolveTemplate(schema).personalize(schema, template.defaultData, template.defaultData));
    assert.equal(result.theme.primaryColor, '#123456');
    assert.equal(result.blocks[0].id, schema.blocks[0].id);
    assert.equal(result.blocks[0].isHidden, true);
    assert.equal(result.template.version, template.schema.template.version);
    assert(result.blocks.every(block => resolveTemplate(result).supportedBlocks.includes(block.type)));
  }
});

const { originalData } = require('../src/templates/minimalism-dark-red/originalBindings.ts');
const layout = require('../src/templates/minimalism-dark-red/source-layout.json');
const nodes = node => typeof node === 'string' ? [] : [node, ...node.children.flatMap(nodes)];

test('imported RSVP preserves two distinct values and every text binding resolves', () => {
  assert.deepEqual(nodes(layout.rsvp).filter(node => node.tag === 'input' && node.attrs.type === 'radio').map(node => node.attrs.value), ['yes', 'no']);
  const data = originalData(minimalism.schema);
  for (const root of [layout.cover, layout.gift, ...Object.values(layout.sections).flat()]) {
    for (const node of nodes(root)) {
      const binding = node.attrs['data-text-binding'];
      if (binding) assert.equal(typeof data.boundText(binding), 'string', binding);
    }
  }
  assert.throws(() => data.boundText('unsupported.field'), /Unsupported/);
});

test('component-injected cover and gift styles retain every required source keyframe', () => {
  const css = require('postcss').parse(fs.readFileSync(path.join(__dirname, '../public/template-designs/minimalism-dark-red/v2.css'), 'utf8'));
  const keyframes = new Set();
  css.walkAtRules('keyframes', rule => keyframes.add(rule.params));
  assert.equal(layout.provenance.motionSources.length, 2);
  for (const source of layout.provenance.motionSources) {
    assert.match(source.sha256, /^[a-f0-9]{64}$/);
    for (const name of source.required) assert(keyframes.has(name), `Missing motion keyframes: ${name}`);
  }
  const parts = nodes(layout.cover).map(node => node.attrs['data-cover-part']);
  assert(parts.includes('card') && parts.includes('seal'));
  assert.equal(layout.provenance.openingConfig.moduleId, 90662);
  assert.match(layout.provenance.openingConfig.sha256, /^[a-f0-9]{64}$/);
  assert.deepEqual(layout.coverMotion.particleColors, ['#7a1f26', '#a8323b', '#c9a24a', '#ece4d8']);
  assert.equal(layout.coverMotion.flyingDecorations.length, 2);
  assert.deepEqual(layout.coverMotion.flyingDecorations.map(node => node.children[0].attrs.style['--fly-scale-x']), ['1', '-1']);
  assert(layout.coverMotion.flyingDecorations.every(node => node.children[0].attrs.style.animation === 'dragon-fly-forward 1.2s ease-in forwards'));
});

test('source bindings independently render ceremony date/time, banquet, names and gift accounts', () => {
  const schema = structuredClone(minimalism.schema);
  const ceremony = schema.blocks.find(block => block.type === 'EVENTS' && block.props.groomEvents[0].id === 'ceremony');
  const banquet = schema.blocks.find(block => block.type === 'EVENTS' && block.props.groomEvents[0].id === 'banquet');
  ceremony.props.groomEvents[0] = { ...ceremony.props.groomEvents[0], dateText: '2028-02-29', timeText: '10:15', locationName: 'Nhà thờ mới' };
  banquet.props.groomEvents[0] = { ...banquet.props.groomEvents[0], dateText: '2028-03-01', timeText: '19:45', address: 'Địa chỉ tiệc mới' };
  banquet.props.timeline[0].time = '19:00';
  schema.blocks.find(block => block.type === 'COUPLE').props.groom.name = 'Nguyễn Đặng Hoàng Long Quân';
  schema.blocks.find(block => block.type === 'GIFTBOX').props = { brideAccount: { label: 'Cô dâu', ownerName: 'HÀ LINH', bankName: 'Ngân hàng mới', accountNumber: '123', qrCodeUrl: '/new-qr.png' } };
  const data = originalData(schema);
  assert.equal(data.boundText('groom.name'), 'Nguyễn Đặng Hoàng Long Quân');
  assert.equal(data.boundText('ceremony.day'), '29');
  assert.equal(data.boundText('ceremony.month'), 'THÁNG 02');
  assert.equal(data.boundText('ceremony.timeLabel'), 'VÀO LÚC 10:15');
  assert(data.boundText('ceremony.venueLabel').includes('Nhà thờ mới'));
  assert.equal(data.boundText('banquet.day'), '01');
  assert.equal(data.boundText('banquet.time'), '19:45');
  assert.equal(data.boundText('banquet.address'), 'Địa chỉ tiệc mới');
  assert.equal(data.boundText('timeline.0.time'), '19:00');
  assert.equal(data.boundText('groom.account.ownerName'), '');
  assert.equal(data.boundText('bride.account.ownerName'), 'HÀ LINH');
});
