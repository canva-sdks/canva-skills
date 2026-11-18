---
name: canva-autofill
description: Populate Canva Brand Templates (or existing Canva designs) with structured data through the Canva MCP autofill flow - find a template with data fields, read its field schema, map the user's content to those fields, upload any media, call autofill-design, and hand back the finished design. Use this skill whenever the user wants on-brand Canva output from data rather than from a blank prompt - "fill in our template", "autofill", "use the brand template", "make one of these for each row / product / store / event", "merge this spreadsheet into Canva", "personalise this design for each customer", "refresh this design with the new numbers", or any request that pairs a Canva template or template ID with names, copy, images, video or chart data. Also use it when a user asks why a template can't be autofilled or how to set one up for autofill. Prefer this over generating a new design whenever a suitable Brand Template exists.
compatibility: Requires the Canva MCP connector. Autofill is available on all paid Canva plans.
---

# Canva autofill

Autofill merges values into named data fields that a designer has already placed in a Brand Template. The layout, fonts, colours and logo placement stay exactly as designed; only the tagged fields change. That makes it the most reliable way to get on-brand output from Canva, and the right choice whenever the user has a template for the job. Generating a design from a prompt is for when no template exists.

The flow is always the same five moves: **find the source, read its schema, map the data, fill, hand off.** Most failures come from skipping the second move and guessing field names, so never skip it.

Tool names and parameters below reflect the Canva MCP at the time of writing. The tool surface changes; where a live tool description disagrees with this file, trust the live description. Every Canva tool call should include a short `user_intent`.

## 1. Find the source

Work out which of three situations applies:

- **The user gave a Brand Template ID or link.** Use it directly; searching again wastes a call and risks picking a different template.
- **The user described a template or just wants "our template".** Call `search-brand-templates` with `dataset: "non_empty"` so only autofillable templates come back. Pass `query` only if the user named or described the template; otherwise leave it out and browse. If several plausible templates come back, show the names and let the user choose rather than guessing, because picking the wrong template produces a confident-looking wrong result.
- **The user wants to fill or refresh an existing design**, not a template. Find it with `search-designs` if needed and treat its `design_id` as the source.

If the search returns nothing with `dataset: "non_empty"`, retry with `dataset: "any"`. If the template exists but has no data fields, go to "When the template has no fields".

## 2. Read the schema

Call `get-brand-template-dataset` (for a template) or `get-design-dataset` (for a design). The response lists each field's name and type: `text`, `image`, `video` or `chart`.

An empty object means the source cannot be autofilled. Stop and say so; do not call `autofill-design` hoping it will work.

Treat the returned field names as the only valid keys. They are exact-match and case-sensitive (`Headline` is not `headline`, `product_name` is not `Product Name`).

## 3. Map the data

Build one mapping from the user's content to the schema before calling anything.

- **Match on meaning, write with the schema's key.** The user's column might be "Title" while the field is `headline`. Map it, and keep the field name verbatim.
- **Respect the type.** Text goes to text fields, an asset to media (image or video) fields, tabular data to chart fields. A URL pasted into an image field as text will fail.
- **Fit the copy to the space.** A field was designed around a certain amount of text, and autofill will not shrink the font to rescue a long string. Use the field name as the cue (`headline`, `cta`, `tagline` want a few words; `body`, `description` can run longer) and tighten copy that is clearly too long, telling the user what was shortened. Never change facts, prices, dates, names or legal text to make something fit; flag it instead.
- **Account for every field.** Fields left out of `data` keep the template's placeholder content, which can ship "Lorem ipsum" or last season's price. List any unfilled fields for the user and either get values or confirm they should stay as-is.
- **Do not invent content.** If the data has no value for a field, ask or leave it out and say so. Made-up prices, claims or contact details on a branded asset are worse than a gap.

When the mapping is obvious, proceed and report it afterwards. When it involves judgement (ambiguous columns, rewritten copy, missing fields), show the mapping and confirm first. A short table works well:

| Template field | Type | Value |
|---|---|---|
| `headline` | text | Autumn menu, now pouring |
| `hero_image` | image | pumpkin-latte.jpg (uploaded) |
| `price` | text | *not provided - keep placeholder?* |

### Media fields

Image and video fields are both media fields: each takes a Canva `asset_id`, so the media has to be in the user's Canva account first.

The schema's reported type does not reliably tell the two apart. A video placeholder can be reported as `image`, and a field reported that way accepts a `video` value. Set the value's `type` to match the asset being inserted (`image` for an image, `video` for a video). If the call is rejected, retry once with the field's reported type, and tell the user what happened.

- Public URL: `upload-asset-from-url`.
- File attached in chat: `create-upload-url`, then send the bytes as that tool instructs. Each upload URL is single-use.
- Already in Canva: find it with `get-assets`.
- Needs creating: generate it with `generate-image`, then use the resulting media ID.

Finish all uploads before the autofill call, and reuse an asset ID across records when the same image appears more than once.

## 4. Fill

