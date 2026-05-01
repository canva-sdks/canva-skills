# Troubleshooting

General debugging guidance for Canva REST API integrations.

---

## HTTP Error Map

### 400 Bad Request

**Likely meaning:** Invalid request shape, missing required field, unsupported field value, or validation error.

**Likely causes:**
- Required field is absent from the request body
- Field value is the wrong type or format (e.g., string where integer expected)
- Unsupported combination of parameters
- Malformed JSON body
- Content-Type header is wrong or missing

**How to diagnose:**
- Read the error response body — Canva returns a structured error with a `code` and `message`. Check `https://www.canva.dev/docs/connect/error-responses.md` for the full error code list.
- Compare your request body against the relevant endpoint's API reference page on Canva.dev.
- Log the raw request (without the Authorization header) and compare it to the documented schema.

**Likely fixes:**
- Add the missing required field
- Correct the field type or format
- Remove unsupported or misspelled fields
- Ensure the `Content-Type: application/json` header is set for JSON bodies

**What not to assume:**
- Do not assume the field names match other APIs you've used — check the Canva.dev docs.

---

### 401 Unauthorized

**Likely meaning:** Missing, invalid, expired, or malformed access token.

**Likely causes:**
- No `Authorization` header sent
- Token has expired (access tokens have a limited lifetime)
- Token was revoked by the user or invalidated
- Malformed `Bearer` header (e.g., extra spaces, wrong prefix)
- Token was generated for a different environment (sandbox vs production)

**How to diagnose:**
- Confirm the `Authorization: Bearer <token>` header is present and correctly formatted.
- Check whether the token has expired. Decode the JWT (without verifying) to check the `exp` claim, or track expiry from the time of issue.
- Attempt a token refresh. If the refresh token is also invalid, the user must re-authenticate.

**Likely fixes:**
- Refresh the access token and retry
- Re-run the OAuth flow if the refresh token is also invalid
- Ensure you're using the correct token for the environment

**What not to assume:**
- Do not assume the token is valid just because it was recently issued — tokens can be revoked.
- Do not confuse 401 with 403. A 401 means the request is unauthenticated; a 403 means it is authenticated but not permitted.

---

### 403 Forbidden

**Likely meaning:** Valid token, but insufficient scope, permission, or resource access.

**Likely causes:**
- The access token was issued without the required scope for this endpoint
- The token was issued before a required scope was added — the user must re-consent
- The authenticated user does not have access to the requested resource (e.g., a design owned by someone else)
- The app is not approved or enabled for the required capability
- Environment mismatch (development app accessing production resources or vice versa)

**How to diagnose:**
- Check the required scope for the endpoint in `https://www.canva.dev/docs/connect/appendix/scopes.md`.
- Compare required scopes against the scopes your app requested during OAuth.
- Verify the resource ID belongs to the authenticated user.
- Check whether your app has been approved for the capability being used.

**Likely fixes:**
- Add the required scope to your OAuth request and have the user re-authorize
- Verify the resource ID is correct and accessible to the authenticated user
- Confirm app review / approval status if the endpoint requires it

**What not to assume:**
- Do not assume refreshing the access token will fix a 403. The problem is permissions, not token expiry.
- Do not invent a required scope — read the Canva.dev docs for the endpoint.

---

### 404 Not Found

**Likely meaning:** Wrong resource ID, unavailable resource, or resource not accessible to the authenticated user.

**Likely causes:**
- The design ID, asset ID, or folder ID does not exist
- The resource exists but belongs to a different user or team (Canva may return 404 instead of 403 for privacy reasons)
- The resource was deleted
- The endpoint path is wrong

**How to diagnose:**
- Double-check the resource ID against what was returned from a list or create endpoint.
- Verify the endpoint path against the Canva.dev API reference.
- Confirm the authenticated user has access to the resource.

**Likely fixes:**
- Correct the resource ID
- Verify the resource exists and the authenticated user owns it or has access

**What not to assume:**
- Do not assume 404 always means "not found" — it may mean "not accessible to you."

---

### 409 Conflict

**Likely meaning:** Conflict or invalid resource state.

**Likely causes:**
- Attempting to create a resource that already exists
- The resource is in a state that does not allow the requested operation (e.g., an export job already in progress)
- Concurrent modification conflict

**How to diagnose:**
- Read the error code in the response body.
- Check whether the operation was already completed by a previous (possibly failed) request.

**Likely fixes:**
- Check if the resource already exists before creating it
- Wait for an in-progress job to complete before starting another

**What not to assume:**
- Do not automatically retry a 409 — investigate the conflict first.

---

### 429 Too Many Requests

**Likely meaning:** Rate limited.

**Likely causes:**
- Too many requests in a short period
- Free plan quota exceeded
- Polling an async job endpoint too frequently

**How to diagnose:**
- Check for a `Retry-After` header in the response.
- Review the rate limit and quota guidance in `https://www.canva.dev/docs/connect/api-requests-responses.md` and `https://www.canva.dev/docs/connect/error-responses.md`.

**Likely fixes:**
- Back off and retry after the `Retry-After` period
- Implement exponential backoff with jitter
- Reduce polling frequency for async jobs
- Cache responses where appropriate

**What not to assume:**
- Do not retry immediately — honour the backoff.

---

### 5xx Server Error

**Likely meaning:** Canva-side or transient failure.

**Likely causes:**
- Temporary Canva infrastructure issue
- The request triggered an unexpected server-side error

**How to diagnose:**
- Check whether the error is reproducible or intermittent.
- Check Canva's status page if available.

**Likely fixes:**
- Retry with exponential backoff (5xx errors are generally safe to retry for idempotent requests)
- If consistently reproducible, contact Canva developer support

**What not to assume:**
- Do not retry non-idempotent requests (e.g., resource creation) without checking whether the operation succeeded first.

---

## General Debugging Checklist

1. Read the error response body — Canva error responses include a `code` field. Look it up in `https://www.canva.dev/docs/connect/error-responses.md`.
2. Check the `Authorization` header is present, correctly formatted, and not expired.
3. Confirm the endpoint path and HTTP method against the Canva.dev API reference.
4. Verify the request body fields against the documented schema.
5. Check the required scopes for the endpoint.
6. Check the resource ID is correct and accessible to the authenticated user.
7. Look for `Retry-After` or `X-RateLimit-*` headers on 429 responses.
