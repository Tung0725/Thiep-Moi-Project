import fs from 'node:fs/promises';
import assert from 'node:assert/strict';

async function connect(url) {
  const ws = new WebSocket(url);
  await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
  let id = 0;
  const pending = new Map();
  ws.onmessage = event => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(JSON.stringify(message.error)));
      else request.resolve(message.result);
    }
  };
  return { ws, call: (method, params = {}) => new Promise((resolve, reject) => {
    pending.set(++id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params }));
  }) };
}
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const browserInfo = await (await fetch('http://localhost:9223/json/version')).json();
const browser = await connect(browserInfo.webSocketDebuggerUrl);
const { targetId } = await browser.call('Target.createTarget', { url: 'about:blank' });
const tabs = await (await fetch('http://localhost:9223/json')).json();
const page = await connect(tabs.find(tab => tab.id === targetId).webSocketDebuggerUrl);
const c = page.call;
const evaluate = async expression => {
  const response = await c('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
};
const waitFor = async expression => {
  for (let attempt = 0; attempt < 80; attempt++) {
    if (await evaluate(expression)) return;
    await sleep(250);
  }
  throw new Error(`Timed out: ${expression}`);
};
const screenshot = async name => {
  const result = await c('Page.captureScreenshot', { format: 'png' });
  await fs.writeFile(`extracted_templates/${name}.png`, Buffer.from(result.data, 'base64'));
};
const setField = async (selector, value) => {
  await evaluate(`(()=>{const input=document.querySelector(${JSON.stringify(selector)});if(!input)throw Error('Missing field');const type=input.tagName==='TEXTAREA'?HTMLTextAreaElement:HTMLInputElement;Object.getOwnPropertyDescriptor(type.prototype,'value').set.call(input,${JSON.stringify(value)});input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));})()`);
  await sleep(100);
};
try {
 await c('Page.enable');
 await c('Emulation.setDeviceMetricsOverride',{width:430,height:920,deviceScaleFactor:1,mobile:false});
 await c('Page.navigate',{url:'http://localhost:3100/vi/mau-thiep/minimalism-do-dam/demo'});
 await waitFor('Boolean(document.querySelector(\'a[href="?open=1"]\'))');
 console.log(await evaluate('document.querySelector(\'a[href="?open=1"]\').parentElement.outerHTML.slice(0,1000)'));
 await fs.writeFile('extracted_templates/original-cover-dom.html',await evaluate('document.querySelector(\'a[href="?open=1"]\').closest("main")?.outerHTML || document.body.outerHTML'));
 await evaluate('document.querySelector(\'a[href="?open=1"]\').click()');
 await waitFor('Boolean(document.querySelector(\'[data-testid="minimalism-darkred-template"]\'))');
 await sleep(1500);
 console.log(await evaluate('JSON.stringify({root:document.querySelector(\'[data-testid="minimalism-darkred-template"]\').outerHTML.slice(0,800),parents:document.querySelector(\'[data-testid="minimalism-darkred-template"]\').parentElement.outerHTML.slice(0,800)})'));
 await fs.writeFile('extracted_templates/original-open-dom.html',await evaluate('document.querySelector(\'[data-testid="minimalism-darkred-template"]\').outerHTML'));
 await fs.writeFile('extracted_templates/original-open-body.html',await evaluate('document.body.outerHTML'));
 await screenshot('original-replay-open');
} finally {page.ws.close();await browser.call('Target.closeTarget',{targetId});browser.ws.close()}
