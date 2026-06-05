---
name: canva-classroom-helper
description: Turn a lesson plan into a teaching slide deck in Canva. Use when the user asks to build classroom slides from a lesson plan, convert a lesson plan into a presentation, make a teaching deck, create school slides from an outline, or generate a lesson deck for students. Input can be a lesson plan pasted in the message, a Canva design ID, a Canva doc or design by name, or a Canva design link (e.g., https://www.canva.com/design/...).
---

# Canva Classroom Helper — Lesson Plan to Deck

Transform a lesson plan into a clear, teachable presentation: learning goals on screen, logical flow, and slide-by-speaker-notes so the teacher can run the class from one deck.

## Workflow

1. **Get the lesson plan source** (always do this first — no substitute checklist)
   - **Do not** open with a generic two-part prompt (e.g. “paste the plan” *and then* “describe the topic and key points”). The **lesson plan** already carries topic and key points; asking twice is redundant and skips this step’s real work (text vs Canva link vs search).
   - If the user has **not** yet given a source, ask **one** short question that matches this step only, for example: *Paste your full lesson plan here, **or** give a Canva design link or **design ID**, **or** the exact title to search in Canva; if the plan is in a file, paste the contents or give a path you can read.* Then proceed along the branch below.
   - If the user provides the lesson plan as **text in chat**, use that as the full source
   - If the user provides a **Canva design ID** directly (the identifier from a design URL—typically starts with `D`, e.g. `DABcd1234ef`), use that value as `design_id` with `Canva:start-editing-transaction` to read its text content (same as reading from a link, without URL parsing)
   - If the user provides a **Canva design link** (e.g., `https://www.canva.com/design/DAG.../...`), extract the design ID from the path and use `Canva:start-editing-transaction` to read its text content
   - If the user references a **Canva doc or design by name**, use `Canva:search-designs` to find it, then `Canva:start-editing-transaction` to read its contents

2. **List available brand kits**
   - Call `Canva:list-brand-kits` to retrieve the user's brand kits
   - If only one brand kit exists, use it automatically without asking
   - If multiple brand kits exist, present the options and ask the user to select one (school or district brand, if relevant)

3. **Generate the presentation**
   - Call `Canva:generate-design` with:
     - `design_type`: "presentation"
     - `brand_kit_id`: the selected brand kit ID
     - `query`: follow the **Lesson plan → deck query format** below (always a **multi-slide** deck—see opening lines of that format)
   - Show the generated candidates (thumbnails/previews as returned) to the user

4. **Finalize**
   - Ask the user which candidate they prefer
   - Call `Canva:create-design-from-candidate` to create the editable design
   - Provide the link to the new presentation and a one-line reminder of slide order vs. lesson phases (e.g., "Opening → Instruction → Practice → Check → Close")

## Lesson plan → deck query format

Structure the `query` for `Canva:generate-design` so the model in Canva receives **pedagogy-first** instructions. This skill **only** targets **multi-slide presentations** (`design_type` is always `"presentation"`). Open the `query` with **one line**: the **total slide count** and that the output must be a **standard multi-slide deck** (one slide per item in the slide plan below)—never a poster, flyer, or single-page layout.

Include these sections (omit only if the lesson plan truly has no data for that section):

**Lesson brief**
- Subject / unit / grade level (infer from context if missing)
- Lesson title and duration (e.g., 45 min, double period)
- **Learning objective(s)** — what students will know or be able to do (verbatim from the plan when provided)
- Standards (e.g., CCSS, state, or district) — only if the user included them

**Classroom arc**
One short paragraph: how the lesson flows for students (e.g., Engage → Explore → Explain → Elaborate → Evaluate; or I Do / We Do / You Do). Match the teacher's structure from the lesson plan when possible.

**Slide plan (teaching deck)**
For each slide, include:
- Slide N — **Exact title** (short, student-facing where appropriate)
- **Teaching goal**: one sentence — what this slide does for the lesson
- **On-slide content**: bullets (3–6) — key points, questions, or prompts; avoid walls of text; use age-appropriate language
- **Visuals**: concrete but **safe** suggestions — prefer photos, simple icons, or abstract treatment; see **Visuals — where they come from** below (avoid asking the generator for dense labels, fine detail, or text inside images)
- **Speaker notes**: 2–5 sentences — what the teacher says, facilitation tips, anticipated misconceptions, quick checks for understanding, timing hints

**Materials & logistics** (optional slide or final appendix slides)
- List materials, tech, grouping, and safety notes if present in the lesson plan

**Differentiation / extensions** (if in the plan)
- Brief bullets for support, challenge, or homework — can be one or two dedicated slides at the end

## Pedagogical notes

- **Respect the lesson plan**: Prefer the author's sequence, vocabulary, and activities; only reorganize for clarity or slide limits, and keep objectives aligned to the source
- **One main idea per slide** where possible; split dense steps across multiple slides
- **Age-appropriate**: Adjust reading level and examples to grade level stated or inferred
- **Sparse plans**: If the plan is thin, expand with standard lesson structure (objectives, direct instruction, practice, assessment, closure) and flag assumptions briefly to the user before or after generation

## Visuals — where they come from and how to avoid bad images


**Why automated visuals often miss the lesson**  
Across **any subject** (literacy, history, STEM, arts, SEL, etc.), AI-assisted and auto-picked images are **unreliable for**: readable text **inside** pictures; exact facts (dates, names, quotes, vocabulary); maps, timelines, or charts that must be precise; depictions of people, places, or events that must match the source material; and any slide where **correct wording** matters for assessment or standards alignment. Models may garble language, mix languages, invent labels, or choose **plausible but wrong** imagery.

**What to put in the `query` (mitigations — any lesson plan)**  
Include explicit **global visual rules** near the start of the generated query, for example:
- Prefer **simple photos, textures, icons, or abstract backgrounds**; avoid asking the generator for **dense infographics, labeled illustrations, or “posters with lots of text”** in the image itself.
- **Do not rely on text baked into images** — state that key terms, definitions, questions, numbers, and **all curriculum-critical wording** belong in **on-slide text** (in the lesson language, usually English), not inside pictures.
- For slides where **accuracy is essential** (vocabulary, timelines, processes, data, primary sources, artwork titles, etc.): ask for **minimal or decorative imagery** and put the correct content in bullets/titles; remind that the teacher must **verify** on-slide text too.
- Optionally ask for an overall **image-light or clean-template** feel so educators can swap in vetted **Elements**, uploads, or screenshots from trusted sources after generation.

**After the deck exists**  
Advise a **full pass in the Canva editor**: replace misleading images, fix on-slide copy, and add or paste vetted media. The editing API (`perform-editing-operations`, etc.) can help with text and some media in follow-up workflows—see `implement-feedback` patterns—but **curriculum-faithful** visuals and wording are ultimately **human-reviewed**.

**Set expectations when handing off**  
Briefly warn that **auto-generated lesson visuals are drafts**, not guaranteed accurate for any topic—teachers should treat images and on-slide facts as **unverified** until reviewed.

## Notes

- Same tool chain as branded presentation skills: brand kit + `generate-design` + `create-design-from-candidate`
- **Autofill** and advanced generation features may require a **Canva Enterprise** plan — if tools error, explain briefly and suggest manual edits in Canva
