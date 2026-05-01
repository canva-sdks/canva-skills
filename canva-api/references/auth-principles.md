# Auth Principles

Stable OAuth guidance for Canva integrations. These principles do not depend on exact endpoint paths — read `https://www.canva.dev/docs/connect/authentication.md` for current URLs and field names.

---

## Authorization Code Flow

Canva uses the OAuth 2.0 Authorization Code flow. The steps are:

1. **Your backend constructs an authorization URL** pointing to Canva's authorization endpoint, including: `client_id`, `redirect_uri`, `response_type=code`, `scope` (space-separated list), and a random `state` value.
2. **The user is redirected** to Canva's authorization page and grants (or denies) permission.
3. **Canva redirects back** to your `redirect_uri` with an `authorization_code` and the `state` value.
4. **Your backend validates `state`** — reject the callback if it doesn't match what you sent.
5. **Your backend exchanges the code** for an access token and refresh token by making a POST request to Canva's token endpoint. This exchange must happen server-side — never in the browser.
6. **Store the tokens securely** server-side. Associate them with the Canva user.

Read `https://www.canva.dev/docs/connect/authentication.md` for the exact authorization URL, token endpoint URL, and all required request parameters.

---

## Redirect URI

- Must be registered in the Canva Developer Portal before use.
- Canva rejects authorization requests with unregistered redirect URIs.
- For local development, register `http://localhost:<port>/auth/canva/callback` explicitly.
- Use `https://` in production.

---

## State Parameter

The `state` parameter is mandatory for security. It prevents CSRF attacks on your OAuth callback.

- Generate a cryptographically random value (e.g., 32 bytes, hex-encoded) before redirecting.
- Store it server-side, keyed to the user's session (not in a cookie the user controls).
- Verify it matches on the callback before proceeding.
- Discard it after use — state values are single-use.

---

## Token Exchange

- The code-for-token exchange must happen on your backend server.
- Send the request with HTTP Basic Auth (client ID as username, client secret as password) or as body parameters — check `authentication.md` for the current requirement.
- The `redirect_uri` in the token request must exactly match the one used in the authorization request.
- Do not log the token response.

---

## Refresh Tokens

- Refresh tokens allow obtaining a new access token without re-running the authorization flow.
- Store refresh tokens securely — treat them with the same sensitivity as passwords.
- Refresh proactively: check expiry before making a request and refresh if the access token is close to expiry (e.g., less than 5 minutes remaining).
- After refreshing, persist both the new access token and the new refresh token (Canva may rotate refresh tokens on use — verify in `authentication.md`).
- If a refresh token is invalid or expired, the user must re-authorize.

---

## Token Expiry

- Access tokens have a limited lifetime. The token response includes an `expires_in` value (seconds).
- Calculate the absolute expiry time at issue (`issued_at + expires_in`) and store it alongside the token.
- Do not rely on receiving a 401 to detect expiry — refresh proactively.

---

## Server-Side Token Exchange

The token exchange (authorization code → access token) must never happen in the browser. Reasons:

- The token endpoint requires the client secret, which must not be in browser code.
- A browser-side exchange would expose the client secret in network requests.
- OAuth 2.0 Authorization Code flow is designed for server-side exchange.

If you need to support a pure SPA without a backend, use PKCE (Proof Key for Code Exchange) and omit the client secret — verify whether Canva supports PKCE in `authentication.md`.

---

## Secure Token Storage

- Store tokens in a server-side database or encrypted cache, not in `localStorage` or `sessionStorage`.
- Encrypt tokens at rest if your threat model requires it.
- Associate each token with the specific Canva user ID it was issued for.
- For local development only, an in-memory store is acceptable. Never use it in production.

---

## Local Development Considerations

- Register `http://localhost:<port>/your/callback/path` as a redirect URI in the Developer Portal.
- Use a tool like `ngrok` if you need Canva to send webhooks to your local machine.
- Use a `.env` file for credentials locally — ensure it is in `.gitignore`.
- Never commit credentials to version control, even for development apps.

---

## Scope Changes Requiring Re-Consent

If you add a new OAuth scope to your app after a user has already authorized it, the user will typically need to go through the authorization flow again to grant the new permission. Their existing access token will not automatically include the new scope.

> **Verify in `https://www.canva.dev/docs/connect/authentication.md`**: confirm the exact re-consent behaviour for Canva's OAuth implementation, as this detail may be explicitly documented.
