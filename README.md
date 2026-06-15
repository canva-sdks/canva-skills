# Canva Agent Skills

Professional agent skills for working with Canva designs. This repo is a
marketplace-style package: root-level marketplace metadata points to one shared
plugin package under `plugins/canva/`, which supports Claude Code, Cursor, and
Codex.

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
- `.claude-plugin/marketplace.json` — Claude plugin marketplace entrypoint
- `.cursor/` — Cursor project config, not a marketplace

Each host entrypoint folder has a small README with setup notes for that host.

## Active Plugin Skills

These skills are exposed consistently by Claude Code, Cursor, and Codex through
the shared `plugins/canva/skills/` directory.

### resize-for-social-media

Resize designs for multiple social media platforms (Facebook, Instagram, LinkedIn) in one operation.

**Use when:** You want to quickly distribute a design across multiple social media formats.

**Capabilities:**

- Creates 5 platform-optimized versions (Facebook post/story, Instagram post/story, LinkedIn post)
- Exports all versions as high-quality PNGs
- Provides direct download links and Canva edit links
- Executes all operations in parallel for speed

### bulk-create

Bulk-create Canva designs from tabular data using a brand template with autofill fields — one design per row.

**Use when:** You want to generate many designs from a CSV, spreadsheet, pasted table, or JSON (e.g. one design per product or row).

**Capabilities:**

- Parses tabular data from files, pasted content, or URLs
- Finds autofill-capable brand templates and maps columns to template fields
- Creates one design per row with `autofill-design` (handles text, image assets, and chart fields per the skill)
- Supports Enterprise autofill workflows where available

### implement-feedback

Implement reviewer feedback on a Canva design — read comment threads, make the clear-cut changes.

**Use when:** A design has been reviewed and you want to apply the feedback without manually reading every comment thread and editing each slide.

**Capabilities:**

- Reads all comment threads and replies across the design
- Triages feedback into actionable, ambiguous, and manual-only categories
- Applies API-supported changes (text, formatting, images) in a single batch
- Presents a checklist of remaining manual changes with step-by-step instructions
- Replies to comment threads to close the feedback loop

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
- Uses thumbnails as primary evidence when exact colors/fonts are not exposed
- Marks findings as on brand, off brand, or can't verify
- Makes no changes unless the user asks to hand off fixable items to `edit-design`

## Inactive Skills

The repo also keeps additional skill work under
`plugins/canva/inactive-skills/`. These are not exposed by Claude Code, Cursor,
or Codex because each host now registers the same active subset from
`plugins/canva/skills/`.

- `branded-presentation`
- `classroom-helper`
- `design-translation`
- `presentation-time-fitting`

## Installation

### For Claude Desktop

1. Clone or download this repository
2. Install the `canva` plugin from the root `.claude-plugin/marketplace.json`
3. Restart Claude Desktop to load the skills

### For Claude Code CLI

Install from GitHub:

```bash
/plugin marketplace add canva-sdks/canva-claude-skills
/plugin install canva@canva-skills
```

If you already added this marketplace before, refresh it instead:

```bash
/plugin marketplace update canva-skills
```

Then sign in to Canva when prompted and use the skills from your terminal.

### For Cursor

1. Open this repository in Cursor (`.cursor/mcp.json` and `.cursor/skills/` load automatically), or open `plugins/canva/` directly
2. In **Settings → MCP Tools**, connect the `canva` server and sign in with Canva
3. Use the skills naturally in agent chat — see [.cursor/README.md](.cursor/README.md) for details

### For Codex

```bash
codex plugin marketplace add canva-sdks/canva-claude-skills
codex plugin add canva@canva-skills
codex mcp login canva
```

If you already added this marketplace before, refresh it instead:

```bash
codex plugin marketplace upgrade canva-skills
```

Then start a new Codex thread and use `@canva` or ask for Canva workflows
naturally.

Codex uses the root `.agents/plugins/marketplace.json` to find the package at
`plugins/canva/`, then uses `plugins/canva/.codex-plugin/plugin.json` for plugin
metadata, `plugins/canva/.mcp.json` for the Canva MCP server, and
`plugins/canva/skills/` as the single source of truth for active skill
instructions.

The Codex marketplace entry points at the shared package:

```json
{
  "name": "canva-skills",
  "interface": {
    "displayName": "Canva Skills"
  },
  "plugins": [
    {
      "name": "canva",
      "source": {
        "source": "local",
        "path": "./plugins/canva"
      },
      "policy": {
        "installation": "AVAILABLE",
        "authentication": "ON_INSTALL"
      },
      "category": "Productivity"
    }
  ]
}
```

## Usage

Simply reference the skills naturally in your conversations:

**Examples:**

```
# Social media resize
"Resize design DABcd1234ef for all social media platforms"

# Bulk create
"Bulk create designs from this CSV using my brand template"

# Implement feedback
"Implement the feedback on my deck"

# Edit design
"Change the headline in this Canva design and make it bold"

# Design feedback
"Review this Canva design and tell me what to improve"

# Brand check
"Check this Canva design against my brand kit"
```

Works seamlessly in Claude Desktop, Claude Code CLI, Cursor, and Codex.

## Repository Structure

```
canva-claude-skills/
├── README.md
├── .agents/plugins/                      # Codex marketplace entrypoint
│   ├── README.md
│   └── marketplace.json
├── .claude-plugin/                       # Claude marketplace entrypoint
│   ├── README.md
│   └── marketplace.json
├── .cursor/                              # Cursor root convenience config
│   ├── README.md
│   ├── mcp.json
│   └── skills -> ../plugins/canva/skills
└── plugins/
    └── canva/
        ├── .claude-plugin/plugin.json    # Claude plugin manifest
        ├── .codex-plugin/plugin.json     # Codex plugin manifest
        ├── .cursor/                      # Cursor config when opening package directly
        ├── .mcp.json                     # Codex MCP server registration
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
4. Register active skills in `plugins/canva/.claude-plugin/plugin.json` so Claude Code matches Cursor and Codex
5. Update this README with the new skill

## License

[Add your license here]
