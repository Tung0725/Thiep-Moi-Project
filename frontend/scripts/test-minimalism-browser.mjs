import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const motion = process.argv.includes('--motion');
const scroll = process.argv.includes('--scroll');
const live = process.argv.includes('--live') || motion || scroll;
const template = JSON.parse(await fs.readFile(path.join(root, 'frontend/src/data/templates/minimalism-do-dam.json'), 'utf8'));
const manifest = JSON.parse(await fs.readFile(path.join(root, 'extracted_templates/manifest.json'), 'utf8'));
const output = path.join(root, 'extracted_templates/browser-check', scroll ? 'minimalism-scroll' : motion ? 'minimalism-motion' : live ? 'minimalism-live' : 'minimalism-repair');
await fs.mkdir(output, { recursive: true });
if (motion || scroll) await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ status: 'running', startedAt: new Date().toISOString() }, null, 2));
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'minimalism-browser-'));
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check', 'about:blank',
], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let chromeLog = '';
chrome.stderr.on('data', chunk => { chromeLog += chunk.toString(); });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let launchError;
chrome.on('error', error => { launchError = error; });
let socket;
let call;
const pending = new Map();
const errors = [];
const wishes = [];
let stored;
let schema = structuredClone(template.schema);
const origin = process.env.FRONTEND_URL || (live ? 'http://localhost:3000' : 'http://127.0.0.1:3000');
try {
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (launchError) throw launchError;
    try { port = (await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await delay(100); }
  }
  assert(port, 'Chrome did not start');
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  socket.onclose = event => { for (const request of pending.values()) request.reject(new Error(`Chrome connection closed: ${event.code} ${event.reason}\n${chromeLog}`)); pending.clear(); };
  let id = 0;
  call = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
  });
  const fulfill = (requestId, body, contentType = 'application/json', status = 200) => call('Fetch.fulfillRequest', {
    requestId, responseCode: status, body: Buffer.from(body).toString('base64'),
    responseHeaders: [{ name: 'Content-Type', value: contentType }, { name: 'Access-Control-Allow-Origin', value: origin }, { name: 'Access-Control-Allow-Credentials', value: 'true' }, { name: 'Access-Control-Allow-Headers', value: 'content-type' }, { name: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' }],
  });
  socket.onmessage = async event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request?.reject(new Error(JSON.stringify(message.error))); else request?.resolve(message.result);
      return;
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
    if (message.method !== 'Fetch.requestPaused') return;
    const { requestId, request } = message.params;
    try {
      const url = new URL(request.url);
      if (url.pathname.includes('/archive/')) {
        const relative = url.pathname.split('/archive/')[1];
        const asset = manifest.resources.find(item => item.rel_path === relative);
        if (!asset) return await fulfill(requestId, 'Missing archive resource', 'text/plain', 404);
        return await fulfill(requestId, await fs.readFile(path.join(root, 'extracted_templates', asset.rel_path)), asset.content_type);
      }
      if (url.hostname.includes('google')) return await fulfill(requestId, '<html></html>', 'text/html');
      if (request.method === 'OPTIONS') return await fulfill(requestId, '');
      let data;
      if (url.pathname.includes('/templates/')) data = { ...template, code: template.id, contentSchema: JSON.stringify(template.schema), defaultData: JSON.stringify(template.defaultData) };
      else if (url.pathname.endsWith('/quick-create')) {
        stored = JSON.parse(request.postData);
        schema = JSON.parse(stored.contentSchema);
        data = { id: 1, slug: 'repair-test', title: 'Repair test' };
      } else if (url.pathname.endsWith('/wishes')) {
        if (request.method === 'POST') {
          data = { ...JSON.parse(request.postData), id: wishes.length + 1, createdAt: new Date().toISOString() };
          wishes.push(data);
        } else data = { content: [...wishes].reverse(), totalElements: wishes.length, last: true };
      } else data = { slug: 'repair-test', title: 'Repair test', contentSchema: JSON.stringify(schema) };
      await fulfill(requestId, JSON.stringify({ data }));
    } catch (error) { errors.push(String(error)); await fulfill(requestId, 'Test interception failed', 'text/plain', 500); }
  };
  await call('Page.enable');
  await call('Runtime.enable');
  if (!live) await call('Fetch.enable', { patterns: [{ urlPattern: '*api/v1/*' }, { urlPattern: '*/templates/minimalism-do-dam/archive/*' }, { urlPattern: '*maps.google.com/*' }] });
  const evaluate = async expression => {
    const response = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  };
  const waitFor = async expression => {
    for (let attempt = 0; attempt < 160; attempt++) { if (await evaluate(expression)) return; await delay(100); }
    throw new Error(`Timed out: ${expression}`);
  };
  const inRoot = expression => evaluate(`(()=>{const root=document.querySelector('[data-template="minimalism-original-v2"]').shadowRoot;return ${expression}})()`);
  const field = async (selector, value, shadow = false) => {
    const expression = `(()=>{const input=${shadow ? 'root' : 'document'}.querySelector(${JSON.stringify(selector)});const type=input.tagName==='TEXTAREA'?HTMLTextAreaElement:HTMLInputElement;Object.getOwnPropertyDescriptor(type.prototype,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));})()`;
    if (shadow) await inRoot(expression); else await evaluate(expression);
    await delay(80);
  };
  const navigate = async route => {
    await call('Page.navigate', { url: origin + route });
    await waitFor(`Boolean(document.querySelector('[data-template="minimalism-original-v2"]')?.shadowRoot?.querySelector('a[href="#invitation"]'))`);
    await inRoot('root.querySelector(\'a[href="#invitation"]\').click()');
    await waitFor(`document.querySelector('[data-template]')?.dataset.invitationOpen==='true'`);
    await evaluate('document.fonts.ready');
  };
  if (scroll) {
    const report = [];
    await call('Page.addScriptToEvaluateOnNewDocument', { source: 'window.__scrollTrace=[];const originalScrollTo=window.scrollTo;window.scrollTo=function(...args){window.__scrollTrace.push({time:performance.now(),args});return originalScrollTo.apply(window,args)}' });
    const reference = process.env.REFERENCE_URL || 'http://localhost:3100/vi/mau-thiep/minimalism-do-dam/demo';
    const saved = JSON.parse(await fs.readFile(path.join(root, 'extracted_templates/browser-check/minimalism-live/report.json'), 'utf8'));
    const slug = process.env.INVITATION_SLUG || saved.slug;
    for (const [label, url] of [['reference', reference], ['template', `${origin}/templates/minimalism-do-dam`], ['public', `${origin}/t/${slug}`]]) {
      await call('Emulation.setDeviceMetricsOverride', { width: 375, height: 920, deviceScaleFactor: 1, mobile: false });
      await call('Page.navigate', { url });
      const rootExpression = label === 'reference' ? 'document' : 'document.querySelector(\'[data-template="minimalism-original-v2"]\')?.shadowRoot';
      const scope = expression => evaluate(`(()=>{const root=${rootExpression};return ${expression}})()`);
      await waitFor(`Boolean((${rootExpression})?.querySelector('[data-landing-screenshot-id="invite-envelope"] a'))`);
      await waitFor(`(()=>{const a=(${rootExpression})?.querySelector('[data-landing-screenshot-id="invite-envelope"] a');return a&&Object.keys(a).some(key=>key.startsWith('__reactProps')&&typeof a[key]?.onClick==='function')})()`);
      await scope('root.querySelector(\'[data-landing-screenshot-id="invite-envelope"] a\').click()');
      await waitFor(`!(${rootExpression}).querySelector('[data-landing-screenshot-id="invite-envelope"]')`);
      await delay(700);
      assert.equal(await evaluate('window.scrollY'), 0, `${label}: scrolled before start delay`);
      await delay(1700);
      const start = await evaluate('window.scrollY');
      await delay(1000);
      const speed = await evaluate(`window.scrollY-${start}`);
      if (speed < 40 || speed > 65) console.log(label, await evaluate('JSON.stringify({url:location.href,reduced:matchMedia("(prefers-reduced-motion:reduce)").matches,behavior:getComputedStyle(document.documentElement).scrollBehavior,height:document.documentElement.scrollHeight,active:document.activeElement?.tagName,calls:window.__scrollTrace.slice(-6)})'));
      assert(speed >= 40 && speed <= 65, `${label}: expected 50px/s, got ${speed}`);
      await call('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 180, y: 300, deltaY: 80, deltaX: 0 });
      await delay(250);
      const afterWheel = await evaluate('window.scrollY');await delay(700);
      assert.equal(await evaluate('window.scrollY'), afterWheel, `${label}: wheel did not pause`);
      await scope('root.querySelector("header").click()');await delay(700);
      assert(await evaluate(`window.scrollY>${afterWheel}+20`), `${label}: background click did not resume`);
      await scope('root.querySelector("textarea").closest("form").querySelector("input").focus({preventScroll:true})');await delay(200);
      const editingPosition = await evaluate('window.scrollY');await delay(700);
      assert.equal(await evaluate('window.scrollY'), editingPosition, `${label}: moved during form editing`);
      await scope('root.querySelector("textarea").closest("form").querySelector("input").blur()');await delay(50);
      await scope('root.querySelector("header").click()');await delay(150);
      assert.equal(await evaluate('window.scrollY'), editingPosition, `${label}: ignored edit guard`);
      await delay(350);await scope('root.querySelector("header").click()');await delay(700);
      assert(await evaluate(`window.scrollY>${editingPosition}+20`), `${label}: did not resume after editing`);
      await scope('root.querySelector(\'button[aria-label="Mở hộp mừng cưới"]\').click()');await delay(250);
      const modalPosition = await evaluate('window.scrollY');await delay(700);
      assert.equal(await evaluate('window.scrollY'), modalPosition, `${label}: moved while dialog open`);
      await scope('root.querySelector("dialog[open] button").click()');await delay(100);
      await evaluate('window.scrollTo({top:document.documentElement.scrollHeight-innerHeight-20,behavior:"instant"})');
      await scope('root.querySelector("header").click()');await delay(1800);
      const endPosition = await evaluate('window.scrollY');
      assert(await evaluate('Math.abs(window.scrollY-(document.documentElement.scrollHeight-innerHeight))<=2'), `${label}: did not reach end`);
      await delay(500);assert.equal(await evaluate('window.scrollY'), endPosition);
      report.push({ label, speed, wheelPause: true, editPause: true, editGuard: true, clickResume: true, modalPause: true, endStop: true });
    }
    await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await navigate(`/t/${slug}`);await delay(2500);
    assert.equal(await evaluate('window.scrollY'), 0);
    assert.equal(await evaluate('document.querySelector("[data-template]").dataset.autoScroll'), 'disabled');
    await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
    await call('Page.navigate', { url: origin + '/create?templateId=minimalism-do-dam' });
    await waitFor('Boolean(document.querySelector("[data-template=minimalism-original-v2]"))');await delay(2500);
    assert.equal(await evaluate('document.querySelector("[data-template]").dataset.autoScroll'), undefined);
    assert.equal(await evaluate('window.scrollY'), 0);
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ status: 'passed', cases: report, reducedMotion: 'passed', editorExclusion: 'passed' }, null, 2));
    console.log('Passed source/template/public auto-scroll: delay, speed, wheel/edit/modal pause, background resume, end stop; reduced motion and editor excluded.');
  } else if (motion) {
    const report = [];
    const reference = process.env.REFERENCE_URL || 'http://localhost:3100/vi/mau-thiep/minimalism-do-dam/demo';
    let slug = process.env.INVITATION_SLUG;
    if (!slug) {
      const savedReport = path.join(root, 'extracted_templates/browser-check/minimalism-live/report.json');
      try { slug = JSON.parse(await fs.readFile(savedReport, 'utf8')).slug; }
      catch { throw new Error('Set INVITATION_SLUG to an existing invitation, or run this script with --live first.'); }
    }
    assert(slug, 'Missing saved invitation slug');
    const snapshot = async name => {
      const shot = await call('Page.captureScreenshot', { format: 'png' });
      await fs.writeFile(path.join(output, name + '.png'), Buffer.from(shot.data, 'base64'));
    };
    for (const width of [375, 1280]) for (const [label, url] of [['reference', reference], ['template', `${origin}/templates/minimalism-do-dam`], ['public', `${origin}/t/${slug}`]]) {
      errors.length = 0;
      await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'no-preference' }] });
      await call('Emulation.setDeviceMetricsOverride', { width, height: 920, deviceScaleFactor: 1, mobile: false });
      await call('Page.navigate', { url });
      const rootExpression = label === 'reference' ? 'document' : 'document.querySelector(\'[data-template="minimalism-original-v2"]\')?.shadowRoot';
      const scope = expression => evaluate(`(()=>{const root=${rootExpression};return ${expression}})()`);
      await waitFor(`Boolean((${rootExpression})?.querySelector('[data-landing-screenshot-id="invite-envelope"] a'))`);
      await evaluate('document.fonts.ready');
      await delay(300);
      const idle = await scope(`getComputedStyle(root.querySelector('[data-landing-screenshot-id="invite-envelope"] [style*="seal-pulse"], [data-cover-part="seal"]')).animationName`);
      assert.equal(idle, 'seal-pulse');
      await snapshot(`${label}-${width}-idle`);
      await scope(`(()=>{
        const start=performance.now(); window.__motionSamples=[];
        const button=root.querySelector('[data-landing-screenshot-id="invite-envelope"] a');button.click();button.click();
        const capture=()=>{
          const cover=root.querySelector('[data-landing-screenshot-id="invite-envelope"]');
          const card=cover?.querySelector('[data-cover-part="card"]') || [...(cover?.children || [])].find(node=>node.style.zIndex==='10');
          const seal=cover?.querySelector('[data-cover-part="seal"]') || cover?.querySelector('[style*="seal-break"]');
          const elements=[...(cover?.querySelectorAll('*') || [])];
          const layers={};
          for(const element of elements) for(const name of getComputedStyle(element).animationName.split(', ')) if(name!=='none') layers[name]=(layers[name] || 0)+1;
          const flights=elements.filter(element=>getComputedStyle(element).animationName==='dragon-fly-forward').map(element=>{const style=getComputedStyle(element);return {duration:style.animationDuration,easing:style.animationTimingFunction,fill:style.animationFillMode,mirror:style.getPropertyValue('--fly-scale-x').trim(),transform:style.transform,filter:style.filter,opacity:style.opacity,asset:new URL(element.src).pathname.split('/').pop(),wrapperClass:element.parentElement.className.split(/\\s+/).sort().join(' ')}}).sort((a,b)=>a.mirror.localeCompare(b.mirror));
          const ring=elements.find(element=>getComputedStyle(element).animationName==='seal-ring');
          const glow=elements.find(element=>element.style.backgroundImage.includes('at center top'));
          const colors=[...new Set(elements.filter(element=>getComputedStyle(element).animationName==='particle-burst').map(element=>getComputedStyle(element).color))].sort();
          window.__motionSamples.push({elapsed:performance.now()-start,cover:!!cover,phase:cover?.dataset.coverPhase,cardAnimation:card?getComputedStyle(card).animationName:null,cardTransform:card?getComputedStyle(card).transform:null,sealAnimation:seal?getComputedStyle(seal).animationName:null,sealTransform:seal?getComputedStyle(seal).transform:null,sealOpacity:seal?getComputedStyle(seal).opacity:null,rings:cover?.querySelectorAll('[data-cover-part="ring"], [style*="seal-ring"]').length || 0,particles:cover?.querySelectorAll('[data-cover-particle], [style*="particle-burst"]').length || 0,layers,flights,ringBorder:ring?getComputedStyle(ring).borderTopWidth:null,glow:glow?getComputedStyle(glow).backgroundImage:null,colors});
        };capture();const timer=setInterval(capture,30);setTimeout(()=>{clearInterval(timer);capture()},1600);
      })()`);
      const started = Date.now();
      for (const timestamp of [200, 650, 1050, 1500]) {
        await delay(Math.max(0, timestamp - (Date.now() - started)));
        await snapshot(`${label}-${width}-opening-${timestamp}ms`);
      }
      await delay(150);
      const samples = await evaluate('window.__motionSamples');
      assert(samples.some(sample => sample.cover && sample.sealAnimation === 'seal-break'), `${label}: missing seal break`);
      assert(samples.some(sample => sample.cardAnimation === 'envelope-away'), `${label}: missing envelope departure`);
      assert(samples.some(sample => sample.particles === 32), `${label}: missing particle burst`);
      assert(samples.some(sample => sample.rings === 1), `${label}: missing seal ring`);
      assert(samples.some(sample => sample.flights.length === 2), `${label}: missing flying flower layers`);
      for (let index = 0; index < 2; index++) {
        assert(new Set(samples.filter(sample => sample.flights.length === 2).map(sample => sample.flights[index].transform)).size > 2, `${label}: flower ${index} does not approach`);
        assert(new Set(samples.filter(sample => sample.flights.length === 2).map(sample => sample.flights[index].filter)).size > 2, `${label}: flower ${index} does not blur`);
      }
      assert(samples.some(sample => !sample.cover && sample.elapsed >= 1200), `${label}: cover never completes`);
      assert(new Set(samples.filter(sample => sample.cardAnimation === 'envelope-away').map(sample => sample.cardTransform)).size > 2, `${label}: departure is static`);
      await call('Page.navigate', { url });
      await waitFor(`Boolean((${rootExpression})?.querySelector('[data-landing-screenshot-id="invite-envelope"] a'))`);
      const timing = await scope(`new Promise((resolve,reject)=>{
        const start=performance.now();const phases={};
        const timeout=setTimeout(()=>reject(new Error('Opening did not complete in timing pass')),5000);
        const measure=()=>{
          const cover=root.querySelector('[data-landing-screenshot-id="invite-envelope"]');
          const card=cover?.querySelector('[data-cover-part="card"]') || [...(cover?.children || [])].find(node=>node.style.zIndex==='10');
          if(card?.style.animationName==='envelope-away' && phases.away===undefined)phases.away=performance.now()-start;
          if(!cover){phases.done=performance.now()-start;clearTimeout(timeout);resolve(phases);return}
          requestAnimationFrame(measure);
        };
        root.querySelector('[data-landing-screenshot-id="invite-envelope"] a').click();requestAnimationFrame(measure);
      })`);
      const giftSelector = 'button[aria-label="Mở hộp mừng cưới"]';
      await waitFor(`Boolean((${rootExpression})?.querySelector(${JSON.stringify(giftSelector)}))`);
      await scope(`root.querySelector(${JSON.stringify(giftSelector)}).scrollIntoView({block:'center',behavior:'instant'})`);
      await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 });
      await delay(200);
      const giftState = () => scope(`(()=>{const card=root.querySelector('.ienv-card'),back=root.querySelector('.ienv-back'),hint=root.querySelector('.ienv-hint');return {main:getComputedStyle(card).animationName,duration:getComputedStyle(card).animationDuration,delay:getComputedStyle(card).animationDelay,back:getComputedStyle(back).animationName,backDuration:getComputedStyle(back).animationDuration,backDelay:getComputedStyle(back).animationDelay,translate:getComputedStyle(card).translate,transform:getComputedStyle(card).transform,hint:getComputedStyle(hint).animationName,sparkle:getComputedStyle(root.querySelector('.ienv-sparkle')).animationName}})()`);
      const giftIdle = await giftState();
      assert(giftIdle.main.includes('ienvFloatMain') && giftIdle.back.includes('ienvFloat') && giftIdle.sparkle.includes('ienvSparkleAnim'));
      await delay(350);
      const giftLater = await giftState();
      assert.notEqual(giftIdle.translate, giftLater.translate, `${label}: gift does not float`);
      await snapshot(`${label}-${width}-gift-idle`);
      const position = await scope(`(()=>{const rect=root.querySelector(${JSON.stringify(giftSelector)}).getBoundingClientRect();return {x:rect.x+rect.width/2,y:rect.y+rect.height/2}})()`);
      await call('Input.dispatchMouseEvent', { type: 'mouseMoved', ...position });
      await delay(500);
      const giftHover = await giftState();
      assert(giftHover.main.includes('ienvGrow') && giftHover.main.includes('ienvWave') && giftHover.back.includes('ienvBackWave'), `${label}: missing gift hover motion ${JSON.stringify({ position, giftHover })}`);
      await snapshot(`${label}-${width}-gift-hover`);
      await call('Input.dispatchMouseEvent', { type: 'mouseMoved', x: 0, y: 0 });
      await call('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
      await call('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab', windowsVirtualKeyCode: 9 });
      await scope(`root.querySelector(${JSON.stringify(giftSelector)}).focus()`);
      await delay(150);
      const giftFocus = await giftState();
      assert(giftFocus.main.includes('ienvWave'), `${label}: missing keyboard focus motion`);
      await snapshot(`${label}-${width}-gift-focus`);
      await scope(`root.querySelector(${JSON.stringify(giftSelector)}).click()`);
      await delay(250);
      assert(await scope('Boolean(root.querySelector("dialog[open]"))'), `${label}: gift modal not open`);
      await snapshot(`${label}-${width}-gift-open`);
      await scope('root.querySelector("dialog[open] button").click()');
      await delay(100);
      assert.equal(await scope('Boolean(root.querySelector("dialog[open]"))'), false);
      if (label !== 'reference') assert.deepEqual(errors, [], 'Local invitation browser errors');
      report.push({ label, width, samples, timing, giftIdle, giftLater, giftHover, giftFocus, errors: [...errors] });
    }
    for (const width of [375, 1280]) for (const label of ['template', 'public']) {
      const source = report.find(item => item.width === width && item.label === 'reference');
      const target = report.find(item => item.width === width && item.label === label);
      for (const active of [sample => sample.elapsed >= 90 && sample.cardAnimation !== 'envelope-away' && sample.sealAnimation === 'seal-break', sample => sample.particles === 32]) {
        const original = source.samples.find(active);
        const imported = target.samples.find(active);
        assert(original && imported, `${label}: missing opening phase sample`);
        assert.deepEqual(imported.layers, original.layers, `${label}: active animation layers differ`);
        assert.equal(imported.ringBorder, original.ringBorder, `${label}: seal ring differs`);
        assert.equal(imported.glow, original.glow, `${label}: opening glow differs`);
        assert.deepEqual(imported.flights.map(({ transform, filter, opacity, ...config }) => config), original.flights.map(({ transform, filter, opacity, ...config }) => config), `${label}: flight settings differ`);
      }
      for (const state of ['giftIdle', 'giftHover', 'giftFocus']) for (const property of ['main', 'duration', 'delay', 'back', 'backDuration', 'backDelay', 'hint', 'sparkle']) assert.equal(target[state][property], source[state][property], `${width} ${state}.${property}`);
      for (const phase of ['away', 'done']) assert(Math.abs(target.timing[phase] - source.timing[phase]) < 150, `${width} ${label}: ${phase} timing differs from source (${target.timing[phase]} vs ${source.timing[phase]} ms)`);
    }
    await call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await navigate(`/t/${slug}`);
    assert.equal(await inRoot('Boolean(root.querySelector(\'[data-landing-screenshot-id="invite-envelope"]\'))'), false);
    assert.equal(await inRoot('getComputedStyle(root.querySelector(".ienv-card")).animationName'), 'none');
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ status: 'passed', finishedAt: new Date().toISOString(), api: 'real backend; existing saved invitation; no request interception', slug, reducedMotion: 'passed', cases: report }, null, 2));
    console.log(`Passed reference/template/public motion comparison at 375/1280px: all active opening layers, two approaching/blurring flowers, ring/glow, particles, gift interactions and reduced motion. Existing invitation: ${slug}`);
  } else if (live) {
    const apiOrigin = process.env.API_URL || 'http://localhost:8080/api/v1';
    const apiGet = async endpoint => {
      const response = await fetch(apiOrigin + endpoint);
      assert.equal(response.status, 200, endpoint);
      return (await response.json()).data;
    };
    const detail = await apiGet('/templates/minimalism-do-dam');
    assert.equal(JSON.parse(detail.contentSchema).template.version, 2);
    await call('Network.enable');
    await call('Emulation.setDeviceMetricsOverride', { width: 1280, height: 920, deviceScaleFactor: 1, mobile: false });
    await call('Page.navigate', { url: origin + '/create?templateId=minimalism-do-dam' });
    await waitFor('Boolean(document.querySelector(\'input[name="groomName"]\'))');
    await field('input[name="groomName"]', 'Nguyễn Minh Quân');
    await field('input[name="brideName"]', 'Trần Hà Linh');
    await field('input[type="date"]', '2028-02-29');
    await field('input[type="time"]', '19:45');
    await field('input[name="venueName"]', 'Trung Tâm Hội Nghị White Palace');
    await evaluate('document.querySelector("form").requestSubmit()');
    await waitFor('location.pathname.startsWith("/t/")');
    const slug = await evaluate('location.pathname.slice(3)');
    const card = await apiGet(`/public/invitations/${encodeURIComponent(slug)}`);
    const saved = JSON.parse(card.contentSchema);
    assert.equal(saved.template.version, 2);
    assert.equal(card.groomName, 'Nguyễn Minh Quân');
    assert.equal(card.eventDate, '2028-02-29');
    const checks = [];
    for (const width of [320, 375, 430, 768, 1280]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 920, deviceScaleFactor: 1, mobile: false });
      await navigate(`/t/${slug}`);
      await inRoot('[...root.querySelectorAll("img")].forEach(img=>img.loading="eager")');
      await waitFor(`(()=>{const r=document.querySelector('[data-template]').shadowRoot;return [...r.querySelectorAll('img')].every(img=>img.complete)})()`);
      const broken = await inRoot('[...root.querySelectorAll("img")].filter(img=>!img.naturalWidth).map(img=>img.src)');
      assert.deepEqual(broken, [], 'Images must load through MinIO');
      assert.equal(await evaluate('document.documentElement.scrollWidth > innerWidth'), false);
      const content = await inRoot('root.textContent');
      assert(content.includes('Minh Quân') && content.includes('Hà Linh') && content.includes('19:45') && content.includes('2028'));
      const screenshot = await call('Page.captureScreenshot', { format: 'png' });
      await fs.writeFile(path.join(output, `saved-${width}.png`), Buffer.from(screenshot.data, 'base64'));
      checks.push({ width, imagesLoaded: true, overflow: false });
    }
    await inRoot('root.querySelector(\'[data-gallery-index="0"]\').click()');
    await delay(150);
    const firstImage = await inRoot('root.querySelector("dialog[open] img").src');
    await inRoot('root.querySelector(\'[aria-label="Next image"]\').click()');
    await delay(100);
    assert.notEqual(await inRoot('root.querySelector("dialog[open] img").src'), firstImage);
    await inRoot('root.querySelector(\'[aria-label="Close lightbox"]\').click()');
    for (const [value, status, count] of [['yes', 'ATTENDING', 1], ['no', 'DECLINED', 0]]) {
      await inRoot('[...root.querySelectorAll("button")].find(button=>button.textContent.trim().startsWith("XÁC NHẬN")).click()');
      await delay(100);
      await field('form.space-y-4 input[type="text"]', `Kiểm tra lưu thật ${value}`, true);
      await inRoot(`root.querySelector('input[value="${value}"]').click()`);
      await delay(100);
      await inRoot('root.querySelector("form.space-y-4").requestSubmit()');
      await waitFor(`!document.querySelector('[data-template]').shadowRoot.querySelector('dialog[aria-label="Xác nhận tham dự"]')`);
      const page = await apiGet(`/public/invitations/${encodeURIComponent(slug)}/wishes`);
      const wish = page.content.find(item => item.guestName === `Kiểm tra lưu thật ${value}`);
      assert.equal(wish?.attendanceStatus, status);
      assert.equal(wish?.guestCount, count);
    }
    await navigate(`/t/${slug}`);
    await waitFor(`document.querySelector('[data-template]').shadowRoot.textContent.includes('Kiểm tra lưu thật no')`);
    assert.deepEqual(errors, [], 'Unexpected browser exceptions');
    const report = { api: 'real Spring Boot API; no request interception', publicUrl: origin + '/t/' + slug, slug, schema: saved.template, viewports: checks, wishes: (await apiGet(`/public/invitations/${slug}/wishes`)).content, errors };
    await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  } else {
  const metrics = [];
  for (const width of [320, 375, 430, 768, 1280]) {
    await call('Emulation.setDeviceMetricsOverride', { width, height: 920, deviceScaleFactor: 1, mobile: false });
    await navigate('/templates/minimalism-do-dam');
    await delay(150);
    const overflow = await evaluate('document.documentElement.scrollWidth > innerWidth');
    assert.equal(overflow, false, `Horizontal overflow at ${width}`);
    metrics.push({ width, overflow });
    const shot = await call('Page.captureScreenshot', { format: 'png' });
    await fs.writeFile(path.join(output, `open-${width}.png`), Buffer.from(shot.data, 'base64'));
  }
  await call('Page.navigate', { url: origin + '/create?templateId=minimalism-do-dam' });
  await waitFor('Boolean(document.querySelector(\'input[name="groomName"]\'))');
  await field('input[name="groomName"]', 'Nguyễn Minh Quân');
  await field('input[name="brideName"]', 'Trần Hà Linh');
  await field('input[type="date"]', '2028-02-29');
  await field('input[type="time"]', '19:45');
  await field('input[name="venueName"]', 'Địa điểm mới');
  await evaluate('document.querySelector("form").requestSubmit()');
  await waitFor('location.pathname==="/t/repair-test"');
  assert(stored, 'Editor must submit schema');
  assert.equal(schema.template.version, 2);
  await navigate('/t/repair-test');
  const content = await inRoot('root.textContent');
  assert(content.includes('Minh Quân') && content.includes('Hà Linh') && content.includes('19:45') && content.includes('2028'));
  assert(!content.includes('Đặng Hoàng Long') && !content.includes('Vũ Bảo Ngọc'));
  for (const [value, status, count] of [['yes', 'ATTENDING', 1], ['no', 'DECLINED', 0]]) {
    await inRoot('[...root.querySelectorAll("button")].find(button=>button.textContent.trim().startsWith("XÁC NHẬN")).click()');
    await delay(100);
    assert(await inRoot('Boolean(root.querySelector(\'dialog[aria-label="Xác nhận tham dự"]\').open)'));
    await field('form.space-y-4 input[type="text"]', `Khách ${value}`, true);
    await inRoot(`root.querySelector('input[value="${value}"]').click()`);
    await delay(300);
    assert.equal(await inRoot(`root.querySelector('input[value="${value}"]').checked`), true);
    const selected = await inRoot(`getComputedStyle(root.querySelector('input[value="${value}"]').closest('label')).borderColor`);
    assert.equal(selected, 'rgb(81, 20, 25)');
    await inRoot('root.querySelector("form.space-y-4").requestSubmit()');
    await delay(250);
    assert.equal(wishes.at(-1)?.attendanceStatus, status);
    assert.equal(wishes.at(-1)?.guestCount, count);
    assert.equal(await inRoot('Boolean(root.querySelector(\'dialog[aria-label="Xác nhận tham dự"]\'))'), false);
  }
  await navigate('/t/repair-test');
  assert((await inRoot('root.textContent')).includes('Khách no'));
  const giftBlock = schema.blocks.find(block => block.type === 'GIFTBOX');
  for (const accountCount of [0, 1, 2]) {
    const defaults = template.schema.blocks.find(block => block.type === 'GIFTBOX').props;
    giftBlock.props = { ...defaults, groomAccount: accountCount === 2 ? defaults.groomAccount : undefined, brideAccount: accountCount ? defaults.brideAccount : undefined };
    await navigate('/t/repair-test');
    await inRoot('[...root.querySelectorAll("button")].find(button=>button.textContent.includes("Nhấn để mở")).click()');
    await delay(100);
    assert.equal(await inRoot('root.querySelectorAll("dialog[open] img").length'), accountCount);
    await inRoot('root.querySelector("dialog[open] button").click()');
  }
  const images = schema.blocks.find(block => block.type === 'GALLERY').props.images;
  for (const size of [0, 1, 2, 9]) {
    schema.blocks.find(block => block.type === 'GALLERY').props.images = Array.from({ length: size }, (_, index) => images[index % images.length]);
    await navigate('/t/repair-test');
    assert.equal(await inRoot('root.querySelectorAll("[data-gallery-index]").length'), size);
    assert.equal(await inRoot('root.querySelectorAll(\'[aria-label^="Go to photo"]\').length'), size);
    if (!size) continue;
    await inRoot('root.querySelector(\'[data-gallery-index="0"]\').click()');
    await delay(100);
    assert.equal(await inRoot('root.querySelectorAll(\'[aria-label^="View image"]\').length'), size);
    await inRoot('root.querySelector(\'[aria-label="Next image"]\').click()');
    await delay(80);
    assert((await inRoot('root.querySelector("dialog[open]").textContent')).includes(`${size === 1 ? 1 : 2} / ${size}`));
    await inRoot('root.querySelector(\'[aria-label="Close lightbox"]\').click()');
  }
  assert.deepEqual(errors, [], 'Unexpected browser exceptions');
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ api: 'intercepted in-memory fixture; no real backend persistence claimed', metrics, rsvp: wishes, giftAccountCounts: [0, 1, 2], gallerySizes: [0, 1, 2, 9], errors }, null, 2));
  console.log('Passed: 5 viewport widths, editor save/reload, both RSVP payloads, gallery sizes 0/1/2/9. API responses are test fixtures.');
  }
} catch (error) {
  if (motion || scroll) await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ status: 'failed', finishedAt: new Date().toISOString(), error: error.message }, null, 2));
  throw error;
} finally {
  socket?.close();
  chrome.kill();
}
