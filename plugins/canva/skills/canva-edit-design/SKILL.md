---
name: canva-edit-design
description: Make edits to an existing Canva design — change or fix text, replace/insert/delete images and videos, reformat text (size, weight, style, color, alignment, lists, line height), reposition or resize elements, and update the title. Use when the user wants to change, edit, update, fix, translate, replace, or reformat content in a specific Canva design. This is the safe edit engine that other Canva skills (e.g. implement-feedback) build on.
---

# Canva Design Editing

Edit a Canva design using a single transaction. Discover the connected host's tools first. The same tool name can have different schemas depending on the connector.

## Workflow

1. **Resolve the design.** Use `resolve-shortlink` for a canva.link URL, extract the ID from a full Canva design URL, or use the supplied design ID directly. Ask for the ID or link if needed.
2. **Open and inspect.** Call `read-design` with the design ID and `open_transaction: true`. Request the page content and thumbnails using the live schema. Keep the returned `transaction_id`, page IDs and locator IDs. If the host exposes `read-design-v2` with the code-based editor, use its documented pairing and read the returned `code_guide`.
3. **Stage the edits.** Call `edit-design` with `finalize: "keep_open"`. With the operations schema, batch compatible operations by page, pass the one-based `page_index`, and reuse the transaction ID across pages. With a code-based schema, author the code using the transaction's `code_guide`. Use `edit-design-v2` only if that is the callable name exposed by the host for that schema.
4. **Preview.** Inspect the returned draft state and thumbnails. With the operations-based reader, pass the transaction ID to `read-design` to re-read an unsaved draft if needed. Show the user the changed pages and summarise the edits. For responsive pages, use the draft document when a thumbnail is unavailable.
5. **Save or discard.** After explicit approval of the preview, call the same editing tool with the transaction ID and `finalize: "commit"`. To discard the draft, call it with `finalize: "cancel"`. Send either action in a separate call with no operations or code. Share the Canva edit link after a successful save.

## Choose supported operations

Check the live schema and the targeted page before staging. The operations-based editor supports `replace_text`, `find_and_replace_text`, `format_text`, media and layout changes, and `update_title`. Use returned locator IDs to target existing elements and returned page IDs for page-level operations. For responsive pages, follow the live restrictions and set `is_responsive`, `is_empty` and `is_editable` as documented. Use `find_and_replace_text` for populated responsive text and reserve `replace_text` for the empty cases described by the schema.

Flag changes the available editor cannot make so the user can finish them in Canva. If staging or saving fails, check the transaction state before retrying. Report whether the changes were saved, discarded, or remain pending.
