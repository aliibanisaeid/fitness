import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { seedArticles } from './seed.mjs';

export function createStore(dir) {
  const file = path.join(dir, 'store.json');
  let queue = Promise.resolve();
  const empty = () => ({ requests: [], articles: structuredClone(seedArticles), drafts: [], sync: { lastAttempt: null, lastSuccess: null, status: 'not-configured' } });
  async function read() {
    try { return JSON.parse(await readFile(file, 'utf8')); }
    catch (error) { if (error.code !== 'ENOENT') throw error; return empty(); }
  }
  function update(fn) {
    const next = queue.then(async () => {
      await mkdir(dir, { recursive: true, mode: 0o700 });
      const state = await read();
      const result = await fn(state);
      const tmp = `${file}.${randomUUID()}.tmp`;
      await writeFile(tmp, JSON.stringify(state, null, 2), { mode: 0o600 });
      await rename(tmp, file);
      return result;
    });
    queue = next.catch(() => {});
    return next;
  }
  return { read, update };
}
