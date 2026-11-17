import express, { Request, Response } from 'express';
import http from 'http';
import https from 'https';
import vm from 'vm';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;
const upload = multer({
  limits: { fileSize: 15 * 1024 * 1024 }, // 15 MB
  storage: multer.memoryStorage(),
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Cache for vp.gt.tc anti-bot cookie
let cachedVpCookie: string | null = null;
let cookieExpireTime = 0;

// In-memory cache for assets categories and files to ensure blazing fast response
const cacheStore: Record<string, { data: any; expiry: number }> = {};

function fetchRaw(url: string, headers: Record<string, string> = {}): Promise<{ statusCode: number; headers: http.IncomingHttpHeaders; body: string }> {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https:');
    const client = isHttps ? https : http;
    const reqHeaders = {
      'User-Agent': USER_AGENT,
      'Accept-Encoding': 'identity',
      ...headers,
    };
    const req = client.get(url, { headers: reqHeaders }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode || 200, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => {
      req.destroy(new Error('Request timeout'));
    });
  });
}

async function getVpCookie(forceRefresh = false): Promise<string> {
  const now = Date.now();
  if (!forceRefresh && cachedVpCookie && now < cookieExpireTime) {
    return cachedVpCookie;
  }

  try {
    const initial = await fetchRaw('http://vp.gt.tc/?i=1');

    if (!initial.body.includes('slowAES')) {
      const setCookie = initial.headers['set-cookie'];
      if (setCookie && setCookie.length > 0) {
        cachedVpCookie = setCookie[0].split(';')[0];
        cookieExpireTime = now + 4 * 60 * 60 * 1000;
        return cachedVpCookie;
      }
      return '';
    }

    const aesRes = await fetchRaw('http://vp.gt.tc/aes.js');
    const scriptMatch = initial.body.match(/<script>([\s\S]*?toNumbers[\s\S]*?)<\/script>/i) ||
      initial.body.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
    if (!scriptMatch || !scriptMatch[1]) {
      return '';
    }

    const jsCode = scriptMatch[1].replace(/location\.href=[^;]+;/, '');
    const ctx: any = {
      document: {},
      location: {},
      parseInt: parseInt,
    };
    vm.createContext(ctx);
    vm.runInContext(aesRes.body, ctx);
    vm.runInContext(jsCode, ctx);

    if (ctx.document.cookie) {
      const computedCookie = ctx.document.cookie.split(';')[0];
      // Activate session in firewall by visiting ?i=2 with exact same User-Agent and Referer
      await fetchRaw('http://vp.gt.tc/?i=2', {
        Cookie: computedCookie,
        Referer: 'http://vp.gt.tc/?i=1',
      });

      cachedVpCookie = computedCookie;
      cookieExpireTime = now + 4 * 60 * 60 * 1000; // 4 hours
      return cachedVpCookie || '';
    }
  } catch (err) {
    console.error('Error resolving vp.gt.tc anti-bot cookie:', err);
  }

  return cachedVpCookie || '';
}

