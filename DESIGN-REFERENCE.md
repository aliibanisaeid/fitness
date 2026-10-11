# Apple Fitness+ reference and implementation

Primary reference: [Apple Fitness+](https://www.apple.com/apple-fitness-plus/). Live desktop and mobile inspection on October 11, 2026 included scrolling through the hero, program/device panels, trainer galleries, activity tiles and footer. The additional review, media and implementation cycle began at 07:53:32 UTC and continued beyond 08:24:42 UTC, followed by final QA and the requested refinements.

| Observed reference pattern | HARAKAT implementation |
| --- | --- |
| Large centered headlines, restrained gray secondary text, ample section spacing | Bilingual centered section headings, BonyadeKoodak Persian typography and Apple platform stack for English |
| Bright #AAFF00 call-to-action pills | Matching neon token for primary actions, requested program labels, phone stage icons and consultation frame |
| #f5f5f7 panels with rounded corners around 28px | Gray rounded program and phone panels, consistent course/image radii |
| Alternating copy and oversized device imagery | Burgundy iPhone 18 Pro composition with interactive goal, equipment and available-time stages |
| Short eased reveals and restrained image movement | Once-only 20–28px reveals, small desktop image/device shifts, passive scroll listener and one animation frame per update |
| Continuous clipped galleries with a pause control | Course marquee with genuine course links, correctly mirrored Persian direction, pause/resume, offscreen suspension, keyboard/static mode |
| Large cinematic films supporting the message | Three locally hosted male-only scenes, gym selected by default, automatic offscreen/hidden-document suspension |
| Mobile device tiles stack copy above imagery; 390px tiles measured around 341px wide with 30px radii and 17px body headings | Stacked responsive phone panel, compact three-stage selector, contained phone frame and no root overflow at 320/390px |
| Mobile section headings measured 40px with 44px line-height; large screens measured 56px | Corresponding responsive section scale, adjusted for Persian font rhythm |

The final requested palette uses a centered 1180px black header with white text, a black footer with centered copyright/disclaimer rows, a black weekly-research banner with white copy, neon green featured labels and consultation background, #0071E3 blue service tiles with white text, a #FF3B30 red course headline, a #AF52DE purple journal headline and capitalized AI labels. Red eyebrow dots blink on a 1.6-second cycle and remain static with reduced motion. Hero play/plus overlays and the secondary hero action, phone caption, status clock and signal/Wi-Fi/battery icons, ambient video pause overlay and footer slogan were removed. The Dynamic Island remains as part of the phone frame.

## Verified behavior

- Persian RTL and English LTR pages, fonts and title endings
- No root overflow at 320px and 390px; centered mobile hero photograph
- Phone choices passed into the real intake form: shoulder, strength, gym, four days and thirty minutes
- English phone contents fit within the device screen
- All three films loaded to readyState 4 and played with the matching source
- Gallery pause holds position; resume returns animation to running after pointer leaves
- Reduced motion makes reveals visible, stops films, removes marquee animation and hides decorative copies
- Latest requested neon/black/white colors checked through rendered computed styles
- Solar Hijri calendar covers Nowruz, leap Esfand, month navigation, date limits and ungrouped years; the API retains ISO dates
- Production and Pages TypeScript/Vite builds passed; nineteen tests passed (fourteen backend, four calendar and one public-export privacy test)

Calendar conversion uses the browser's Intl Persian calendar: [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/DateTimeFormat). The Pages edition uses public research snapshots and downloads form drafts; the Node edition saves requests on its server. See README for deployment details.

Service-flow references: [E3 Rehab](https://e3rehab.com/) and [Dr. Ketabchi](https://drketabchi1.com/recieve-program/). No Superdesign tooling was used. Media sources and image directions are recorded separately.
