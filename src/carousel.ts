import { GuardError, type Guards } from "./core.js";

export type CarouselPlatform = "instagram" | "linkedin" | "tiktok";
export type SlideKind = "hook" | "content" | "cta";

export interface CarouselSlideInput {
  title?: string;
  body?: string;
}

export type CarouselOutline = string | CarouselSlideInput[];

export interface CarouselSlide {
  number: number;
  kind: SlideKind;
  title: string;
  body: string;
  disclosure?: string;
}

export interface CarouselDeck {
  topic: string;
  platform: CarouselPlatform;
  width: 1080;
  height: 1350;
  slides: CarouselSlide[];
  disclosure: string;
}

export interface CreateCarouselOptions {
  platform?: CarouselPlatform;
  disclosure?: string;
  guards?: Guards;
}

export interface CarouselValidationIssue {
  slide: number;
  field: "title" | "body" | "slides";
  message: string;
}

export interface CarouselValidation {
  valid: boolean;
  platform: CarouselPlatform;
  issues: CarouselValidationIssue[];
}

export interface ExportPlan {
  deckFile: "carousel-deck.json";
  htmlFile: "carousel.html";
  slides: Array<{ number: number; file: string; kind: SlideKind }>;
}

export const AI_DISCLOSURE = "AI-assisted content. Review before publishing.";

