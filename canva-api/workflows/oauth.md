# Workflow: OAuth

## Goal

Implement Canva OAuth so your backend can make REST API calls on behalf of a Canva user.

## When to use

Use this workflow when:
- Adding "Connect with Canva" / "Log in with Canva" to your application
- Your integration needs to access a user's designs, assets, or folders
- You need to set up the auth flow before implementing any other Canva REST API feature

## Docs to read first

Fetch `https://www.canva.dev/docs/connect/authentication.md` before implementing. It contains:
- The exact authorization URL
- The token endpoint URL
- Required request parameters and headers for the token exchange
- Token response field names
- Refresh token behaviour

Also read:
- `https://www.canva.dev/docs/connect/appendix/scopes.md` for current scope names

## Prerequisites

- App registered in the Canva Developer Portal
- `CANVA_CLIENT_ID` and `CANVA_CLIENT_SECRET` from the portal
- Redirect URI registered in the portal (e.g. `http://localhost:3000/auth/canva/callback` for dev)
- A session mechanism on your server (e.g. express-session) for storing state

## Recommended Approach

1. Generate a random `state` value and store it in the user's server-side session.
2. Redirect the user to Canva's authorization URL with `client_id`, `redirect_uri`, `response_type=code`, `scope`, and `state`.
3. On the callback, validate `state` matches what you stored. Reject if it doesn't.
4. Exchange the `authorization_code` for tokens server-side using your client secret. Do not do this in the browser.
5. Store the access token, refresh token, and expiry time securely, associated with the user.
6. Use the access token in subsequent REST API requests via `Authorization: Bearer <token>`.

## TypeScript Pattern

Read `https://www.canva.dev/docs/connect/authentication.md` for the exact URLs and parameter names before filling in the TODOs below.

```typescript
import { randomBytes } from 'crypto';
import express from 'express';

const router = express.Router();

// Step 1: Redirect to Canva authorization
router.get('/auth/canva', (req, res) => {
  const state = randomBytes(32).toString('hex');
  req.session.oauthState = state;

  const params = new URLSearchParams({
    client_id: process.env.CANVA_CLIENT_ID!,
    redirect_uri: process.env.CANVA_REDIRECT_URI!,
    response_type: 'code',
    scope: 'TODO: read scopes.md for current scope names',
    state,
  });

  // TODO: replace with exact authorization URL from authentication.md
  res.redirect(`TODO_CANVA_AUTH_URL?${params.toString()}`);
});

// Step 2: Handle callback
router.get('/auth/canva/callback', async (req, res) => {
  const { code, state } = req.query;

  // Validate state
  if (!state || state !== req.session.oauthState) {
    res.status(400).send('Invalid state parameter');
    return;
  }
  delete req.session.oauthState;

  // Exchange code for tokens — server-side only
  // TODO: replace URL and parameter format with values from authentication.md
  const response = await fetch('TODO_CANVA_TOKEN_URL', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code as string,
      redirect_uri: process.env.CANVA_REDIRECT_URI!,
      client_id: process.env.CANVA_CLIENT_ID!,
      client_secret: process.env.CANVA_CLIENT_SECRET!,
    }),
  });

  if (!response.ok) {
    res.status(500).send('Token exchange failed');
    return;
  }

  const tokens = await response.json();
  // Never log tokens.access_token or tokens.refresh_token

  await tokenStore.save(req.session.userId, {
    accessToken: tokens.access_token,
    refreshToken: tokens.refresh_token,
    expiresAt: Date.now() + tokens.expires_in * 1000,
  });

  res.redirect('/dashboard');
});
```

## Common Mistakes

- **State not validated**: always check the returned `state` matches before exchanging the code.
- **Token exchange in the browser**: the client secret must not be in frontend code.
- **Hardcoding the authorization URL**: fetch `authentication.md` for the current URL — it may change.
- **Not storing expiry**: always store `expires_in` as an absolute timestamp so you can refresh proactively.
- **Logging the token response**: redact before logging.

## Troubleshooting

- **401 on token exchange**: check that `client_id` and `client_secret` are correct and from the right environment.
- **400 on token exchange**: check that `redirect_uri` exactly matches the registered URI (including trailing slashes).
- **State mismatch on callback**: check that your session is persisting between the redirect and callback requests. This often fails without a session store.
- **"Invalid scope"**: fetch `scopes.md` for the current valid scope names.

## Production Notes

- Use a proper session store (Redis, database-backed) in production — in-memory sessions do not persist across server restarts.
- Store tokens in an encrypted database column or secrets manager, not in a plain-text session store.
- Implement token refresh: check expiry before each API call and refresh if less than ~5 minutes remain.
- If Canva supports PKCE for SPAs without a backend, verify in `authentication.md`.
