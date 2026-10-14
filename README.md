# agentic-carousel

[![npm version](https://img.shields.io/npm/v/agentic-carousel)](https://www.npmjs.com/package/agentic-carousel)
[![Monthly downloads](https://img.shields.io/npm/dm/agentic-carousel)](https://www.npmjs.com/package/agentic-carousel)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/license/mit)

agentic-carousel is an open-source carousel deck generator for Node.js applications and AI agents, with JSON output, printable HTML, and social-platform text presets.

## Install

```sh
npm install agentic-carousel
```

Requires Node.js 18 or later. Includes TypeScript declarations and two direct runtime dependencies.

## Create your first deck

Save this example as `carousel.mjs`, then run `node carousel.mjs`.

```js
import { writeFileSync } from "node:fs";
import { createCarousel, validateCarousel, renderCarouselHtml } from "agentic-carousel";
const deck = createCarousel("Better handoffs", "Give context|Name an owner");
writeFileSync("carousel-deck.json", JSON.stringify(deck, null, 2));
writeFileSync("carousel.html", renderCarouselHtml(deck));
console.log(deck.slides.length, validateCarousel(deck).valid);
```

Expect `4 true`. Open `carousel.html` in a browser to see four 1080 × 1350 slides.
No credentials, model calls, or network requests are required.

## Features and coverage

- Accept newline-separated or pipe-separated outlines, or arrays of title/body objects.
- Add a hook and a call-to-action slide around the supplied content.
- Require disclosure text on the final slide; SDK options can customize it.
- Render escaped text into self-contained HTML with inline CSS.
- List expected JSON, HTML, and PNG filenames with `exportPlan`; it writes no files.

| Text preset | Status | Title limit | Body limit |
| --- | --- | --- | --- |
| Instagram | Local validation only | 80 characters | 220 characters |
| LinkedIn | Local validation only | 120 characters | 300 characters |
| TikTok | Local validation only | 70 characters | 180 characters |

The code defines three presets. These are package rules, without live platform verification or publishing integrations.

## Runtime surfaces

```sh
npx agentic-carousel carousel create --topic "Better handoffs" --slides "Give context|Name an owner"
npx agentic-carousel carousel validate --file carousel-deck.json --platform linkedin
npx agentic-carousel carousel render --file carousel-deck.json > carousel.html
npx agentic-carousel costs
npx agentic-carousel mcp
```

The CLI has five operational commands, plus `--help` and `--version`. The `carousel` prefix is optional.
Create accepts `--platform instagram|linkedin|tiktok` and prints `{ deck, plan }`; it does not save either object.
The Model Context Protocol (MCP) server exposes five tools: `create_carousel`, `validate_carousel`, `render_carousel_html`, `export_carousel_plan`, and `get_cost_report`.
The `agentic-carousel-mcp` binary starts the same server.
The Worker you deploy has `GET /health`, `POST /create`, and `POST /validate`; create uses the default Instagram preset.

## Behavior limits

Decks contain 2–10 slides, including the generated hook and final slide; outlines can contain at most eight content slides.
All presets use the same HTML size. Text presets do not guarantee platform acceptance or visual fit.
The package creates no PNG files or PDF files and does not upload or publish slides.
The CLI accepts `--live`, but generation stays local. There is no remote generation mode.
Carousel operations do not record cost units. The shared SDK also exports generic text summary and routing helpers.

## Links and status

[Package](https://www.npmjs.com/package/agentic-carousel) · [Source and support](https://github.com/pooriaarab/agentic-carousel)

Version 0.1.0 APIs can change. Public case studies are not yet published.
Run `npm run build`, `npm run typecheck`, and `npm test` before contributing.

## License

MIT.
