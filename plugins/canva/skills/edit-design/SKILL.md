---
name: canva-edit-design
description: Make edits to an existing Canva design — change or fix text, replace/insert/delete images and videos, reformat text (size, weight, style, color, alignment, lists, line height), reposition or resize elements, add or reorder pages, restyle/group shapes, and update the title. Use when the user wants to change, edit, update, fix, translate, replace, or reformat content in a specific Canva design. This is the safe edit engine that other Canva skills (e.g. implement-feedback) build on.
---

# Canva Design Editing

The canonical, safe way to apply edits to an existing Canva design. Every Canva skill that mutates a design should follow this exact protocol: **open a transaction via `read-design` → apply operations via `edit-design` → commit (with approval)**. Changes are draft-only until committed and are PERMANENTLY LOST if not committed.

## Before you start: read the workflow guide

Call **`Canva:get-editing-workflow-guide`** once near the start of an editing session (no arguments). It returns the full, authoritative validation loop, hard rules, and side-effect checklist for `read-design`/`edit-design` — follow it for every edit in this skill. This file gives the Canva-specific quick reference; the guide is the source of truth for the mechanics.

## The Transaction Protocol (always these steps, in order)

1. **`Canva:read-design`** with `design_id` and `open_transaction: true`. Pass `filter: { fields: ['design_content', 'thumbnails'], thumbnail_pages: [...] }` to also get the CDF markdown (elements annotated with `[locator_id]`, e.g. `## TEXT [PBxxx-LByyy]` — use that as `element_id` in operations) and thumbnails in the same call. Remember the returned `transaction.transaction_id`. ALWAYS show the user the thumbnail(s) returned here.
2. **`Canva:edit-design`** with `transaction_id`, `page_index` (1-indexed), and `operations` — apply edits to **one page per call**; all operations in a call must target that same page. Leave `finalize` at its default, `'keep_open'`. Batch multiple operations to the same page into a single call wherever possible.
3. **`Canva:edit-design`** with `transaction_id`, `finalize: 'commit'`, and `operations` omitted (or `[]`) — save. See the approval gate below. `commit` and `cancel` CANNOT be combined with `operations` — finalize only after a separate `keep_open` call has applied and you've validated the edits. After committing, the `transaction_id` is invalid; a new edit needs a new transaction.
4. **`Canva:edit-design`** with `transaction_id`, `finalize: 'cancel'`, `operations` omitted — discard the draft instead of saving (e.g. the user rejects the preview, or you opened a transaction only to inspect the design).

## Capabilities — what the API CAN and CANNOT do

### CAN (operations on `edit-design`)
- **Text content**: `replace_text` (whole element, or empty target), `find_and_replace_text` (substring — preferred, preserves formatting), `add_text` (new text elements)
- **Text formatting** (`format_text`): font size, weight (normal/bold), style (normal/italic), color, alignment, line height, underline, strikethrough, links, list level/marker, text anchoring (`update_text_anchoring`)
- **Media**: `update_fill` (replace image/video), `insert_fill` (add image/video), `delete_element`, `flip_media`, `crop_media`
- **Shapes & lines**: `insert_shape`, `replace_shape`, `recolor_element`, `update_stroke_properties`, `update_line_properties`
- **Layout**: `position_element`, `resize_element`, `rotate_element`, `layer_element` (front/back), `group_elements`, `ungroup_elements`, `update_opacity`
- **Pages**: `add_page`, `reorder_page`, `replace_speaker_notes`
- **Metadata**: `update_title`
- **Autofill mapping**: `update_autofill_field` (fixed-page designs only)

### CANNOT
- Change font **family/typeface** (only size, weight, style)
- Change the background color/gradient of an **existing** page (`add_page` can set a background, but only for a brand-new page)
- Delete a page (pages can be added and reordered, not removed)
- Modify animations or transitions

When a requested change is in the CANNOT list, tell the user it must be done manually in the Canva editor — don't attempt a workaround.

## Responsive pages — restricted operation set

Some pages come back marked `is_responsive: true`. On those pages, ONLY these operations are allowed:
`update_title`, `replace_text`, `update_fill`, `delete_element`, `find_and_replace_text`.

Before calling `edit-design`, check the page's flags in the `read-design` output. If any operation targets a responsive page with an unsupported op, do NOT make the call — tell the user that operation isn't supported on that page and offer an alternative. Echo the page's `is_responsive`/`is_empty` flags back on the `edit-design` call — the API uses them to decide what's allowed.

## Non-editable pages

Pages tagged `(NON-EDITABLE)` in the `read-design` output cannot be targeted at all. If any operation in an `edit-design` call targets one, the ENTIRE batch is rejected. Don't attempt it — offer to edit the editable pages instead.

## The commit approval gate (required)

`edit-design` with `finalize: 'commit'` makes changes permanent. You MUST show the user exactly what changed (and the after-thumbnail) and get explicit approval before committing — e.g. "Here's the preview. Save these changes to your design?" Wait for a clear yes.

- Do NOT commit without approval.
- Do NOT tell the user changes are saved before the commit call has succeeded.
- After a successful commit, give the user a direct link to open the design in Canva.
- If a commit fails, all changes are lost — start a new transaction to retry.

> Note for composing skills: a skill that already collects a single up-front approval for a batch of changes (e.g. `canva-implement-feedback`) should treat that approval as covering the commit and NOT ask again. Follow that skill's own confirmation rules; the gate above is the default for direct, ad-hoc edits.

## Workflow

### Step 1: Resolve the design
- Short link (`canva.link/...`) → `Canva:resolve-shortlink` to get the URL.
- Full Canva URL → extract the design ID (the segment after `/design/`).
- Raw design ID (starts with `D`) → use directly; do NOT search.
- Nothing provided → ask for the design ID or link.

### Step 2: Start the transaction and inspect
Call `Canva:read-design` with `open_transaction: true` and `filter.fields` including `design_content` and `thumbnails`. Show the thumbnail(s). Use the `[locator_id]` annotations to locate the exact `element_id`s you need to target. (If you only needed to look, call `edit-design` with `finalize: 'cancel'` and stop.)

### Step 3: Build and perform operations
Translate the user's request into concrete operations. Confirm scope first when a `find_and_replace_text` string could match in multiple places or contexts — ask which instances they mean. All operations in one `edit-design` call must target the same page; loop page-by-page for multi-page edits, validating each (per the workflow guide) before moving to the next.

### Step 4: Preview and commit
Show the resulting thumbnail (from the `edit-design` response) and a plain-language list of what changed. Ask for approval, then call `edit-design` with `finalize: 'commit'`. Share the edit link.

## Rules
- Always remember and reuse the `transaction_id` within a transaction.
- All operations in a single `edit-design` call must target the same `page_index`.
- Never leave a transaction uncommitted without telling the user their draft was discarded.
- For destructive ops (`delete_element`, large `find_and_replace_text`), confirm scope before performing.
- Prefer one batched `edit-design` call per page over many small ones.
- Follow the mandatory validation loop from `Canva:get-editing-workflow-guide` after every edit — compare before/after thumbnails and inspect the returned document before proceeding.
