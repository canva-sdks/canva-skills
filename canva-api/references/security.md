# Security

Rules and patterns for building secure Canva REST API integrations. Apply these in every code example and review.

---

## Client secrets must stay server-side

`CANVA_CLIENT_SECRET` must only exist in your backend environment. Never:
- Include it in frontend JavaScript bundles
- Pass it to the browser via an API response
- Store it in a client-side `.env` file committed to a repo
- Log it anywhere

If a secret is exposed, rotate it immediately in the Canva Developer Portal.

---

## Access tokens and refresh tokens must not be logged

Tokens are credentials. Treat them like passwords.

- Do not log request headers containing `Authorization: Bearer <token>`
- Do not log token exchange responses in full
- Redact tokens before writing to any log sink
- Do not store tokens in plain-text log files

```typescript
// Redact before logging
const safePayload = { ...tokenResponse, access_token: '[REDACTED]', refresh_token: '[REDACTED]' };
logger.info('Token exchange complete', safePayload);
```

---

## Use environment variables

Store all credentials and configuration in environment variables, not in source code.

Required variables for a typical integration:
```
CANVA_CLIENT_ID
CANVA_CLIENT_SECRET
CANVA_REDIRECT_URI
```

Use a secrets manager (AWS Secrets Manager, GCP Secret Manager, HashiCorp Vault) in production rather than `.env` files.

---

## Validate OAuth state parameter

The `state` parameter in the OAuth flow prevents CSRF attacks. Your implementation must:

1. Generate a cryptographically random `state` value before redirecting the user to Canva's authorization URL
2. Store it server-side (session, short-lived cache) keyed to the user's session
3. On callback, verify the returned `state` matches before proceeding
4. Reject the callback if `state` is missing or does not match

```typescript
import { randomBytes } from 'crypto';

// Before redirect
const state = randomBytes(32).toString('hex');
req.session.oauthState = state;

// On callback
if (req.query.state !== req.session.oauthState) {
  res.status(400).send('Invalid state parameter');
  return;
}
```

---

## Store tokens securely

- **Server-side only.** Store tokens in a database or secure server-side cache — not in browser `localStorage` or `sessionStorage` in production.
- **Encrypt at rest** if storing in a database alongside other sensitive user data.
- **Scope tokens to users.** Associate each token with the specific Canva user it belongs to.
- **Local development only**: in-memory stores are acceptable for development. Never use them in production.

---

## Prefer least-privilege scopes

Only request the OAuth scopes your integration actually uses. Requesting broad scopes:
- Increases the risk surface if a token is compromised
- May cause users to decline authorization
- Can complicate app review

Check `https://www.canva.dev/docs/connect/appendix/scopes.md` for the current scope list. Add scopes incrementally as features are added.

---

## Avoid storing production tokens in localStorage

`localStorage` is accessible to any JavaScript running on the page, including third-party scripts. Never store access tokens or refresh tokens in `localStorage` in production applications.

---

## Redact logs

Apply redaction at the logging layer, not ad hoc at each call site. Ensure the following never appear in logs:
- Authorization header values
- Token exchange response bodies
- Client secrets from config

---

## Handle token refresh correctly

- Track token expiry and refresh proactively (e.g., refresh when less than 5 minutes remain), rather than waiting for a 401.
- On 401 response: attempt one token refresh, then retry the original request once. If the refresh also fails, require the user to re-authenticate.
- Do not retry a 401 in a loop without refreshing first.
- After refreshing, persist the new access token and refresh token before making further requests.

---

## Avoid blindly retrying non-idempotent requests

On 5xx or network errors:
- **Safe to retry**: GET requests, and POST requests explicitly documented as idempotent.
- **Retry with caution**: POST requests that create resources (e.g., export jobs, asset uploads). Check whether the job was already created before retrying.
- **Use exponential backoff** with jitter for retries.
- **Respect `Retry-After` headers** when present (especially on 429 responses).

---

## Verify webhooks

If Canva's webhook documentation specifies a verification mechanism (e.g., a signature header), validate it on every incoming request before processing the payload. Reject unverified requests with a 401 or 403.

Check `https://www.canva.dev/docs/connect/webhooks.md` for the current verification mechanism, as this may change.
