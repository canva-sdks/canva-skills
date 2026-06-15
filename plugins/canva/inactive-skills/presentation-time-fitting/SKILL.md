---
name: canva-presentation-time-fitting
description: Fit a Canva presentation to a target speaking duration by generating or rewriting presenter notes only (visible slide text is not edited). Use when users say "make this a 10-minute presentation", "split time evenly across slides", "generate speaker notes for a 15-minute talk", "fit my deck to [duration]", or "how long per slide for a 20-minute slot".
---

# Presentation Time-Fitting

Take an existing Canva presentation and align it with a target speaking duration **using presenter notes only**. Visible **on-slide text is read** for context and timing, but **must not** be changed by this skill. The flow is: confirm **design + total duration** (before cloning), read slide text, divide time across slides, **add, replace, or trim speaker notes** per slide to match each slot, write **notes only** back via Canva editing tools.

## Primary workflow (time-balanced presenter notes)

### Step 1: Collect design and duration (before other Canva tool calls)

- Gather everything you need **before** calling `Canva:resize-design`, `Canva:get-design-content` or other editing/content tools:
  - **Design**: link (`canva.link`), full Canva URL, **design ID**, or **design name** (see Step 2 for how each maps to `design_id`)
  - **Total speaking time** for delivering the deck (e.g. `"15 minutes"`, `"45 min"`, `"1 hour"`). Parse to **total seconds** (or minutes as a decimal). If the user is vague, confirm the **total minutes** they want for speaking through the slides (include Q&A in that total only if they say so)
- If either design or duration is missing, **ask and wait** before proceeding

### Step 2: Resolve the design

- If the user provides a short link (`canva.link`), call `Canva:resolve-shortlink` to get the design URL
- If the user provides a full Canva URL, extract the design ID (`https://www.canva.com/design/{design_id}/...`)
- If the user provides a **design ID** directly (typically starts with `D`, e.g. `DABcd1234ef`), use it as `design_id`; **do not** use `Canva:search-designs` for a raw ID
- If the user provides a **design name** (not an ID), use `Canva:search-designs`; if multiple matches, ask for clarification
- If you still cannot resolve a design, ask for the design ID or link

### Step 3: Work on a copy (required)

- Use `Canva:resize-design` with the **same dimensions** as the source to clone the presentation; **do not** modify the original

### Step 4: Read slide content

- Call **`Canva:get-design-content`** on the **copy** to extract **visible text per slide/page** (headings, bullets, body)
- Build a per-slide summary: slide index or title, text content, and whether speaker notes already exist if the payload includes them
- **Slide count** = number of content-bearing pages from this response (use for the division in Step 5)

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

- Call **`Canva:get-design-pages`** on the **copy** to obtain **`page_id`** (or equivalent) for each slide that needs notes
- Call **`Canva:start-editing-transaction`** on the copy if not already active; use the returned `transaction_id` for edits
- **Optional ordering:** start the editing transaction **soon after** you have the copy’s design ID (e.g. right after Step 4 or right after `get-design-pages`) so the session is open **before** you spend a long time composing notes in chat; some environments time out less often when the transaction is not deferred. If the connector allows **one** long-lived transaction for the whole flow, prefer opening it once and reusing `transaction_id` for Step 7 edits
- Call **`Canva:perform-editing-operations`** using **only** the **operation type the Canva MCP exposes for presenter/speaker notes** (name may vary by connector; use the schema for updating notes **per page**). Do **not** call `replace_text`, `find_and_replace_text`, or any operation that changes **visible on-slide text**. Apply **all** note updates, batched in as **few** calls as allowed
- Call **`Canva:commit-editing-transaction`** to save

### Step 8: Hand off

- Share the **link to the copy** of the design and a **one-line recap**: total target time and per-slide time allocation
- Remind the user that pace (~150 wpm) varies by speaker and that **equal split** is a default; they can ask for a different weighting in a follow-up

---

## Scope: notes only

- **In scope**: Read on-slide text via **`get-design-content`**. Create, update, lengthen, or shorten **presenter/speaker notes** only, using the MCP’s note operation per page.
- **Out of scope**: Do **not** change **visible slide content** (`replace_text`, `find_and_replace_text`, formatting, media, layout, title, etc.). If the user asks to cut or pad the **slides themselves**, say this skill only adjusts **notes**; they can edit slides in Canva or use another skill/workflow.
- **Slide count**: The API cannot add or remove pages. If the time target is unrealistic for the amount of on-slide material (e.g. 60 minutes of talking from two dense slides), say so and suggest **splitting or simplifying slides in the editor**, or revising the target duration. You may still write notes that **acknowledge** the squeeze (e.g. “prioritise X, skim Y”) without changing slide text.

---

## When `start-editing-transaction` fails or times out

**Cause (usually not the skill text):** Canva or the MCP gateway can **abort** with *“The operation was aborted due to timeout”* when the design is **large** (many pages/assets), the **network** is slow, or **servers are under load**. That is an **infrastructure / product** limit, not something fixed by editing `SKILL.md`.

**What to do in the session:**

1. **Retry once** `Canva:start-editing-transaction` after a short pause (e.g. 15–30 seconds). Transient failures often succeed on a second attempt.
2. **Open the transaction earlier** in the flow (see Step 7 bullet) so a long note-generation stretch in chat does not sit between “ready to edit” and “start transaction.”
3. If it **still** fails: tell the user clearly this is a **Canva/MCP timeout**, not a logic error in the skill. Suggest they **try again later**, use a **stable network / VPN** per org policy, or test on a **smaller copy** of the deck (fewer pages) to confirm the pipeline works.
4. **Fallback:** paste the **generated speaker notes** into the chat **grouped by slide** (Slide 1: …, Slide 2: …) so the user can **enter them manually** in Canva’s presenter notes if automation keeps timing out.

---

## Rules

- **Always** clone with `Canva:resize-design` (same dimensions) before edits
- **Read** with **`Canva:get-design-content`**; **resolve page IDs** with **`Canva:get-design-pages`** before writing notes
- **Primary path**: confirm duration early → per-slide budget → generate notes → **note-only** **`perform-editing-operations`** → **commit**
- **Never** edit on-slide text in this skill; **only** presenter/speaker notes (see **Scope: notes only**)
- On **`start-editing-transaction`** timeout: retry once, then explain and offer the **manual notes fallback** (see **When `start-editing-transaction` fails or times out**)
- Batch editing operations where possible
