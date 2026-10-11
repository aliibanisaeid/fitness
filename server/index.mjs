import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import cron from 'node-cron';
import { createStore } from './store.mjs';
import { aiConfiguration, createResearchSync } from './research.mjs';
import { createApp } from './app.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const store = createStore(process.env.DATA_DIR || path.join(root, 'data'));
const sync = createResearchSync(store);
const app = createApp({ store, sync, serveStatic: existsSync(path.join(root, 'dist/index.html')), publicDir: path.join(root, 'dist') });
const port = Number(process.env.PORT || 3190);
const host = process.env.HOST || '127.0.0.1';
const server = app.listen(port, host, () => console.log(`HARAKAT API: http://${host}:${port}`));
const schedule = process.env.ARTICLE_CRON || '0 9 * * 6';
if (!cron.validate(schedule)) throw new Error('Invalid ARTICLE_CRON');
const task = cron.schedule(schedule, () => sync().catch(e => console.error('Weekly article sync:', e.message)), { timezone: process.env.ARTICLE_TIMEZONE || 'Asia/Tehran' });
if (aiConfiguration().apiKey) {
  const state = await store.read();
  if (!state.sync.lastSuccess || Date.now() - Date.parse(state.sync.lastSuccess) > 7 * 86400000) sync().catch(e => console.error('Article catch-up:', e.message));
} else console.log('Weekly AI articles: waiting for GAPGPT_API_KEY in .env');
function stop() { task.stop(); server.close(); }
process.on('SIGTERM', stop); process.on('SIGINT', stop);
