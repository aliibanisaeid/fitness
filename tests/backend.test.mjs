import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm, stat } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createApp } from '../server/app.mjs';
import { createStore } from '../server/store.mjs';
import { createResearchSync, fetchResearch, generateSummary, researchQuery } from '../server/research.mjs';

const adminToken = 'local-test-token';
const program = { type: 'program', locale: 'fa', name: 'کاربر آزمایشی', phone: '۰۹۱۲۰۰۰۰۰۰۰', email: '', area: 'knee', goal: 'move', experience: 'beginner', equipment: 'home', days: 3, minutes: 30, consent: true, website: '' };
const paper = { pmid: '99999999', title: 'A randomized trial of rehabilitation education', abstract: 'Example abstract data.', journal: 'Example Research Journal', publishedAt: '2026-10-01', doi: '10.0000/example', evidence: 'Randomized Controlled Trial' };
const copy = { title: 'Understanding rehabilitation education', excerpt: 'A careful look at one research abstract.', body: 'This is an educational summary of the supplied trial abstract. Its findings apply only to the population and setting studied.', takeaways: ['The study examined one specific population.', 'Interpret the findings with the reported uncertainty.'], limitations: 'The abstract alone cannot establish individual treatment decisions.' };
const summary = { fa: { ...copy, title: 'نگاهی به آموزش در بازتوانی' }, en: copy };

async function setup(t, syncOptions) {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'harakat-test-'));
  const store = createStore(dir);
  const sync = createResearchSync(store, syncOptions ?? { enabled: () => false });
  const app = createApp({ store, sync, adminToken });
  const server = await new Promise(resolve => { const s = app.listen(0, '127.0.0.1', () => resolve(s)); });
  const base = `http://127.0.0.1:${server.address().port}`;
  t.after(async () => { await new Promise(resolve => server.close(resolve)); await rm(dir, { recursive: true, force: true }); });
  return { store, sync, dir, request: (route, opts) => fetch(base + route, opts) };
}
const post = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
const auth = { Authorization: `Bearer ${adminToken}` };

test('a valid program request is normalized, saved privately and given a real reference', async t => {
  const { request, store, dir } = await setup(t);
  const response = await request('/api/requests', post(program));
  assert.equal(response.status, 201);
  const result = await response.json();
  assert.match(result.reference, /^HK-[A-F0-9]{10}$/);
  const saved = (await store.read()).requests[0];
  assert.equal(saved.reference, result.reference);
  assert.equal(saved.phone, '09120000000');
  assert.equal(saved.status, 'received');
  assert.equal((await stat(path.join(dir, 'store.json'))).mode & 0o777, 0o600);
  assert.equal((await request('/api/admin/requests')).status, 401);
  const admin = await request('/api/admin/requests', { headers: auth });
  assert.equal(admin.headers.get('cache-control'), 'no-store');
  assert.equal((await admin.json()).length, 1);
  assert.equal(JSON.stringify(await (await request('/api/articles')).json()).includes(saved.phone), false);
});

test('consent, phone, honeypot and required program preferences are validated on the server', async t => {
  const { request, store } = await setup(t);
  for (const change of [{ consent: false }, { phone: 'abc' }, { phone: '--------' }, { phone: '1111-----' }, { website: 'spam' }, { days: 8 }, { equipment: 'unknown' }, { experience: undefined }]) {
    assert.equal((await request('/api/requests', post({ ...program, ...change }))).status, 400);
  }
  assert.equal((await store.read()).requests.length, 0);
});

test('consultations require a valid future date and remain requests until coordinated', async t => {
  const { request, store } = await setup(t);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const consultation = { ...program, type: 'consultation', date: tomorrow, time: 'afternoon' };
  assert.equal((await request('/api/requests', post(consultation))).status, 201);
  for (const date of ['2000-01-01', '2099-02-30', '2099-12-01']) {
    assert.equal((await request('/api/requests', post({ ...consultation, date }))).status, 400);
  }
  assert.equal((await request('/api/requests', post({ ...consultation, time: undefined }))).status, 400);
  assert.equal((await store.read()).requests[0].status, 'received');
});

test('malformed JSON is rejected without an internal-error response', async t => {
  const { request } = await setup(t);
  assert.equal((await request('/api/requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{bad' })).status, 400);
});

test('concurrent store updates preserve every request and survive reopening', async t => {
  const { store, dir } = await setup(t);
  await Promise.all(Array.from({ length: 25 }, (_, i) => store.update(s => s.requests.push({ reference: `TEST-${i}` }))));
  const reopened = createStore(dir);
  assert.equal((await reopened.read()).requests.length, 25);
  assert.equal(new Set((await reopened.read()).requests.map(r => r.reference)).size, 25);
});

test('missing AI configuration does not call the model or claim publication', async t => {
  const { sync, store } = await setup(t, { enabled: () => false, summarize: () => { throw new Error('must not run'); } });
  assert.equal((await sync()).status, 'not-configured');
  assert.equal((await store.read()).articles.length, 3);
  assert.equal((await store.read()).sync.lastSuccess, null);
});

