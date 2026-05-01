# Workflow: App Review Readiness

## Goal

Prepare a Canva integration for submission to Canva's app review process.

## When to use

Use this workflow when:
- You are ready to publish your integration beyond development/testing
- You need to know what Canva's review team will check
- You want to avoid common rejection reasons before submitting

## Docs to read first

Fetch before assessing readiness — requirements may change:
- `https://www.canva.dev/docs/connect/submission-checklist.md` — Connect API / REST API submission requirements
- `https://www.canva.dev/docs/connect/guidelines/recommended-practices.md` — recommended implementation practices for Connect integrations
- For Apps SDK apps also fetch:
  - `https://www.canva.dev/docs/apps/app-review-process.md`
  - `https://www.canva.dev/docs/apps/submission-checklist.md`

## Prerequisites

- Your integration is functionally complete and tested
- You have a Canva Developer Portal account with the app registered
- Read the relevant submission checklist from Canva.dev before completing this workflow

## Recommended Approach

Work through the checklist below, then fetch the official submission checklist docs for the current requirements. The items below are stable principles — exact requirements must be verified in the current docs.

## Readiness Checklist

### Security (always required)
- [ ] `CANVA_CLIENT_SECRET` is never in frontend code, browser requests, or client-side env files
- [ ] Access tokens and refresh tokens are not logged anywhere
- [ ] OAuth state parameter is validated on every callback
- [ ] Tokens are stored server-side only (not in `localStorage` or client-side cookies in production)
- [ ] HTTPS used for all endpoints (redirect URI, webhook endpoint)
- [ ] Only the scopes your integration actually uses are requested

### OAuth implementation
- [ ] Authorization code flow is implemented correctly (not implicit flow)
- [ ] Token exchange happens server-side
- [ ] Redirect URI is registered in the Developer Portal and matches exactly
- [ ] Token refresh is implemented — integration does not require re-authentication on every session
- [ ] Error states (user denies permission, invalid token) are handled gracefully

### API usage
- [ ] No invented endpoint paths — all calls verified against Canva.dev docs
- [ ] No invented scope names — all scopes verified against `scopes.md`
- [ ] Async job flows (exports, uploads) poll correctly and handle failure states
- [ ] Rate limit errors (429) are handled with backoff — integration does not hammer the API on error
- [ ] Error responses (400, 401, 403, 404, 5xx) are all handled — no unhandled exceptions

### Webhooks (if applicable)
- [ ] Webhook signature is verified before processing any payload
- [ ] Webhook handler returns 200 quickly (async processing)
- [ ] Idempotency implemented for duplicate event delivery

### Developer Portal configuration
- [ ] App name, description, and branding are complete and accurate
- [ ] All redirect URIs are registered (including production URIs)
- [ ] Required scopes are declared in the portal
- [ ] Privacy policy and terms of service URLs are provided (verify if required in checklist docs)
- [ ] Support contact information is provided (verify if required)

### Testing
- [ ] Integration tested end-to-end with a real Canva account (not mocked)
- [ ] All declared scopes tested and confirmed working
- [ ] Error states tested (expired token, wrong scope, invalid design ID)

## TypeScript Review Pattern

When reviewing code for review readiness:

```typescript
// Check 1: No secrets in frontend-accessible code
// Bad:
const clientSecret = process.env.NEXT_PUBLIC_CANVA_CLIENT_SECRET; // NEXT_PUBLIC_ exposes to browser

// Good:
const clientSecret = process.env.CANVA_CLIENT_SECRET; // server-side only

// Check 2: State validation present
// Bad: callback handler with no state check
// Good:
if (req.query.state !== req.session.oauthState) {
  return res.status(400).send('Invalid state');
}

// Check 3: Token refresh implemented
// Bad: no token refresh, re-auth on every 401
// Good: proactive refresh + reactive retry pattern (see workflows/authenticated-request.md)
```

## Common Rejection Reasons

Based on documented guidelines — verify current requirements in submission checklist docs:
- Client secret visible in frontend code or public repositories
- Tokens logged in application logs
- Requesting scopes that are not used by the integration
- Missing state parameter validation in OAuth callback
- No graceful handling of user denying OAuth permission
- Integration breaks silently on API errors instead of surfacing meaningful feedback

## Production Notes

- Do a security pass specifically looking for token and secret exposure before submitting.
- Run the integration end-to-end in a production-like environment (HTTPS, real Canva account) before submission.
- Keep the submission checklist docs bookmarked — review requirements can be updated by Canva.
