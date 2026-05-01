# Workflow: Upload Asset

## Goal

Upload an image or video file to a Canva user's media library via the Assets API.

## When to use

Use this workflow when:
- Your integration needs to push images or videos into a user's Canva library
- You are building a DAM (Digital Asset Management) connector
- You want assets to be available for the user to use in their Canva designs

## Docs to read first

Fetch these before writing any upload code:
- `https://www.canva.dev/docs/connect/api-reference/assets.md` — overview, supported types, size limits, upload methods (direct vs URL-based), required scopes

Also read:
- `https://www.canva.dev/docs/connect/appendix/scopes.md` — verify the required scope for asset uploads

## Prerequisites

- Valid Canva access token with the required asset upload scope (verify in `scopes.md`)
- The file to upload: an image (<50 MB) or video (<500 MB) — verify current limits in `assets.md`

## Recommended Approach

Asset uploads are **asynchronous**. There are two upload methods — check `assets.md` for both:

1. **Direct upload**: send the file bytes directly in the request. Best for files you have locally.
2. **URL-based upload**: provide a publicly accessible URL for Canva to fetch the asset from. Best for files already hosted externally.

Both methods return a job ID. Poll the job status until the asset is ready, then use the returned asset ID in subsequent operations.

**Steps:**
1. Create an upload job (direct or URL-based)
2. Poll the job status
3. When complete, retrieve the asset ID from the response
4. Optionally: use the asset ID in design creation or other API calls

## TypeScript Pattern

Read `assets.md` for exact endpoint paths, request field names, multipart format requirements, and response shapes. Fill in TODOs before using.

```typescript
import { CanvaClient } from './canva-client'; // copy from examples/node/canva-client.md
import { readFile } from 'fs/promises';

// Option A: Direct file upload
// TODO: verify request format (multipart? binary? base64?) from assets.md
async function uploadAssetFromFile(
  accessToken: string,
  filePath: string,
  name: string
): Promise<string> {
  // TODO: implement based on upload method documented in assets.md
  // Likely multipart/form-data or a binary upload — verify the Content-Type and body format
  throw new Error('TODO: implement based on assets.md upload method');
}

// Option B: URL-based upload
// TODO: verify request body fields from assets.md
async function uploadAssetFromUrl(
  accessToken: string,
  url: string,
  name: string
): Promise<string> {
  const client = new CanvaClient(accessToken);

  // TODO: replace endpoint path and field names with values from assets.md
  const job = await client.post<{ job: { id: string } }>(
    '/TODO_ASSET_UPLOAD_ENDPOINT',
    {
      url,
      name,
      // TODO: add any other required fields from docs
    }
  );

  return await pollAssetJob(client, job.job.id);
}

async function pollAssetJob(client: CanvaClient, jobId: string): Promise<string> {
  const MAX_POLLS = 20;
  const POLL_INTERVAL_MS = 2000;

  for (let i = 0; i < MAX_POLLS; i++) {
    await sleep(POLL_INTERVAL_MS);

    // TODO: replace endpoint path, status values, and asset ID field with values from assets.md
    const result = await client.get<{
      job: {
        status: string;       // TODO: verify status values from docs
        asset?: { id: string }; // TODO: verify response shape
      };
    }>(`/TODO_ASSET_JOB_STATUS_ENDPOINT/${jobId}`);

    const { status, asset } = result.job;

    if (status === 'TODO_SUCCESS_STATUS') {
      if (!asset?.id) throw new Error('Upload completed but no asset ID returned');
      return asset.id;
    }

    if (status === 'TODO_FAILED_STATUS') {
      throw new Error('Asset upload job failed');
    }
  }

  throw new Error('Asset upload timed out');
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

## Common Mistakes

- **Treating uploads as synchronous**: always poll — the asset is not immediately available.
- **Exceeding file size limits**: images must be <50 MB, videos <500 MB — verify current limits in `assets.md`.
- **Using an unsupported file type**: check `assets.md` for the list of supported formats.
- **Not checking job failure**: always handle the failed status, not just success.
- **Using a URL that Canva cannot reach**: for URL-based uploads, the URL must be publicly accessible (no auth, no VPN).

## Troubleshooting

- **400**: check request body and Content-Type against `assets.md`. File format or size may be unsupported.
- **403**: verify the access token has the required asset upload scope.
- **429 during polling**: increase poll interval.
- **Job fails immediately**: check file size limits and supported types in `assets.md`.

See `references/troubleshooting.md` for the full error map.

## Production Notes

- Store job IDs so you can resume polling after a server restart.
- For large uploads, set a generous timeout and poll with backoff.
- If uploading many assets in bulk, implement a queue with concurrency limits to avoid rate limiting.
- The returned asset ID can be used in other API calls — store it alongside your own asset metadata.
