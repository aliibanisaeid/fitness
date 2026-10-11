import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
const html = await readFile('dist-pages/index.html', 'utf8');
const research = JSON.parse(await readFile('public/research.json', 'utf8'));
const routes = ['programs', 'start', 'consultation', 'courses', 'journal', 'privacy',
  ...['knee', 'back', 'shoulder', 'ankle', 'general'].map(id => `programs/${id}`),
  ...['movement-foundations', 'strength-basics', 'return-to-activity'].map(id => `courses/${id}`),
  ...research.articles.map(article => `journal/${article.id}`)];
for (const locale of ['fa', 'en']) {
  const localized = html.replace('lang="fa" dir="rtl"', `lang="${locale}" dir="${locale === 'fa' ? 'rtl' : 'ltr'}"`);
  for (const route of ['', ...routes]) {
    const folder = path.join('dist-pages', locale, route);
    await mkdir(folder, { recursive: true });
    await writeFile(path.join(folder, 'index.html'), localized);
  }
}
await writeFile('dist-pages/404.html', html);
await writeFile('dist-pages/.nojekyll', '');
console.log(`Generated ${2 * (routes.length + 1)} refreshable localized Pages routes.`);
