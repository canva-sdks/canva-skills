# Workflow: Webhooks

## Goal

Receive real-time event notifications from Canva when things happen to a user's designs, folders, or team.

## When to use

Use this workflow when:
- You need to react to Canva events without polling (e.g. design shared, comment added, approval status changed)
- Your integration needs to keep external systems in sync with Canva activity

## Docs to read first

Fetch before implementing:
- `https://www.canva.dev/docs/connect/webhooks.md` — event types, payload schemas, required scopes per event type, webhook registration, verification mechanism

Also read:
- `https://www.canva.dev/docs/connect/appendix/scopes.md` — verify which scopes each notification type requires

## Prerequisites

- A publicly accessible HTTPS endpoint on your server that Canva can POST to
- Valid Canva access token with the required webhook scopes
- A webhook registered in the Canva Developer Portal or via the API (verify method in `webhooks.md`)

For local development, use a tunnel tool (e.g. `ngrok`) to expose your local server.

## Recommended Approach

1. **Register a webhook**: configure your endpoint URL and select the event types you want to receive. Verify the registration method (portal vs API) in `webhooks.md`.
2. **Receive events**: Canva will POST JSON payloads to your endpoint for each event.
3. **Verify the request**: if Canva provides a signing mechanism (e.g. a signature header), validate it on every incoming request before processing. Read `webhooks.md` for the current verification approach.
4. **Respond quickly**: return `200 OK` immediately. Process the event asynchronously if needed — Canva may time out and retry if your endpoint is slow.
5. **Handle retries**: Canva may retry failed deliveries. Make your handler idempotent — processing the same event twice should not cause duplicate side effects.

## TypeScript Pattern

Read `webhooks.md` for exact payload schemas, event type names, and verification field names before implementing. Fill in TODOs.

```typescript
import express from 'express';
import { createHmac, timingSafeEqual } from 'crypto';

const router = express.Router();

router.post('/webhooks/canva', express.raw({ type: 'application/json' }), (req, res) => {
  // Step 1: Verify the webhook signature
  // TODO: check webhooks.md for the current signature header name and verification algorithm
  if (!verifyWebhookSignature(req)) {
    res.status(401).send('Invalid signature');
    return;
  }

  // Step 2: Respond immediately
  res.status(200).send('OK');

  // Step 3: Process asynchronously
  const payload = JSON.parse(req.body.toString());
  handleWebhookEvent(payload).catch(err => {
    console.error('Webhook processing error', { eventType: payload.type, error: err.message });
    // Do not re-throw — the 200 is already sent
  });
});

function verifyWebhookSignature(req: express.Request): boolean {
  // TODO: replace with the verification approach documented in webhooks.md
  // This is a placeholder HMAC pattern — the actual header name and algorithm must be verified
  const signature = req.headers['TODO_CANVA_SIGNATURE_HEADER'] as string;
  if (!signature) return false;

  const secret = process.env.CANVA_WEBHOOK_SECRET!;
  const expected = createHmac('sha256', secret)
    .update(req.body)
    .digest('hex');

  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length) return false;
  return timingSafeEqual(sigBuf, expBuf);
}

async function handleWebhookEvent(payload: Record<string, unknown>) {
  // TODO: replace event type values with names from webhooks.md
  switch (payload.type) {
    case 'TODO_DESIGN_SHARED_EVENT':
      await onDesignShared(payload);
      break;
    case 'TODO_COMMENT_EVENT':
      await onComment(payload);
      break;
    // Add cases for each event type your integration handles
    default:
      // Unknown event type — ignore gracefully
      break;
  }
}

async function onDesignShared(payload: Record<string, unknown>) {
  // TODO: implement based on payload schema from webhooks.md
}

async function onComment(payload: Record<string, unknown>) {
  // TODO: implement based on payload schema from webhooks.md
}
```

## Common Mistakes

- **Not verifying the signature**: process only verified requests to prevent spoofed events.
- **Blocking on processing before returning 200**: if your handler is slow, Canva may retry. Return 200 first, process async.
- **Non-idempotent handlers**: Canva may deliver the same event more than once. Guard against duplicate processing (e.g. store processed event IDs).
- **Using HTTP instead of HTTPS**: Canva requires HTTPS for webhook endpoints in production.
- **Not reading the payload schema from docs**: payload field names must come from `webhooks.md`, not guesswork.

## Troubleshooting

- **Canva not delivering events**: check that your endpoint is publicly accessible over HTTPS and returning 200.
- **Signature verification failing**: ensure you are reading the raw request body (not parsed JSON) when computing the signature. Express parses the body by default — use `express.raw()` for the webhook route.
- **Duplicate events**: implement idempotency using the event ID from the payload.
- **Missing events**: check that the required scope for the event type is included in your access token.

## Production Notes

- Route webhook events to a queue (SQS, RabbitMQ, BullMQ) for reliable async processing.
- Store processed event IDs to handle retries idempotently.
- Monitor webhook endpoint latency — aim to respond in <1 second.
- Set up alerting for signature verification failures (may indicate a spoofed request or a Canva key rotation).
- Check `webhooks.md` for any documented key rotation behaviour and handle accordingly.