function clean(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function titleCase(topic: string): string {
  return topic.length === 0 ? "Your next idea" : topic;
}

function normalizeOutline(outline: CarouselOutline): CarouselSlideInput[] {
  if (typeof outline === "string") {
    return outline
      .split(/\n|\|/)
      .map(clean)
      .filter(Boolean)
      .map((body) => ({ body }));
  }
  if (!Array.isArray(outline)) throw new TypeError("slides must be a string outline or an array of slides");
  return outline.map((slide, index) => {
    if (typeof slide !== "object" || slide === null) {
      throw new TypeError(`slide ${index + 1} must be an object`);
    }
    if (slide.title !== undefined && typeof slide.title !== "string") {
      throw new TypeError(`slide ${index + 1} title must be a string`);
    }
    if (slide.body !== undefined && typeof slide.body !== "string") {
      throw new TypeError(`slide ${index + 1} body must be a string`);
    }
    return { title: slide.title, body: slide.body };
  });
}

/** Create a 1080×1350 carousel deck from an outline. */
export function createCarousel(
  topic: string,
  slidesOutline: CarouselOutline,
  options: CreateCarouselOptions = {},
): CarouselDeck {
  if (typeof topic !== "string" || clean(topic).length === 0) throw new TypeError("topic must be a non-empty string");
  options.guards?.checkDispatch(topic);
  const outline = normalizeOutline(slidesOutline);
  const disclosure = clean(options.disclosure ?? AI_DISCLOSURE) || AI_DISCLOSURE;
  const content = outline.map((item, index): CarouselSlide => ({
    number: index + 2,
    kind: "content",
    title: clean(item.title ?? `Point ${index + 1}`) || `Point ${index + 1}`,
    body: clean(item.body ?? ""),
  }));
  const deck: CarouselDeck = {
    topic: clean(topic),
    platform: options.platform ?? "instagram",
    width: 1080,
    height: 1350,
    disclosure,
    slides: [
      { number: 1, kind: "hook", title: titleCase(clean(topic)), body: "Swipe for the key ideas." },
      ...content,
      {
        number: content.length + 2,
        kind: "cta",
        title: "What will you try first?",
        body: "Save this carousel and share it with someone who needs it.",
        disclosure,
      },
    ],
  };
  const validation = validateCarousel(deck, deck.platform);
  if (!validation.valid) {
    throw new GuardError(validation.issues.map((issue) => `slide ${issue.slide}: ${issue.message}`).join("; "));
  }
  return deck;
}

const LIMITS: Record<CarouselPlatform, { title: number; body: number }> = {
  instagram: { title: 80, body: 220 },
  linkedin: { title: 120, body: 300 },
  tiktok: { title: 70, body: 180 },
};

/** Validate slide count and per-slide text limits for a publishing platform. */
export function validateCarousel(deck: CarouselDeck, platform: CarouselPlatform = deck.platform): CarouselValidation {
  const issues: CarouselValidationIssue[] = [];
  if (!deck || !Array.isArray(deck.slides)) {
    return { valid: false, platform, issues: [{ slide: 0, field: "slides", message: "deck needs slides" }] };
  }
  if (deck.slides.length < 2 || deck.slides.length > 10) {
    issues.push({ slide: 0, field: "slides", message: "a carousel must have 2 to 10 slides" });
  }
  const limits = LIMITS[platform];
  deck.slides.forEach((slide, index) => {
    const number = index + 1;
    if (typeof slide.title !== "string" || slide.title.length === 0) {
      issues.push({ slide: number, field: "title", message: "title is required" });
    } else if (slide.title.length > limits.title) {
      issues.push({ slide: number, field: "title", message: `title exceeds ${limits.title} characters for ${platform}` });
    }
    if (typeof slide.body !== "string") {
      issues.push({ slide: number, field: "body", message: "body must be a string" });
    } else if (slide.body.length > limits.body) {
      issues.push({ slide: number, field: "body", message: `body exceeds ${limits.body} characters for ${platform}` });
    }
  });
  const cta = deck.slides.at(-1);
  if (cta?.kind !== "cta" || !cta.disclosure?.trim()) {
    issues.push({ slide: deck.slides.length, field: "body", message: "CTA slide must include AI disclosure text" });
  }
  return { valid: issues.length === 0, platform, issues };
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

/** Render every slide as a self-contained, printable 1080×1350 HTML deck. */
export function renderCarouselHtml(deck: CarouselDeck): string {
  const validation = validateCarousel(deck);
  if (!validation.valid) throw new GuardError(validation.issues.map((issue) => issue.message).join("; "));
  const slides = deck.slides.map((slide) => `
    <section class="slide ${slide.kind}">
      <div class="number">${slide.number} / ${deck.slides.length}</div>
      <div class="content"><p class="eyebrow">${escapeHtml(deck.topic)}</p><h1>${escapeHtml(slide.title)}</h1><p class="body">${escapeHtml(slide.body)}</p></div>
      ${slide.disclosure ? `<p class="disclosure">${escapeHtml(slide.disclosure)}</p>` : ""}
    </section>`).join("\n");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(deck.topic)} carousel</title><style>
*{box-sizing:border-box}body{margin:0;background:#111827;color:#fff;font-family:Inter,Arial,sans-serif}.slide{width:1080px;height:1350px;margin:0 auto;position:relative;overflow:hidden;padding:90px;background:linear-gradient(145deg,#172554,#4338ca 60%,#db2777);page-break-after:always;display:flex;flex-direction:column}.slide.content{background:linear-gradient(145deg,#0f172a,#155e75)}.slide.cta{background:linear-gradient(145deg,#7c2d12,#e11d48)}.number{font-size:28px;opacity:.8;letter-spacing:.08em}.content{margin:auto 0}.eyebrow{text-transform:uppercase;letter-spacing:.13em;font-size:28px;font-weight:700;color:#c4b5fd}.hook h1{font-size:108px}.content h1{font-size:78px;line-height:1.05;margin:26px 0}.body{font-size:42px;line-height:1.35;max-width:850px}.disclosure{font-size:24px;opacity:.8;margin:0}@media print{body{background:#fff}.slide{margin:0;break-after:page}}</style></head><body>${slides}</body></html>`;
}

/** List the JSON, HTML, and per-slide image files a renderer should create. */
export function exportPlan(deck: CarouselDeck): ExportPlan {
  return {
    deckFile: "carousel-deck.json",
    htmlFile: "carousel.html",
    slides: deck.slides.map((slide) => ({ number: slide.number, kind: slide.kind, file: `slide-${String(slide.number).padStart(2, "0")}.png` })),
  };
}
