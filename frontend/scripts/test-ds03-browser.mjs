import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
const backend = process.env.BACKEND_URL || 'http://localhost:8080/api/v1';
const port = process.env.CDP_PORT || '9250';
const reportDir = new URL('../../extracted_templates/browser-check/ds03-integration/', import.meta.url);
const template = 'ds03-sang-trong';
const report = { gallery: {}, demo: [], publication: null };
const tabs = async () => (await fetch(`http://127.0.0.1:${port}/json/list`)).json();

async function connect(tab) {
  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const pending = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    const request = pending.get(message.id);
    if (!request) return;
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  };
  socket.onclose = () => {
    for (const request of pending.values()) request.reject(new Error('Chrome closed the connection'));
    pending.clear();
  };
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  return {
    send,
    close: () => socket.close(),
    evaluate: async expression => {
      const value = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
      if (value.exceptionDetails) throw new Error(value.exceptionDetails.exception?.description ?? value.exceptionDetails.text);
      return value.result.value;
    },
  };
}

async function eventually(read, message) {
  for (let attempt = 0; attempt < 120; attempt++) {
    const value = await read();
    if (value) return value;
    await delay(140);
  }
  throw new Error(message);
}

const page = await connect((await tabs()).find(tab => tab.type === 'page'));
let frame;
async function grabFrame() {
  frame?.close();
  const url = await eventually(() => page.evaluate('document.querySelector("[data-template=ds03-v1] iframe")?.src'), 'Missing DS03 frame');
  frame = await connect(await eventually(async () => (await tabs()).find(tab => tab.type === 'iframe' && tab.url === url), 'Missing Chrome iframe target'));
  await eventually(() => frame.evaluate('document.querySelector("#content-wrapper img")?.complete'), 'Original canvas did not load');
  return frame;
}

async function screenshot(name) {
  const shot = await page.send('Page.captureScreenshot', { format: 'png' });
  await fs.writeFile(new URL(`${name}.png`, reportDir), Buffer.from(shot.data, 'base64'));
}

async function api(path) {
  const response = await fetch(backend + path);
  assert(response.ok, `${path}: HTTP ${response.status}`);
  return (await response.json()).data;
}

