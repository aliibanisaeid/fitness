import express from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { timingSafeEqual, randomBytes } from 'node:crypto';
import path from 'node:path';
import { z } from 'zod';
import { aiConfiguration } from './research.mjs';

const digits = v => String(v).replace(/[۰-۹]/g, c => '۰۱۲۳۴۵۶۷۸۹'.indexOf(c)).replace(/[٠-٩]/g, c => '٠١٢٣٤٥٦٧٨٩'.indexOf(c));
const requestSchema = z.object({
  type: z.enum(['program', 'consultation']), locale: z.enum(['fa', 'en']),
  name: z.string().trim().min(2).max(100),
  phone: z.string().transform(digits).refine(v => /^\+?[\d\s()-]{8,20}$/.test(v) && v.replace(/\D/g, '').length >= 8 && v.replace(/\D/g, '').length <= 15, 'Invalid phone'),
  email: z.union([z.email().max(200), z.literal('')]).optional(),
  area: z.enum(['knee', 'back', 'shoulder', 'ankle', 'general']),
  goal: z.string().trim().min(1).max(100),
  experience: z.enum(['beginner', 'returning', 'active']).optional(), equipment: z.enum(['home', 'basic', 'gym']).optional(),
  days: z.number().int().min(1).max(7).optional(), minutes: z.number().int().min(10).max(90).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  time: z.enum(['morning', 'afternoon', 'evening']).optional(),
  notes: z.string().trim().max(1500).optional(), consent: z.literal(true), website: z.string().max(0).optional()
}).superRefine((data, ctx) => {
  if (data.type === 'program') {
    for (const field of ['experience', 'equipment', 'days', 'minutes']) {
      if (data[field] === undefined) ctx.addIssue({ code: 'custom', path: [field], message: 'Required for program requests' });
    }
  }
});
export function createApp({ store, sync, adminToken = process.env.ADMIN_TOKEN, serveStatic = false, publicDir = path.resolve('dist') }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: {
    directives: { defaultSrc: ["'self'"], scriptSrc: ["'self'"], styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:'], fontSrc: ["'self'"], mediaSrc: ["'self'"],
      connectSrc: ["'self'"], frameSrc: ['https://www.youtube-nocookie.com'], objectSrc: ["'none'"], upgradeInsecureRequests: null }
  }, crossOriginEmbedderPolicy: false }));
  app.use(express.json({ limit: '20kb' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok', aiConfigured: Boolean(aiConfiguration().apiKey) }));
  app.get('/api/articles', async (_req, res) => {
    const { articles, sync: status } = await store.read();
    res.json({ articles: [...articles].sort((a,b) => b.publishedAt.localeCompare(a.publishedAt)), automation: {
      configured: Boolean(aiConfiguration().apiKey), schedule: process.env.ARTICLE_CRON || '0 9 * * 6',
      timezone: process.env.ARTICLE_TIMEZONE || 'Asia/Tehran', lastSuccess: status.lastSuccess, status: status.status
    } });
  });
  const submissionLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: 'draft-8', legacyHeaders: false, message: { error: 'too-many-requests' } });
  app.post('/api/requests', submissionLimiter, async (req, res) => {
    const result = requestSchema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ error: 'invalid-request', fields: result.error.issues.map(i => i.path.join('.')) });
    const data = result.data;
    if (data.type === 'consultation') {
      const minDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Tehran', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
      const maxDate = new Date(Date.now() + 90 * 86400000).toISOString().slice(0, 10);
      const validDate = data.date && Number.isFinite(Date.parse(data.date)) && new Date(data.date).toISOString().slice(0, 10) === data.date;
      if (!validDate || data.date < minDate || data.date > maxDate || !data.time) return res.status(400).json({ error: 'invalid-date' });
    }
    const reference = `HK-${randomBytes(5).toString('hex').toUpperCase()}`;
    await store.update(s => { s.requests.push({ ...data, reference, status: 'received', createdAt: new Date().toISOString() }); });
    res.status(201).json({ reference, status: 'received' });
  });
  const adminLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: 'draft-8', legacyHeaders: false });
  app.use('/api/admin', adminLimiter, (req, res, next) => {
    const supplied = req.get('authorization')?.replace(/^Bearer /, '') || '';
    if (!adminToken || Buffer.byteLength(supplied) !== Buffer.byteLength(adminToken) || !timingSafeEqual(Buffer.from(supplied), Buffer.from(adminToken))) return res.status(401).json({ error: 'unauthorized' });
    res.set('Cache-Control', 'no-store'); next();
  });
  app.get('/api/admin/requests', async (_req, res) => { res.json((await store.read()).requests); });
  app.get('/api/admin/editorial', async (_req, res) => { const s = await store.read(); res.json({ drafts: s.drafts, sync: s.sync }); });
  app.post('/api/admin/articles/sync', async (_req, res) => { res.json(await sync()); });
  app.post('/api/admin/articles/:id/publish', async (req, res) => {
    const found = await store.update(s => { const i = s.drafts.findIndex(a => a.id === req.params.id); if (i < 0) return false; s.articles.unshift(s.drafts.splice(i, 1)[0]); return true; });
    res.status(found ? 200 : 404).json({ status: found ? 'published' : 'not-found' });
  });
  app.use('/api', (_req, res) => { res.status(404).json({ error: 'not-found' }); });
  if (serveStatic) {
    app.use(express.static(publicDir, { maxAge: '1h' }));
    app.get('/{*path}', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')));
  }
  app.use((error, _req, res, _next) => {
    const status = Number.isInteger(error.status) && error.status >= 400 && error.status < 500 ? error.status : 500;
    if (status === 500) console.error('API error:', error.message);
    res.status(status).json({ error: status === 500 ? 'server-error' : 'invalid-request' });
  });
  return app;
}
