# Doc Index

Maps developer intent to Canva.dev markdown pages. Fetch the listed `.md` URLs before answering endpoint-specific questions.

> **Canonical URL indexes** (use to discover new or renamed pages):
> - `https://www.canva.dev/docs/connect/llms.txt`
> - `https://www.canva.dev/docs/apps/llms.txt`

---

## OAuth

Use when the user mentions:
- OAuth, authentication, auth flow
- login with Canva, connect Canva account
- authorization code, token exchange
- redirect URI, callback
- client ID, client secret

Read:
- `https://www.canva.dev/docs/connect/authentication.md`

Also load:
- `references/auth-principles.md`
- `references/security.md`
- `workflows/oauth.md`

---

## OAuth Scopes

Use when the user mentions:
- scopes, permissions
- which scope do I need
- scope list, available scopes

Read:
- `https://www.canva.dev/docs/connect/appendix/scopes.md`

Also load:
- `references/security.md` (least-privilege guidance)

---

## REST API Overview

Use when the user mentions:
- getting started with Canva API
- Canva Connect APIs, overview
- API quickstart, first request
- how does the Canva API work

Read:
- `https://www.canva.dev/docs/connect.md`
- `https://www.canva.dev/docs/connect/quickstart.md`

Also load:
- `references/terminology.md`
- `references/api-surface-map.md`

---

## API Requests and Responses

Use when the user mentions:
- request format, response format
- async jobs, job polling
- quotas, free plan limits
- how to make a request

Read:
- `https://www.canva.dev/docs/connect/api-requests-responses.md`

Also load:
- `workflows/authenticated-request.md`
- `references/troubleshooting.md`

---

## Assets

Use when the user mentions:
- upload image, upload video, upload asset
- asset upload, import asset
- get asset, delete asset, update asset
- supported file types

Read:
- `https://www.canva.dev/docs/connect/api-reference/assets.md`

Also load:
- `workflows/upload-asset.md`
- `references/security.md`
- `references/troubleshooting.md`

---

## Designs

Use when the user mentions:
- create design, list designs, get design
- design ID, design metadata
- design pages, design content
- supported design formats

Read:
- `https://www.canva.dev/docs/connect/api-reference/designs.md`

Sub-pages (load as needed):
- `https://www.canva.dev/docs/connect/api-reference/designs/create-design.md`
- `https://www.canva.dev/docs/connect/api-reference/designs/list-designs.md`
- `https://www.canva.dev/docs/connect/api-reference/designs/get-design.md`
- `https://www.canva.dev/docs/connect/api-reference/designs/get-design-pages.md`
- `https://www.canva.dev/docs/connect/api-reference/designs/get-design-export-formats.md`

Also load:
- `references/troubleshooting.md`

---

## Exports

Use when the user mentions:
- export design, download design
- PDF export, PNG export, PPTX export, MP4 export
- render design, get export URL
- export job, export formats

Read:
- `https://www.canva.dev/docs/connect/api-reference/exports.md`

Sub-pages:
- `https://www.canva.dev/docs/connect/api-reference/exports/create-design-export-job.md`
- `https://www.canva.dev/docs/connect/api-reference/exports/get-design-export-job.md`

Also load:
- `workflows/export-design.md`
- `references/troubleshooting.md`
- `references/security.md`

---

## Folders

Use when the user mentions:
- folders, folder management
- list folder contents, move design
- create folder, delete folder
- organise designs

Read:
- `https://www.canva.dev/docs/connect/api-reference/folders.md`

Sub-pages (load as needed):
- `https://www.canva.dev/docs/connect/api-reference/folders/list-folder-items.md`
- `https://www.canva.dev/docs/connect/api-reference/folders/create-folder.md`
- `https://www.canva.dev/docs/connect/api-reference/folders/get-folder.md`
- `https://www.canva.dev/docs/connect/api-reference/folders/update-folder.md`
- `https://www.canva.dev/docs/connect/api-reference/folders/delete-folder.md`
- `https://www.canva.dev/docs/connect/api-reference/folders/move-folder-item.md`

Also load:
- `references/troubleshooting.md`

Note: root library folder ID is `root`, uploads folder ID is `uploads` — verify in docs.

---

## Webhooks

Use when the user mentions:
- webhooks, events, notifications
- design shared, comment notification
- receive Canva events, event payload
- webhook endpoint, register webhook

Read:
- `https://www.canva.dev/docs/connect/webhooks.md`

Also load:
- `workflows/webhooks.md`
- `references/security.md`
- `references/troubleshooting.md`

---

## Apps SDK

Use when the user mentions:
- Apps SDK, Canva app, in-editor plugin
- Canva App marketplace
- building a Canva app (plugin)
- Apps SDK vs REST

Read:
- `https://www.canva.dev/docs/apps.md`

Also load:
- `references/api-surface-map.md`

---

## REST API vs Apps SDK

Use when the user mentions:
- should I use REST API or Apps SDK
- difference between REST API and Apps SDK
- can I use the REST API inside the editor
- which API surface for my use case

Read:
- `https://www.canva.dev/docs/connect.md` (see end of overview for Apps SDK contrast)
- `https://www.canva.dev/docs/apps.md`
- `https://www.canva.dev/docs/connect/creating-integrations.md`

Also load:
- `references/api-surface-map.md`

Note: there is no single dedicated comparison page on Canva.dev. Use `api-surface-map.md` as the bundled decision guide.

---

## App Review / Developer Guidelines (REST API)

Use when the user mentions:
- app review, submission, publish integration
- Connect API review, review requirements
- recommended practices, integration guidelines

Read:
- `https://www.canva.dev/docs/connect/submission-checklist.md`
- `https://www.canva.dev/docs/connect/guidelines/recommended-practices.md`

Also load:
- `workflows/review-readiness.md`

---

## App Review / Developer Guidelines (Apps SDK)

Use when the user mentions:
- Apps SDK app review, app submission
- publish a Canva app, marketplace listing

Read:
- `https://www.canva.dev/docs/apps/app-review-process.md`
- `https://www.canva.dev/docs/apps/submission-checklist.md`

Also load:
- `workflows/review-readiness.md`

---

## Error Handling

Use when the user mentions:
- error codes, error response, API error
- debugging API errors, error handling
- specific error codes (e.g. `too_many_requests`, `unauthorized`)
- try/catch with Canva API

Read:
- `https://www.canva.dev/docs/connect/error-responses.md`

Also load:
- `references/troubleshooting.md`

---

## Pagination

Use when the user mentions:
- pagination, paging, next page
- list all designs, iterate over results
- continuation token

Read (no dedicated page — pagination is documented inline at list endpoints):
- `https://www.canva.dev/docs/connect/api-reference/designs/list-designs.md`
- `https://www.canva.dev/docs/connect/api-reference/folders/list-folder-items.md`
- `https://www.canva.dev/docs/connect/api-reference/brand-templates/list-brand-templates.md`

Pattern: response includes a `continuation` field; pass it as `?continuation={token}` on the next request. Verify field names in docs.

---

## Rate Limits

Use when the user mentions:
- rate limits, throttling, 429
- too many requests, backoff
- quota, free plan limits

Read (no dedicated page — rate limits are covered in):
- `https://www.canva.dev/docs/connect/error-responses.md` (`too_many_requests` error code, backoff guidance)
- `https://www.canva.dev/docs/connect/api-requests-responses.md` (quota context, polling guidance)

Also load:
- `references/troubleshooting.md`
