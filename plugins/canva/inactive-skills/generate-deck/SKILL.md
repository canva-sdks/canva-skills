---
name: canva-branded-presentation
description: Create branded marketing and sales presentation decks with Canva AI using a selected Canva Brand Kit and the connected Canva MCP design generation tool. Use when the user asks to generate, create, draft, or build a Canva sales deck, marketing deck, pitch deck, product deck, or other branded slide presentation; always suggest available brand kits and ask the user to choose before generation. Use the corresponding Canva workflow for other design formats or Brand Templates.
---

# Canva Presentation Builder

Use the Canva app to generate presentation-type designs with Canva AI, especially branded marketing decks and sales decks. Keep the workflow focused on multi-slide decks even though the generation tool can create many other design types.

## Core Rule

Use `create-design` with `format: "Presentation"` and a deck-specific `brief`. If the user switches to a different output type or asks to start from a Brand Template, use the corresponding Canva workflow.

## Deck Focus

Optimize the deck for marketing and sales outcomes:

- Audience: buyers, prospects, customers, partners, or internal go-to-market stakeholders.
- Purpose: position the brand or product, communicate value, support a campaign, enable sales, pitch an offer, or drive a next step.
- Content shape: concise messaging, crisp positioning, specific benefits, proof points, and clear calls to action.

Prefer a persuasive commercial narrative over a generic informational outline. Useful arcs include:

- Problem -> insight -> solution -> value -> proof -> next step.
- Market shift -> customer need -> product story -> differentiation -> results -> CTA.
- Audience pain -> desired outcome -> offer -> capabilities -> credibility -> buying path.



## Inputs

Use the user's brief, outline, notes, or pasted content as the source material. If important presentation parameters are missing, infer sensible defaults instead of blocking:

- Audience: infer from the brief, or use a general professional audience.
- Length: infer from the content; for a normal first draft, aim for 8-12 slides.
- Tone: match the user's language; default to clear, polished, and useful.
- Objective: derive the intended commercial outcome, such as generate interest, persuade buyers, pitch a product, enable sales, recap a campaign, or align go-to-market teams.

Ask a concise follow-up only when the missing choice would materially change the deck, such as whether the deck is for executives or customers, or whether the user needs a very specific slide count. Brand kit selection is the exception: always ask the user to choose from available brand kits before generation.

## Brand Kit Handling

For every deck request:

- Call `list-brand-kits` to find available brand kits.
- Suggest the available brand kits to the user and ask them to choose one before generation.
- Do not auto-select a brand kit, even if only one kit is available or one kit seems obviously relevant.
- Pass the selected kit as `brand_kit_id` when calling `create-design`.
- If no brand kits are available, say that none were found and ask whether to continue without a brand kit.
- If `list-brand-kits` reports missing `brandkit:read` scopes, ask the user to disconnect and reconnect the Canva app before continuing.
- If the user explicitly chooses to continue without a brand kit, keep the deck brand-aware using the supplied company, product, tone, colors, or messaging, without inventing brand rules.

## Generation Prompt

Write the generation prompt as a deck brief, not as a generic document prompt. Include:

- Working title.
- Audience and objective.
- Desired slide count or range.
- Narrative arc.
- Brand, product, offer, category, and positioning.
- Primary customer pain points and desired outcomes.
- Key value propositions, differentiators, and proof points.
- Slide-by-slide outline with specific slide titles.
- Key bullets or talking points for each slide.
- Visual direction for each slide, such as chart, timeline, comparison table, product screenshot, diagram, or image subject.
- Speaker-note guidance when useful.
- Any brand, tone, or formatting constraints the user supplied.

Prefer concrete, outcome-oriented slide titles over vague section labels. Make slides scannable and visual; avoid dense prose, article-like sections, or report-style page structure.

For a sales deck, include the likely buyer problem, solution fit, benefits, credibility, objection-aware proof, and next step. For a marketing deck, include campaign or brand context, target audience, message hierarchy, offer, channels or use cases when relevant, and a memorable CTA.

## Deliver

If no widget is shown, poll `get-create-design-async-job` with the returned job ID and continuation token, respecting the polling policy. Inspect the completed deck with the available design reader and share its Canva edit link.
