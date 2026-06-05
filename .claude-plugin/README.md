# Claude Marketplace Entrypoint

This folder contains the Claude plugin marketplace catalog for this repository.

- `marketplace.json` exposes the shared Canva plugin package at
  `./plugins/canva` from the repository root.
- The installable package contains its Claude plugin manifest at
  `plugins/canva/.claude-plugin/plugin.json`.
- The Claude manifest registers the active shared skills from
  `plugins/canva/skills/`.

Cursor and Codex use their own host entrypoints, but they point at the same
shared Canva plugin package.

See the repository root `README.md` for the full multi-host setup.
