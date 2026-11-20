---
name: canva-implement-feedback
description: Implement reviewer feedback on a Canva design. Reads all comment threads, synthesises what reviewers want, makes the clear-cut changes directly, and flags anything that needs a human decision. Use when the user asks to "implement feedback on my deck", "address comments on a design", "apply review feedback", "fix the comments on my presentation", or "implement the feedback".
---

# Feedback to Finished

A deck has been out for review — stakeholders have left comments scattered across slides. This skill reads every thread, summarises what reviewers actually want, makes the clear-cut changes directly, and flags anything ambiguous for a human decision.

## Canva Editing API — What You Can and Cannot Do

Before triaging feedback, you MUST know these constraints. This avoids wasted back-and-forth with the user on changes that are impossible via the API.

### What the API CAN do (via `edit-design`)

- **Text content**: replace entire text elements (`replace_text`), find-and-replace substrings (`find_and_replace_text`), add new text boxes (`add_text`)
- **Text formatting**: font size, font weight (bold), font style (italic), text color, text alignment, line height, text decoration (underline), strikethrough, links, list formatting
- **Media**: replace images/videos (`update_fill`), insert new images/videos (`insert_fill`), delete elements (`delete_element`), crop/flip (`crop_media`, `flip_media`)
- **Layout**: reposition, resize, rotate, layer, group/ungroup elements (`position_element`, `resize_element`, `rotate_element`, `layer_element`, `group_elements`, `ungroup_elements`)
- **Shapes and color**: insert/replace shapes, recolor elements, change opacity and stroke/line properties
- **Pages**: add pages (`add_page`), reorder pages (`reorder_page`), update speaker notes (`replace_speaker_notes`)
- **Metadata**: update design title (`update_title`)

### What the API CANNOT do

- Change font family/typeface — only size, weight, and style are supported
- Modify animations or transitions

### Triage rule

When a comment requests something in the "CANNOT do" list, classify it as **Requires manual action**. Don't dwell on the limitation — simply note it in the summary and move on. These are normal; most design reviews will have a mix of API-supported and manual changes. Save the details for the manual changes checklist at the end (Step 7).

## Workflow

### Step 1: Resolve the Design

- If the user provides a short link (`canva.link`), call `Canva:resolve-shortlink` to get the design URL
- If the user provides a full Canva URL, extract the design ID from the URL
- If the user provides a **design ID** directly (typically starts with `D`, e.g. `DABcd1234ef`), use it as `design_id`; **do not** use `Canva:search-designs` for a raw ID
- Otherwise ask for the design ID or link

### Step 2: Read All Feedback

- Call `Canva:list-comments` with the design ID to get every comment thread
- For each thread with replies, call `Canva:list-replies` to capture the full conversation
- Call `Canva:read-design` (default fields, or `design_content`) to read the current text on every page

### Step 3: Triage the Feedback

Classify each comment thread into one of these categories:

- **Actionable** — a change that the API supports and you can reasonably interpret. Use your best judgement — if a comment says "make the title punchier", rewrite it to be punchier rather than flagging it as ambiguous. If a comment says "fix the spacing", look at the design content and make a reasonable adjustment. Only escalate to the user when you genuinely cannot determine what the reviewer intends (e.g., two reviewers directly contradict each other, or a comment references something you can't find in the design).
- **Requires manual action** — the reviewer wants something the API cannot do (font family change, animation or transition change, etc.). Note these briefly in the summary — full details go in the manual changes checklist (Step 7).
- **Resolved** — already addressed, explicitly marked done, or is a positive acknowledgement (e.g., "LGTM", "looks good")

Present a summary to the user organised by category: what you plan to change, what needs clarification, what must be done manually, and what you're skipping.

### Step 4: Get User Approval — ONE time only

- Present the plan and wait for the user to approve
- If the user wants adjustments, update the plan and confirm once more

**This is the only confirmation point in the entire workflow. Once the user says yes, go.**

### Step 5: Apply and Commit the Changes

**Do NOT ask the user again.** They already approved. Execute all of these in sequence immediately:

- Call `Canva:read-design` with `open_transaction: true` (include `thumbnails` and `design_content` in `filter.fields`) to begin an editing session and get the `transaction_id`
- Call `Canva:edit-design` with `finalize: "keep_open"` to make each approved change (batch all operations in a single call where possible)
- Call `Canva:edit-design` with `finalize: "commit"` and no operations to save — do NOT ask "shall I commit?" or "ready to save?"
- Call `Canva:read-design` with `thumbnails` in `filter.fields` to show the user a thumbnail as confirmation

### Step 7: Present Remaining Manual Changes

After committing (or if no API-supported changes were possible), present a clear checklist of everything that still needs to be done manually in the Canva editor:

```
## Changes to make manually in Canva

1. **Slide 3 — Change heading font to Montserrat**
   Reviewer: @Sarah | Why: API cannot change font family
   → Open slide 3, select the heading, change font to Montserrat

2. **Slide 7 — Add a slide transition**
   Reviewer: @James | Why: API cannot modify animations or transitions
   → Select slide 7, open Animate, and apply the requested transition

3. ...
```

Include the slide number, what to change, who requested it, and step-by-step instructions so the user can work through the list quickly.

### Step 8: Resolve Comment Threads

- After committing, call `Canva:reply-to-comment` on each actionable thread to note what was changed
- For "Requires manual action" threads, reply noting what was done as the closest alternative and what still needs manual attention
- This closes the feedback loop so reviewers can see their comments were addressed

## Rules

- Be helpful, not cautious — interpret feedback generously and make your best attempt at a change rather than labelling it "ambiguous" and giving up. The user can always reject your changes in the approval step.
- Only escalate to the user when you genuinely can't figure out the intent — two reviewers directly contradict each other, or a comment references something you can't find in the design
- When reviewers disagree, present both sides and let the user decide
- Show the summary of planned changes and wait for approval ONCE — after that, execute everything without further confirmation
- NEVER ask "shall I commit?", "ready to save?", or any variation — the user's initial approval covers the entire edit-and-commit flow
- Manual changes are normal and expected — don't over-explain or apologise for API limitations, just include them in the checklist
- Batch operations: use a single `edit-design` call with multiple operations rather than one call per change