// 1. Assets API: /api/assets?type=live | advance
app.get('/api/assets', async (req: Request, res: Response) => {
  const type = req.query.type === 'advance' ? 'advance' : 'live';
  const cacheKey = `assets_cats_${type}`;
  if (cacheStore[cacheKey] && Date.now() < cacheStore[cacheKey].expiry) {
    return res.json(cacheStore[cacheKey].data);
  }

  try {
    let cookie = await getVpCookie();
    const targetUrl = `http://vp.gt.tc/assets/?type=${type}`;
    let result = await fetchRaw(targetUrl, {
      Cookie: cookie,
      Referer: 'http://vp.gt.tc/assets/',
    });

    // If challenge was returned again, force refresh cookie and retry once
    if (result.body.includes('slowAES')) {
      cookie = await getVpCookie(true);
      result = await fetchRaw(targetUrl, {
        Cookie: cookie,
        Referer: 'http://vp.gt.tc/assets/',
      });
    }

    try {
      const data = JSON.parse(result.body);
      cacheStore[cacheKey] = { data, expiry: Date.now() + 10 * 60 * 1000 }; // 10 min cache
      return res.json(data);
    } catch {
      return res.status(500).json({ error: 'Invalid response from upstream assets server', raw: result.body.slice(0, 200) });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to fetch categories' });
  }
});

// 2. Assets Files API: /api/assets/files?btype=live&cat=optionallocres&ver=51
app.get('/api/assets/files', async (req: Request, res: Response) => {
  const { btype = 'live', cat, ver } = req.query;
  if (!cat || !ver) {
    return res.status(400).json({ error: 'Category (cat) and Version (ver) are required' });
  }

  const cacheKey = `assets_files_${btype}_${cat}_${ver}`;
  if (cacheStore[cacheKey] && Date.now() < cacheStore[cacheKey].expiry) {
    return res.json(cacheStore[cacheKey].data);
  }

  try {
    let cookie = await getVpCookie();
    const targetUrl = `http://vp.gt.tc/assets/?build_urls=1&btype=${encodeURIComponent(String(btype))}&cat=${encodeURIComponent(String(cat))}&ver=${encodeURIComponent(String(ver))}`;
    let result = await fetchRaw(targetUrl, {
      Cookie: cookie,
      Referer: 'http://vp.gt.tc/assets/',
    });

    if (result.body.includes('slowAES')) {
      cookie = await getVpCookie(true);
      result = await fetchRaw(targetUrl, {
        Cookie: cookie,
        Referer: 'http://vp.gt.tc/assets/',
      });
    }

    try {
      const data = JSON.parse(result.body);
      cacheStore[cacheKey] = { data, expiry: Date.now() + 30 * 60 * 1000 }; // 30 min cache
      return res.json(data);
    } catch {
      return res.status(500).json({ error: 'Failed to parse file URLs from assets provider' });
    }
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to build asset URLs' });
  }
});

// 3. Remini AI Enhance: /api/enhance
app.post('/api/enhance', upload.single('image'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'No image file provided' });
  }

  try {
    let cookie = await getVpCookie();
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const postData = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="image"; filename="${req.file.originalname || 'upload.jpg'}"\r\nContent-Type: ${req.file.mimetype || 'image/jpeg'}\r\n\r\n`),
      req.file.buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const executeUpload = (cookieStr: string) => {
      return new Promise<any>((resolve, reject) => {
        const upstreamReq = http.request(
          'http://vp.gt.tc/Enhance/ai.php',
          {
            method: 'POST',
            headers: {
              'User-Agent': USER_AGENT,
              Cookie: cookieStr,
              Referer: 'http://vp.gt.tc/Enhance/',
              'Content-Type': `multipart/form-data; boundary=${boundary}`,
              'Content-Length': postData.length,
            },
          },
          (upstreamRes) => {
            let body = '';
            upstreamRes.on('data', (c) => (body += c));
            upstreamRes.on('end', () => {
              try {
                const data = JSON.parse(body);
                resolve(data);
              } catch {
                resolve({ raw: body });
              }
            });
          }
        );

        upstreamReq.on('error', reject);
        upstreamReq.setTimeout(45000, () => {
          upstreamReq.destroy(new Error('Enhance service timeout'));
        });
        upstreamReq.write(postData);
        upstreamReq.end();
      });
    };

    let result = await executeUpload(cookie);
    if (result.raw && result.raw.includes('slowAES')) {
      cookie = await getVpCookie(true);
      result = await executeUpload(cookie);
    }

    if (result.success !== undefined) {
      return res.json(result);
    }
    return res.status(500).json({ success: false, error: 'Could not parse Remini AI response' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Image Proxy: /api/proxy-image?url=...
app.get('/api/proxy-image', (req: Request, res: Response) => {
  const imageUrl = req.query.url as string;
  if (!imageUrl) {
    return res.status(400).send('Image URL required');
  }

  const isHttps = imageUrl.startsWith('https:');
  const client = isHttps ? https : http;

  const clientReq = client.get(
    imageUrl,
    {
      headers: {
        'User-Agent': USER_AGENT,
        Referer: 'http://vp.gt.tc/',
      },
    },
    (imgRes) => {
      if (imgRes.statusCode && imgRes.statusCode >= 400) {
        return res.status(imgRes.statusCode).send('Failed to fetch image');
      }

      res.setHeader('Content-Type', imgRes.headers['content-type'] || 'image/jpeg');
      if (imgRes.headers['content-length']) {
        res.setHeader('Content-Length', imgRes.headers['content-length']);
      }
      res.setHeader('Cache-Control', 'public, max-age=86400');
      imgRes.pipe(res);
    }
  );

  clientReq.on('error', (err) => {
    res.status(500).send('Proxy error: ' + err.message);
  });
});

// 5. HD Upscaler Upload: /api/hd-upload
app.post('/api/hd-upload', upload.single('myfile'), async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ error: true, message: 'No image uploaded' });
  }

  try {
    let cookie = await getVpCookie();
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const postData = Buffer.concat([
      Buffer.from(`--${boundary}\r\nContent-Disposition: form-data; name="myfile"; filename="${req.file.originalname || 'image.png'}"\r\nContent-Type: ${req.file.mimetype || 'image/png'}\r\n\r\n`),
      req.file.buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const executeUpload = (cookieStr: string) => {
      return new Promise<any>((resolve, reject) => {
        const upstreamReq = http.request(
          'http://vp.gt.tc/HD/?action=upload',
          {
            method: 'POST',
            headers: {
              'User-Agent': USER_AGENT,
              Cookie: cookieStr,
              Referer: 'http://vp.gt.tc/HD/',
              'Content-Type': `multipart/form-data; boundary=${boundary}`,
              'Content-Length': postData.length,
            },
          },
          (upstreamRes) => {
            let body = '';
            upstreamRes.on('data', (c) => (body += c));
            upstreamRes.on('end', () => {
              try {
                const data = JSON.parse(body);
                resolve(data);
              } catch {
                resolve({ raw: body });
              }
            });
          }
        );
        upstreamReq.on('error', reject);
        upstreamReq.setTimeout(30000, () => {
          upstreamReq.destroy(new Error('Upload timeout'));
        });
        upstreamReq.write(postData);
        upstreamReq.end();
      });
    };

    let result = await executeUpload(cookie);
    if (result.raw && result.raw.includes('slowAES')) {
      cookie = await getVpCookie(true);
      result = await executeUpload(cookie);
    }

    if (result.code) {
      return res.json(result);
    }
    return res.status(500).json({ error: true, message: 'Invalid response from upscaler upload' });
  } catch (err: any) {
    return res.status(500).json({ error: true, message: err.message });
  }
});

// 6. HD Upscaler Status Check: /api/hd-status
app.post('/api/hd-status', (req: Request, res: Response) => {
  const { code, scaleRadio = 4 } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  const payload = JSON.stringify({ code, scaleRadio: Number(scaleRadio) });
  const checkReq = https.request(
    'https://get1.imglarger.com/api/UpscalerNew/CheckStatusNew',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': USER_AGENT,
        Referer: 'https://imgupscaler.com/',
        Origin: 'https://imgupscaler.com',
        'Content-Length': Buffer.byteLength(payload),
      },
    },
    (checkRes) => {
      let body = '';
      checkRes.on('data', (c) => (body += c));
      checkRes.on('end', () => {
        try {
          const data = JSON.parse(body);
          return res.json(data);
        } catch {
          return res.status(500).json({ error: 'Failed to parse status response' });
        }
      });
    }
  );

  checkReq.on('error', (err) => {
    res.status(500).json({ error: err.message });
  });

  checkReq.write(payload);
  checkReq.end();
});

// 7. Health & Status
app.get('/api/health', async (_req: Request, res: Response) => {
  const cookie = await getVpCookie();
  res.json({
    status: 'online',
    platform: 'Shah G Creator FF Tools',
    upstreamConnected: !!cookie,
    timestamp: new Date().toISOString(),
  });
});

// Mount Vite or serve static
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(Number(port), '0.0.0.0', () => {
    console.log(`Free Fire Tools Server running at http://0.0.0.0:${port}`);
  });
}

startServer();
