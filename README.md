# حرکت / HARAKAT

A Persian-first rehabilitation and fitness website, with a complete English version. Created in `~/Downloads/fitness` with a mock brand.

## Published website

- Website: https://aliibanisaeid.github.io/fitness/
- Persian: https://aliibanisaeid.github.io/fitness/fa/
- English: https://aliibanisaeid.github.io/fitness/en/
- Source: https://github.com/aliibanisaeid/fitness

The `main` branch publishes through `.github/workflows/pages.yml`. `npm run build:pages` builds into `dist-pages`, prefixes assets with `/fitness/`, and generates entry files for every current localized route so direct links and refreshes work.

GitHub Pages serves static files. The published form builder therefore downloads an explicitly labeled request draft; it does not claim the team has received it. The local Node edition saves real requests. To connect a separately hosted API, set `VITE_API_BASE_URL` to its HTTPS origin, permit this site's origin on that API, and rebuild.

Research remains automatic on Pages: the same workflow runs Saturdays at 05:30 UTC (09:00 Tehran), calls GapGPT with `gpt-6-luna`, saves only public article fields in `public/research.json`, and republishes the site. GitHub can delay scheduled jobs. `GAPGPT_API_KEY` is an encrypted repository secret, available only to the research job; it is never in client code or committed files. The workflow can also be dispatched with `refresh_research` enabled. An unsuccessful source/model call leaves the live snapshot intact.

To preview the static edition locally:

```sh
npm run build:pages
npx vite preview --mode pages --host 127.0.0.1 --port 5191
```

## Run locally

Requires Node.js 22.12+ (or 24/26) and npm.

```sh
cd ~/Downloads/fitness
npm ci
npm run dev
```

Open **http://127.0.0.1:5190/fa** or **http://127.0.0.1:5190/en**. The API runs on port 3190; Vite proxies `/api` to it.

```sh
npm test
npm run build
npm start
```

After building, `npm start` serves both the website and API at **http://127.0.0.1:3190**. Keep the Node process running for the weekly article scheduler. Use one server process with persistent storage. A static upload of `dist` alone does not provide forms or article automation.

## Included

- Persian and English routes, matching navigation and language switching
- Five program areas and a four-step individualized program request
- Consultation requests with a keyboard-accessible Solar Hijri calendar, ungrouped Persian year (۱۴۰۵), Saturday-first weeks, a 90-day selection window and Tehran time preferences; selected dates retain ISO format for the API
- Persistent server-side submissions with unique tracking references
- Three foundation courses, nine short lessons, filters, search and device-local lesson progress
- A research journal with dated sources, study limitations, search and topic filters
- Three local male-only films with a default gym scene, automatic visible-only playback, a native course video dialog and reduced-motion support
- Self-hosted BonyadeKoodak Persian fonts and Apple's platform font stack for English
- Responsive layouts, keyboard focus, accessible body-area tabs and server-side form validation
- Staggered scroll reveals, restrained desktop visual depth, smooth card/CTA/FAQ transitions, native scrolling and reduced-motion fallbacks
- Clean hero with one centered primary action and no image-overlay play or plus controls; heading lines have no trailing dots
- Interactive iPhone 18 Pro showcase with three request stages and real handoff of goal, body area, equipment and time preferences
- Six original male campaign photographs, a generated burgundy phone rear view, neon green accents, blue service tiles, purple journal headline, red course headline, a narrow black header and centered black footer with white text

The brand, campaign images and course materials are demonstration content. No real clinician identity, consultation availability or payment service has been connected. Submitting a form saves a **request**; it does not automatically book a clinician or produce a clinical prescription. The included course film illustrates movement; the nine lessons are written educational lessons.

## Weekly AI research briefs

The working folder is configured for GapGPT with the supplied key stored only in private `.env` (file mode `0600`). The selected model is **`gpt-6-luna`**. A real bilingual brief was successfully generated and published locally. The source archive intentionally excludes the key and live storage.

For a new installation, copy `.env.example` to `.env` and set a server-side `GAPGPT_API_KEY`. Never put this key in a `VITE_` variable or browser code. Do not overwrite an existing configured `.env`.

```sh
cp .env.example .env
# Edit .env locally, then restart the server.
```

