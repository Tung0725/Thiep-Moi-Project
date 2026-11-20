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

 const serialize = String.raw`(root)=>{const skip=new Set(['SCRIPT','NOSCRIPT']);const walk=node=>{if(node.nodeType===3)return node.textContent;if(node.nodeType!==1||skip.has(node.tagName))return null;const attrs={};for(const attr of node.attributes){if(attr.name.startsWith('on')||['nonce','integrity'].includes(attr.name))continue;if(attr.name==='style'){attrs.style=Object.fromEntries([...node.style].map(key=>[key.startsWith('--')?key:key.replace(/-([a-z])/g,(_,v)=>v.toUpperCase()),node.style.getPropertyValue(key)]));}else attrs[attr.name]=attr.value;}return {tag:node.tagName.toLowerCase(),attrs,children:[...node.childNodes].map(walk).filter(n=>n!==null)}};return walk(root)}`;
 await fs.writeFile('extracted_templates/inline-styles.json',JSON.stringify(await evaluate('[...document.querySelectorAll("style")].map(s=>s.textContent)'),null,2));
 console.log('cover ancestors',await evaluate('JSON.stringify((()=>{let e=document.querySelector(\'a[href="?open=1"]\');let arr=[];for(let i=0;e&&i<7;i++,e=e.parentElement)arr.push({tag:e.tagName,cls:e.className});return arr})())'));
 const coverSelector='a[href="?open=1"]';
 await fs.writeFile('extracted_templates/cover-tree.json',JSON.stringify(await evaluate('('+serialize+')(document.querySelector('+JSON.stringify(coverSelector)+').parentElement.parentElement.parentElement.parentElement.parentElement)'),null,2));
 await evaluate('document.querySelector(\'a[href="?open=1"]\').click()');
 await waitFor('Boolean(document.querySelector(\'[data-testid="minimalism-darkred-template"]\'))');
 await sleep(1200);
 await fs.writeFile('extracted_templates/open-tree.json',JSON.stringify(await evaluate('('+serialize+')(document.querySelector(\'[data-testid="minimalism-darkred-template"]\'))'),null,2));
 console.log('buttons',await evaluate('JSON.stringify([...document.querySelectorAll("button")].filter(b=>b.textContent.trim()).map(b=>({text:b.textContent,aria:b.getAttribute("aria-label")})))'));
 await evaluate('document.querySelector("button.group")?.click()');
 await sleep(200);
 console.log('dialogs',await evaluate('JSON.stringify([...document.querySelectorAll("dialog,[role=dialog]")].map(d=>({html:d.outerHTML.slice(0,600),open:d.open})))'));
 await fs.writeFile('extracted_templates/gift-open-body.html',await evaluate('document.body.outerHTML'));
 await fs.writeFile('extracted_templates/gift-body-tree.json',JSON.stringify(await evaluate('('+serialize+')(document.body)'),null,2));
 await evaluate('document.querySelector("dialog[open]").close()');
 await evaluate('[...document.querySelectorAll("button")].find(b=>b.textContent.trim().startsWith("X"))?.click()');
 await sleep(200);
 await fs.writeFile('extracted_templates/rsvp-body-tree.json',JSON.stringify(await evaluate('('+serialize+')(document.body)'),null,2));
 console.log('rsvp',await evaluate('JSON.stringify([...document.querySelectorAll("dialog[open],[role=dialog]")].map(d=>d.outerHTML.slice(0,1000)))'));

} finally {page.ws.close();await browser.call('Target.closeTarget',{targetId});browser.ws.close()}
