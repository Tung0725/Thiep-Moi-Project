import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const baseline = process.argv.includes('--baseline');
const origin = process.env.FRONTEND_URL || 'http://localhost:3000';
const output = path.join(root, 'extracted_templates/browser-check/demo-layout', baseline ? 'before' : 'after');
await fs.mkdir(output, { recursive: true });
await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ status: 'running' }));
const profile = await fs.mkdtemp(path.join(os.tmpdir(), 'demo-layout-browser-'));
const chrome = spawn(process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless=new', '--disable-gpu', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', 'about:blank',
], { windowsHide: true, stdio: ['ignore', 'ignore', 'pipe'] });
let launchError;
let chromeLog = '';
chrome.on('error', error => { launchError = error; });
chrome.stderr.on('data', chunk => { chromeLog += chunk; });
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const results = [];
const errors = [];
const failedResources = [];
let socket;
try {
  let port;
  for (let attempt = 0; attempt < 100; attempt++) {
    if (launchError) throw launchError;
    try { port = (await fs.readFile(path.join(profile, 'DevToolsActivePort'), 'utf8')).split('\n')[0]; break; } catch { await delay(100); }
  }
  assert(port, `Chrome did not start: ${chromeLog}`);
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  let id = 0;
  const pending = new Map();
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params }));
  });
  socket.onclose = () => { for (const request of pending.values()) request.reject(new Error('Chrome connection closed')); pending.clear(); };
  socket.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id); pending.delete(message.id);
      if (message.error) request?.reject(new Error(JSON.stringify(message.error))); else request?.resolve(message.result);
    }
    if (message.method === 'Runtime.exceptionThrown') errors.push(message.params.exceptionDetails);
    if (message.method === 'Runtime.consoleAPICalled' && ['warning', 'error'].includes(message.params.type)) errors.push({ type: message.params.type, args: message.params.args.map(arg => arg.value || arg.description) });
    if (message.method === 'Network.responseReceived' && message.params.response.status >= 400 && /\/templates\/(hb04|minimalism-do-dam)\//.test(message.params.response.url)) failedResources.push(message.params.response);
  };
  const evaluate = async expression => {
    const response = await call('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
    return response.result.value;
  };
  const waitFor = async expression => {
    for (let attempt = 0; attempt < 300; attempt++) { if (await evaluate(expression)) return; await delay(100); }
    throw new Error(`Timed out: ${expression}`);
  };
  await call('Page.enable'); await call('Runtime.enable'); await call('Network.enable');
  const favicon = await fetch(`${origin}/favicon.ico`);
  assert.equal(favicon.status, 200);
  assert.match(favicon.headers.get('content-type'), /image\//);
  for (const template of ['hb04-basic', 'minimalism-do-dam']) {
    await call('Page.navigate', { url: `${origin}/templates/${template}?screenshot=true` });
    if (template === 'hb04-basic') {
      await waitFor('Boolean(document.querySelector(".hb04-template section"))');
      await waitFor('!document.querySelector(".hb04-template .sticky img")');
    } else {
      await waitFor(String.raw`Boolean(document.querySelector('[data-template]')?.shadowRoot?.querySelector('a[href="#invitation"]'))`);
      await evaluate(String.raw`document.querySelector('[data-template]').shadowRoot.querySelector('a[href="#invitation"]').click()`);
      await waitFor('document.querySelector("[data-template]").dataset.invitationOpen==="true"');
    }
    await evaluate('document.fonts.ready');
    for (const width of [320, 375, 430, 768, 1280]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 920, deviceScaleFactor: 1, mobile: false });
      await evaluate('window.scrollTo({top:0,behavior:"instant"})'); await delay(350);
      const state = await evaluate(`(()=>{const hb=document.querySelector('.hb04-template'),host=document.querySelector('[data-template]'),canvas=hb?.querySelector('.invitation-demo'),scope=hb||host.shadowRoot;return {template:${JSON.stringify(template)},width:innerWidth,availableWidth:document.documentElement.clientWidth,overflow:document.documentElement.scrollWidth>innerWidth,canvas:canvas?.getBoundingClientRect().toJSON(),headingSize:hb?getComputedStyle(hb.querySelector('.font-greatvibes')).fontSize:null,brokenImages:[...scope.querySelectorAll('img')].filter(i=>i.complete&&i.currentSrc&&!i.naturalWidth).map(i=>i.currentSrc)}})()`);
      results.push(state); console.log(JSON.stringify(state));
      const shot = await call('Page.captureScreenshot', { format: 'png' });
      await fs.writeFile(path.join(output, `${template}-${width}.png`), Buffer.from(shot.data, 'base64'));
      if (!baseline) {
        assert.equal(state.overflow, false); assert.deepEqual(state.brokenImages, []);
        if (template === 'hb04-basic') {
          assert.equal(state.canvas.width, Math.min(state.availableWidth, 400));
          assert(Math.abs(state.canvas.left - (state.availableWidth - state.canvas.width) / 2) <= 1);
          assert.equal(state.headingSize, '38px');
        }
      }
      await evaluate('window.scrollTo({top:document.documentElement.scrollHeight,behavior:"instant"})');
      await waitFor(String.raw`Boolean(document.querySelector('nav a[href^="/create?templateId="]'))`);
      assert.equal(await evaluate(String.raw`document.querySelector('nav a[href^="/create?templateId="]').getAttribute('href')`), `/create?templateId=${template}`);
    }
  }
  if (!baseline) {
    await call('Page.navigate', { url: `${origin}/create?templateId=hb04-basic` });
    await waitFor('Boolean(document.querySelector(".hb04-template section"))');
    for (const width of [375, 1280]) {
      await call('Emulation.setDeviceMetricsOverride', { width, height: 920, deviceScaleFactor: 1, mobile: false });
      if (width === 375) await evaluate(`[...document.querySelectorAll('button')].find(button=>button.textContent.includes('smartphone')).click()`);
      await delay(350);
      const editor = await evaluate(`(()=>{const hb=document.querySelector('.hb04-template'),canvas=hb.querySelector('.max-w-full');return {editor:true,width:innerWidth,parentWidth:hb.clientWidth,canvasWidth:canvas.getBoundingClientRect().width,headingSize:getComputedStyle(hb.querySelector('.font-greatvibes')).fontSize}})()`);
      assert(editor.canvasWidth > 0); assert.equal(editor.canvasWidth, editor.parentWidth);
      assert.equal(editor.headingSize, '38px'); results.push(editor);
    }
  }
  assert.deepEqual(errors, []); assert.deepEqual(failedResources, []);
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ status: baseline ? 'baseline-recorded' : 'passed', results, errors, failedResources }, null, 2));
} catch (error) {
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify({ status: 'failed', error: String(error), results, errors, failedResources }, null, 2));
  throw error;
} finally { socket?.close(); chrome.kill(); }
