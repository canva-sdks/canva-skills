---
name: canva-resize-for-social-media
description: Create channel-ready variants of an existing Canva campaign design. Use when users ask to resize or adapt one campaign for multiple social platforms, produce variants for each channel, turn landscape creative into vertical or square formats, create platform-specific versions, or prepare TikTok, Instagram, LinkedIn, Facebook, YouTube, Pinterest, X, or custom-dimension variations. When they ask for each channel or platform-ready variants and do not name placements or dimensions, use the default channel set in references/channel-formats.md. A named platform plus placement uses that file's lookup table. This skill creates resized copies and returns edit links; use edit-design separately when the user asks to recompose, adjust crop or safe areas, change copy, or use generative fill.
---

# Canva Resize for Social Media

Automatically resize a single Canva design into multiple social media formats.

## Overview

This skill enables rapid multi-platform content distribution by taking a single Canva design and creating versions for:
- Facebook
- Instagram
- LinkedIn
- TikTok
- X / Twitter
- YouTube
- Pinterest

When the user asks for each channel, all channels, every platform, or platform-ready variants and does not name placements or dimensions, use the default channel set in `references/channel-formats.md`. When they ask for common formats, social versions, or all formats, use the aspect-ratio set in that file. All resized versions are provided with Canva edit links so users can further edit or download them directly from Canva. 

## Workflow

### Step 1: Identify the Source Design

Determine which Canva design the user wants to resize. This can be provided in three ways:

1. **Direct design ID**: User provides a design ID (starts with "D")
   - Example: "resize design DABcd1234ef for all social media"
   - Use the design ID directly with `get-design` tool to retrieve design information
   
2. **Direct design URL**: User provides a Canva design link
   - Example: "resize https://www.canva.com/design/DABcd1234ef/... for all social media"
   - Use the full, design share URL with `get-design` tool
   
3. **Search by design name**: Use `search-designs` tool with the design name as the query
   - Example: "resize my Demo Brand Template: Brix&Hart Flyer design for all social media"
   - Use the exact name/phrase the user provides as the search query
   - If multiple matches are found, present options and ask the user to select one
   
4. **Current context**: If the user just created or edited a design in the conversation, use that design ID

**Implementation note**: When searching by name, pass the design name directly to `search-designs` as the query parameter. The tool will find the best match based on the design title.

### Step 2: Retrieve Source Design Information

Use the `get-design` tool with the design ID or design share URL to:
- Confirm the design exists and is accessible
- Verify design type compatibility

### Step 3: Resolve Target Placements and Canvases

Resolve requested targets in this order:

1. If the user provides exact pixel dimensions, use only those dimensions.
2. If the user provides a platform and placement, look up its canvas in the platform and placement lookup in `references/channel-formats.md`.
3. If the user provides an aspect ratio (for example, `9:16` or `1:1`) without pixels, resolve it through the aspect-ratio set in `references/channel-formats.md`.
4. If the user asks for each channel, all channels, every platform, platform-ready variants, or channel-ready variants, and does not name dimensions, ratios, or placements, use the default channel set in `references/channel-formats.md`. Do not ask which placement to use.
5. If the user asks for “social versions,” “common formats,” or “all formats” without naming dimensions, ratios, or platforms, use the aspect-ratio set.

If the user names one platform and no placement, ask which placement they need rather than assuming one. A request for every channel is rule 4, not this question.

De-duplicate identical width × height pairs while retaining every requested platform label associated with that variant. State the planned variants before resizing.

### Step 4: Resize to Selected Formats

For each unique target canvas, call `Canva:resize-design` with:

- the source `design_id`
- `design_type: { type: "custom", width, height }`
- a concise `user_intent`

Each call creates a new resized design and leaves the source unchanged.

For each successful result, retain:

- requested placements
- resolved dimensions
- `job.result.design.id`
- `job.result.design.thumbnail.url`
- `job.result.design.urls.edit_url`
- `job.result.design.urls.view_url`

**Error handling:** If one resize fails, continue with the remaining target canvases. Report successful and failed variants separately at the end.

### Step 5: Present Results with Edit Links

**Present comprehensive results to the user:**

Provide the user with a summary including:

1. **Summary**: Confirm which formats were created successfully
2. **Design edit links**: Canva editor URLs for each resized design so users can make further edits or download directly from Canva

**Presentation format example:**

| Requested placement(s) | Canvas | Status | Thumbnail | Design |
|---|---:|---|---|
| Instagram Story, Facebook Story, TikTok | 1080 × 1920 | Created | ![Thumbnail](thumbnail.url) | [Edit in Canva](edit_url) |
| LinkedIn single-image landscape | 1200 × 627 | Created | ![Thumbnail](thumbnail.url) | [Edit in Canva](edit_url) |
| X image, square | 1200 × 1200 | Failed | No design created | Reason |

“Created 2 of 3 requested canvas variants”

**Implementation details**:
- Design edit links come from the `resize-design` tool response (use the `urls.edit_url` field from each resized design)
- Present links as clickable URLs, not just plain text
- Organize by design size for easy scanning

## Key Implementation Notes

- **Compatibility**: Check if `resize-design` is available in the current MCP tools. If not, inform the user that this skill requires the Canva MCP resize tool in the current host
- **Parallel execution**: Resize operations should be performed in parallel for efficiency
- **Error resilience**: If any operation fails, complete the remaining operations and clearly report what succeeded/failed
- **User confirmation**: Do not require user approval between steps - execute the full workflow automatically unless errors occur
- **Format accuracy**: Always use the exact pixel dimensions specified in `references/channel-formats.md` for each platform
