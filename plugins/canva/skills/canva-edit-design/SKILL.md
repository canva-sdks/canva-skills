---
name: canva-edit-design
description: Make edits to an existing Canva design — change or fix text, replace/insert/delete images and videos, reformat text (size, weight, style, color, alignment, lists, line height), reposition or resize elements, and update the title. Use when the user wants to change, edit, update, fix, translate, replace, or reformat content in a specific Canva design. This is the safe edit engine that other Canva skills (e.g. implement-feedback) build on.
---

# Canva Design Editing

The canonical, safe way to apply edits to an existing Canva design. Every Canva skill that mutates a design should follow this exact protocol: **open a transaction → apply operations → commit (with approval)**. Changes are draft-only until committed and are PERMANENTLY LOST if not committed.

## The Transaction Protocol (always these steps, in order)

1. **`Canva:read-design`** — pass the `design_id` with `open_transaction: true` and `filter.fields` including `"thumbnails"` and `"design_content"`. Remember the returned `transaction_id`; it is required by later calls. Use the returned `design_content` to find the `locator_id` of each element to edit, and note each page's `type`/`isEditable` values. ALWAYS show the user the thumbnail(s) returned here.
2. **`Canva:edit-design`** — apply edits with `finalize: "keep_open"`. Pass the `transaction_id`, the `page_index` of the page being changed, and an `operations` array. Batch multiple operations into a single call wherever possible. Set `is_responsive` / `is_editable` from the page data returned by `read-design`.
3. **`Canva:edit-design`** with `finalize: "commit"` and **no** `operations` — save. See the approval gate below. After committing, the `transaction_id` is invalid; a new edit needs a new transaction.
4. **`Canva:edit-design`** with `finalize: "cancel"` and **no** `operations` — discard the draft instead of saving (e.g. the user rejects the preview, or you opened a transaction only to inspect the design).

To preview unsaved edits, call `Canva:read-design` again with the `transaction_id` and `"thumbnails"` in `filter.fields`.

## Capabilities — what the API CAN and CANNOT do

### CAN (operations on `edit-design`)
- **Text content**: `replace_text` (whole element), `find_and_replace_text` (substring), `add_text` (new text box)
- **Text formatting** (`format_text`): font size, weight (normal/bold), style (normal/italic), color, alignment, line height, underline, strikethrough, links, list level/marker; `update_text_anchoring`
- **Media**: `update_fill` (replace image/video), `insert_fill` (add image/video), `delete_element`, `crop_media`, `flip_media`
- **Layout**: `position_element`, `resize_element`, `rotate_element`, `layer_element`, `group_elements`, `ungroup_elements`
- **Shapes and color**: `insert_shape`, `replace_shape`, `recolor_element`, `update_opacity`, `update_stroke_properties`, `update_line_properties`
- **Pages**: `add_page`, `reorder_page`, `replace_speaker_notes`
- **Metadata**: `update_title`
- **Autofill mapping**: `update_autofill_field` (fixed-page designs only)

### CANNOT
- Change font **family/typeface** (only size, weight, style)
- Modify animations or transitions

When a requested change is not in the CAN list, tell the user it must be done manually in the Canva editor — don't attempt a workaround.

## Responsive pages — restricted operation set

Some pages come back from `read-design` with `"type": "responsive"` (pass `is_responsive: true` to `edit-design` for these). On those pages, ONLY these operations are allowed:
`update_title`, `replace_text`, `update_fill`, `delete_element`, `find_and_replace_text`.

Before calling `edit-design`, check the page data returned by `read-design`. If any operation targets a responsive page with an unsupported op (e.g. `format_text`, `position_element`, `resize_element`, `insert_fill`), do NOT make the call — tell the user that operation isn't supported on that page and offer an alternative.

## The commit approval gate (required)

Committing (`edit-design` with `finalize: "commit"`) makes changes permanent. You MUST show the user exactly what changed (and the preview thumbnail) and get explicit approval before committing — e.g. "Here's the preview. Save these changes to your design?" Wait for a clear yes.

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
Call `Canva:read-design` with `open_transaction: true` (include `thumbnails` and `design_content`). Show the thumbnail(s). Use the returned content to locate the exact `element_id`s you need to target. (If you only needed to look, call `edit-design` with `finalize: "cancel"` and stop.)

### Step 3: Build and perform operations
Translate the user's request into concrete operations. Confirm scope first when a `find_and_replace_text` string could match in multiple places or contexts — ask which instances they mean. Batch all operations into one `edit-design` call (`finalize: "keep_open"`) when you can.

### Step 4: Preview and commit
Show the resulting thumbnail and a plain-language list of what changed. Ask for approval, then call `edit-design` with `finalize: "commit"`. Share the edit link.

## Rules
- Always remember and reuse the `transaction_id` within a transaction.
- Never leave a transaction uncommitted without telling the user their draft was discarded.
- For destructive ops (`delete_element`, large `find_and_replace_text`), confirm scope before performing.
- Prefer one batched `edit-design` call over many small ones.
