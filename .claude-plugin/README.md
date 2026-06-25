# Claude Marketplace Entrypoint

This folder contains the Claude plugin marketplace catalog for this repo.

- `marketplace.json` exposes the shared Canva plugin package at
  `./plugins/canva` from the repository root.
- The installable package contains its Claude plugin manifest at
  `plugins/canva/.claude-plugin/plugin.json`.
- The Claude manifest registers the active shared skills from
  `plugins/canva/skills/`.

Install from GitHub with:

```bash
/plugin marketplace add canva-sdks/canva-skills
/plugin install canva@canva-skills
```

If you already added this marketplace before, refresh it instead:

```bash
/plugin marketplace update canva-skills
```

Then connect the Canva MCP server and sign in when prompted. Use the skills
naturally (e.g. "resize design DAB... for all social media platforms").

This works in Claude Code, Claude Desktop, and other Claude clients that support
plugin marketplaces.
