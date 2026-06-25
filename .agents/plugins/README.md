# Codex Marketplace Entrypoint

This folder contains the Codex repo marketplace catalog for this repo.

- `marketplace.json` exposes the shared Canva plugin package at
  `./plugins/canva` from the repository root.
- The installable package contains its Codex manifest at
  `plugins/canva/.codex-plugin/plugin.json`.
- The package also contains the Canva MCP registration at `plugins/canva/.mcp.json`
  and the active shared skills at `plugins/canva/skills/`.

Install from GitHub with:

```bash
codex plugin marketplace add canva-sdks/canva-skills
codex plugin add canva@canva-skills
codex mcp login canva
```

If you already added this marketplace before, refresh it instead:

```bash
codex plugin marketplace upgrade canva-skills
```

Then connect the Canva MCP server and sign in when prompted.
