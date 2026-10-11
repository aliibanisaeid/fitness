const fields = ['id', 'category', 'image', 'publishedAt', 'readMinutes', 'sourceUrl', 'journal', 'evidence', 'origin', 'originalTitle', 'doi', 'pmid'];
const copyFields = ['title', 'excerpt', 'body', 'takeaways', 'limitations'];

export function publicResearch(state, { configured = false } = {}) {
  return {
    articles: state.articles.map(article => ({
      ...Object.fromEntries(fields.filter(key => article[key] !== undefined).map(key => [key, article[key]])),
      ...Object.fromEntries(['fa', 'en'].map(lang => [lang, Object.fromEntries(copyFields.map(key => [key, article[lang][key]]))]))
    })).sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
    automation: { configured, schedule: '0 9 * * 6', timezone: 'Asia/Tehran', lastSuccess: state.sync?.lastSuccess || null, status: state.sync?.status || 'not-configured' }
  };
}
