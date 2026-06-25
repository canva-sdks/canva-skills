# Using these Canva skills in Cursor

The skills in this repo follow the open **Agent Skills** standard (`SKILL.md`).

## What's here

- **`plugins/canva/skills/`** — active skill folders
- **`.cursor/skills`** — symlink to `../plugins/canva/skills` so Cursor discovers project skills from the repo root
- **`.cursor/mcp.json`** — registers the Canva MCP server for workspace use
- **`.cursor-plugin/`** — Cursor Marketplace entrypoint (see [.cursor-plugin/README.md](../.cursor-plugin/README.md))

## Setup

1. Open this repo in Cursor.
2. Cursor reads `.cursor/mcp.json` and `.cursor/skills/` automatically. In
   **Settings → MCP Tools**, click **Connect** next to `canva` and complete the
   Canva sign-in (OAuth / Dynamic Client Registration).
3. The skills become available to the agent, triggered by their `description`
   front-matter (e.g. "resize for social media", "brand-check my design").

## Notes

- MCP server: `https://mcp.canva.com/mcp`
- Skills kept under `plugins/canva/inactive-skills/` are not exposed to Cursor
  because `.cursor/skills` points only to `../plugins/canva/skills`.
