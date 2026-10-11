import { readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { createStore } from '../server/store.mjs';
import { aiConfiguration, createResearchSync } from '../server/research.mjs';
import { publicResearch } from '../server/public-research.mjs';

if (!aiConfiguration().apiKey) throw new Error('GAPGPT_API_KEY repository secret is required for weekly research.');
const previous = JSON.parse(await readFile('public/research.json', 'utf8'));
const store = createStore(path.join(tmpdir(), `harakat-research-${randomUUID()}`));
await store.update(state => { state.articles = previous.articles; state.sync.lastSuccess = previous.automation.lastSuccess; });
const result = await createResearchSync(store)();
if (result.status === 'failed') throw new Error('Research sync failed; the published snapshot was preserved.');
const snapshot = publicResearch(await store.read(), { configured: true });
await writeFile('public/research.json', `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Weekly research: ${result.status}; ${snapshot.articles.length} public briefs.`);
