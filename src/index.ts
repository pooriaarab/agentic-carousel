export { VERSION } from "./version.js";
export { defineBrand, createLogger, GuardError, VendorError, createGuards, LocalRouterAdapter, HttpRouterAdapter, recordCost, getCostReport, resetCosts, createDryRunResult, dispatchText, summarizeText } from "./core.js";
export type { BrandConfig, LogLevel, Logger, LoggerOptions, CapsConfig, QuietHoursConfig, GuardsConfig, Guards, DispatchReceipt, RouterAdapter, HttpRouterOptions, CostEntry, CostReport, DispatchOptions, DispatchResult, TopWord, TextSummary, SummarizeOptions } from "./core.js";
export { AI_DISCLOSURE, createCarousel, validateCarousel, renderCarouselHtml, exportPlan } from "./carousel.js";
export type { CarouselPlatform, SlideKind, CarouselSlideInput, CarouselOutline, CarouselSlide, CarouselDeck, CreateCarouselOptions, CarouselValidationIssue, CarouselValidation, ExportPlan } from "./carousel.js";

import { defineBrand, type BrandConfig } from "./core.js";
import { VERSION } from "./version.js";
export const DEFAULT_BRAND: BrandConfig = defineBrand({
  name: "Agentic Carousel", command: "agentic-carousel", description: "Build platform-ready carousels from an outline.",
  keywords: ["carousel", "instagram", "linkedin", "tiktok", "slides", "cli", "mcp"], version: VERSION,
});
