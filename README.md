# Canva Skills for Claude

Professional Claude skills for working with Canva designs. These skills enable powerful Canva workflows in both Claude Desktop and Claude Code CLI.

## Available Skills

### branded-presentation

Create on-brand presentations from outlines or briefs using Canva brand kits.

**Use when:** You want to generate a professional presentation with consistent branding from text content, outlines, or Canva docs.

**Capabilities:**

- Converts outlines and briefs into structured slide decks
- Automatically applies your Canva brand kits
- Reads content from text, Canva docs, or design links
- Generates multiple design candidates for selection

### design-translation

Translate all text in a Canva design to another language, creating localized copies.

**Use when:** You need to create multilingual versions of your designs without manually editing each text element.

**Capabilities:**

- Translates all text elements while preserving layout
- Creates a new copy, leaving the original untouched
- Supports any language Claude can translate
- Batch processes all text in a single operation

### implement-feedback

Implement reviewer feedback on a Canva design — read comment threads, make the clear-cut changes.

**Use when:** A design has been reviewed and you want to apply the feedback without manually reading every comment thread and editing each slide.

**Capabilities:**

- Reads all comment threads and replies across the design
- Triages feedback into actionable, ambiguous, and manual-only categories
- Applies API-supported changes (text, formatting, images) in a single batch
- Presents a checklist of remaining manual changes with step-by-step instructions
- Replies to comment threads to close the feedback loop

### presentation-time-fitting

Fit a presentation to a target speaking duration, especially by allocating time evenly across slides and generating presenter notes.

**Use when:** You want a deck to match a slot (e.g. 15 minutes), even time per slide, or speaker notes written for timing. (On-slide copy is not edited; shorten or lengthen **slides** in Canva or elsewhere.)

**Capabilities:**

- Confirms design and target duration before cloning; reads slide text with `get-design-content` for context only, computes per-slide time and word budget
- Generates or adjusts **presenter notes only** in the chat (no external API); writes them back via `get-design-pages` and editing APIs
- Clones the design before note changes; does not change visible slide text; cannot add/remove slides via API

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

### classroom-helper

Turn a lesson plan into a teaching slide deck with learning objectives, lesson flow, and speaker notes.

**Use when:** You want classroom slides built from a lesson plan (pasted text, Canva design ID, Canva doc or design name, or design link).

**Capabilities:**

- Maps lesson plans to a structured teaching deck (objectives, arc, slide-by-slide notes)
- Pacing and slide-budget hints tied to lesson length; student-facing slides vs teacher speaker notes
- Accepts design ID, short links, or search by name; disambiguation when needed; optional clarifying questions when the plan is thin
- Uses brand kits like other presentation skills

### canva-api

Build, debug, and review server-side integrations with the Canva REST API (Connect APIs).

**Use when:** You are writing backend code that calls the Canva REST API — OAuth, assets, designs, exports, folders, webhooks, or debugging API errors.

**Capabilities:**

- OAuth 2.0 Authorization Code flow implementation for Express/Node.js
- Authenticated REST request patterns with token refresh and error handling
- Design export workflows (async job creation, polling, download)
- Asset upload workflows (direct and URL-based)
- Webhook setup, signature verification, and idempotent event handling
- Debugging guidance for 400/401/403/404/429/5xx errors
- REST API vs Apps SDK decision guidance
- App review readiness checklist
- Uses live Canva.dev markdown docs as source of truth for endpoint paths, fields, and scopes — never invents API details

**Why live docs?**

Endpoint paths, request fields, OAuth scopes, and rate limits change over time. This skill fetches the relevant `https://www.canva.dev/docs/connect/*.md` page before answering endpoint-specific questions, so answers reflect the current API rather than a bundled snapshot. Stable guidance (security rules, OAuth principles, troubleshooting patterns) is bundled locally.

**Online vs offline mode:**

- *Online (default)*: fetches the relevant Canva.dev markdown page before answering endpoint-specific questions.
- *Offline*: answers using bundled security, troubleshooting, and principles guidance. Explicitly flags any endpoint-specific detail it cannot verify.

**How to update doc references:**

Edit `canva-api/references/doc-index.md`. Each section maps developer intent to a Canva.dev markdown URL. The canonical URL indexes are `https://www.canva.dev/docs/connect/llms.txt` and `https://www.canva.dev/docs/apps/llms.txt`.

**How to add new workflows:**

1. Create a new file in `canva-api/workflows/` following the structure in existing workflow files.
2. Add the new workflow to the relevant section(s) in `canva-api/references/doc-index.md` under `Also load`.
3. Update `canva-api/SKILL.md` progressive disclosure table if the workflow covers a new task type.

## Installation

### For Claude Desktop

1. Clone or download this repository
2. Add skills to your Claude Desktop configuration
3. Restart Claude Desktop to load the skills

### For Claude Code CLI

1. Clone this repository
2. Follow the [Claude Code skill installation guide](https://github.com/anthropics/claude-code)
3. Start using the skills from your terminal

## Usage

Simply reference the skills naturally in your conversations:

**Examples:**

```
# Branded presentation
"Create a presentation from my product launch outline using our brand kit"

# Design translation
"Translate my Summer Sale Poster design to French"

# Implement feedback
"Implement the feedback on my deck"

# Presentation time-fitting
"Make this a 10-minute presentation"

# Social media resize
"Resize design DABcd1234ef for all social media platforms"

# Bulk create
"Bulk create designs from this CSV using my brand template"

# Classroom helper
"Turn this lesson plan into a slide deck for my 7th grade science class"
"Build slides from the lesson plan in design DABcd1234ef"
```

Works seamlessly in both Claude Desktop and Claude Code CLI.

## Repository Structure

```
canva-claude-skills/
├── README.md                         # This file
├── branded-presentation/             # Presentation generation skill
│   └── SKILL.md
├── design-translation/               # Translation skill
│   └── SKILL.md
├── implement-feedback/               # Review feedback skill
│   └── SKILL.md
├── presentation-time-fitting/        # Speaking duration and speaker notes
│   └── SKILL.md
├── resize-for-social-media/          # Multi-format resize skill
│   └── SKILL.md
├── bulk-create/                      # Tabular data → one design per row
│   └── SKILL.md
├── classroom-helper/                 # Lesson plan → teaching deck
│   └── SKILL.md
└── canva-api/                        # Canva REST API integration skill
    ├── SKILL.md
    ├── references/
    │   ├── doc-index.md              # Maps intent → Canva.dev markdown URLs
    │   ├── api-surface-map.md        # REST API vs Apps SDK decision guide
    │   ├── security.md
    │   ├── troubleshooting.md
    │   ├── answer-templates.md
    │   ├── terminology.md
    │   └── auth-principles.md
    ├── workflows/
    │   ├── oauth.md
    │   ├── authenticated-request.md
    │   ├── export-design.md
    │   ├── upload-asset.md
    │   ├── webhooks.md
    │   └── review-readiness.md
    └── examples/
        ├── node/
        │   ├── canva-client.md       # Generic typed API client
        │   ├── oauth-express.md      # Express OAuth skeleton
        │   └── token-store.md        # TokenStore interface + in-memory impl
        └── curl/
            └── README.md             # cURL patterns with placeholder URLs
```

## Contributing

To add a new skill:

1. Create a new directory with a kebab-case name
2. Add a `SKILL.md` file with skill metadata and workflow
3. Follow the existing skill patterns for consistency
4. Update this README with the new skill

## License

[Add your license here]
