# Answer Templates

Use these templates to structure answers consistently by task type.

---

## 1. Implementation Answer

Use when the user is building a new feature or integration.

```
## Approach
[1–3 sentences: what the integration does, which Canva API surface it uses, and the key steps.]

## Required Canva Setup
- [ ] App created in Canva Developer Portal
- [ ] Redirect URI registered
- [ ] [Any other setup steps — verify in docs]

## Required Environment Variables
```
CANVA_CLIENT_ID=
CANVA_CLIENT_SECRET=
CANVA_REDIRECT_URI=
[any others]
```

## Required Scopes
[List scopes needed. Read https://www.canva.dev/docs/connect/appendix/scopes.md for current names.
Do not invent scope names.]

## TypeScript Implementation
[Minimal working code. Load the relevant Canva.dev markdown page before writing endpoint-specific code.]

## How to Test
[Step-by-step: set up env, run auth flow, call the endpoint, verify the response.]

## Common Issues
[2–4 specific, concrete mistakes and how to fix them.]

## Production Notes
[Token storage, secret management, error handling, retry behaviour, monitoring.]
```

---

## 2. Debugging Answer

Use when the user has an error, unexpected response, or broken integration.

```
## Likely Cause
[One or two sentences. Be specific — name the error code, the missing scope, or the misconfigured field.]

## Why
[Brief explanation of why this error occurs. Reference the HTTP status meaning from troubleshooting.md if relevant.]

## Check These
- [ ] [Specific thing to inspect — header, field, token, scope]
- [ ] [Another specific check]
- [ ] [...]

## Fix
[Concrete code change or configuration fix. Show before/after if helpful.]

## Safer Version
[If the original code had a security or reliability issue beyond the immediate bug, show the improved pattern.]
```

---

## 3. Architecture Answer

Use when the user is deciding on an approach, choosing between surfaces, or designing a system.

```
## Recommendation
[One clear recommendation: which API surface, which flow, which pattern.]

## Why
[The key reason: what the user is trying to do, and why this approach fits.]

## Trade-offs
[What this approach gives up vs alternatives. Keep it to 2–3 real trade-offs.]

## Approach Overview
[High-level steps, not code. What the integration does, in order.]

## Alternative Considered
[One meaningful alternative and why it is not recommended here.]

## Next Steps
[The first 2–3 concrete actions the user should take.]
```

---

## 4. Code Review Answer

Use when reviewing a user's existing Canva API integration code.

```
## Summary
[One sentence: overall assessment — safe / unsafe / functional / needs changes.]

## Security Issues
[List any: client secret exposure, token logging, missing state validation, tokens in localStorage.
If none: "None found."]

## Correctness Issues
[List any: wrong endpoint usage, incorrect error handling, missing required fields, wrong auth flow.]

## Reliability Issues
[List any: no retry logic, no token refresh, polling too aggressively, no backoff.]

## Suggestions
[Non-blocking improvements: better types, cleaner error messages, improved testability.]

## Revised Code
[If there are issues to fix, show the corrected version.]
```

---

## 5. App-Review Readiness Answer

Use when the user is preparing a Canva integration for submission to app review.

```
## Readiness Assessment
[Pass / Needs work / Blocked on X]

## Required Before Submission
- [ ] [Specific requirement from submission checklist — read https://www.canva.dev/docs/connect/submission-checklist.md]
- [ ] [...]

## Security Checklist
- [ ] Client secret is server-side only
- [ ] Tokens are not logged
- [ ] OAuth state is validated
- [ ] Least-privilege scopes requested
- [ ] [Any others relevant to this integration]

## Likely Review Questions
[Based on documented guidelines — do not invent requirements. Route to recommended-practices.md.]

## What to Verify in Docs
[Any requirements that should be confirmed against current Canva.dev docs before submitting.]
```
