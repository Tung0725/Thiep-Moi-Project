import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

/** Upload an extracted archive to configured MinIO storage and replay it locally. */
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = new Set(process.argv.slice(2));
const option = name => {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith('--')) throw new Error(`Missing value for ${name}`);
  return value;
};
const source = path.resolve(root, option('--source') ?? 'extracted_templates');
const template = option('--template') ?? 'minimalism-do-dam';
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(template)) throw new Error('Invalid template id.');
const packageSource = option('--package') ? path.resolve(root, option('--package')) : null;
const config = {};
for (const line of (await fs.readFile(path.join(root, '.env'), 'utf8')).split(/\r?\n/)) {
  const match = line.match(/^\s*([A-Z_]+)\s*=\s*(.*?)\s*$/);
  if (match) config[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
}
const setting = (key, fallback) => process.env[key] ?? config[key] ?? fallback;
const endpoint = new URL(setting('STORAGE_ENDPOINT', 'http://localhost:9000'));
const bucket = setting('STORAGE_BUCKET_NAME', 'wedding-media');
const access = setting('STORAGE_ACCESS_KEY');
const secret = setting('STORAGE_SECRET_KEY');
const region = setting('STORAGE_REGION', 'us-east-1');
const prefix = `templates/${template}/archive`;
const port = Number(setting('ARCHIVE_PREVIEW_PORT', '3100'));
const manifest = JSON.parse(await fs.readFile(path.join(source, 'manifest.json'), 'utf8'));
const resources = manifest.resources;
const entry = resources.find(r => r.category === 'pages' && new URL(r.url).hostname === 'chungdoi.com');
if (!entry || !access || !secret) throw new Error('Missing archive entry or STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY.');
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const hmac = (key, value) => crypto.createHmac('sha256', key).update(value).digest();
const encodePath = value => value.split('/').map(encodeURIComponent).join('/');

async function storage(method, key = '', body = Buffer.alloc(0), contentType = 'application/octet-stream') {
  const url = new URL(`/${encodePath(bucket)}${key ? '/' + encodePath(key) : ''}`, endpoint);
  const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const day = timestamp.slice(0, 8);
  const digest = hash(body);
  const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
  const headers = `host:${url.host}\nx-amz-content-sha256:${digest}\nx-amz-date:${timestamp}\n`;
  const canonical = [method, url.pathname, '', headers, signedHeaders, digest].join('\n');
  const scope = `${day}/${region}/s3/aws4_request`;
  const signingKey = hmac(hmac(hmac(hmac('AWS4' + secret, day), region), 's3'), 'aws4_request');
  const signature = crypto.createHmac('sha256', signingKey)
    .update(`AWS4-HMAC-SHA256\n${timestamp}\n${scope}\n${hash(canonical)}`).digest('hex');
  const response = await fetch(url, {
    method,
    headers: {
      'x-amz-date': timestamp,
      'x-amz-content-sha256': digest,
      Authorization: `AWS4-HMAC-SHA256 Credential=${access}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
      'Content-Type': contentType,
    },
    ...(method === 'PUT' ? { body } : {}),
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`MinIO ${method} ${key}: ${response.status} ${(await response.text()).slice(0, 200)}`);
  return response;
}

if (args.has('--import')) {
  try {
    await storage('HEAD');
  } catch (error) {
    if (!error.message.includes(': 404 ')) throw error;
    await storage('PUT');
  }
  const uploadedFiles = [];
  const files = resources.map(resource => ({
    relative: resource.rel_path, size: resource.size_bytes, contentType: resource.content_type,
  }));
  for (const file of ['manifest.json', 'wedding_template_data.json', 'summary.md',
    'invitation_source.json', 'page-content.txt', 'extraction-notes.md', 'extraction-verification.json',
    'playback-data.json', 'integration-assets.json']) {
    try {
      await fs.access(path.join(source, file));
    } catch (error) {
      if (error.code === 'ENOENT' && !['manifest.json', 'wedding_template_data.json', 'summary.md'].includes(file)) continue;
      throw error;
    }
    files.push({ relative: file, contentType: file.endsWith('.json')
      ? 'application/json; charset=utf-8' : 'text/plain; charset=utf-8' });
  }
  try {
    const supplemental = JSON.parse(await fs.readFile(path.join(source, 'integration-assets.json'), 'utf8'));
    files.push(...supplemental.resources.map(resource => ({ relative: resource.rel_path,
      size: resource.size_bytes, contentType: resource.content_type, sha256: resource.sha256 })));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (packageSource) {
    const packageData = await fs.readFile(path.join(packageSource, 'datapackage.json'));
    files.push({ relative: 'original/datapackage.json', data: packageData, contentType: 'application/json' });
    files.push({ relative: 'original/datapackage-digest.json',
      data: await fs.readFile(path.join(packageSource, 'datapackage-digest.json')), contentType: 'application/json' });
    for (const resource of JSON.parse(packageData).resources) {
      const file = path.resolve(packageSource, resource.path);
      if (!file.startsWith(packageSource + path.sep)) throw new Error('Invalid source package path.');
      const data = await fs.readFile(file);
      if (data.length !== resource.bytes || `sha256:${hash(data)}` !== resource.hash) {
        throw new Error(`Source package checksum mismatch: ${resource.path}`);
      }
      files.push({ relative: `original/${resource.path}`, data, size: resource.bytes,
        contentType: resource.path.endsWith('.gz') ? 'application/gzip' : 'application/octet-stream' });
    }
  }
  for (const resource of files) {
    const file = path.resolve(source, resource.relative);
    if (!file.startsWith(source + path.sep)) throw new Error('Invalid archive path.');
    const data = resource.data ?? await fs.readFile(file);
    if (resource.sha256 && hash(data) !== resource.sha256) throw new Error(`Supplemental checksum mismatch: ${resource.relative}`);
    if (resource.size !== undefined && data.length !== resource.size) {
      throw new Error(`Archive size mismatch: ${resource.relative}`);
    }
    const key = `${prefix}/${resource.relative}`;
    let existing;
    try {
      existing = Buffer.from(await (await storage('GET', key)).arrayBuffer());
    } catch (error) {
      if (!error.message.includes(': 404 ')) throw error;
    }
    if (existing && hash(existing) !== hash(data)) throw new Error(`Existing object differs; refusing overwrite: ${key}`);
    if (!existing) await storage('PUT', key, data, resource.contentType);
    const stored = Buffer.from(await (await storage('GET', key)).arrayBuffer());
    if (stored.length !== data.length || hash(stored) !== hash(data)) {
      throw new Error(`Upload checksum mismatch: ${resource.relative}`);
    }
    uploadedFiles.push({ key, bytes: data.length, sha256: hash(data), verified: true });
  }
  const report = Buffer.from(JSON.stringify({
    template, bucket, prefix, verifiedAt: new Date().toISOString(),
    status: 'passed', scope: 'Byte-for-byte storage verification; visual and runtime fidelity not evaluated.',
    files: uploadedFiles,
  }, null, 2) + '\n');
  await storage('PUT', `${prefix}/storage-verification.json`, report, 'application/json');
  const storedReport = Buffer.from(await (await storage('GET', `${prefix}/storage-verification.json`)).arrayBuffer());
  if (hash(storedReport) !== hash(report)) throw new Error('Verification report checksum mismatch.');
  await fs.writeFile(path.join(source, 'storage-verification.json'), report);
  console.log(`Uploaded and SHA-256 verified ${uploadedFiles.length} files + verification report: ${bucket}/${prefix}/`);
}

if (args.has('--serve')) {
  const origin = `http://localhost:${port}`;
  const localPath = value => {
    const url = new URL(value);
    return url.hostname === 'chungdoi.com'
      ? url.pathname + url.search
      : `/__archive/${url.hostname}${url.pathname}${url.search}`;
  };
  const exact = new Map(resources.map(r => [localPath(r.url), r]));
  if (args.has('--playback')) {
    const playback = JSON.parse(await fs.readFile(path.join(source, 'playback-data.json'), 'utf8'));
    const replacement = resources.find(resource => resource.category === 'audio'
      && resource.url === playback.audio.sourceUrl);
    if (!replacement || playback.replacedMusicTrackId !== manifest.wedding_metadata.music.id) {
      throw new Error('Playback music does not match the archived template.');
    }
    const audio = Buffer.from(await (await storage('GET', `${prefix}/${replacement.rel_path}`)).arrayBuffer());
    if (hash(audio) !== playback.audio.sha256) throw new Error('Playback audio checksum mismatch.');
    exact.set(localPath(manifest.wedding_metadata.music.url), replacement);
    console.log(`Playback music: ${playback.metadata.music.title} - ${playback.metadata.music.artist}`);
  }
  const byPath = new Map();
  for (const resource of resources) {
    const pathname = localPath(resource.url).split('?')[0];
    if (!byPath.has(pathname)) byPath.set(pathname, resource);
  }
  const hosts = [...new Set(resources.map(r => new URL(r.url).origin))];
  const rewrite = text => {
    for (const host of hosts) {
      const replacement = host === 'https://chungdoi.com' ? origin : `${origin}/__archive/${new URL(host).hostname}`;
      text = text.replaceAll(host, replacement);
    }
    return text;
  };
  const cache = new Map();
  const server = http.createServer(async (request, response) => {
    try {
      const url = new URL(request.url, origin);
      if (url.pathname === '/') {
        response.writeHead(302, { Location: new URL(entry.url).pathname });
        response.end();
        return;
      }
      const resource = exact.get(url.pathname + url.search) ?? byPath.get(url.pathname);
      if (!resource) {
        response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        response.end('Resource was not captured in the archive.');
        return;
      }
      if (!['GET', 'HEAD'].includes(request.method) && resource.category !== 'data') {
        response.writeHead(405, { Allow: 'GET, HEAD' });
        response.end();
        return;
      }
      if (!cache.has(resource.rel_path)) {
        const stored = await storage('GET', `${prefix}/${resource.rel_path}`);
        let data = Buffer.from(await stored.arrayBuffer());
        if (['pages', 'styles', 'scripts', 'data'].includes(resource.category)) {
          let text = data.toString('utf8');
          if (resource === entry) {
            // Flight records contain byte lengths; changing their URLs corrupts hydration.
            text = text.split(/(<script>self\.__next_f\.push\([\s\S]*?<\/script>)/g)
              .map(part => part.startsWith('<script>self.__next_f.push(') ? part : rewrite(part)).join('');
            const replacements = Object.fromEntries(hosts.map(host => [host,
              host === 'https://chungdoi.com' ? origin : `${origin}/__archive/${new URL(host).hostname}`]));
            const bootstrap = `<script>(()=>{const hosts=${JSON.stringify(replacements)};const local=value=>{if(typeof value!=='string')return value;for(const [host,target] of Object.entries(hosts))if(value.startsWith(host+'/'))return target+value.slice(host.length);return value};const attr=Element.prototype.setAttribute;Element.prototype.setAttribute=function(name,value){return attr.call(this,name,['src','href','poster'].includes(name)?local(value):value)};for(const [type,key] of [[HTMLImageElement,'src'],[HTMLMediaElement,'src'],[HTMLIFrameElement,'src'],[HTMLLinkElement,'href']]){const d=Object.getOwnPropertyDescriptor(type.prototype,key);if(d?.set)Object.defineProperty(type.prototype,key,{...d,set(value){d.set.call(this,local(value))}})}const originalFetch=window.fetch;window.fetch=(input,init)=>originalFetch(typeof input==='string'?local(input):input,init);const open=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(method,url,...rest){return open.call(this,method,local(url),...rest)}})();</script>`;
            text = text.replace('<head>', '<head>' + bootstrap);
          } else {
            text = rewrite(text);
          }
          if (resource === entry) {
            // Rewritten archive assets have different hashes than the original deployment.
            text = text.replace(/\s+integrity="[^"]*"/g, '');
          }
          data = Buffer.from(text);
        }
        cache.set(resource.rel_path, data);
      }
      const data = cache.get(resource.rel_path);
      response.writeHead(200, {
        'Content-Type': resource.content_type,
        'Content-Length': data.length,
        'Cache-Control': 'no-store',
        'Access-Control-Allow-Origin': origin,
      });
      response.end(request.method === 'HEAD' ? undefined : data);
    } catch (error) {
      console.error(error.message);
      response.writeHead(502, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Unable to read archived resource from MinIO.');
    }
  });
  server.listen(port, '127.0.0.1', () => console.log(`Archive preview: ${origin}${new URL(entry.url).pathname}`));
  server.on('error', error => { console.error(error.message); process.exitCode = 1; });
} else if (!args.has('--import')) {
  console.log('Usage: node tools/preview_extracted.mjs --import [--serve]');
}
