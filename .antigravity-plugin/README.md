# Antigravity Marketplace Entrypoint

This folder contains the Antigravity plugin marketplace catalog for this repo.

- `marketplace.json` exposes the shared Canva plugin package at
  `./plugins/canva` from the repository root.
- The installable package contains its Antigravity plugin manifest at
  `plugins/canva/plugin.json`.
- The Antigravity manifest registers the active shared skills from
  `plugins/canva/skills/`.

Canva is listed in the Antigravity plugin marketplace. In the Antigravity app,
open **Customizations → Plugins → Discover** and search for **Canva**. The
marketplace listing can lag behind this repo, so check its version against
`plugins/canva/plugin.json`.

To install the latest version from GitHub instead:

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

This works in Antigravity clients that support plugin marketplaces.
