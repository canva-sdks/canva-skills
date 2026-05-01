# cURL Patterns

Quick reference for manual testing and scripting against the Canva REST API.

> **Important**: All endpoint URLs below are placeholders. Copy the exact paths from the relevant Canva.dev API reference page before using. See `references/doc-index.md` for the correct documentation links.

Set these shell variables before running any command:

```bash
ACCESS_TOKEN="your_access_token_here"
DESIGN_ID="your_design_id_here"
ASSET_ID="your_asset_id_here"
```

---

## Authenticated GET request

```bash
# TODO: replace /TODO_ENDPOINT_PATH with the path from the relevant Canva.dev docs page
curl -X GET "https://api.canva.com/TODO_ENDPOINT_PATH" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## GET design

```bash
# Endpoint path: read https://www.canva.dev/docs/connect/api-reference/designs/get-design.md
curl -X GET "https://api.canva.com/TODO_GET_DESIGN_PATH/$DESIGN_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## List designs

```bash
# Endpoint path: read https://www.canva.dev/docs/connect/api-reference/designs/list-designs.md
# Add ?continuation=TOKEN to get the next page
curl -X GET "https://api.canva.com/TODO_LIST_DESIGNS_PATH" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Create export job

```bash
# Endpoint path and request body: read https://www.canva.dev/docs/connect/api-reference/exports/create-design-export-job.md
# Replace format type value with a value from the docs
curl -X POST "https://api.canva.com/TODO_CREATE_EXPORT_JOB_PATH" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "design_id": "'"$DESIGN_ID"'",
    "format": {
      "type": "TODO_FORMAT_TYPE"
    }
  }'
```

---

## Poll export job

```bash
# Endpoint path: read https://www.canva.dev/docs/connect/api-reference/exports/get-design-export-job.md
# Replace JOB_ID with the id returned from the create export job response
curl -X GET "https://api.canva.com/TODO_GET_EXPORT_JOB_PATH/JOB_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN"
```

---

## Upload asset from URL

```bash
# Endpoint path and body fields: read https://www.canva.dev/docs/connect/api-reference/assets.md
curl -X POST "https://api.canva.com/TODO_UPLOAD_ASSET_PATH" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/image.png",
    "name": "My Image"
  }'
```

---

## Exchange authorization code for tokens

```bash
# Token URL: read https://www.canva.dev/docs/connect/authentication.md
# Parameter format (body vs Basic Auth): verify in authentication.md
curl -X POST "TODO_CANVA_TOKEN_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=authorization_code" \
  -d "code=YOUR_AUTH_CODE" \
  -d "redirect_uri=YOUR_REDIRECT_URI" \
  -d "client_id=$CANVA_CLIENT_ID" \
  -d "client_secret=$CANVA_CLIENT_SECRET"
```

---

## Refresh access token

```bash
# Token URL: read https://www.canva.dev/docs/connect/authentication.md
curl -X POST "TODO_CANVA_TOKEN_URL" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token" \
  -d "refresh_token=YOUR_REFRESH_TOKEN" \
  -d "client_id=$CANVA_CLIENT_ID" \
  -d "client_secret=$CANVA_CLIENT_SECRET"
```

---

## POST with JSON body

```bash
# Generic pattern for any POST endpoint
# Replace path and body fields with values from the relevant Canva.dev docs page
curl -X POST "https://api.canva.com/TODO_ENDPOINT_PATH" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'
```
