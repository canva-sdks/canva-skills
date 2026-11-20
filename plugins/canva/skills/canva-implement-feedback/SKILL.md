---
name: canva-implement-feedback
description: Implement reviewer feedback on a Canva design. Reads all comment threads, synthesises what reviewers want, makes the clear-cut changes directly, and flags anything that needs a human decision. Use when the user asks to "implement feedback on my deck", "address comments on a design", "apply review feedback", "fix the comments on my presentation", or "implement the feedback".
---

# Feedback to Finished

A deck has been out for review — stakeholders have left comments scattered across slides. This skill reads every thread, summarises what reviewers actually want, makes the clear-cut changes directly, and flags anything ambiguous for a human decision.

## Check editing support

Use the transaction workflow in `canva-edit-design`. Check the live editing schema and the target page type before deciding which reviewer requests can be applied. List unsupported requests for manual follow-up.

## Workflow

### Step 1: Resolve the Design

- If the user provides a short link (`canva.link`), call `resolve-shortlink` to get the design URL
- If the user provides a full Canva URL, extract the design ID from the URL
- If the user provides a **design ID** directly (typically starts with `D`, e.g. `DABcd1234ef`), use it as `design_id`; **do not** use `search-designs` for a raw ID
- Otherwise ask for the design ID or link

### Step 2: Read All Feedback

- Call `list-comments` with the design ID and follow continuation tokens to read the threads.
- Where `list-replies` is available, paginate replies for each thread that has them. If it is unavailable and the comment response omits replies, flag the gap and ask for any missing replies before acting on those threads.
- Use `read-design` or `read-design-v2` without opening a transaction to read the current page content.

### Step 3: Triage the Feedback

Classify each comment thread into one of these categories:

- **Actionable** — a change that the API supports and you can reasonably interpret. Use your best judgement — if a comment says "make the title punchier", rewrite it to be punchier rather than flagging it as ambiguous. If a comment says "fix the spacing", look at the design content and make a reasonable adjustment. Only escalate to the user when you genuinely cannot determine what the reviewer intends (e.g., two reviewers directly contradict each other, or a comment references something you can't find in the design).
- **Requires manual action** — the requested change is unsupported by the available editing schema or target page. Note these briefly in the summary — full details go in the manual changes checklist (Step 6).
- **Resolved** — already addressed, explicitly marked done, or is a positive acknowledgement (e.g., "LGTM", "looks good")

Present a summary to the user organised by category: what you plan to change, what needs clarification, what must be done manually, and what you're skipping.

### Step 4: Apply Changes and Preview

If there are actionable changes, open a transaction with `read-design` and stage the edits with `edit-design` following `canva-edit-design`. Batch compatible edits by page. Show the changed pages and the staged changes together.

### Step 5: Approve and Save

Ask once for approval of the staged changes. After approval, save with `edit-design` and `finalize: "commit"` without operations or code. If the user declines, discard with `finalize: "cancel"`. For a host with a different editing tool pairing, follow the live schema as described in `canva-edit-design`.

### Step 6: Present Remaining Manual Changes

After committing (or if no API-supported changes were possible), present a clear checklist of everything that still needs to be done manually in the Canva editor:

```
## Changes to make manually in Canva

1. **Slide 3 — Change heading font to Montserrat**
   Reviewer: @Sarah | Why: API cannot change font family
   → Open slide 3, select the heading, change font to Montserrat

2. **Slide 7 — Change the animation timing**
   Reviewer: @James | Why: the available editor does not expose animation timing
   → Adjust the timing in the Canva editor

3. ...
```

Include the slide number, what to change, who requested it, and step-by-step instructions so the user can work through the list quickly.

### Step 7: Report Back on Comment Threads

- If the user authorised posting replies and `reply-to-comment` is available, use it after saving to report what changed on the relevant threads. Otherwise give the user the update in the handoff.

## Rules

- Be helpful, not cautious — interpret feedback generously and make your best attempt at a change rather than labelling it "ambiguous" and giving up. The user can always reject your changes in the approval step.
- Only escalate to the user when you genuinely can't figure out the intent — two reviewers directly contradict each other, or a comment references something you can't find in the design
- When reviewers disagree, present both sides and let the user decide
- Manual changes are normal and expected — don't over-explain or apologise for API limitations, just include them in the checklist
- Batch compatible operations for the same page.
