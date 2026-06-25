# Cursor Marketplace Entrypoint

This folder contains the Cursor plugin marketplace catalog for this repo.

- `marketplace.json` exposes the shared Canva plugin package at
  `./plugins/canva` from the repository root.
- The installable package contains its Cursor plugin manifest at
  `plugins/canva/.cursor-plugin/plugin.json`.
- The Cursor manifest registers skills from `plugins/canva/skills/` and MCP from
  `plugins/canva/.mcp.json`.

Install from the Cursor Marketplace after approval at
[cursor.com/marketplace/publish](https://cursor.com/marketplace/publish).

For workspace use (opening this repo directly in Cursor), see
[.cursor/README.md](../.cursor/README.md).
