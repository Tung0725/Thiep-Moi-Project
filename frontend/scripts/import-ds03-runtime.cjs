const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const root = path.resolve(__dirname, '..', '..');
const source = path.resolve(process.argv[2] ?? path.join(root, 'extracted_templates', 'ds03-fresh'));
const prefix = '/templates/ds03-sang-trong/runtime/v1';
const objectPrefix = 'templates/ds03-sang-trong/runtime/v1';
const sourceOrigin = 'https://mehappy.vn';

const manifest = JSON.parse(fs.readFileSync(path.join(source, 'manifest.json'), 'utf8'));
const verification = JSON.parse(fs.readFileSync(path.join(source, 'extraction-verification.json'), 'utf8'));
const hashes = new Map([...verification.resources, ...verification.recoveredRevisitAssets].map(item => [item.path, item.sha256]));
const sha256 = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const hmac = (key, value) => crypto.createHmac('sha256', key).update(value).digest();
const encodePath = value => value.split('/').map(encodeURIComponent).join('/');

function loadEnvConfig() {
  const config = {};
  const envPath = path.join(root, '.env');
  if (fs.existsSync(envPath)) {
    for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match) config[match[1]] = match[2].replace(/^(['"])(.*)\1$/, '$2');
    }
  }
  const setting = (key, fallback) => process.env[key] ?? config[key] ?? fallback;
  return {
    endpoint: new URL(setting('STORAGE_ENDPOINT', 'http://localhost:9000')),
    bucket: setting('STORAGE_BUCKET_NAME', 'wedding-media'),
    access: setting('STORAGE_ACCESS_KEY', ''),
    secret: setting('STORAGE_SECRET_KEY', ''),
    region: setting('STORAGE_REGION', 'us-east-1'),
  };
}

function contentTypeFor(name) {
  const ext = path.extname(name).toLowerCase();
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.webp': 'image/webp',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.mp3': 'audio/mpeg',
  };
  return types[ext] ?? 'application/octet-stream';
}

function read(filename) {
  const fullPath = path.resolve(source, filename);
  if (!fullPath.startsWith(source + path.sep)) throw new Error(`Invalid capture path: ${filename}`);
  const bytes = fs.readFileSync(fullPath);
  if (sha256(bytes) !== hashes.get(filename)) throw new Error(`Capture checksum mismatch: ${filename}`);
  return bytes;
}

const assets = new Map();
const files = new Map();
const { data } = JSON.parse(read('data/128.json').toString('utf8'));
if (data.template.id !== 128 || data.content.desktop.sections.length !== 13) throw new Error('Unexpected DS03 capture');
const templateFonts = new Set(Object.values(data.template.fontMap).filter(value => typeof value === 'string'));

