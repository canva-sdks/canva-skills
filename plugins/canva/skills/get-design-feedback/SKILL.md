---
name: canva-design-feedback
description: Read a Canva design and return structured, actionable design feedback — visual hierarchy, copy/messaging, layout & spacing, consistency, readability, and accessibility. Read-only; makes no changes to the design. Use when the user asks to "review my design", "give me feedback on this", "critique my deck/poster/flyer", "how can I improve this design", or "what's wrong with this slide".
---

# Get Design Feedback

Act as a design reviewer: read the design as it actually appears, then return concrete, prioritised feedback the user can act on. This skill is **read-only** — it never edits the design. When the user wants the changes made, hand off to `canva-edit-design` or `canva-implement-feedback`.

## What you can actually read (and the gap to know about)

- **`Canva:read-design`** (plain read, no transaction) returns text content — good for copy, headings, and wording, but not colors, fonts, sizes, or element positions. This works even for users with read-only access to the design.
- **`Canva:read-design` with `open_transaction: true`** (`filter: { fields: ['design_content'] }`) returns the full CDF as markdown, with geometry, element types, backgrounds, strokes, and opacity all visible — a real upgrade over the old text-only model. Use this for layout/spacing/alignment detail. This opens an editing transaction as a side effect; when you're done inspecting, close it with `Canva:edit-design` (`transaction_id`, `finalize: 'cancel'`) — **never commit**, since this skill makes no changes.
- **`Canva:read-design` with `filter: { fields: ['thumbnails'], thumbnail_pages: [...] }`** gives you the rendered image — this is how you "see" layout, hierarchy, balance, color, and contrast. Always pull this; visual critique depends on it.
- **Precise color/font values are still not guaranteed.** The CDF exposes what's structurally present, but treat the **thumbnail as the primary source** for any color, contrast, or typography judgement, and treat CDF style data as best-effort (use it when present, don't depend on it). Never report a specific hex/font as fact unless the payload actually contained it.

## Workflow

### Step 1: Resolve the design
Short link → `Canva:resolve-shortlink`; full URL → extract the ID; raw `D...` ID → use directly; otherwise ask.

### Step 2: Read the design
- `Canva:read-design` (default fields) for title and page count.
- `Canva:read-design` with `filter: { fields: ['thumbnails'] }` (and/or `['page_metadata']`) to see each page.
- `Canva:read-design` with `filter: { fields: ['design_content'] }` for the text.
- Optional (layout/typography/color detail): `Canva:read-design` with `open_transaction: true` as described above, then close it with `Canva:edit-design` (`finalize: 'cancel'`).

### Step 3: Evaluate across dimensions
Assess the design against these lenses. Skip any that don't apply to the design type:

- **Visual hierarchy** — does the eye land on the most important thing first? Title/subtitle/body contrast.
- **Layout & spacing** — alignment, balance, crowding, consistent margins/gutters.
- **Copy & messaging** — clarity, length, tone, typos, jargon, a single clear takeaway per page.
- **Consistency** — repeated fonts, sizes, colors, and spacing across pages.
- **Readability & contrast** — text size vs. viewing context, text-on-image legibility, color contrast.
- **Accessibility** — contrast ratios, alt text, text not conveyed by color alone.
- **Fit for purpose** — does it suit the stated channel/audience (a slide ≠ an Instagram post ≠ a flyer)?

### Step 4: Return structured feedback
Organise findings by **page**, each with a **severity** and a **concrete fix**:

```
## Feedback — "<design title>" (N pages)

### Top priorities
1. [High] Page 2 — Title competes with the body text (same size/weight).
   Fix: bump the title to ~1.5× and bold it so it reads first.
2. [High] Page 4 — White caption over a light photo is hard to read.
   Fix: darken the image or add a scrim; or move the caption to a solid band.

### Page-by-page
**Page 1** — [Med] Three different accent colors; pick one. [Low] "recieve" → "receive".
**Page 2** — ...

### What's working
- Consistent margins; strong cover image.
```

Use severities **High / Med / Low**. Lead with the few highest-impact items, then the per-page detail. Be specific and located (page + element), not generic ("make it pop").

### Step 5: Offer to act
End by offering to implement the API-fixable items via **`canva-edit-design`**, and note which items need manual work in Canva (e.g. font-family or existing-page-background changes the API can't touch — see `canva-edit-design` for the full CANNOT list).

## Rules
- Never edit or commit anything — this skill is strictly read-only. If you open a transaction to inspect, always close it with `edit-design` (`finalize: 'cancel'`).
- Ground every point in something you actually observed in the thumbnail or content — no generic advice.
- Prioritise. A ranked shortlist beats an exhaustive list the user won't read.
- Be candid but constructive; always pair a problem with a specific fix.
