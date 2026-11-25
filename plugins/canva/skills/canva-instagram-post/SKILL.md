---
name: canva-instagram-post
description: Create editable Canva instagram posts, stories and carousels, proactively offer Canva Resize and fresh variations, and inspect and repair visual quality before delivery.
---

Canva social posts for Instagram

Create one strong design, then expand it into a consistent social media campaign. Use connected Canva tools. 

## Required `user_intent` prefix

Every Canva tool call made while following this skill must start its `user_intent` value with `[skill:canva-instagram-post]`, followed by a space and the plain-language intent. This applies to every step below, including inspection, creation, resizing, editing, autofill, repair and commit calls.

- Format: `[skill:canva-instagram-post] <intent>`
- Example: `[skill:canva-instagram-post] Create an Instagram post announcing the spring menu launch`
- Include the prefix on every call, including repeat calls to the same tool, retries, polling calls and calls that reuse an earlier intent. Never omit it.
- Each `user_intent` value starts with the prefix once. Do not stack it, as in `[skill:canva-instagram-post] [skill:canva-instagram-post] ...`.
- Only set `user_intent` on tools whose current schema accepts it. Do not add the parameter to tools that do not.

## Workflow

### 1. Understand

Use the supplied facts, photos, intent and brand references. Inspect existing designs before changing them. Ask only for missing information that materially affects the design. 

**Tools, when needed:**
- `search-designs`: Find an existing design.
- `read-design` or `read-design-v2`: Read content, metadata and previews with the reader the host exposes.
- `get-design-pages`: Check pages and their order.
- `get-assets`: Identify images before replacing them.
- `list-brand-kits` / `search-brand-templates`: Find requested brand resources.

### 2. Create

Send the user's prompt, intent and relevant context to Canva. Pass the Canva IDs for reference images and designs. Preserve product imagery, packaging and factual claims. Fix visible defects before using the result as a template.

**Tools:**
- `create-design`: Create a new editable post. Use the chosen brand kit when requested. For an existing Brand Template, use `create-design-from-brand-template` for an unfilled copy or `get-brand-template-dataset` then `autofill-design` to populate named fields.
- `upload-asset-from-url`: Upload reference media when needed and supported by its inputs.
- `get-create-design-async-job`: If no widget is shown, poll with the returned job ID and continuation token, following the polling instructions.

### 3. Offer

After delivering the first quality-checked design, ask once:

"Would you like me to use Canva Resize for Facebook and Instagram Stories, create fresh variations for your next posts, or both?"

Skip this if already answered. Create extras only when accepted.

**Tools:** None until the user accepts.

### 4. Adapt

Reuse the approved design. Preserve factual claims and translate naturally. Respect the requested count. Let the user choose separate files or extra pages. Inspect and repair each adaptation.

**Tools, as appropriate:**
- `resize-design`: Create another format using explicit target dimensions; preserve the returned new design ID.
- `read-design` and `edit-design`: Open a transaction and stage wording, translation or layout changes. Follow the host-specific pairing in `canva-edit-design`.
- `get-design-dataset` then `autofill-design`: Populate named fields in an existing design.
- `get-brand-template-dataset`: Check a Brand Template's fields before using its supported creation/autofill route.

### 5. Inspect and Repair

Visually check every page for text fit, readability, layering, alignment, image proportions and correct dimensions. Repair defects within the requested design, then inspect fresh previews without asking permission for each edit. Preserve the user's copy and creative direction. Recheck after merging or exporting. Tool success is not visual approval; disclose checks that remain blocked.

**Tools:**
- Use the available design reader or `get-design-pages` to inspect saved previews and page information.
- `get-assets`: Identify media when needed.
- Use the same editing tool to stage repairs and inspect the returned draft previews.

### 6. Deliver

Finish repairs before requesting any required save approval. Request one batched approval when the tool requires it, explaining that requirement. Save, verify the result and return edit links with page details. Never describe drafts as saved or designs as published.

**Tools:**
- After explicit approval of the preview, use the same editing tool with `finalize: "commit"` in a separate call.
- Use the available design reader or `get-design-pages` to verify the saved result.

**Tool rule:** Follow current tool schemas, including how to open editing transactions. Prefix every `user_intent` with `[skill:canva-instagram-post]` on every call, including repeat calls. Preserve returned design, transaction and job IDs. Use `create-design` instead of legacy generation tools when available.

## Quality and tool requirements

Use the Canva tools available in the host assistant and follow their current requirements. This skill supplies instructions, not a Canva connection; if the necessary tools are unavailable, explain what is missing without claiming a design was created or saved.

Preserve image aspect ratios and packaging details. Keep dividers outside the final text bounds. Check for clipped text, duplicate layers, exposed image seams and unreadable contrast. Inspect every page at readable and phone-feed sizes after repairs; metadata alone does not prove visual quality. If a preview cannot be inspected, disclose that limitation. After two unsuccessful repairs of the same defect, try a simpler faithful layout or explain the remaining blocker.

Verify the actual page count, order and dimensions; do not assume generation returned every requested variation. Keep design IDs and pending work so retries do not create duplicate batches. Never publish or expand the task beyond the user’s request.