// Collect strictly pure static media & fonts (no JS chunks, HTML pages, or CSS bundles)
for (const resource of manifest.resources) {
  const uri = new URL(resource.url);
  if (resource.http_status !== 200 || uri.protocol !== 'https:') continue;
  const supported = ['fonts', 'styles', 'images', 'audio'].includes(resource.category);
  if (!supported) continue;

  let name;
  if (uri.hostname === 'mehappy.vn' && /^\/icons\//.test(uri.pathname)) name = uri.pathname.slice(1);
  if (uri.hostname === 's3-hcm-r2.s3cloud.vn' && /^\/thiepcuoi-mehappy\/(?:admin\/assets|audio-templates|fonts|users\/(?:5711|24012))\//.test(uri.pathname)) {
    name = `media/${resource.rel_path}`;
  }
  if (resource.category === 'fonts' && templateFonts.has(uri.href)) name ??= `media/${resource.rel_path}`;
  if (uri.hostname === 'fonts.gstatic.com' && resource.category === 'fonts') name = `media/${resource.rel_path}`;
  if (uri.hostname === 'fonts.googleapis.com' && resource.rel_path === 'styles/css2.css') name = 'media/fonts/google.css';
  if (uri.hostname === 'fonts.googleapis.com' && resource.rel_path === 'styles/css2_2.css') name = 'media/fonts/invitation-google.css';
  if (!name) continue;

  files.set(name, resource.rel_path);
  assets.set(uri.href, `${prefix}/${name}`);
  if (uri.hostname === 'mehappy.vn') assets.set(uri.pathname, `${prefix}/${name}`);
}

for (const item of verification.recoveredRevisitAssets) {
  const name = `media/${item.path}`;
  files.set(name, item.path);
  assets.set(`https://s3-hcm-r2.s3cloud.vn/thiepcuoi-mehappy/admin/assets/${path.basename(item.path)}`, `${prefix}/${name}`);
}

function assetUrl(value, base = sourceOrigin) {
  if (typeof value !== 'string' || value.startsWith('data:') || value.startsWith('#')) return value;
  const fullVariant = value.replace(/-(?:medium|preview)(\.webp)(?=$|\?)/i, '-full$1');
  if (assets.has(value)) return assets.get(value);
  if (assets.has(fullVariant)) return assets.get(fullVariant);
  try {
    const url = new URL(fullVariant, base);
    return assets.get(url.href) ?? (url.origin === sourceOrigin ? assets.get(url.pathname) : undefined);
  } catch {
    return undefined;
  }
}

function localizeValue(value) {
  if (typeof value === 'string') return assetUrl(value) ?? value;
  if (Array.isArray(value)) return value.map(localizeValue);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, localizeValue(v)]));
  }
  return value;
}

const runtimeObjects = new Map();

