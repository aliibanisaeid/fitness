import path from 'node:path';
import { writeFile } from 'node:fs/promises';
import { createStore } from '../server/store.mjs';
import { aiConfiguration } from '../server/research.mjs';
import { publicResearch } from '../server/public-research.mjs';

const state = await createStore(process.env.DATA_DIR || path.resolve('data')).read();
const snapshot = publicResearch(state, { configured: Boolean(aiConfiguration().apiKey) });
await writeFile('public/research.json', `${JSON.stringify(snapshot, null, 2)}\n`);
console.log(`Exported ${snapshot.articles.length} public research briefs; private requests and drafts excluded.`);
