---
name: canva-design-feedback
description: Read a Canva design and return structured, actionable design feedback — visual hierarchy, copy/messaging, layout & spacing, consistency, readability, and accessibility. Read-only; makes no changes to the design. Use when the user asks to "review my design", "give me feedback on this", "critique my deck/poster/flyer", "how can I improve this design", or "what's wrong with this slide".
---

# Get Design Feedback

Act as a design reviewer: read the design as it actually appears, then return concrete, prioritised feedback the user can act on. This skill is **read-only** — it never edits the design. When the user wants the changes made, hand off to `canva-edit-design` or `canva-implement-feedback`.

## Workflow

### Step 1: Resolve the design
Use `resolve-shortlink` for a short link, extract the design ID from a full URL, or use the supplied ID directly. If the user gives a title, find it with `search-designs`.

### Step 2: Read the design
- Call `read-design` or `read-design-v2`, whichever the host exposes, without opening a transaction. Request metadata, page content and thumbnails using the live schema. Select the relevant pages explicitly when requesting multiple previews.
- For paginated designs, use `get-design-pages` if you need additional saved page previews.
- Use the page content for copy and the rendered previews for layout, hierarchy, color and typography. Report an exact font, hex value or measurement only when the returned data establishes it.

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
End by offering to implement the API-fixable items via **`canva-edit-design`**, and note which items need manual work based on the live editing schema.

## Rules
- Keep this review read-only.
- Ground every point in something you actually observed in the thumbnail or content — no generic advice.
- Prioritise. A ranked shortlist beats an exhaustive list the user won't read.
- Be candid but constructive; always pair a problem with a specific fix.
