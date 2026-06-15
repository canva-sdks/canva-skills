# Codex Marketplace Entrypoint

This folder contains the Codex repo marketplace catalog for this repository.

- `marketplace.json` exposes the shared Canva plugin package at
  `./plugins/canva` from the marketplace root.
- Codex resolves `source.path` from the marketplace root, not from this
  `.agents/plugins/` folder.
- The installable package contains its Codex manifest at
  `plugins/canva/.codex-plugin/plugin.json`.
- The package also contains the Canva MCP registration at `plugins/canva/.mcp.json`
  and the active shared skills at `plugins/canva/skills/`.

Install from GitHub with:

```bash
codex plugin marketplace add canva-sdks/canva-claude-skills
codex plugin add canva@canva-skills
codex mcp login canva
```

See the repository root `README.md` for the full multi-host setup.
