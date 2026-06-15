# Claude Marketplace Entrypoint

This folder contains the Claude plugin marketplace catalog for this repository.

- `marketplace.json` exposes the shared Canva plugin package at
  `./plugins/canva` from the repository root.
- The installable package contains its Claude plugin manifest at
  `plugins/canva/.claude-plugin/plugin.json`.
- The Claude manifest registers the active shared skills from
  `plugins/canva/skills/`.

Install from GitHub with:

```bash
/plugin marketplace add canva-sdks/canva-claude-skills
/plugin install canva@canva-skills
```

If you already added this marketplace before, refresh it instead:

```bash
/plugin marketplace update canva-skills
```

Then sign in to Canva when prompted and use the skills (e.g. "resize design
DAB... for all social media platforms").

Cursor and Codex use their own host entrypoints, but they point at the same
shared Canva plugin package.

See the repository root `README.md` for the full multi-host setup.
