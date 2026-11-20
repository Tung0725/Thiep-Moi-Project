import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, 'extracted_templates/song-hy-xanh/browser-check');
await fs.mkdir(output, { recursive: true });
const behaviorOnly = process.argv.includes('--behavior');
const reportPath = path.join(output, behaviorOnly ? 'behavior-report.json' : 'report.json');
await fs.writeFile(reportPath, JSON.stringify({ status: 'running' }));
const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
const backend = process.env.BACKEND_URL || 'http://localhost:8080/api/v1';
const reference = process.env.REFERENCE_URL || 'http://localhost:3101/vi/mau-thiep/song-hy-xanh/demo';
const debug = `http://localhost:${process.env.CDP_PORT || 9224}`;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const tabs = await (await fetch(`${debug}/json`)).json();
const socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
let id = 0;
const pending = new Map();
const errors = [];
const referenceErrors = [];
const contextOrigins = new Map();
const failures = [];
const results = [];
const call = (method, params = {}) => new Promise((resolve, reject) => {
  pending.set(++id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
});
socket.onmessage = event => {
  const message = JSON.parse(event.data);
  if (message.id) {
    const request = pending.get(message.id); pending.delete(message.id);
    if (message.error) request?.reject(Error(JSON.stringify(message.error))); else request?.resolve(message.result);
  }
  if (message.method === 'Runtime.executionContextCreated') contextOrigins.set(message.params.context.id, message.params.context.origin);
  if (message.method === 'Runtime.exceptionThrown') {
    const detail = message.params.exceptionDetails;
    (detail.url?.startsWith(new URL(reference).origin) ? referenceErrors : errors).push(detail);
  }
  if (message.method === 'Runtime.consoleAPICalled' && ['error', 'warning'].includes(message.params.type)) {
    (contextOrigins.get(message.params.executionContextId) === new URL(reference).origin ? referenceErrors : errors).push(message.params.args.map(arg => arg.value || arg.description));
  }
  if (message.method === 'Network.responseReceived' && message.params.response.status >= 400 && message.params.response.url.startsWith(origin)) failures.push(message.params.response);
};
const evaluate = async expression => {
  const response = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
};
const waitFor = async expression => {
  for (let count = 0; count < 150; count++) { if (await evaluate(`Boolean(${expression})`)) return; await delay(100); }
  throw Error(`Timed out: ${expression}`);
};
const navigate = async url => { await call('Page.navigate', { url }); await waitFor('document.readyState === "complete"'); };
const shot = async name => {
  const image = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
  await fs.writeFile(path.join(output, `${name}.png`), Buffer.from(image.data, 'base64'));
};
const scope = "(document.querySelector('[data-template]')?.shadowRoot || document)";
const cover = `${scope}.querySelector('a[href*="open=1"],a[href="#invitation"]')`;
const setField = async (selector, value, shadow = false) => {
  await evaluate(`(()=>{const field=${shadow ? scope : 'document'}.querySelector(${JSON.stringify(selector)});if(!field)throw Error('Missing input');const proto=field.tagName==='TEXTAREA'?HTMLTextAreaElement:HTMLInputElement;Object.getOwnPropertyDescriptor(proto.prototype,'value').set.call(field,${JSON.stringify(value)});field.dispatchEvent(new Event('input',{bubbles:true}));field.dispatchEvent(new Event('change',{bubbles:true}));})()`);
};
const openInvitation = async () => {
  await waitFor(`${cover} && Object.keys(${cover}).some(key=>key.startsWith('__reactProps'))`);
  await evaluate(`${cover}.click()`);
  await waitFor(`(${scope}.querySelector('[data-testid="song-hy-green-template"]')?.getBoundingClientRect().width || 0) > 0`);
  await evaluate('document.fonts.ready.then(()=>true)');
  await delay(250);
};
const metrics = async () => evaluate(`(()=>{const s=${scope};const card=s.querySelector('[data-showcase-root]')||s.querySelector('[data-testid]');const box=card.getBoundingClientRect();return {text:card.innerText.replace(/\\s+/g,' ').trim(),width:box.width,height:box.height,overflow:document.documentElement.scrollWidth>innerWidth,images:[...card.querySelectorAll('img')].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),headings:[...card.querySelectorAll('header,section,footer')].map(i=>({tag:i.tagName,y:i.getBoundingClientRect().top-box.top,height:i.getBoundingClientRect().height}))}})()`);
try {
  await call('Page.enable');
  await call('Page.navigate', { url: 'about:blank' });
  await delay(100);
  await call('Runtime.discardConsoleEntries');
  await call('Runtime.enable'); await call('Network.enable');
  await call('Emulation.setFocusEmulationEnabled', { enabled: true });
  const templateResponse = await fetch(`${backend}/templates/song-hy-xanh`);
  assert.equal(templateResponse.status, 200);
  const template = (await templateResponse.json()).data;
  assert.equal(JSON.parse(template.contentSchema).template.id, 'song-hy-green');
  if (behaviorOnly) {
    const previous = JSON.parse(await fs.readFile(path.join(output, 'report.json'), 'utf8'));
    const slug = process.env.INVITATION_SLUG || previous.results.find(result => result.slug).slug;
    await call('Emulation.setDeviceMetricsOverride', { width: 375, height: 920, deviceScaleFactor: 1, mobile: false });
    await navigate(`${origin}/t/${slug}`); await openInvitation();
    await delay(2400);
    const scrollStart = await evaluate('window.scrollY');
    await delay(500);
    const scrollEnd = await evaluate('window.scrollY');
    assert(scrollStart > 0 && scrollEnd - scrollStart >= 15 && scrollEnd - scrollStart <= 40, 'Auto-scroll speed differs from source');
    await evaluate(`${scope}.querySelector('input[type=text]').focus({preventScroll:true})`);
    const paused = await evaluate('window.scrollY');
    await delay(550);
    assert(Math.abs(await evaluate('window.scrollY') - paused) <= 1, 'Auto-scroll moved while editing');
    await evaluate(`${scope}.activeElement.blur()`);
    await delay(500);
    await evaluate(`${scope}.querySelector('header p').click()`);
    await delay(500);
    const resumed = await evaluate('window.scrollY');
    assert(resumed > paused + 10, 'Blank-area click did not resume auto-scroll');
    await evaluate("window.dispatchEvent(new WheelEvent('wheel',{deltaY:60}))");
    await setField('input[type=text]', 'Khách gửi lời chúc', true);
    await setField('textarea', 'Lời chúc kiểm chứng Song Hỷ Xanh: trăm năm hạnh phúc!', true);
    await evaluate(`${scope}.querySelector('textarea').closest('form').requestSubmit()`);
    let savedWish;
    for (let attempt = 0; attempt < 30; attempt++) {
      const response = await fetch(`${backend}/public/invitations/${slug}/wishes?size=100`);
      savedWish = (await response.json()).data.content.find(wish => wish.guestName === 'Khách gửi lời chúc');
      if (savedWish) break;
      await delay(100);
    }
    assert(savedWish?.message.includes('trăm năm hạnh phúc'));
    assert.equal(savedWish.attendanceStatus, 'MAYBE');
    await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await navigate(`${origin}/t/${slug}`);
    await waitFor("document.querySelector('[data-template]')?.dataset.invitationOpen === 'true'");
    await waitFor(`${scope}.querySelector('[data-testid]')?.getBoundingClientRect().width > 0`);
    await delay(300);
    assert.equal(await evaluate(`${scope}.getAnimations().filter(animation=>animation.playState==='running').length`), 0);
    assert.notEqual(await evaluate('document.documentElement.style.overflow'), 'hidden');
    await shot('reduced-motion');
    await call('Emulation.setEmulatedMedia', { features: [] });
    results.push({ slug, scrollStart, scrollEnd, paused, resumed, savedWish, reducedMotion: 'passed' });
    assert.deepEqual(errors, []); assert.deepEqual(failures, []);
    await fs.writeFile(reportPath, JSON.stringify({ status: 'passed', results, errors, failures }, null, 2));
    console.log('PASS: auto-scroll speed, editing pause/resume, persisted guestbook, reduced motion.');
  } else {
  for (const width of [375, 1280]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 920, deviceScaleFactor: 1, mobile: false });
    const comparison = {};
    for (const [name, url] of [['source', `${reference}?screenshot=true`], ['native', `${origin}/templates/song-hy-xanh?screenshot=true`]]) {
      await navigate(url);
      await openInvitation();
      await evaluate('window.scrollTo(0,0)');
      comparison[name] = await metrics();
      await shot(`${name}-${width}`);
      assert(!comparison[name].overflow, `${name} horizontal overflow at ${width}`);
      assert.deepEqual(comparison[name].images, [], `${name} broken image`);
    }
    assert.equal(comparison.native.text, comparison.source.text, `Source text mismatch at ${width}`);
    assert.equal(comparison.native.width, comparison.source.width, `Card width mismatch at ${width}`);
    assert(Math.abs(comparison.native.height - comparison.source.height) <= 1.1, `Card height mismatch at ${width}`);
    results.push({ width, comparison });
  }
  const motion = {};
  for (const width of [375, 1280]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 920, deviceScaleFactor: 1, mobile: false });
    for (const [name, url] of [['source', `${reference}?screenshot=true`], ['native', `${origin}/templates/song-hy-xanh?screenshot=true`]]) {
      await navigate(url);
      await waitFor(`${cover} && Object.keys(${cover}).some(key=>key.startsWith('__reactProps'))`);
      await evaluate('document.fonts.ready.then(()=>true)');
      await delay(300);
      const sample = () => evaluate(`(()=>{const s=${scope};const cover=s.querySelector('[data-landing-screenshot-id="invite-envelope"]');return {elapsed:performance.now()-(window.songHyOpeningStart||performance.now()),animations:s.getAnimations().filter(a=>cover?.contains(a.effect?.target)).map(a=>a.animationName).filter(Boolean),opened:!cover}})()`);
      const idle = await sample();
      assert(idle.animations.includes('seal-pulse'), `${name} idle seal motion missing`);
      await shot(`${name}-${width}-cover`);
      await evaluate(`window.songHyOpeningStart=performance.now();${cover}.click();${cover}?.click()`);
      const start = Date.now();
      const frames = [];
      for (const target of [200, 650, 1050, 1500]) {
        await delay(Math.max(0, target - (Date.now() - start)));
        const frame = await sample(); frames.push(frame);
        await shot(`${name}-${width}-opening-${target}`);
      }
      assert(frames[0].animations.includes('seal-break'), `${name} seal does not break`);
      assert(frames[0].animations.filter(animation => animation === 'dragon-fly-forward').length === 2, `${name} must retain both flying decorations`);
      assert(frames[1].animations.includes('envelope-away'), `${name} envelope does not move away`);
      assert.equal(frames[1].animations.filter(animation => animation === 'particle-burst').length, 32);
      assert(frames[3].opened, `${name} opening is not complete`);
      motion[`${name}-${width}`] = { idle, frames };
    }
    for (const index of [0, 1, 2]) {
      const counts = key => motion[key].frames[index].animations.reduce((result, animation) => ({ ...result, [animation]: (result[animation] || 0) + 1 }), {});
      assert.deepEqual(counts(`native-${width}`), counts(`source-${width}`), `Opening animation set mismatch at ${width}, frame ${index}`);
    }
  }
  results.push({ motion });
  const gallery = await evaluate(`(()=>{const s=${scope};s.querySelector('button[aria-label="Go to photo 3"]').click();return Boolean(s.querySelector('button[aria-label="Next photo"]'))})()`);
  assert(gallery);
  await delay(250);
  await evaluate(`(()=>{const s=${scope};const card=[...s.querySelectorAll('div')].filter(element=>element.className.startsWith('absolute h-[92%]')).sort((a,b)=>Number(b.style.zIndex)-Number(a.style.zIndex))[0];if(!card)throw Error('Missing original gallery card');card.click()})()`);
  await waitFor(`${scope}.querySelector('dialog[open]')`);
  await evaluate(`${scope}.querySelector('button[aria-label="Next image"]').click()`);
  await shot('native-gallery-lightbox');
  await evaluate(`${scope}.querySelector('button[aria-label="Close lightbox"]').click()`);
  await evaluate(`${scope}.querySelector('button[aria-label="Mở hộp mừng cưới"]').scrollIntoView()`);
  const giftMotion = await evaluate(`(()=>{const s=${scope};const target=s.querySelector('.igb-bob');return {before:getComputedStyle(target).transform,names:target.getAnimations().map(a=>a.animationName)}})()`);
  await delay(250);
  giftMotion.after = await evaluate(`getComputedStyle(${scope}.querySelector('.igb-bob')).transform`);
  assert(giftMotion.names.includes('igbGiftBob') && giftMotion.before !== giftMotion.after);
  await evaluate(`${scope}.querySelector('button[aria-label="Mở hộp mừng cưới"]').click()`);
  await waitFor(`${scope}.querySelector('dialog[open]')`);
  await shot('native-gift-dialog');
  assert(await evaluate(`${scope}.querySelector('dialog[open]').textContent.includes('Vo Hai Nam')`));
  await evaluate(`${scope}.querySelector('dialog[open] button').click()`);
  results.push({ galleryLightbox: 'passed', giftMotion, giftDialog: 'passed' });
  await navigate(`${origin}/create?templateId=song-hy-xanh`);
  await waitFor("document.querySelector('input[name=groomName]')?.value==='Võ Hải Nam'");
  for (const [name, value] of Object.entries({ groomName: 'Nguyễn Minh Quân', brideName: 'Trần Hà Linh', eventDate: '2028-02-29', eventTime: '19:15', ceremonyTime: '10:30', venueName: 'Nhà hàng kiểm chứng', venueAddress: '123 Nguyễn Huệ, TP. Hồ Chí Minh', groomFather: 'Nguyễn Văn Bình' })) {
    await setField(`input[name=${name}]`, value); await delay(50);
  }
  await evaluate("document.querySelector('form').requestSubmit()");
  await waitFor("location.pathname.startsWith('/t/')");
  const slug = await evaluate("location.pathname.split('/').pop()");
  await waitFor("document.querySelector('[data-template]')?.shadowRoot?.querySelector('a')");
  await openInvitation();
  const savedResponse = await fetch(`${backend}/public/invitations/${slug}`);
  assert.equal(savedResponse.status, 200);
  const saved = (await savedResponse.json()).data;
  const schema = JSON.parse(saved.contentSchema);
  const data = schema.blocks[0].props.data;
  assert.equal(data.groomFullName, 'Nguyễn Minh Quân');
  assert.equal(data.brideFullName, 'Trần Hà Linh');
  assert.equal(data.ceremonies[0].time, '10:30');
  assert.equal(data.date, '2028-02-29');
  assert.equal(data.banquetTime, '19:15');
  assert.deepEqual(data.giftMethods, []);
  const publicText = await evaluate(`${scope}.querySelector('[data-testid]').innerText`);
  assert(publicText.includes('Nguyễn Minh Quân') && publicText.includes('Nguyễn Văn Bình'));
  assert(!publicText.includes('Hải Nam') && !publicText.includes('Khánh Linh'));
  for (const [choice, status, name] of [['yes', 'ATTENDING', 'Khách xác nhận đến'], ['no', 'DECLINED', 'Khách xin vắng mặt']]) {
    await evaluate(`${scope}.querySelectorAll('button').forEach(b=>{if(b.textContent.trim()==='XÁC NHẬN THAM DỰ')b.click()})`);
    await waitFor(`${scope}.querySelector('input[name=attending]')`);
    const fieldSelector = `${scope}.querySelector('input[name=attending]').closest('form')`;
    await evaluate(`(()=>{const f=${fieldSelector};const field=f.querySelector('input[type=text]');Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(field,${JSON.stringify(name)});field.dispatchEvent(new Event('input',{bubbles:true}));f.querySelector('input[value=${choice}]').click()})()`);
    await delay(100);
    await evaluate(`${fieldSelector}.requestSubmit()`);
    await waitFor(`${scope}.textContent.includes('Cảm ơn') || !${scope}.querySelector('input[name=attending]')`);
    const wishesResponse = await fetch(`${backend}/public/invitations/${slug}/wishes?size=100`);
    const wishes = (await wishesResponse.json()).data.content;
    const wish = wishes.find(item => item.guestName === name);
    assert(wish, `RSVP not saved for ${choice}`);
    assert.equal(wish.attendanceStatus, status);
    assert.equal(wish.guestCount, choice === 'no' ? 0 : 1);
    await navigate(`${origin}/t/${slug}?screenshot=true`); await openInvitation();
  }
  await shot('personalized-public');
  results.push({ slug, publicUrl: `${origin}/t/${slug}`, savedSchema: schema });
  assert.deepEqual(errors, []); assert.deepEqual(failures, []);
  await fs.writeFile(reportPath, JSON.stringify({ status: 'passed', results, errors, referenceErrors, failures }, null, 2));
  console.log(`PASS: reference comparison, real editor publication, both RSVP choices; ${origin}/t/${slug}`);
  }
} catch (error) {
  await fs.writeFile(reportPath, JSON.stringify({ status: 'failed', error: String(error), results, errors, referenceErrors, failures }, null, 2));
  console.error(error); process.exitCode = 1;
} finally { socket.close(); }
