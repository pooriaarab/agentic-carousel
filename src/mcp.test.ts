import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, test } from "vitest";
import { createMcpServer } from "./mcp.js";
const textOf = (result: unknown) => (result as { content: { text: string }[] }).content[0].text;
describe("mcp server", () => { test("serves carousel tools", async () => { const [ct, st] = InMemoryTransport.createLinkedPair(); const server = createMcpServer(); await server.connect(st); const client = new Client({ name: "probe", version: "0" }); await client.connect(ct); try { expect((await client.listTools()).tools.map((x) => x.name).sort()).toEqual(["create_carousel", "export_carousel_plan", "get_cost_report", "render_carousel_html", "validate_carousel"]); const r = await client.callTool({ name: "create_carousel", arguments: { topic: "Hi", slides: "One|Two" } }); expect(JSON.parse(textOf(r)).deck.slides).toHaveLength(4); } finally { await client.close(); await server.close(); } }); });