for (const [name, original] of files) {
  let bytes = read(original);
  if (name.endsWith('.css')) {
    const originalUrl = manifest.resources.find(item => item.rel_path === original).url;
    const originalStyles = bytes.toString('utf8').replace(/@font-face\s*\{[^}]*\}/g, rule => {
      const url = /url\(\s*['"]?([^)'"\s]+)/.exec(rule)?.[1];
      return !url || assetUrl(url, originalUrl) ? rule : '';
    });
    bytes = Buffer.from(originalStyles.replace(/url\(\s*(['"]?)([^)'"\s]+)\1\s*\)/g,
      (full, quote, url) => `url("${assetUrl(url, originalUrl) ?? url}")`), 'utf8');
  }
  runtimeObjects.set(name, bytes);
}

// Build clean, deduplicated native React scene.json (no iframe HTML/JS runtime)
const svgMap = new Map();
const svgBank = {};
function internSvg(rawSvg) {
  if (typeof rawSvg !== 'string' || !rawSvg.trim()) return rawSvg;
  const cleaned = rawSvg.replace(/<metadata[\s\S]*?<\/metadata>/gi, '').trim();
  if (svgMap.has(cleaned)) return svgMap.get(cleaned);
  const key = `$svg_${svgMap.size}`;
  svgMap.set(cleaned, key);
  svgBank[key] = cleaned;
  return key;
}

const MOBILE_DATE_FIXES = {
  ulpJ0a_cMP: { top: '584px' },
  ut4vQ3DBHV: { top: '615px' },
  Z3LDtLX5ns: { top: '589px' },
  RG9_1q5_VK: { top: '589px', left: '252px', width: '48px', textAlign: 'right' },
  '-4MyMrpxv1': { top: '589px', left: '304px', width: '52px', textAlign: 'left' },
};

const TEXT_TYPO_FIXES = {
  nCcxuKr6fx: [['Khoảnh khách', 'Khoảnh khắc']],
  ak1sEx2wji: [['tổ chúc', 'tổ chức']],
  '9Z_86Pq8W8': [['cho c dâu', 'cho cô dâu']],
  EpBnl_nlTH: [['Tải ảnh QR', 'Copy STK']],
  kyidBoITZY: [['Tải ảnh QR', 'Copy STK']],
  '79i2dwTWrn': [['Tải ảnh QR', 'Copy STK']],
};

function fixCopyString(nodeId, value) {
  let out = value.replace(/Coppy STK/g, 'Copy STK');
  const pairs = TEXT_TYPO_FIXES[nodeId];
  if (pairs) {
    for (const [from, to] of pairs) {
      out = out.split(from).join(to);
    }
  }
  return out;
}

function normalizeNode(node, platform = 'desktop') {
  if (!node || typeof node !== 'object') return node;
  const copy = { ...node };
  if (copy.props && typeof copy.props === 'object') {
    const nextProps = localizeValue(copy.props);
    if (platform === 'mobile' && MOBILE_DATE_FIXES[copy.id]) {
      Object.assign(nextProps, MOBILE_DATE_FIXES[copy.id]);
    }
    if (typeof nextProps.text === 'string') {
      nextProps.text = fixCopyString(copy.id, nextProps.text);
    }
    if (nextProps.textComponent && typeof nextProps.textComponent.text === 'string') {
      nextProps.textComponent = {
        ...nextProps.textComponent,
        text: fixCopyString(copy.id, nextProps.textComponent.text),
      };
    }
    if (copy.type === 'Icon' && typeof nextProps.svgCode === 'string' && nextProps.svgCode.trim()) {
      nextProps.svgCode = internSvg(nextProps.svgCode);
    }
    if (copy.type === 'Button' && nextProps.iconComponent && typeof nextProps.iconComponent.svgCode === 'string' && nextProps.iconComponent.svgCode.trim()) {
      nextProps.iconComponent = { ...nextProps.iconComponent, svgCode: internSvg(nextProps.iconComponent.svgCode) };
    }
    copy.props = nextProps;
  }
  if (Array.isArray(copy.children)) {
    copy.children = copy.children.map(child => normalizeNode(child, platform));
  }
  return copy;
}

const localizedTemplate = localizeValue(data.template);
localizedTemplate.customHtml = '';
localizedTemplate.customHtmlTrusted = false;
if (localizedTemplate.notificationSettings) {
  localizedTemplate.notificationSettings.enabled = false;
}

const { data: wishes } = JSON.parse(read('data/wishes.json').toString('utf8'));
const scenePayload = {
  version: 1,
  template: {
    id: localizedTemplate.id,
    name: localizedTemplate.name,
    pageSettings: localizedTemplate.pageSettings,
    effects: localizedTemplate.effects,
    audioSettings: localizedTemplate.audioSettings,
    openingEffect: localizedTemplate.openingEffect,
    customEffects: localizedTemplate.customEffects,
    fontMap: localizedTemplate.fontMap,
  },
  svgBank,
  desktop: { sections: (data.content.desktop.sections || []).map(node => normalizeNode(node, 'desktop')) },
  mobile: { sections: ((data.content.mobile || data.content.desktop).sections || []).map(node => normalizeNode(node, 'mobile')) },
  demoWishes: wishes,
};
runtimeObjects.set('scene.json', Buffer.from(JSON.stringify(scenePayload), 'utf8'));

async function uploadToMinio() {
  const { endpoint, bucket, access, secret, region } = loadEnvConfig();
  if (!access || !secret) {
    throw new Error('Missing STORAGE_ACCESS_KEY / STORAGE_SECRET_KEY in environment or .env');
  }

  async function storage(method, key = '', body = Buffer.alloc(0), contentType = 'application/octet-stream', queryString = '') {
    const baseUrl = new URL(`/${encodePath(bucket)}${key ? '/' + encodePath(key) : ''}`, endpoint);
    const params = [...new URLSearchParams(queryString).entries()].sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]));
    const canonicalQuery = params.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
    const fullUrl = new URL(baseUrl.href + (canonicalQuery ? `?${canonicalQuery}` : ''));

    const timestamp = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
    const day = timestamp.slice(0, 8);
    const digest = sha256(body);
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';
    const headers = `host:${fullUrl.host}\nx-amz-content-sha256:${digest}\nx-amz-date:${timestamp}\n`;
    const canonical = [method, fullUrl.pathname, canonicalQuery, headers, signedHeaders, digest].join('\n');
    const scope = `${day}/${region}/s3/aws4_request`;
    const signingKey = hmac(hmac(hmac(hmac('AWS4' + secret, day), region), 's3'), 'aws4_request');
    const signature = crypto.createHmac('sha256', signingKey)
      .update(`AWS4-HMAC-SHA256\n${timestamp}\n${scope}\n${sha256(canonical)}`).digest('hex');
    const response = await fetch(fullUrl, {
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
    if (!response.ok) {
      throw new Error(`MinIO ${method} ${key || fullUrl.search}: ${response.status} ${(await response.text()).slice(0, 200)}`);
    }
    return response;
  }

  async function listExistingKeys(keyPrefix) {
    const keys = [];
    let continuation = '';
    while (true) {
      const qs = `list-type=2&prefix=${encodeURIComponent(keyPrefix)}${continuation ? `&continuation-token=${encodeURIComponent(continuation)}` : ''}`;
      const xml = await (await storage('GET', '', Buffer.alloc(0), 'application/octet-stream', qs)).text();
      for (const match of xml.matchAll(/<Key>([^<]+)<\/Key>/g)) {
        keys.push(match[1].replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
      }
      const nextToken = /<NextContinuationToken>([^<]+)<\/NextContinuationToken>/.exec(xml)?.[1];
      if (!nextToken) break;
      continuation = nextToken.replace(/&amp;/g, '&');
    }
    return keys;
  }

  try {
    await storage('HEAD');
  } catch (error) {
    if (!error.message.includes(': 404 ')) throw error;
    await storage('PUT');
  }

  const uploadedFiles = [];
  let uploadedCount = 0;
  let skippedCount = 0;

  for (const [name, bytes] of runtimeObjects) {
    const key = `${objectPrefix}/${name}`;
    const localHash = sha256(bytes);
    const contentType = contentTypeFor(name);
    let existingHash = null;
    try {
      const existing = Buffer.from(await (await storage('GET', key)).arrayBuffer());
      existingHash = sha256(existing);
    } catch (error) {
      if (!error.message.includes(': 404 ')) throw error;
    }

    if (existingHash === localHash) {
      skippedCount++;
    } else {
      await storage('PUT', key, bytes, contentType);
      uploadedCount++;
    }

    const stored = Buffer.from(await (await storage('GET', key)).arrayBuffer());
    if (stored.length !== bytes.length || sha256(stored) !== localHash) {
      throw new Error(`Upload checksum mismatch: ${key}`);
    }
    uploadedFiles.push({ key, bytes: bytes.length, sha256: localHash, contentType, verified: true });
  }

  // Purge obsolete JS chunks, HTML pages, and legacy bridge scripts from MinIO
  const expectedKeys = new Set(uploadedFiles.map(item => item.key));
  expectedKeys.add(`${objectPrefix}/storage-verification.json`);
  const existingKeys = await listExistingKeys(`${objectPrefix}/`);
  let deletedCount = 0;
  for (const key of existingKeys) {
    if (!expectedKeys.has(key)) {
      await storage('DELETE', key);
      deletedCount++;
    }
  }

  const report = Buffer.from(JSON.stringify({
    template: 'ds03-sang-trong',
    bucket,
    prefix: objectPrefix,
    mode: 'native-scene-graph',
    verifiedAt: new Date().toISOString(),
    status: 'passed',
    totalFiles: uploadedFiles.length,
    uploaded: uploadedCount,
    skippedUnchanged: skippedCount,
    purgedLegacy: deletedCount,
    files: uploadedFiles,
  }, null, 2) + '\n', 'utf8');

  await storage('PUT', `${objectPrefix}/storage-verification.json`, report, 'application/json; charset=utf-8');
  const storedReport = Buffer.from(await (await storage('GET', `${objectPrefix}/storage-verification.json`)).arrayBuffer());
  if (sha256(storedReport) !== sha256(report)) {
    throw new Error('Verification report checksum mismatch.');
  }
  fs.writeFileSync(path.join(source, 'storage-verification.json'), report);
  console.log(`Native scene.json & static media synced to ${bucket}/${objectPrefix}/ (${uploadedFiles.length} total, ${uploadedCount} uploaded, ${skippedCount} unchanged, ${deletedCount} legacy JS/HTML purged).`);
}

uploadToMinio().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
