---
name: agentic-carousel
description: Build platform-ready carousels from an outline. Keywords: carousel,instagram,linkedin,slides,agentic-suite,cli,mcp.
---

# agentic-carousel

Build platform-ready carousels from an outline.

## Use the SDK

```js
import { summarizeText, dispatchText } from "agentic-carousel";

summarizeText("some text");
await dispatchText("some text", { dryRun: true });
```

## Use the CLI

```sh
agentic-carousel summary --text "some text"
agentic-carousel dispatch --text "some text" --dry-run
```

## Use the MCP server

Start the server with `agentic-carousel mcp`. Call `summarize_text`
for stats, `dispatch_text` for routes, `get_cost_report` for costs.

## Rules

- Preview each route with dry run first.
- Report guard denials and adapter errors as failures.
- Read the cost report at the end.