Call `autofill-design` with exactly one source (`brand_template_id` or `design_id`) and the `data` object. Give it a `title` that identifies the output ("Autumn promo - Fortitude Valley store"); otherwise every output inherits the template's name and the user's folder fills with identical titles.

```json
{
  "brand_template_id": "<brand_template_id>",
  "title": "Autumn promo - Fortitude Valley",
  "data": {
    "headline":   { "type": "text",  "text": "Autumn menu, now pouring" },
    "hero_image": { "type": "image", "asset_id": "<image_asset_id>" },
    "promo_clip": { "type": "video", "asset_id": "<video_asset_id>" },
    "sales_chart": {
      "type": "chart",
      "chart_data": {
        "rows": [
          { "cells": [ { "type": "string", "value": "Month" }, { "type": "string", "value": "Sales" } ] },
          { "cells": [ { "type": "string", "value": "March" }, { "type": "number", "value": 1240 } ] }
        ]
      }
    }
  }
}
```

Chart rules: first row is usually headers, every row has the same number of cells, every cell declares its type, and numbers are sent as numbers (not `"1,240"`). Limits are 100 rows and 20 columns.

### Creating new versus overwriting

By default autofill creates a new design and leaves the source untouched. That is almost always what the user wants.

`update_in_place: true` (with `design_id`) overwrites the existing design's content and cannot be undone. Use it only when the user has explicitly asked to refresh or refill that specific design, and say that it overwrites before doing it. It is not available on every account; if the call fails for that reason, fall back to creating a new design and tell the user.

### Many records

"One per row" means one `autofill-design` call per record against the same template.

1. Read the schema once and build the mapping once.
2. Upload shared media once; upload per-record media as needed.
3. Run the first record alone and check it. A schema or mapping mistake repeated forty times is forty designs to delete.
4. Run the rest, titling each output from a distinguishing value in the record.
5. If a record fails, note it and continue; if the same error hits two records in a row, stop, because it is the mapping and not the data.

For large sets (more than about ten), confirm the count with the user before starting.

## 5. Hand off

Report in this shape:

- The design link (or a table of title + link for a batch).
- Which fields were filled, and with what, when anything was rewritten or shortened.
- Which fields were left on placeholder content.
- Anything that failed, with the reason.

Then offer the natural next step, without doing it unasked: export (`export-design`), resize for another channel (`resize-design`), or move to a folder. Small tweaks to a filled design belong to the editing tools, not to another autofill pass.

## When the template has no fields

A template is only autofillable once a designer has tagged elements as data fields. If the dataset comes back empty:

1. Tell the user plainly that this template has no data fields yet, and that tagging is a one-off setup step.
2. Offer the options: pick a different template that has fields; have a template owner add fields in the Canva editor (the Data autofill / Bulk Create app, connecting elements to named fields) and republish; or, if the user owns the template and asks for it, do the tagging through the MCP by following the workflow in the `create-brand-template-draft` tool description and finishing with `publish-brand-template`.
3. If they just need a design now, `create-design-from-brand-template` makes an unfilled copy they can edit by hand.

Publishing changes the template for everyone who uses it, so only publish when the user has asked for that.

Good field names make every later run easier: short, lowercase, descriptive of the role rather than the current content (`headline`, `product_image`, `cta`, `price`), and unique within the template.

## Troubleshooting

| Symptom | Likely cause | What to do |
|---|---|---|
| Dataset is empty | Template has no tagged fields | See "When the template has no fields" |
| Error about an unknown or invalid field | Key does not exactly match the schema | Re-read the schema and copy names verbatim |
| Error about field type | Wrong value shape for the field | Match `type` to the schema; image and video need `asset_id` |
| Image field rejected | Asset not in this user's Canva account, or a URL was passed | Upload first and pass the returned asset ID |
| Output still shows placeholder text | Field omitted from `data` | Supply a value or confirm it should stay |
| Text overflows or is cut off | Copy longer than the field was designed for | Shorten and rerun, or suggest the designer adjust the template |
| `update_in_place` fails | Not enabled for this account | Create a new design instead |
| "Missing scopes" error | Connector token predates a required scope | Ask the user to disconnect and reconnect the Canva connector |
| Template not found | No access, or it is a regular design rather than a Brand Template | Check the ID, try `search-designs`, or ask the owner to share it |

Do not retry the same failing call unchanged. Change something (re-read the schema, fix the type, re-upload) or stop and report.

## Example

**Request:** "Use our seasonal promo template to make a post for each of these three stores" (with a small table of store name, offer and photo URL).

**Flow:** search templates with `dataset: "non_empty"` and query "seasonal promo" → one match → `get-brand-template-dataset` returns `store_name` (text), `offer` (text), `hero_image` (image), `cta` (text) → three photos uploaded via `upload-asset-from-url` → `cta` has no source column, so ask: same call-to-action for all, or keep the template's? → fill the first store, check it → fill the other two → reply with three titled links, note that `offer` was shortened for one store, and offer to export as PNG.
