---
name: canva-presentation-time-fitting
description: Fit a Canva presentation to a target speaking duration by generating or rewriting presenter notes only (visible slide text is not edited). Use when users say "make this a 10-minute presentation", "split time evenly across slides", "generate speaker notes for a 15-minute talk", "fit my deck to [duration]", or "how long per slide for a 20-minute slot".
---

# Presentation Time-Fitting

Take an existing Canva presentation and align it with a target speaking duration **using presenter notes only**. Visible **on-slide text is read** for context and timing, but **must not** be changed by this skill. The flow is: confirm **design + total duration** (before cloning), read slide text, divide time across slides, **add, replace, or trim speaker notes** per slide to match each slot, write **notes only** back via Canva editing tools.

## Primary workflow (time-balanced presenter notes)

### Step 1: Collect design and duration (before other Canva tool calls)

- Gather everything you need **before** calling `copy-design` or other Canva tools:
  - **Design**: link (`canva.link`), full Canva URL, **design ID**, or **design name** (see Step 2 for how each maps to `design_id`)
  - **Total speaking time** for delivering the deck (e.g. `"15 minutes"`, `"45 min"`, `"1 hour"`). Parse to **total seconds** (or minutes as a decimal). If the user is vague, confirm the **total minutes** they want for speaking through the slides (include Q&A in that total only if they say so)
- If either design or duration is missing, **ask and wait** before proceeding

### Step 2: Resolve the design

- If the user provides a short link (`canva.link`), call `resolve-shortlink` to get the design URL
- If the user provides a full Canva URL, extract the design ID (`https://www.canva.com/design/{design_id}/...`)
- If the user provides a **design ID** directly (typically starts with `D`, e.g. `DABcd1234ef`), use it as `design_id`; **do not** use `search-designs` for a raw ID
- If the user provides a **design name** (not an ID), use `search-designs`; if multiple matches, ask for clarification
- If you still cannot resolve a design, ask for the design ID or link

### Step 3: Work on a copy (required)

- Use `copy-design` to duplicate the presentation.

### Step 4: Read slide content

- Use `read-design` on the copy to request slide content, page metadata and presenter notes without opening a transaction. Use `read-design-v2` if it is the reader available on the host.
- Build a per-slide summary: slide index or title, text content, and whether speaker notes already exist if the payload includes them
- **Slide count** = the deck’s page count, including slides without text.

### Step 5: Calculate time per slide

- **Target speaking time per slide** = `total_duration ÷ number_of_slides` (equal split unless the user asks to weight title/closing differently; then adjust and state the assumption)
- Derive a **word budget** per slide using ~**150 words/minute** as a guide: `target_words ≈ (target_minutes_per_slide) × 150` (floor/round sensibly; treat as guidance, not a hard cap)
- Show the user a small table: slide count, total duration, **seconds (or mm:ss) per slide**, approximate word budget per slide

### Step 6: Generate speaker notes (in this session)

- **Generate the notes directly in this response**; no external API call is required. For **each slide**, using that slide’s **text from Step 4** plus the **per-slide time/word budget from Step 5**, compose **presenter notes** (this is the only content you may author or edit for timing):
  - Aim to fill roughly the allocated time when spoken aloud
  - Expand thin slides with context, transitions, and delivery cues in the **notes**; shorten **notes** if the budget is small (do not shorten on-slide text)
  - Stay faithful to the slide’s visible messages; do not invent facts
- If a slide is **visual-heavy** with little text, write notes that describe what to say **about** the visual in the allotted time

### Step 7: Write notes back to Canva

- Check that `edit-design` exposes the `replace_speaker_notes` operation. If the active editor has no documented notes operation, deliver the notes grouped by slide for the user to paste into Canva.
- Open a transaction on the copy with `read-design` and `open_transaction: true`. Use the transaction's returned page IDs and the matching page indices.
- For each slide, stage `replace_speaker_notes` with its `page_id` and `notes`. Use the one-based `page_index` and `finalize: "keep_open"`.
- Show the staged notes and obtain explicit approval before saving with `edit-design` and `finalize: "commit"` without operations. Verify the saved presenter notes with the design reader.

### Step 8: Hand off

- Share the **link to the copy** of the design and a **one-line recap**: total target time and per-slide time allocation
- Remind the user that pace (~150 wpm) varies by speaker and that **equal split** is a default; they can ask for a different weighting in a follow-up

---

## Scope: notes only

- **In scope**: Read on-slide text via `read-design`. Create, update, lengthen, or shorten **presenter/speaker notes** only, using the MCP’s note operation per page.
- **Out of scope**: Do **not** change **visible slide content** (`replace_text`, `find_and_replace_text`, formatting, media, layout, title, etc.). If the user asks to cut or pad the **slides themselves**, say this skill only adjusts **notes**; they can edit slides in Canva or use another skill/workflow.
- **Slide count**: If the time target is unrealistic for the amount of on-slide material (e.g. 60 minutes of talking from two dense slides), say so and suggest **splitting or simplifying slides in the editor**, or revising the target duration. You may still write notes that **acknowledge** the squeeze (e.g. “prioritise X, skim Y”) without changing slide text.

---

## When the transaction cannot be opened

Retry a transient read failure once. If it persists, or the available editor does not support writing presenter notes, report the blocker and provide the generated notes grouped by slide for manual entry.