async function fill(target, selector, value) {
  return target.evaluate(`(() => {
    const input = document.querySelector(${JSON.stringify(selector)});
    if (!input) return false;
    const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(input, ${JSON.stringify(value)});
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
}

try {
  await fs.mkdir(reportDir, { recursive: true });
  const savedTemplate = await api(`/templates/${template}`);
  assert.deepEqual(JSON.parse(savedTemplate.contentSchema).template, { id: 'ds03', version: 1 });
  await page.send('Page.enable');

  for (const width of [1440, 390]) {
    await page.send('Emulation.setDeviceMetricsOverride', { width, height: 900, mobile: width < 768, deviceScaleFactor: 1 });
    await page.send('Page.navigate', { url: `${origin}/templates/${template}?test=${width}` });
    await grabFrame();
    const atMount = await frame.evaluate('scrollY');
    const measure = () => frame.evaluate(`(() => ({
      viewport: innerWidth,
      platform: document.querySelector('.view-page')?.dataset.viewportPlatform,
      scroll: scrollY,
      images: [...document.images].filter(img=>img.complete&&img.naturalWidth>0).length,
      brokenImages: [...document.images].filter(img=>img.currentSrc&&img.complete&&!img.naturalWidth).length,
      cover: [...document.images].some(img=>img.currentSrc.includes('f2119798-')&&img.naturalWidth>0),
      audio: document.querySelector('audio')?.readyState,
      animations: [...new Set(document.getAnimations().map(a=>a.animationName || a.transitionProperty || 'web-animation'))],
    }))()`);
    const sample = { width, atMount };
    report.demo.push(sample);
    const state = await eventually(async () => {
      const current = await measure();
      Object.assign(sample, current);
      return current.cover && current.audio >= 2 && current.scroll > atMount && current;
    }, 'Recorded images, audio, or auto-scroll did not become available');
    assert.equal(state.platform, 'desktop');
    assert(state.viewport >= 960 && (width > 960 || state.viewport <= 962));
    assert(state.images > 0);
    assert.equal(state.brokenImages, 0);
    assert(state.audio >= 2);
    assert(state.scroll > atMount, 'Original auto-scroll did not advance');
    assert.equal(await page.evaluate('document.documentElement.scrollWidth <= innerWidth'), true);
    await screenshot(`demo-${width}`);
  }

  await frame.evaluate(`(() => {
    const item = document.querySelector('[data-node-id="Jn4_mMF8bJ"]');
    item?.scrollIntoView({block:'center',behavior:'instant'});
    item?.click();
  })()`);
  const gallery = await eventually(() => frame.evaluate(`(() => {
    const dialog = document.querySelector('.album-thumbnail-container');
    if (!dialog) return null;
    return { images: dialog.querySelectorAll('img').length, title: dialog.getAttribute('aria-label') };
  })()`), 'The original album dialog did not open');
  assert(gallery.images > 0);
  report.gallery = gallery;
  await screenshot('album');

  if (process.argv.includes('--publish')) {
    const unique = String(Date.now()).slice(-6);
    const groomName = `Chú Rể DS03 ${unique}`;
    const brideName = `Cô Dâu DS03 ${unique}`;
    const values = { groomName, brideName, eventDate: '2027-05-23', eventTime: '17:45', venueName: 'Địa điểm kiểm thử DS03', venueAddress: 'Đường Hoa Lan, Hà Nội' };
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, mobile: false, deviceScaleFactor: 1 });
    await page.send('Page.navigate', { url: `${origin}/create?templateId=${template}` });
    await eventually(() => page.evaluate('Boolean(document.querySelector("input[name=groomName]"))'), 'Missing DS03 editor form');
    for (const [field, value] of Object.entries(values)) assert(await fill(page, `input[name=${field}]`, value));
    await page.evaluate('document.querySelector("form").requestSubmit()');
    const slug = await eventually(() => page.evaluate('location.pathname.startsWith("/t/") ? location.pathname.split("/")[2] : ""'), 'DS03 publication did not navigate to a public card');
    const savedCard = await api(`/public/invitations/${slug}`);
    assert.equal(savedCard.groomName, groomName);
    assert.equal(savedCard.brideName, brideName);
    assert.deepEqual(JSON.parse(savedCard.contentSchema).blocks[0].props.values, values);
    await grabFrame();
    await eventually(() => frame.evaluate(`document.querySelector('#content-wrapper')?.textContent.includes(${JSON.stringify(groomName)})`), 'The public runtime did not use the saved name');
    assert(await frame.evaluate(`document.querySelector('#content-wrapper').textContent.includes(${JSON.stringify(values.venueAddress)})`));
    await screenshot('published-desktop');
    const guestName = `Khách DS03 ${unique}`;
    assert(await fill(frame, 'input[name=guestName]', guestName));
    assert(await fill(frame, 'textarea[name=message]', 'Chúc hai bạn luôn hạnh phúc!'));
    await frame.evaluate('document.querySelector("input[name=guestName]").form.requestSubmit()');
    const wish = await eventually(async () => (await api(`/public/invitations/${slug}/wishes`)).content.find(item => item.guestName === guestName), 'Wish was not saved');
    assert.equal(wish.attendanceStatus, 'MAYBE');
    const rsvpName = `Khách RSVP DS03 ${unique}`;
    assert(await fill(frame, 'input[name=fullName]', rsvpName));
    await frame.evaluate(`(() => {
      const form = document.querySelector('input[name=fullName]').form;
      form.querySelectorAll('input[name=willCome]')[1].click();
      form.requestSubmit();
    })()`);
    const rsvp = await eventually(async () => (await api(`/public/invitations/${slug}/wishes`)).content.find(item => item.guestName === rsvpName), 'RSVP was not saved');
    assert.equal(rsvp.attendanceStatus, 'DECLINED');
    assert.equal(rsvp.guestCount, 0);
    await page.send('Page.navigate', { url: `${origin}/t/${slug}?reload=1` });
    await grabFrame();
    await eventually(() => frame.evaluate(`document.querySelector('#content-wrapper')?.textContent.includes(${JSON.stringify(guestName)})`), 'Saved wish was missing after reload');
    report.publication = { slug, wish: wish.id, rsvp: rsvp.id, namesAndAddressVerified: true };
  }
  report.status = 'passed';
} catch (error) {
  report.status = 'failed';
  report.error = error.message;
  throw error;
} finally {
  await fs.writeFile(new URL('report.json', reportDir), JSON.stringify(report, null, 2) + '\n');
  frame?.close();
  page.close();
}
