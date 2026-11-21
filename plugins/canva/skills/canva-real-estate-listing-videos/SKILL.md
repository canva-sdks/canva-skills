---
name: canva-real-estate-listing-videos
description: >-
  Create a polished Canva real estate walkthrough video from property photos,
  floor plans and a listing link, preserving layout, proportions and supplied
  branding. Use when the user asks for a "listing video", "property
  walkthrough", "real estate reel", "home tour video" or "video of this
  listing". Creates a new video and uploads the supplied photos to Canva; edits
  no existing design. Prefers H3 Max. Not for static listing flyers, brochures
  or social posts; use `create-design` for those. Not for edits to an existing
  design; use canva-edit-design for that.
license: Apache-2.0
metadata:
  version: "1.0"
  last-verified: "2026-11-20"
---

# Real estate listing walkthroughs

Create a marketing film that feels like walking through the photographed rooms. The floor plan decides how rooms connect. Real photos decide how they look. Verified listing details decide the copy.

Follow the live Canva tool schemas. This skill names which tool to call. It does not copy their inputs. Use the video tools below. Design-generation tools are a different job.

## Before you start

- Tools this skill needs: `get-video-production-guide`, `create-video`, `get-video-generation-status`, `upload-asset-from-url`, `create-upload-url`. The three video tools are not enabled in every session. If one is missing from your tool list, tell the user and stop. Do not guess a replacement by name.
- Optional tools: `get-assets`, `list-brand-kits`, `search-brand-templates`.
- Hosts prefix tool names differently. Match on the part after the prefix.
- Fill `user_intent` on every Canva call with one plain sentence about the goal.

## Workflow

### 1. Collect the brief

**Outcome:** One grouped question covers anything still missing. Skip answers already given. In a channel that accepts files, ask for the files there.

Ask for the floor plan (every level), property photos or footage, the listing link, branding or a Canva Brand Kit, and where the film will be posted.

When format or length is still open, read the walkthrough guide first (step 3) and offer only the aspect ratios and durations it lists. Then ask: “Where will you post this, and which of these formats and lengths would you like?” Suggest the fit for the placement. Common sizes: vertical 9:16 (1080 × 1920 px) for Reels, Stories, TikTok or Shorts; landscape 16:9 (1920 × 1080 px) for YouTube or listing websites; square 1:1 (1080 × 1080 px) or portrait 4:5 (1080 × 1350 px) for feed posts.

If the placement calls for a shape or length the guide does not list, say so and offer the closest one it does. If the user leaves the choice to you, pick from the placement and the photos, and say what you picked.

**Tools:**
- `get-video-production-guide`: Only to read which formats and lengths can be offered.

### 2. Check the property

**Outcome:** A short room-to-photo map, with uncertain matches flagged. Price, inspection dates and other changeable claims match the listing. Conflicting facts are settled before they enter the film.

Match photos to rooms using windows, doors, fixed cabinetry and room shape. Ask only when an unclear match would change the walking route. If the plan cannot be read, or room connections are unconfirmed, describe the result as a photo-led tour.

**Tools:**
- Read the listing page with the host’s page tool. Use the photos and details that page actually shows.

### 3. Choose the guide and model

**Outcome:** One production guide that fits a property walkthrough, plus a format, length and resolution that guide supports. Prefer H3 Max (`h3max`) when the live `create-video` schema and the selected guide both allow it and can keep the real property photos. If H3 is unavailable, or it cannot keep those photos, say so and ask before another model. Pass only an engine the live schema lists. This choice approves this film only.

If no listed guide fits a property walkthrough, do not force a match. Tell the user and ask how to proceed before any upload or generation.

Use the guide’s default resolution unless the user states a quality preference. Keep the agreed format and length.

**Tools:**
- `get-video-production-guide`: Call with no ID to list guides. Call again with the returned `production_guide_id` for the walkthrough match. Read its required inputs, durations, aspect ratios and resolution. Use that returned ID. A guessed ID is invalid.

### 4. Upload the photos and write the route

**Outcome:** Every real photo in the film is uploaded to Canva and referenced by the ID its upload returned. A timed storyboard ties each shot to its source photo, room, camera move and transition, and encodes the confirmed floor-plan connections. Missing coverage is flagged. Show the route and the chosen format. A routine approval step is unnecessary here.

Start at the entrance when that photo exists. Otherwise start in a photographed room. Where a connection has no photo, cut smoothly and match direction and speed. The route stays on real, adjacent rooms. Finish on the strongest photographed outlook or feature. Keep building amenities off the apartment route unless the user asked for them.

Camera: eye level, steady forward movement, light parallax, gentle changes in speed. The film should feel like a walk.

Pictures stay in their real proportions. Scale evenly and crop on purpose. A screenshot collage is a set of separate photos: name each panel on its own.

Sound, unless the user asks otherwise: gentle original instrumental, no voice-over.

Brand: supplied colours, fonts and the original logo. If the guide cannot place a logo or end card, say so and keep listing links in the accompanying copy.

A useful route, adapted to the property: lounge → dining → kitchen → breakfast nook → balcony → outlook.

**Tools:**
- `upload-asset-from-url`: Upload a photo that is already publicly accessible at an HTTPS URL. Keep the ID the tool returns.
- `create-upload-url`: Upload a chat attachment, a local file, or a listing photo behind a login or signed link. Follow the tool’s upload instructions exactly. Each URL takes one upload, so call it once per photo, and call it again for a fresh URL if an upload fails or expires. Keep the ID the upload response returns.
- Never move a private or local photo to public hosting to get a URL. Those files go through `create-upload-url` only.
- `get-assets`: Optional. Inspect an uploaded photo by ID when a match is in doubt.
- `list-brand-kits` / `search-brand-templates`: Only when the user asked for a Brand Kit or template.

### 5. Generate the video

**Outcome:** One video job for the agreed film. Poll that same job until it finishes, fails, or you are told to stop. A failed job stays failed until the user asks for another try.

Generate when the user has asked for this video in this conversation. Before the call, read the approval and AI-limit rule in the `create-video` description and follow it as written. It differs by engine and can change, so the live description wins over this file.

**Tools:**
- `create-video`: Send the production spec built from the selected guide: brief, output settings, visual direction, storyboard, real asset IDs, audio and constraints.
- `get-video-generation-status`: Wait `polling_policy.wait_seconds`, then poll with the same `job_id` and the latest `continuation_token`. When the video is ready, keep its `id` and `view_url`. If the job is delayed or can no longer be checked, pass on the message and `projects_url`.

### 6. Check the film and hand it back

**Outcome:** The user gets the Canva link and a playable preview or MP4, plus a short note on what was made and what is limited, including gaps covered by a cut. Publish only when they ask.

Watch the file, including frames inside shots and around cuts. Check the aspect ratio and exported size, room proportions, stable walls and fixtures, walking motion, transitions, brand and audio. A completed job is the moment to start that check. A low-resolution preview is a preview. If a stretch of the film could not be watched, or something is still distorted, say so.

**Tools:**
- Open the returned `preview_url` or `download_url` and watch the file.
- Return `view_url` as the stable Canva link. Temporary preview and download links can expire.