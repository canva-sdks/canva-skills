# Canva Agent Skills

Agent skills for working with Canva designs. This repo is a marketplace-style
package: root-level marketplace metadata points to one shared plugin package
under `plugins/canva/`, which supports Claude, Cursor, and Codex.

## How This Repo Is Organized

This repo separates host entrypoints from the reusable Canva plugin package:

```text
marketplace/catalog -> exposes plugin package -> plugin contains skills
```

- **Marketplaces/catalogs** expose installable plugins to a host.
- **Plugins** are the installable distribution unit.
- **Skills** live inside the plugin package because they are bundled with the
  plugin when installed.

The shared Canva plugin package is `plugins/canva/`. It contains the active
`skills/` directory, host-specific plugin manifests, and Canva MCP registration.

The root hidden folders are host entrypoints:

- `.agents/plugins/marketplace.json` — Codex marketplace entrypoint
- `.claude-plugin/marketplace.json` — Claude marketplace entrypoint
- `.cursor-plugin/marketplace.json` — Cursor marketplace entrypoint
- `.cursor/` — Cursor project config, not a marketplace

Each host entrypoint folder has a small README with setup notes for that host.

## Active Plugin Skills

These skills are exposed by every supported host through the shared
`plugins/canva/skills/` directory.

### resize-for-social-media

Resize designs for multiple social media platforms (Facebook, Instagram, LinkedIn) in one operation.

**Use when:** You want to quickly distribute a design across multiple social media formats.

**Capabilities:**

- Creates platform-optimized versions (e.g. Facebook post/story, Instagram post/story, LinkedIn post)
- Provides Canva edit links so users can download or refine each version
- Resizes selected formats in parallel

### bulk-create

Bulk-create Canva designs from tabular data using a brand template, one design per row.

**Use when:** You want to generate many designs from a CSV, spreadsheet, pasted table, or JSON (e.g. one design per product or row).

**Capabilities:**

- Accepts tabular data from uploaded files, pasted content, or URLs
- Finds brand templates that support autofill and maps columns to template fields
- Creates one design per row with `autofill-design` (text, image, and chart fields where supported)
- Requires Canva Enterprise for autofill

### implement-feedback

Implement reviewer feedback on a Canva design: read comment threads and apply the changes the API supports.

**Use when:** A design has been reviewed and you want to apply the feedback without manually reading every comment thread and editing each slide.

**Capabilities:**

- Reads all comment threads and replies across the design
- Triages feedback into actionable, ambiguous, and manual-only categories
- Applies API-supported changes (text, formatting, images) after user approval
- Presents a checklist of remaining manual changes with step-by-step instructions
- Replies to comment threads after changes are made

### edit-design

Make safe, approval-gated edits to an existing Canva design.

**Use when:** You want to change, fix, replace, or reformat content in a specific Canva design.

**Capabilities:**

- Starts a Canva editing transaction, performs batched operations, and commits only after approval
- Changes text content and supported text formatting
- Replaces, inserts, deletes, repositions, or resizes supported media and elements
- Clearly flags changes that the Canva API cannot perform

### get-design-feedback

Read a Canva design and return structured, actionable design feedback.

**Use when:** You want critique on visual hierarchy, copy, layout, spacing, consistency, readability, accessibility, or fit for purpose.

**Capabilities:**

- Reads rendered thumbnails and design text
- Uses read-only inspection for layout details where available
- Prioritizes page-specific findings with concrete fixes
- Never edits or commits changes

### brand-check

Check a Canva design against a brand kit and report where it diverges.

**Use when:** You want to know whether a design is on brand, including colors, typography, logo handling, tone, and consistency.

**Capabilities:**

- Lists available brand kits and compares against the selected kit
- Uses design and brand-kit thumbnails when exact colors or fonts are not available from the API
- Marks findings as on brand, off brand, or can't verify
- Offers to hand off fixable items to `edit-design` if the user wants changes made

## Inactive Skills

The repo also keeps additional skill work under
`plugins/canva/inactive-skills/`. These are not registered by any plugin host
because each host exposes the same active subset from `plugins/canva/skills/`.

- `branded-presentation`
- `classroom-helper`
- `design-translation`
- `presentation-time-fitting`

## Installation

Each host uses the Canva MCP server at `https://mcp.canva.com/mcp`. Connect the
`canva` MCP server and sign in to Canva when prompted.