test('weekly sync publishes a bilingual sourced article once and deduplicates repeat runs', async t => {
  const { sync, store, request } = await setup(t, { enabled: () => true, fetchPapers: async () => [paper], summarize: async () => summary, reviewRequired: () => false });
  assert.equal((await sync()).status, 'published');
  assert.equal((await sync()).status, 'up-to-date');
  const article = (await store.read()).articles.find(a => a.pmid === paper.pmid);
  assert.equal(article.origin, 'ai');
  assert.equal(article.sourceUrl, `https://pubmed.ncbi.nlm.nih.gov/${paper.pmid}/`);
  assert.equal(article.fa.title, summary.fa.title);
  assert.equal(article.en.limitations, summary.en.limitations);
  assert.equal((await (await request('/api/articles')).json()).articles.filter(a => a.pmid === paper.pmid).length, 1);
});

test('editorial review keeps drafts private until an authenticated publish request', async t => {
  const { sync, request } = await setup(t, { enabled: () => true, fetchPapers: async () => [paper], summarize: async () => summary, reviewRequired: () => true });
  const result = await sync();
  assert.equal(result.status, 'awaiting-review');
  assert.equal((await (await request('/api/articles')).json()).articles.length, 3);
  const endpoint = `/api/admin/articles/${result.articleId}/publish`;
  assert.equal((await request(endpoint, { method: 'POST' })).status, 401);
  assert.equal((await request(endpoint, { method: 'POST', headers: auth })).status, 200);
  assert.equal((await (await request('/api/articles')).json()).articles.length, 4);
  assert.equal((await request(endpoint, { method: 'POST', headers: auth })).status, 404);
});

test('invalid or failed AI output preserves existing articles and is marked failed', async t => {
  const { sync, store } = await setup(t, { enabled: () => true, fetchPapers: async () => [paper], summarize: async () => ({ fa: { title: 'bad' } }) });
  await assert.rejects(sync());
  const state = await store.read();
  assert.equal(state.articles.length, 3);
  assert.equal(state.drafts.length, 0);
  assert.equal(state.sync.status, 'failed');
  assert.equal(state.sync.lastSuccess, null);
});

test('overlapping scheduled runs cannot create duplicate articles', async t => {
  let release;
  const ready = new Promise(resolve => { release = resolve; });
  const { sync, store } = await setup(t, { enabled: () => true, fetchPapers: async () => { await ready; return [paper]; }, summarize: async () => summary });
  const first = sync();
  assert.equal((await sync()).status, 'running');
  release();
  assert.equal((await first).status, 'published');
  assert.equal((await store.read()).articles.filter(a => a.pmid === paper.pmid).length, 1);
});

test('research discovery filters future dates, retractions, preprints and missing abstracts', async () => {
  const result = { id: '123', source: 'MED', title: 'A <b>clinical</b> trial', abstractText: '<p>An abstract.</p>', firstPublicationDate: '2026-10-01', pubTypeList: { pubType: ['Randomized Controlled Trial'] } };
  let requestedUrl;
  const papers = await fetchResearch({ now: new Date('2026-10-11T10:00:00Z'), fetchImpl: async url => {
    requestedUrl = url;
    return { ok: true, json: async () => ({ resultList: { result: [result, { ...result, id: '124', firstPublicationDate: '2027-01-01' }, { ...result, id: '125', pubTypeList: { pubType: ['Retracted Publication'] } }, { ...result, id: '126', pubTypeList: { pubType: ['Preprint'] } }, { ...result, id: '127', abstractText: '' }] } }) };
  } });
  assert.equal(papers.length, 1);
  assert.equal(papers[0].title, 'A clinical trial');
  assert.equal(papers[0].abstract, 'An abstract.');
  assert.equal(requestedUrl.origin, 'https://www.ebi.ac.uk');
  assert.match(researchQuery(new Date('2026-10-11T10:00:00Z')), /TO 2026-10-11/);
});

test('failed research-provider requests do not yield invented articles', async () => {
  await assert.rejects(fetchResearch({ fetchImpl: async () => ({ ok: false, status: 503 }) }), /503/);
});

test('GapGPT summaries use the selected model, structured chat output and remove trailing title dots', async () => {
  let request;
  const result = await generateSummary(paper, {
    apiKey: 'unit-test-key', model: 'gpt-6-luna', baseURL: 'https://api.gapgpt.app/v1',
    fetchImpl: async (url, options) => {
      request = { url: String(url), body: JSON.parse(options.body), headers: new Headers(options.headers) };
      return new Response(JSON.stringify({ choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ fa: { ...summary.fa, title: summary.fa.title + '.' }, en: { ...summary.en, title: summary.en.title + '.' } }) } }] }), { headers: { 'Content-Type': 'application/json' } });
    }
  });
  assert.equal(request.url, 'https://api.gapgpt.app/v1/chat/completions');
  assert.equal(request.body.model, 'gpt-6-luna');
  assert.equal(request.headers.get('authorization'), 'Bearer unit-test-key');
  assert.equal(request.body.response_format.type, 'json_schema');
  assert.equal(request.body.response_format.json_schema.strict, true);
  assert.deepEqual(JSON.parse(request.body.messages[1].content), paper);
  assert.equal(result.fa.title, summary.fa.title);
  assert.equal(result.en.title, summary.en.title);
});

test('truncated and refused provider completions cannot become published briefs', async () => {
  for (const choice of [
    { finish_reason: 'length', message: { content: JSON.stringify(summary) } },
    { finish_reason: 'stop', message: { content: JSON.stringify(summary), refusal: 'Cannot summarize' } },
    { finish_reason: 'stop', message: { content: '{invalid json' } }
  ]) {
    await assert.rejects(generateSummary(paper, { apiKey: 'unit-test-key', fetchImpl: async () => new Response(JSON.stringify({ choices: [choice] }), { headers: { 'Content-Type': 'application/json' } }) }));
  }
});
