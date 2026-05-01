# Workflow: Authenticated Request

## Goal

Make an authenticated HTTP request to any Canva REST API endpoint using a valid access token.

## When to use

Use this workflow as the foundation for every other REST API operation. Before calling designs, exports, assets, or folders endpoints, you need a working authenticated request pattern.

## Docs to read first

- `https://www.canva.dev/docs/connect/api-requests-responses.md` — request format, response format, async job behavior, quota information
- `https://www.canva.dev/docs/connect/error-responses.md` — error object structure and error codes

For the specific endpoint you are calling, also fetch its API reference page from `references/doc-index.md`.

## Prerequisites

- A valid Canva access token (from the OAuth flow — see `workflows/oauth.md`)
- The base URL: `https://api.canva.com`
- The endpoint path from the relevant Canva.dev API reference page

## Recommended Approach

1. Check the access token is not expired before making the request. If it is, refresh it first.
2. Add `Authorization: Bearer <token>` to every request.
3. For JSON request bodies, set `Content-Type: application/json`.
4. Read the response status and body. Parse the Canva error `code` field on non-2xx responses.
5. Handle 401 by refreshing the token and retrying once. If retry fails, require re-authentication.
6. Handle 429 by respecting the `Retry-After` header and backing off.

## TypeScript Pattern

```typescript
// Use the CanvaClient from examples/node/canva-client.md as the base client.
// Load the endpoint path from the relevant Canva.dev markdown page before making the call.

import { CanvaClient } from "./canva-client"; // copy from examples/node/canva-client.md

async function makeRequest(accessToken: string) {
  const client = new CanvaClient(accessToken);

  // TODO: replace with the endpoint path from the relevant Canva.dev API reference page
  const result = await client.get<{
    /* TODO: shape from docs */
  }>("/TODO_ENDPOINT_PATH");
  return result;
}
```

With token refresh handling:

```typescript
async function callWithRefresh(
  userId: string,
  call: (token: string) => Promise<Response>,
): Promise<Response> {
  let { accessToken, refreshToken, expiresAt } = await tokenStore.get(userId);

  // Proactive refresh if close to expiry
  if (Date.now() > expiresAt - 5 * 60 * 1000) {
    ({ accessToken, refreshToken, expiresAt } =
      await refreshAccessToken(refreshToken));
    await tokenStore.save(userId, { accessToken, refreshToken, expiresAt });
  }

  const response = await call(accessToken);

  // Reactive refresh on 401
  if (response.status === 401) {
    ({ accessToken, refreshToken, expiresAt } =
      await refreshAccessToken(refreshToken));
    await tokenStore.save(userId, { accessToken, refreshToken, expiresAt });
    return call(accessToken);
  }

  return response;
}

async function refreshAccessToken(refreshToken: string) {
  // TODO: replace URL and parameter format with values from authentication.md
  const response = await fetch("TODO_CANVA_TOKEN_URL", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: process.env.CANVA_CLIENT_ID!,
      client_secret: process.env.CANVA_CLIENT_SECRET!,
    }),
  });

  if (!response.ok)
    throw new Error("Token refresh failed — user must re-authenticate");

  const data = await response.json();
  // Do not log data.access_token or data.refresh_token
  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string,
    expiresAt: Date.now() + (data.expires_in as number) * 1000,
  };
}
```

## Common Mistakes

- **Not setting Content-Type for POST requests**: Canva's API expects `application/json` for JSON bodies.
- **Retrying 401 without refreshing**: refresh the token before retrying.
- **Retrying 403**: a 403 is a permissions problem, not an expiry problem — refreshing the token will not fix it.
- **Not reading the error `code` field**: Canva errors include a machine-readable `code`. Use it — it identifies the exact problem.
- **Polling too frequently on async jobs**: back off between polls to avoid 429s.

## Troubleshooting

See `references/troubleshooting.md` for the full HTTP error map.

Quick reference:

- 400: invalid request shape — check fields against the API reference page
- 401: expired or invalid token — refresh and retry
- 403: wrong scope or no resource access — check scopes and resource ownership
- 404: wrong resource ID or no access — verify the ID
- 429: rate limited — back off and retry after `Retry-After`

## Production Notes

- Use a single `CanvaClient` instance (or a factory) rather than constructing one per request.
- Set a request timeout to avoid hanging requests.
- Implement structured logging but redact authorization header values.
- Track token expiry and refresh before making high-volume batches to avoid mid-batch 401s.
