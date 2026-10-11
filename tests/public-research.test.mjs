import test from 'node:test';
import assert from 'node:assert/strict';
import { publicResearch } from '../server/public-research.mjs';
import { seedArticles } from '../server/seed.mjs';

test('static research export contains only public article fields', () => {
  const state = { articles: [{ ...seedArticles[0], internalNotes: 'private' }], requests: [{ name: 'private contact' }], drafts: [{ secret: 'private' }], sync: { status: 'published', lastSuccess: '2026-10-11T07:20:50.882Z', error: 'private error' } };
  const snapshot = publicResearch(state, { configured: true });
  const json = JSON.stringify(snapshot);
  assert.equal(json.includes('private'), false);
  assert.equal(snapshot.articles[0].id, seedArticles[0].id);
  assert.equal(snapshot.automation.configured, true);
  assert.equal(snapshot.automation.timezone, 'Asia/Tehran');
});
