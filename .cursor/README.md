# Using these Canva skills in Cursor

The skills in this repo follow the open **Agent Skills** standard (`SKILL.md`), so
Cursor uses the *same* skill files as Claude Code and Codex — no separate copy
to maintain.

## What's here

- **`plugins/canva/skills/`** — active assistant-neutral skill folders (single source of truth for all hosts)
- **`.cursor/skills`** — symlink to `../plugins/canva/skills` so Cursor discovers project skills from the marketplace root
- **`.cursor/mcp.json`** — registers the official Canva MCP server, which
  provides the tools the skills call (resize, export, editing transactions,
  brand kits, comments, etc.)
- **`plugins/canva/.codex-plugin/` + `plugins/canva/.mcp.json`** — Codex
  plugin metadata and MCP registration, also pointing at the same skills
  directory

## Setup

1. Open this repo in Cursor.
2. Cursor reads `.cursor/mcp.json` and `.cursor/skills/` automatically. In
   **Settings → MCP Tools**, click **Connect** next to `canva` and complete the
   Canva sign-in (OAuth / Dynamic Client Registration).
3. The skills become available to the agent, triggered by their `description`
   front-matter (e.g. "resize for social media", "brand-check my design").

## Notes

- The MCP server is shared with every other host — only the registration file
  differs (Claude Code uses the plugin manifest; Cursor uses `.cursor/mcp.json`;
  Codex uses `.codex-plugin/plugin.json` plus `.mcp.json`). The endpoint is the
  same: `https://mcp.canva.com/mcp`.
- Skills kept under `plugins/canva/inactive-skills/` are not exposed to Cursor
  because `.cursor/skills` points only to `../plugins/canva/skills`.
- `mcp-remote` is a stdio shim for the remote server; if your Cursor version
  supports remote MCP servers directly you can point at the URL without it.
- On Windows, enable symlink support in git (`git config core.symlinks true`)
  so `.cursor/skills` resolves correctly after clone.
- Root marketplace manifests are ignored by Cursor; they are for Claude Code and
  Codex plugin installation.
