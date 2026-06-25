# Using these Canva skills in Cursor

The skills in this package follow the open **Agent Skills** standard (`SKILL.md`).

## What's here

- **`skills/`** — active skill folders
- **`.cursor/skills`** — symlink to `../skills` so Cursor discovers package skills
- **`.cursor/mcp.json`** — registers the Canva MCP server for workspace use

## Setup

1. Open this `plugins/canva/` folder in Cursor.
2. Cursor reads `.cursor/mcp.json` and `.cursor/skills/` automatically. In
   **Settings → MCP Tools**, click **Connect** next to `canva` and complete the
   Canva sign-in (OAuth / Dynamic Client Registration).
3. The skills become available to the agent, triggered by their `description`
   front-matter.

## Notes

- MCP server: `https://mcp.canva.com/mcp`
- Skills kept under `inactive-skills/` are not exposed to Cursor because
  `.cursor/skills` points only to `../skills`.
- For Cursor Marketplace installs, see
  [.cursor-plugin/README.md](../../.cursor-plugin/README.md).
