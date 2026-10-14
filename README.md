# Agentic Carousel

Build platform-ready social carousels from an outline. The package creates a JSON deck with a hook slide, content slides, and a CTA slide that includes AI-content disclosure text. It creates no external images or network requests.

## Install and build

```sh
npm install
npm run build
npm run typecheck
npm test
```

## CLI

```sh
node dist/cli.js carousel create --topic "Better async handoffs" --slides "Start with context|Name the owner|Set a deadline"
node dist/cli.js carousel validate --file carousel-deck.json --platform linkedin
node dist/cli.js carousel render --file carousel-deck.json > carousel.html
```

`create` prints `{ deck, plan }` as JSON. `render` outputs one self-contained HTML document with inline CSS; each slide is exactly 1080×1350px. The export plan identifies the deck, HTML, and expected slide PNG names.

## Library

```js
import { createCarousel, validateCarousel, renderCarouselHtml, exportPlan } from "agentic-carousel";

const deck = createCarousel("Better async handoffs", [
  { title: "Give context", body: "Explain the outcome, constraints, and why it matters." },
  { title: "Name an owner", body: "Make responsibility explicit." },
]);

console.log(validateCarousel(deck, "instagram"));
console.log(renderCarouselHtml(deck));
console.log(exportPlan(deck));
```

Platforms supported by validation are `instagram`, `linkedin`, and `tiktok`. Carousels have 2–10 slides and platform-specific title/body limits.

## MCP

```sh
node dist/cli.js mcp
```

MCP tools: `create_carousel`, `validate_carousel`, `render_carousel_html`, `export_carousel_plan`, and `get_cost_report`.
