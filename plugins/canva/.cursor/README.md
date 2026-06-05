# Using these Canva skills in Cursor

The skills in this package follow the open **Agent Skills** standard (`SKILL.md`),
so Cursor uses the same active skill files as Claude Code and Codex.

## What's here

- **`skills/`** — active assistant-neutral skill folders
- **`.cursor/skills`** — symlink to `../skills` so Cursor discovers package skills
- **`.cursor/mcp.json`** — registers the official Canva MCP server, which
  provides the tools the skills call (resize, export, editing transactions,
  brand kits, comments, etc.)

## Setup

1. Open this `plugins/canva/` folder in Cursor.
2. Cursor reads `.cursor/mcp.json` and `.cursor/skills/` automatically. In
   **Settings → MCP Tools**, click **Connect** next to `canva` and complete the
   Canva sign-in (OAuth / Dynamic Client Registration).
3. The skills become available to the agent, triggered by their `description`
   front-matter.

## Notes

- The MCP server is shared with every other host; only the registration file
  differs.
- Skills kept under `inactive-skills/` are not exposed to Cursor because
  `.cursor/skills` points only to `../skills`.
- `mcp-remote` is a stdio shim for the remote server; if your Cursor version
  supports remote MCP servers directly you can point at the URL without it.
