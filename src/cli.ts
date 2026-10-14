#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { getCostReport, GuardError, VendorError } from "./core.js";
import { createCarousel, exportPlan, renderCarouselHtml, validateCarousel, type CarouselDeck, type CarouselPlatform } from "./carousel.js";
import { DEFAULT_BRAND } from "./index.js";
import { VERSION } from "./version.js";

export class UsageError extends Error { constructor(message: string) { super(message); this.name = "UsageError"; } }
export type CliCommand = "create" | "render" | "validate" | "costs" | "mcp" | "help" | "version";
export interface CliRequest { command: CliCommand; topic?: string; slides?: string; file?: string; platform?: CarouselPlatform; dryRun: boolean; }

export function parseArgs(argv: string[]): CliRequest {
  const request: CliRequest = { command: "help", dryRun: true };
  const args = [...argv]; let first = args.shift();
  if (!first || first === "--help" || first === "-h") return request;
  if (first === "--version" || first === "-V") return { ...request, command: "version" };
  if (first === "carousel") first = args.shift();
  if (!first || !["create", "render", "validate", "costs", "mcp"].includes(first)) throw new UsageError(`unknown command "${first ?? ""}"`);
  request.command = first as CliCommand;
  while (args.length) {
    const flag = args.shift()!;
    if (flag === "--live") { request.dryRun = false; continue; }
    if (["--topic", "--slides", "--file", "--platform"].includes(flag) && args.length) {
      const value = args.shift()!;
      if (flag === "--topic") request.topic = value;
      if (flag === "--slides") request.slides = value;
      if (flag === "--file") request.file = value;
      if (flag === "--platform") {
        if (!["instagram", "linkedin", "tiktok"].includes(value)) throw new UsageError("--platform must be instagram, linkedin, or tiktok");
        request.platform = value as CarouselPlatform;
      }
      continue;
    }
    throw new UsageError(`unknown flag "${flag}" for "${request.command}"`);
  }
  if (request.command === "create" && (!request.topic || request.slides === undefined)) throw new UsageError("create needs --topic and --slides");
  if ((request.command === "render" || request.command === "validate") && !request.file) throw new UsageError(`${request.command} needs --file`);
  return request;
}
export interface CliIo { out(line: string): void; err(line: string): void; readFile(path: string): string; }
function defaultIo(): CliIo { return { out: console.log, err: console.error, readFile: (path) => readFileSync(path, "utf8") }; }
function helpText(): string { return `${DEFAULT_BRAND.name} ${VERSION}\n\nUsage: ${DEFAULT_BRAND.command} carousel <command> [flags]\n\nCommands:\n  carousel create --topic <topic> --slides <outline> [--platform instagram|linkedin|tiktok]\n  carousel render --file <deck.json>\n  carousel validate --file <deck.json> [--platform instagram|linkedin|tiktok]\n  costs\n  mcp\n\nCreate is local and defaults to dry-run-safe generation; no external services are used.`; }
function readDeck(file: string, io: CliIo): CarouselDeck { return JSON.parse(io.readFile(file)) as CarouselDeck; }
export async function runCli(argv: string[], io: CliIo = defaultIo()): Promise<number> {
  let request: CliRequest;
  try { request = parseArgs(argv); } catch (error) { io.err(error instanceof Error ? error.message : String(error)); return 2; }
  try {
    switch (request.command) {
      case "help": io.out(helpText()); return 0;
      case "version": io.out(VERSION); return 0;
      case "costs": io.out(JSON.stringify(getCostReport())); return 0;
      case "create": { const deck = createCarousel(request.topic!, request.slides!, { platform: request.platform }); io.out(JSON.stringify({ deck, plan: exportPlan(deck) })); return 0; }
      case "render": { io.out(renderCarouselHtml(readDeck(request.file!, io))); return 0; }
      case "validate": { const deck = readDeck(request.file!, io); const result = validateCarousel(deck, request.platform); io.out(JSON.stringify(result)); return result.valid ? 0 : 1; }
      case "mcp": { const { startMcp } = await import("./mcp.js"); await startMcp(); return 0; }
    }
  } catch (error) {
    if (error instanceof GuardError || error instanceof VendorError || error instanceof SyntaxError || error instanceof TypeError) { io.err(`${error.name}: ${error.message}`); return 1; }
    throw error;
  }
}
function isMainModule(): boolean { const invoked = process.argv[1]; if (!invoked) return false; try { return import.meta.url === pathToFileURL(realpathSync(invoked)).href; } catch { return false; } }
if (isMainModule()) runCli(process.argv.slice(2)).then((code) => { if (code) process.exit(code); }, (error: unknown) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });
