---
name: canva-translate-design
description: Translate all text in a Canva design to another language, creating a translated copy. Faster than manually copying and editing each text box in Canva's editor. Use when users say "translate my design to [language]", "make a Spanish/French/etc version", or "localize my Canva design".
---

# Canva Translate

Translate all text elements in a Canva design to a target language, creating a new copy with translated content.

## Workflow

### 1. Locate the Design

If user provides a **design ID** directly (typically starts with `D`, e.g. `DABcd1234ef`), use that as the design identifier; **do not** pass it to `search-designs` (search is for titles, not IDs).

If user provides a **URL**: Extract the design ID from the URL (format: `https://www.canva.com/design/{design_id}/...`).

If user provides a **name**: Use `search-designs` to find the design by title. If multiple matches, ask user to clarify.

### 2. Create a Translated Copy

Use `copy-design` to duplicate the source.

### 3. Start Editing Transaction

Follow the tool pairing in `canva-edit-design`. Open a transaction on the copy with `read-design` and `open_transaction: true`, or use `read-design-v2` with the code-based editor when the host exposes that pairing. Keep the transaction ID, page and locator IDs, and original text.

### 4. Translate Text

For each text element returned:
1. Translate the text to the target language (use Claude's translation capability)
2. Preserve formatting cues (line breaks, emphasis patterns)
3. Keep proper nouns, brand names, and technical terms as appropriate

### 5. Apply Translations

Stage changes with `edit-design` using `finalize: "keep_open"`. For the operations schema, batch `replace_text` operations by page using returned locator IDs. Follow the responsive-page guidance in `canva-edit-design` and the returned code guide for the code-based editor. Update the title to identify the language if the editor supports it.

### 6. Commit Changes

Show the translated preview and get explicit approval. Call the same editing tool with `finalize: "commit"` and no operations or code. Share the edit link.

## Example Interaction

**User**: Translate my "Summer Sale Poster" to French

**Steps**:
1. Search: `search-designs` with query "Summer Sale Poster"
2. Copy: `copy-design` to create the duplicate
3. Edit: `read-design` with `open_transaction: true` on the copy
4. Translate all text elements to French
5. Apply: stage translations with `edit-design`
6. Show preview, get approval, commit

## Important Notes

- Always create a copy—never modify the original design
- Batch compatible edits per page
- If translation significantly changes text length, warn user that layout adjustments may be needed in Canva
- For designs with many pages, translate all pages in the same transaction
