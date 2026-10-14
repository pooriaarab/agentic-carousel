import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createCarousel, exportPlan, renderCarouselHtml, validateCarousel, type CarouselDeck } from "./carousel.js";
import { getCostReport, GuardError } from "./core.js";
import { DEFAULT_BRAND } from "./index.js";
const ok = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value) }] });
const fail = (error: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }) }], isError: true as const });
export interface McpDeps { }
export function createMcpServer(_deps: McpDeps = {}): McpServer {
  const server = new McpServer({ name: DEFAULT_BRAND.command, version: DEFAULT_BRAND.version });
  server.registerTool("create_carousel", { description: "Create a disclosed carousel deck from a topic and outline.", inputSchema: { topic: z.string(), slides: z.union([z.string(), z.array(z.object({ title: z.string().optional(), body: z.string().optional() }))]), platform: z.enum(["instagram", "linkedin", "tiktok"]).optional() }, annotations: { readOnlyHint: true } }, async (args) => { try { const deck = createCarousel(args.topic, args.slides, { platform: args.platform }); return ok({ deck, plan: exportPlan(deck) }); } catch (e) { return fail(e); } });
  server.registerTool("validate_carousel", { description: "Validate a carousel deck against platform text limits.", inputSchema: { deck: z.custom<CarouselDeck>(), platform: z.enum(["instagram", "linkedin", "tiktok"]).optional() }, annotations: { readOnlyHint: true } }, async ({ deck, platform }) => ok(validateCarousel(deck, platform)));
  server.registerTool("render_carousel_html", { description: "Render a valid deck into self-contained 1080x1350 HTML.", inputSchema: { deck: z.custom<CarouselDeck>() }, annotations: { readOnlyHint: true } }, async ({ deck }) => { try { return ok({ html: renderCarouselHtml(deck) }); } catch (e) { return fail(e); } });
  server.registerTool("export_carousel_plan", { description: "List files needed to render a carousel deck.", inputSchema: { deck: z.custom<CarouselDeck>() }, annotations: { readOnlyHint: true } }, async ({ deck }) => ok(exportPlan(deck)));
  server.registerTool("get_cost_report", { description: "Read session cost totals.", inputSchema: {}, annotations: { readOnlyHint: true } }, async () => ok(getCostReport()));
  return server;
}
export async function startMcp(deps: McpDeps = {}): Promise<void> { const server = createMcpServer(deps); await server.connect(new StdioServerTransport()); }
