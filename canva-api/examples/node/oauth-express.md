# Example: OAuth with Express

Express OAuth skeleton for a Canva integration.

Before using in production, replace all `TODO` comments with values from `https://www.canva.dev/docs/connect/authentication.md`.

**Required environment variables:**
- `CANVA_CLIENT_ID`
- `CANVA_CLIENT_SECRET`
- `CANVA_REDIRECT_URI`

```typescript
import { randomBytes } from 'crypto';
import express from 'express';
import { tokenStore } from './token-store';

declare module 'express-session' {
  interface SessionData {
    oauthState?: string;
    userId?: string;
  }
}

export function createOAuthRouter(): express.Router {
  const router = express.Router();

  // Step 1: Redirect the user to Canva's authorization page.
  router.get('/auth/canva', (req, res) => {
    const state = randomBytes(32).toString('hex');
    req.session.oauthState = state;

    const params = new URLSearchParams({
      client_id: process.env.CANVA_CLIENT_ID!,
      redirect_uri: process.env.CANVA_REDIRECT_URI!,
      response_type: 'code',
      // TODO: replace with the scopes your integration needs.
      // Read https://www.canva.dev/docs/connect/appendix/scopes.md for current scope names.
      scope: 'TODO_SCOPES',
      state,
    });

    // TODO: replace with the authorization URL from authentication.md
    res.redirect(`TODO_CANVA_AUTHORIZATION_URL?${params.toString()}`);
  });

  // Step 2: Handle the callback from Canva.
  router.get('/auth/canva/callback', async (req, res) => {
    const { code, state, error } = req.query;

    // Handle user denying permission
    if (error) {
      res.status(400).send(`Authorization denied: ${error}`);
      return;
    }

    // Validate state to prevent CSRF
    if (!state || state !== req.session.oauthState) {
      res.status(400).send('Invalid state parameter');
      return;
    }
    delete req.session.oauthState;

    if (!code || typeof code !== 'string') {
      res.status(400).send('Missing authorization code');
      return;
    }

    try {
      // Step 3: Exchange the authorization code for tokens — server-side only.
      // TODO: replace URL and verify parameter format (body vs Basic Auth) in authentication.md
      const response = await fetch('TODO_CANVA_TOKEN_URL', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          // TODO: some OAuth servers use HTTP Basic Auth instead of body params.
          // Check authentication.md for Canva's required format.
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: process.env.CANVA_REDIRECT_URI!,
          client_id: process.env.CANVA_CLIENT_ID!,
          client_secret: process.env.CANVA_CLIENT_SECRET!,
        }),
      });

      if (!response.ok) {
        // Do not log the response body — it may contain sensitive OAuth details
        console.error('Token exchange failed', { status: response.status });
        res.status(500).send('Authentication failed');
        return;
      }

      const tokens = await response.json();
      // Never log tokens.access_token or tokens.refresh_token

      // TODO: replace with a real user identifier from your session or the token response.
      // Some OAuth providers include a user ID in the token response or a userinfo endpoint.
      const userId = req.session.userId ?? randomBytes(16).toString('hex');
      req.session.userId = userId;

      await tokenStore.save(userId, {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: Date.now() + tokens.expires_in * 1000,
      });

      res.redirect('/dashboard');
    } catch (err) {
      console.error('OAuth callback error', { message: (err as Error).message });
      res.status(500).send('Authentication failed');
    }
  });

  // Disconnect: revoke tokens and clear the session.
  router.post('/auth/canva/disconnect', async (req: express.Request, res: express.Response) => {
    const userId = req.session.userId;
    if (userId) {
      await tokenStore.delete(userId);
    }
    req.session.destroy(() => {
      res.redirect('/');
    });
  });

  return router;
}
```
