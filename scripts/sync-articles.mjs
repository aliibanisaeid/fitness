import path from 'node:path';
import { createStore } from '../server/store.mjs';
import { createResearchSync } from '../server/research.mjs';
try {
  console.log(JSON.stringify(await createResearchSync(createStore(process.env.DATA_DIR || path.resolve('data')))(), null, 2));
} catch (error) { console.error(error.message); process.exitCode = 1; }