### Claude

Install from GitHub:

```bash
/plugin marketplace add canva-sdks/canva-skills
/plugin install canva@canva-skills
```

If you already added this marketplace before, refresh it instead:

```bash
/plugin marketplace update canva-skills
```

This works in Claude Code, Claude Desktop, and other Claude clients that support
plugin marketplaces. See [.claude-plugin/README.md](.claude-plugin/README.md)
for details.

### Cursor

Cursor Marketplace installs use `.cursor-plugin/marketplace.json` and
`plugins/canva/.cursor-plugin/plugin.json`. See
[.cursor-plugin/README.md](.cursor-plugin/README.md) for marketplace details.

To use the skills while working in this repo:

1. Open this repo in Cursor (`.cursor/mcp.json` and `.cursor/skills/` load automatically), or open `plugins/canva/` directly
2. In **Settings → MCP Tools**, connect the `canva` server and sign in with Canva
3. Use the skills naturally in agent chat — see [.cursor/README.md](.cursor/README.md) for details

### Codex

```bash
codex plugin marketplace add canva-sdks/canva-skills
codex plugin add canva@canva-skills
codex mcp login canva
```

If you already added this marketplace before, refresh it instead:

```bash
codex plugin marketplace upgrade canva-skills
```

Then start a new Codex thread and use `@canva` or ask for Canva workflows
naturally. See [.agents/plugins/README.md](.agents/plugins/README.md) for
details.

Codex uses `.agents/plugins/marketplace.json` to find the package at
`plugins/canva/`, then `plugins/canva/.codex-plugin/plugin.json` for plugin
metadata, `plugins/canva/.mcp.json` for the Canva MCP server, and
`plugins/canva/skills/` for the active skill set.

## Usage

Simply reference the skills naturally in your conversations:

**Examples:**

```
# Social media resize
"Resize design DABcd1234ef for all social media platforms"

# Bulk create
"Bulk create designs from this spreadsheet using my brand template"

# Implement feedback
"Implement the feedback on my deck"

# Edit design
"Change the headline in this Canva design and make it bold"

# Design feedback
"Review this Canva design and tell me what to improve"

# Brand check
"Check this Canva design against my brand kit"
```

Works in Claude, Cursor, and Codex.

## Repository Structure

```
canva-skills/
├── LICENSE
├── README.md
├── .agents/plugins/                      # Codex marketplace entrypoint
│   ├── README.md
│   └── marketplace.json
├── .claude-plugin/                       # Claude marketplace entrypoint
│   ├── README.md
│   └── marketplace.json
├── .cursor-plugin/                       # Cursor marketplace entrypoint
│   ├── README.md
│   └── marketplace.json
├── .cursor/                              # Cursor project config, not a marketplace
│   ├── README.md
│   ├── mcp.json
│   └── skills -> ../plugins/canva/skills
└── plugins/
    └── canva/
        ├── README.md
        ├── .claude-plugin/plugin.json    # Claude plugin manifest
        ├── .cursor-plugin/plugin.json    # Cursor plugin manifest
        ├── .codex-plugin/plugin.json     # Codex plugin manifest
        ├── .cursor/                      # Cursor project config when opening package directly
        ├── .mcp.json                     # MCP registration for Cursor marketplace and Codex
        ├── skills/                       # Active plugin skills exposed by all hosts
        │   ├── brand-check/
        │   ├── bulk-create/
        │   ├── edit-design/
        │   ├── get-design-feedback/
        │   ├── implement-feedback/
        │   └── resize-for-social-media/
        └── inactive-skills/              # Kept in repo, not registered by plugin hosts
            ├── branded-presentation/
            ├── classroom-helper/
            ├── design-translation/
            └── presentation-time-fitting/
```

## Contributing

To add a new skill:

1. Create a new directory under `plugins/canva/inactive-skills/` while drafting, or under `plugins/canva/skills/` when it should be exposed by every plugin host
2. Add a `SKILL.md` file with skill metadata and workflow
3. Follow the existing skill patterns for consistency
4. Register active skills in `plugins/canva/.claude-plugin/plugin.json` (Claude requires an explicit list; Cursor and Codex discover skills from `./skills/`)
5. Update this README with the new skill

## License

Apache License 2.0 - see [LICENSE](LICENSE) for details.