The default schedule is **Saturday at 09:00, Asia/Tehran**. It searches the Europe PMC PubMed index for recent musculoskeletal rehabilitation trials and systematic reviews, selects the newest eligible unseen paper within the last 180 days, and calls GapGPT’s OpenAI-compatible Chat Completions endpoint to produce a structured Persian/English educational brief. Original metadata and source URLs come from the research provider. The UI labels generated briefs as AI-generated. Future dates, preprints, retracted publications and records without abstracts are excluded.

There is a catch-up check at server startup if the previous successful run was more than seven days ago. Run a sync manually with:

```sh
npm run articles:sync
```

Without an API key, the journal displays the three sourced editorial starter briefs. It does not pretend a model has run. Live discovery was verified against Europe PMC. Both controlled tests and a real GapGPT generation with `gpt-6-luna` passed. The first generated brief concerns a knee osteoarthritis trial (PMID 42775508), with original source metadata and explicit limitations.

By default, validated briefs are published automatically. Set `ARTICLE_REVIEW_REQUIRED=true` to create private drafts for review. Invalid output and source/model errors preserve existing articles. The default model is `gpt-6-luna`; configure `AI_MODEL` to change it. `AI_BASE_URL` defaults to `https://api.gapgpt.app/v1`. The integration follows the [GapGPT quickstart](https://gapgpt.app/platform-v2/docs/quickstart). Invalid, truncated or refused completions do not publish.

## Requests and editorial management

Set a strong `ADMIN_TOKEN` in `.env` to enable the protected administrative API. These endpoints require `Authorization: Bearer <your token>`:

| Method | Endpoint | Result |
| --- | --- | --- |
| GET | `/api/admin/requests` | Saved program and consultation requests |
| GET | `/api/admin/editorial` | Private drafts and sync status |
| POST | `/api/admin/articles/sync` | Run research discovery and summarization |
| POST | `/api/admin/articles/:id/publish` | Publish a reviewed draft |

For example, pass the token through an environment variable:

```sh
curl -H "Authorization: Bearer $HARAKAT_ADMIN_TOKEN" http://127.0.0.1:3190/api/admin/requests
```

There is no administrative login UI or outbound email/SMS connection. Requests are available through the protected API and the local data store for the site operator to handle.

## Storage and hosting

Server state is stored in `data/store.json` by default, with atomic writes and file mode `0600`. Set `DATA_DIR` to a persistent directory on the server. Keep this directory out of public web roots, source archives and version control. The public API never returns contact details or private drafts. Administrative responses use `Cache-Control: no-store`.

Earlier form checks used a separate directory under the Codex task's `work/preview-data` with artificial submissions. The final preview uses the working folder’s `data/` directory, containing the published research brief and no test contact requests. Source archives exclude all live storage.

For hosting, run `npm ci`, `npm run build`, then `npm start` behind your HTTPS reverse proxy. The default bind address is `127.0.0.1`. Configure your proxy and persistent process manager for this deployment. No external site has been published by this task.

## Design and media

Main visual reference: [Apple Fitness+](https://www.apple.com/apple-fitness-plus/), with large confident type, generous white space, prominent people, rounded imagery and movement. Service references: [E3 Rehab](https://e3rehab.com/) and [Dr. Ketabchi's program flow](https://drketabchi1.com/recieve-program/). The implementation was created directly; Superdesign was not used to generate the design.

See [MEDIA-CREDITS.md](MEDIA-CREDITS.md) for assets and research sources, [ASSET-PROMPTS.md](ASSET-PROMPTS.md) for image directions, and [DESIGN-REFERENCE.md](DESIGN-REFERENCE.md) for observed Apple patterns and their implementation. Edit `src/content.ts` and the localized strings in `src/` to replace the mock brand and content. The palette and layout are defined in `src/styles.css`.

## Validation

`npm test` covers consent and input validation, consultation dates, private storage, concurrent writes, admin access, deduplication, draft publication, failed/invalid AI output, overlapping runs and source filtering. Browser checks cover both languages, video playback, search/filter behavior, saved lesson progress, mobile navigation and complete local form submissions.

The final browser pass verified the phone-to-form handoff, all three local films, the gym default, gallery pause/resume, reduced-motion fallbacks, Persian/English layout, 320px and 390px widths, neon accents, and black navigation/footer. The phone status clock and radio/battery icons, its decorative caption, the ambient video pause overlay, and the footer slogan were removed as requested.
